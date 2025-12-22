<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Services\WalletService;
use App\Services\FirebaseService;
use App\Services\ExpoPushService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private WalletService $walletService,
        private FirebaseService $firebaseService
    ) {}
    /**
     * Danh sách đơn hàng của user hiện tại
     * - Sender thấy đơn mình đặt
     * - Customer thấy đơn mình nhận mang
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Order::with([
            'flight',
            'request',
        ])
            ->leftJoin('requests', 'orders.request_id', '=', 'requests.id')
            ->when($user->role === 'sender' || !$user->role, function ($q) use ($user) {
                $q->where('orders.sender_id', $user->id);
            })
            ->when($user->role === 'customer', function ($q) use ($user) {
                $q->where('orders.customer_id', $user->id);
            })
            ->select('orders.*')
            ->orderByRaw("
                CASE 
                    WHEN requests.priority_level = 'urgent' THEN 1
                    WHEN requests.priority_level = 'priority' THEN 2
                    ELSE 3
                END
            ")
            ->orderByDesc('orders.created_at');

        // Bộ lọc theo trạng thái (từ query string)
        if ($status = $request->query('status')) {
            $allowed = ['confirmed', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'];
            if (in_array($status, $allowed)) {
                $query->where('status', $status);
            }
        }

        // Phân trang đẹp
        $orders = $query->paginate(15);

        // Thêm thông tin ngắn gọn cho frontend
        $orders->getCollection()->transform(function ($order) use ($user) {
            $order->is_sender = $order->sender_id === $user->id;
            $order->partner = $order->is_sender ? $order->customer : $order->sender;
            $order->can_chat = in_array($order->status, ['confirmed', 'picked_up', 'in_transit']);
            $order->can_rate = $order->status === 'completed' && (
                ($order->is_sender && !$order->sender_rating) ||
                (!$order->is_sender && !$order->customer_rating)
            );
            return $order;
        });

        return response()->json([
            'success' => true,
            'data'    => $orders
        ]);
    }

    /**
     * Chi tiết 1 đơn hàng
     */
    public function show(string $id)
    {
        $user = auth()->user();

        $order = Order::with([
            'flight',
            'sender',
            'customer',
            'request',
            'attachments',
        ])
            ->where('id', $id)
            ->firstOrFail();

        // Chỉ cho phép xem đơn của chính mình
        if ($order->sender_id !== $user->id && $order->customer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Không có quyền truy cập đơn hàng này.'
            ], 403);
        }

        $order->is_sender = $order->sender_id === $user->id;
        $order->partner = $order->is_sender ? $order->customer : $order->sender;

        return response()->json([
            'success' => true,
            'data'    => $order
        ]);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * Chỉ người liên quan mới được phép đổi
     */
    public function updateStatus(Request $request, string $uuid)
    {
        $user = auth()->user();

        $order = Order::with(['sender', 'customer', 'flight'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        // Kiểm tra quyền: chỉ sender hoặc customer của đơn mới được thao tác
        if (!in_array($user->id, [$order->sender_id, $order->customer_id])) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thực hiện hành động này.'
            ], 403);
        }

        $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in([
                    'picked_up',      // Customer đã nhận hàng từ Sender
                    'in_transit',     // Đang trên máy bay
                    'arrived',        // Đã đến sân bay đích
                    'delivered',      // Customer đã giao hàng cho Sender
                    'completed',      // Cả hai xác nhận hoàn tất
                    'cancelled'       // Hủy đơn (có lý do)
                ])
            ],
            'cancel_reason' => 'required_if:status,cancelled|string|max:500',
            'item_images' => 'required_if:status,delivered,completed|array|min:1',
            'item_images.*' => 'required|string|url',
        ]);

        $newStatus = $request->status;

        // Kiểm tra luồng trạng thái hợp lệ (rất quan trọng!)
        // Cho phép chuyển từ in_transit sang completed trực tiếp (bỏ bước delivered)
        $validTransitions = [
            'confirmed'   => ['picked_up', 'cancelled'],
            'picked_up'   => ['in_transit', 'cancelled'],
            'in_transit'  => ['arrived', 'completed'], // Cho phép chuyển trực tiếp sang completed
            'arrived'     => ['delivered', 'completed'], // Cho phép chuyển trực tiếp sang completed
            'delivered'   => ['completed'],
        ];


        // Kiểm tra người được phép đổi trạng thái nào
        $isSender = $order->sender_id === $user->id;
        $isCustomer = $order->customer_id === $user->id;

        $allowedByRole = [
            'picked_up'   => $isCustomer,  // Chỉ Customer mới xác nhận đã nhận hàng
            'in_transit'  => $isCustomer,
            'arrived'     => $isCustomer,
            'delivered'   => $isCustomer,
            'completed'   => true,         // Cả 2 đều được bấm hoàn tất
            'cancelled'   => true,
        ];

        if (!$allowedByRole[$newStatus]) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không được phép thực hiện hành động này.'
            ], 403);
        }

        // Kiểm tra bắt buộc item_images khi chuyển sang delivered hoặc completed
        if (in_array($newStatus, ['delivered', 'completed'])) {
            $itemImages = $request->input('item_images', []);
            if (empty($itemImages) || !is_array($itemImages) || count($itemImages) === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vui lòng chụp hoặc upload ít nhất một hình ảnh đơn hàng để xác nhận giao hàng.'
                ], 422);
            }
        }

        // Bắt đầu transaction
        return DB::transaction(function () use ($order, $newStatus, $request, $user) {

            // Dùng hàm tiện ích có sẵn trong model Order của bạn
            $order->updateStatus($newStatus, $user);

            // Lưu item_images khi chuyển sang delivered hoặc completed
            if (in_array($newStatus, ['delivered', 'completed'])) {
                $itemImages = $request->input('item_images', []);
                if (!empty($itemImages) && is_array($itemImages)) {
                    // Normalize item_images - đảm bảo là array of strings
                    $normalizedImages = array_filter($itemImages, function ($img) {
                        return !empty($img) && is_string($img);
                    });
                    $order->item_images = !empty($normalizedImages) ? array_values($normalizedImages) : null;
                    $order->save();
                }
            }

            // Nếu hủy đơn
            if ($newStatus === 'cancelled') {
                $order->cancel_reason = $request->cancel_reason;
                $order->save();

                // Hoàn tiền escrow (nếu đã nạp)
                if (in_array($order->escrow_status, ['held', 'paid'])) {
                    $this->walletService->refundEscrowToSender($order);
                    $order->refundEscrow();
                }

                // Giảm booked_weight của flight khi hủy đơn
                if ($order->flight) {
                    $weight = $order->metadata['weight'] ?? 0.5; // Lấy weight từ metadata hoặc default 0.5kg
                    $order->flight->decreaseBookedWeight($weight);
                }
            }

            // Nếu hoàn tất → giải ngân tiền thưởng cho Customer
            if ($newStatus === 'completed') {
                if ($order->escrow_status === 'held') {
                    $this->walletService->releaseEscrowToCustomer($order);
                    $order->releaseEscrow();
                }
            }

            // Push notification vào Firebase cho đối tác
            $this->pushOrderStatusNotification($order, $newStatus, $user);

            // Cập nhật flight status dựa trên tất cả orders
            if ($order->flight) {
                $this->updateFlightStatusBasedOnOrders($order->flight);
            }

            // Load lại dữ liệu đẹp cho frontend
            $order->load(['sender', 'customer', 'flight']);

            return response()->json([
                'success' => true,
                'message' => $this->getStatusMessage($newStatus),
                'data'    => $order
            ], 200);
        });
    }

    /**
     * Cập nhật flight status dựa trên trạng thái của tất cả orders
     */
    private function updateFlightStatusBasedOnOrders(\App\Models\Flight $flight): void
    {
        // Load tất cả orders của flight
        $orders = $flight->orders;

        // Nếu không có order nào, không cần cập nhật
        if ($orders->isEmpty()) {
            return;
        }

        // Kiểm tra nếu tất cả orders đã completed
        $allCompleted = $orders->every(function ($order) {
            return $order->status === 'completed';
        });

        if ($allCompleted && $flight->status !== 'completed') {
            $flight->update(['status' => 'completed']);
        }
    }

    // Thông báo thân thiện theo từng trạng thái
    private function getStatusMessage(string $status): string
    {
        return match ($status) {
            'picked_up'   => 'Đã nhận hàng từ người gửi thành công!',
            'in_transit'  => 'Hàng đang trên chuyến bay.',
            'arrived'     => 'Đã đến sân bay đích.',
            'delivered'   => 'Đã giao hàng cho người nhận thành công!',
            'completed'   => 'Đơn hàng đã hoàn tất. Cảm ơn bạn!',
            'cancelled'   => 'Đơn hàng đã được hủy.',
            default       => 'Trạng thái đã được cập nhật.',
        };
    }

    /**
     * Push notification vào Firebase khi order status thay đổi
     */
    private function pushOrderStatusNotification(Order $order, string $newStatus, $user): void
    {
        try {
            // Xác định đối tác (người cần nhận notification)
            $partnerId = $order->sender_id === $user->id ? $order->customer_id : $order->sender_id;

            if (!$partnerId) {
                return;
            }

            // Tạo title và body dựa trên status
            $statusLabels = [
                'picked_up'   => 'Đã nhận hàng',
                'in_transit'  => 'Đang vận chuyển',
                'arrived'     => 'Đã đến nơi',
                'delivered'   => 'Đã giao hàng',
                'completed'   => 'Hoàn tất',
                'cancelled'   => 'Đã hủy',
            ];

            $title = 'Cập nhật đơn hàng';
            $body = $this->getStatusMessage($newStatus);

            if ($order->tracking_code) {
                $body .= " - Mã đơn: {$order->tracking_code}";
            }

            // Push vào Firebase
            $this->firebaseService->pushNotification($partnerId, $title, $body, [
                'type' => 'order_status',
                'order_id' => $order->id,
                'order_uuid' => $order->uuid,
                'tracking_code' => $order->tracking_code,
                'status' => $newStatus,
            ]);

            // Gửi push notification qua Expo (cho background/killed state)
            $partner = User::find($partnerId);
            if ($partner && $partner->fcm_token) {
                ExpoPushService::sendNotification(
                    $partner->fcm_token,
                    $title,
                    $body,
                    [
                        'type' => 'order_status',
                        'order_id' => $order->id,
                        'order_uuid' => $order->uuid,
                        'tracking_code' => $order->tracking_code,
                        'status' => $newStatus,
                    ]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Error pushing order status notification: ' . $e->getMessage());
        }
    }

    /**
     * Upload ảnh khi sender giao hàng (pickup)
     */
    public function uploadPickupPhoto(Request $request, string $id)
    {
        $user = auth()->user();

        $order = Order::findOrFail($id);

        // Kiểm tra quyền: chỉ sender mới được upload pickup photo
        if ($order->sender_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thực hiện hành động này'
            ], 403);
        }

        // Validate status: cho phép upload pickup photo khi order ở các trạng thái có thể chụp ảnh
        // Cho phép upload khi đã confirmed/pending (chưa picked_up) hoặc đã picked_up trở đi (để thêm ảnh)
        if (!in_array($order->status, ['confirmed', 'pending', 'picked_up', 'in_transit', 'arrived', 'delivered'])) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể chụp ảnh ở trạng thái này'
            ], 400);
        }

        Log::info('📤 [Pickup Photo Upload] Bắt đầu upload', [
            'order_id' => $order->id,
            'order_status' => $order->status,
            'user_id' => $user->id,
            'has_photo' => $request->hasFile('photo'),
            'all_input_keys' => array_keys($request->all()),
        ]);

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB
        ]);

        try {
            // Upload ảnh
            $photo = $request->file('photo');

            Log::info('📄 [Pickup Photo Upload] File nhận được', [
                'original_name' => $photo->getClientOriginalName(),
                'mime_type' => $photo->getMimeType(),
                'size' => $photo->getSize(),
            ]);
            $filename = 'orders/' . $order->uuid . '/pickup_' . time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
            $path = $photo->storeAs('public', $filename);
            $photoUrl = Storage::url($filename);

            // Lấy danh sách ảnh hiện tại hoặc tạo mới
            $photos = $order->pickup_photos ?? [];
            $photos[] = [
                'url' => $photoUrl,
                'uploaded_at' => now()->toIso8601String(),
            ];

            // Cập nhật order
            $order->pickup_photos = $photos;

            // Chỉ cập nhật status và picked_up_at lần đầu tiên
            if (!$order->picked_up_at) {
                $order->status = 'picked_up';
                $order->picked_up_at = now();

                // Gửi thông báo cho customer
                $this->pushOrderStatusNotification($order, 'picked_up', $user);
            }

            $order->save();

            Log::info('✅ [Pickup Photo Upload] Upload thành công', [
                'order_id' => $order->id,
                'photo_url' => $photoUrl,
                'total_photos' => count($photos),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã chụp ảnh giao hàng thành công',
                'data' => [
                    'pickup_photos' => $photos,
                    'status' => $order->status
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [Pickup Photo Upload] Validation error', [
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ: ' . implode(', ', array_map(function ($errors) {
                    return implode(', ', $errors);
                }, $e->errors()))
            ], 422);
        } catch (\Exception $e) {
            Log::error('❌ [Pickup Photo Upload] Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Không thể upload ảnh. Vui lòng thử lại.'
            ], 500);
        }
    }

    /**
     * Upload ảnh khi customer nhận hàng (delivery)
     */
    public function uploadDeliveryPhoto(Request $request, string $id)
    {
        $user = auth()->user();

        $order = Order::findOrFail($id);

        // Kiểm tra quyền: chỉ customer mới được upload delivery photo
        if ($order->customer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thực hiện hành động này'
            ], 403);
        }

        Log::info('📤 [Delivery Photo Upload] Bắt đầu upload', [
            'order_id' => $order->id,
            'order_status' => $order->status,
            'user_id' => $user->id,
            'has_photo' => $request->hasFile('photo'),
            'all_input_keys' => array_keys($request->all()),
        ]);

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB
        ]);

        try {
            // Upload ảnh
            $photo = $request->file('photo');

            Log::info('📄 [Delivery Photo Upload] File nhận được', [
                'original_name' => $photo->getClientOriginalName(),
                'mime_type' => $photo->getMimeType(),
                'size' => $photo->getSize(),
            ]);

            $filename = 'orders/' . $order->uuid . '/delivery_' . time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
            $path = $photo->storeAs('public', $filename);
            $photoUrl = Storage::url($filename);

            // Lấy danh sách ảnh hiện tại hoặc tạo mới
            $photos = $order->delivery_photos ?? [];
            $photos[] = [
                'url' => $photoUrl,
                'uploaded_at' => now()->toIso8601String(),
            ];

            // Cập nhật order
            $order->delivery_photos = $photos;

            // Chỉ cập nhật status và delivered_at lần đầu tiên
            if (!$order->delivered_at) {
                $order->status = 'delivered';
                $order->delivered_at = now();

                // Gửi thông báo cho sender
                $this->pushOrderStatusNotification($order, 'delivered', $user);
            }

            $order->save();

            Log::info('✅ [Delivery Photo Upload] Upload thành công', [
                'order_id' => $order->id,
                'photo_url' => $photoUrl,
                'total_photos' => count($photos),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã chụp ảnh nhận hàng thành công',
                'data' => [
                    'delivery_photos' => $photos,
                    'status' => $order->status
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [Delivery Photo Upload] Validation error', [
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ: ' . implode(', ', array_map(function ($errors) {
                    return implode(', ', $errors);
                }, $e->errors()))
            ], 422);
        } catch (\Exception $e) {
            Log::error('❌ [Delivery Photo Upload] Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Không thể upload ảnh. Vui lòng thử lại.'
            ], 500);
        }
    }

    /**
     * Xóa ảnh pickup
     */
    public function deletePickupPhoto(Request $request, string $id)
    {
        $user = auth()->user();
        $order = Order::findOrFail($id);

        // Kiểm tra quyền
        if ($order->sender_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thực hiện hành động này'
            ], 403);
        }

        $request->validate([
            'photo_url' => 'required|string',
        ]);

        try {
            $photos = $order->pickup_photos ?? [];
            $photoUrl = $request->input('photo_url');

            // Tìm và xóa ảnh khỏi array
            $photos = array_filter($photos, function ($photo) use ($photoUrl) {
                return is_array($photo) ? ($photo['url'] ?? '') !== $photoUrl : $photo !== $photoUrl;
            });
            $photos = array_values($photos); // Re-index array

            // Xóa file từ storage
            $oldPath = str_replace('/storage/', '', $photoUrl);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            // Cập nhật order
            $order->pickup_photos = $photos;
            $order->save();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa ảnh thành công',
                'data' => [
                    'pickup_photos' => $photos
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting pickup photo: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa ảnh. Vui lòng thử lại.'
            ], 500);
        }
    }

    /**
     * Xóa ảnh delivery
     */
    public function deleteDeliveryPhoto(Request $request, string $id)
    {
        $user = auth()->user();
        $order = Order::findOrFail($id);

        // Kiểm tra quyền
        if ($order->customer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thực hiện hành động này'
            ], 403);
        }

        $request->validate([
            'photo_url' => 'required|string',
        ]);

        try {
            $photos = $order->delivery_photos ?? [];
            $photoUrl = $request->input('photo_url');

            // Tìm và xóa ảnh khỏi array
            $photos = array_filter($photos, function ($photo) use ($photoUrl) {
                return is_array($photo) ? ($photo['url'] ?? '') !== $photoUrl : $photo !== $photoUrl;
            });
            $photos = array_values($photos); // Re-index array

            // Xóa file từ storage
            $oldPath = str_replace('/storage/', '', $photoUrl);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            // Cập nhật order
            $order->delivery_photos = $photos;
            $order->save();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa ảnh thành công',
                'data' => [
                    'delivery_photos' => $photos
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting delivery photo: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa ảnh. Vui lòng thử lại.'
            ], 500);
        }
    }
}
