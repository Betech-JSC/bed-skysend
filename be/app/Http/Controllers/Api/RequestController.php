<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrivateRequestRequest;
use App\Models\Flight;
use App\Models\Order;
use App\Models\Request as ModelsRequest;
use App\Models\RequestMatch;
use App\Models\User;
use App\Services\WalletService;
use App\Services\FirebaseService;
use App\Services\ExpoPushService;
use App\Services\RequestMatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class RequestController extends Controller
{
    public function __construct(
        private WalletService $walletService,
        private FirebaseService $firebaseService,
        private RequestMatchingService $matchingService
    ) {}

    /**
     * Validate sender request với các rules:
     * - Kiểm tra trạng thái user (bị khóa/vi phạm)
     * - Kiểm tra số lượng request active tối đa
     * - Kiểm tra trùng đơn hàng (cùng lộ trình + thời gian)
     * - Kiểm tra hạn chế thời gian (không quá khứ, không quá 6 tháng)
     * - Kiểm tra hạn chế khối lượng
     */
    private function validateSenderRequest(array $data, ?int $flightId = null): array
    {
        $userId = auth()->id();
        $user = auth()->user();

        // 1. Kiểm tra trạng thái user (bị khóa/vi phạm)
        if ($user->trashed()) {
            return [
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ SkySend để được hỗ trợ.',
            ];
        }

        // 2. Kiểm tra số lượng request active tối đa (5 request)
        $activeRequestCount = ModelsRequest::where('sender_id', $userId)
            ->whereNotIn('status', ['completed', 'cancelled', 'declined', 'expired'])
            ->count();

        if ($activeRequestCount >= 5) {
            return [
                'success' => false,
                'message' => 'Bạn đã đạt giới hạn 5 request đang hoạt động. Vui lòng hủy hoặc hoàn thành các request hiện tại trước khi tạo mới.',
            ];
        }

        // 3. Kiểm tra trùng đơn hàng (cùng sender + lộ trình + thời gian)
        $fromAirport = $data['from_airport'] ?? null;
        $toAirport = $data['to_airport'] ?? null;
        $desiredDate = $data['desired_date'] ?? null;
        $flightDate = null;

        // Nếu có flight_id, lấy flight_date từ flight
        if ($flightId) {
            $flight = Flight::find($flightId);
            if ($flight) {
                $fromAirport = $flight->from_airport;
                $toAirport = $flight->to_airport;
                $flightDate = $flight->flight_date;
            }
        }

        if ($fromAirport && $toAirport && ($desiredDate || $flightDate)) {
            $dateToCheck = $desiredDate ?? $flightDate;

            $duplicateQuery = ModelsRequest::where('sender_id', $userId)
                ->where('from_airport', strtoupper($fromAirport))
                ->where('to_airport', strtoupper($toAirport))
                ->whereNotIn('status', ['completed', 'cancelled', 'declined', 'expired']);

            if ($flightId) {
                // Nếu có flight_id, kiểm tra theo flight_id (chính xác hơn)
                $duplicateQuery->where('flight_id', $flightId);
            } else {
                // Nếu không có flight_id, kiểm tra theo desired_date
                $duplicateQuery->whereDate('desired_date', $dateToCheck);
            }

            $duplicateRequest = $duplicateQuery->first();

            if ($duplicateRequest) {
                return [
                    'success' => false,
                    'message' => 'Bạn đã có request đang hoạt động cho tuyến này vào ngày này. Vui lòng hủy request cũ trước khi tạo mới.',
                ];
            }
        }

        // 4. Kiểm tra hạn chế thời gian (không quá khứ, không quá 6 tháng)
        $dateToValidate = $desiredDate ?? $flightDate;
        if ($dateToValidate) {
            $date = \Carbon\Carbon::parse($dateToValidate);
            $sixMonthsLater = now()->addMonths(6);

            if ($date->isPast() && !$date->isToday()) {
                return [
                    'success' => false,
                    'message' => 'Không thể tạo request cho ngày trong quá khứ. Vui lòng chọn ngày hiện tại hoặc tương lai.',
                ];
            }

            if ($date->isAfter($sixMonthsLater)) {
                return [
                    'success' => false,
                    'message' => 'Không thể tạo request cho ngày quá xa (hơn 6 tháng). Vui lòng chọn ngày trong vòng 6 tháng tới.',
                ];
            }
        }

        // 5. Kiểm tra hạn chế khối lượng (nếu có desired_weight)
        if (isset($data['desired_weight'])) {
            $maxWeight = 50; // kg
            if ($data['desired_weight'] > $maxWeight) {
                return [
                    'success' => false,
                    'message' => "Khối lượng vượt quá giới hạn ({$maxWeight}kg). Vui lòng liên hệ SkySend để được hỗ trợ cho các gói hàng lớn hơn.",
                ];
            }
        }

        return ['success' => true];
    }
    public function index(Request $request)
    {
        $user = auth()->user();

        // Chỉ lấy requests khi user ở role sender
        // Khi user ở role customer, họ không nên thấy requests của chính họ
        if ($user->role === 'customer') {
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => [],
                    'current_page' => 1,
                    'total' => 0,
                    'per_page' => 20,
                    'last_page' => 1,
                ],
                'message' => 'Bạn đang ở vai trò hành khách. Vui lòng chuyển sang vai trò người gửi để xem các yêu cầu của bạn.'
            ]);
        }

        $query = ModelsRequest::with(['flight'])
            ->where('sender_id', $user->id);

        // Filter theo status nếu có
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($requests);
    }

    public function store(StorePrivateRequestRequest $request) // Laravel tự validate
    {
        $user = auth()->user();

        // Chỉ cho phép tạo request khi user ở role sender
        if ($user->role === 'customer') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đang ở vai trò hành khách. Vui lòng chuyển sang vai trò người gửi để tạo yêu cầu.'
            ], 403);
        }

        $validated = $request->validated(); // Đã được validate và an toàn

        // Validate sender request
        $validation = $this->validateSenderRequest($validated, $validated['flight_id']);
        if (!$validation['success']) {
            return response()->json($validation, 422);
        }

        $flight = Flight::with('customer')->findOrFail($validated['flight_id']);

        // Không cho phép gửi request cho chính chuyến bay của mình
        if ($flight->customer_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể gửi yêu cầu cho chính chuyến bay của mình.'
            ], 403);
        }

        if (($flight->max_weight - $flight->booked_weight) < 0.5) {
            return response()->json([
                'success' => false,
                'message' => 'Hành khách đã hết chỗ mang thêm (dưới 0.5kg)'
            ], 400);
        }

        $exists = ModelsRequest::where('sender_id', auth()->id())
            ->where('flight_id', $flight->id)
            ->where('status', 'pending')
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã gửi yêu cầu cho chuyến bay này rồi!'
            ], 400);
        }

        $priorityLevel = $validated['priority_level'] ?? 'normal';
        $expiresInHours = match ($priorityLevel) {
            'urgent'   => 12,
            'priority' => 24,
            default    => 48,
        };

        $privateReq = ModelsRequest::create([
            'uuid'             => ModelsRequest::generateRequestUuid(),
            'sender_id'        => auth()->id(),
            'flight_id'        => $flight->id,
            'reward'           => $validated['reward'],
            'item_value'       => $validated['item_value'],
            'item_description' => $validated['item_description'],
            'time_slot'        => $validated['time_slot'],
            'note'             => $validated['note'],
            'priority_level'   => $priorityLevel,
            'status'           => 'pending',
            'expires_at'       => now()->addHours($expiresInHours),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi yêu cầu thành công! Hành khách sẽ phản hồi trong 24h.',
            'data'    => $privateReq
        ], 201);
    }

    public function sent(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'flight_id'           => 'required|exists:flights,id',
            'reward'              => 'required|numeric|min:50000|max:10000000',
            'item_value'          => 'required|numeric|min:100000',
            'item_description'    => 'required|string|max:1000',
            'note'                => 'nullable|string|max:500',
        ]);

        // Validate sender request
        $validation = $this->validateSenderRequest($validated, $validated['flight_id']);
        if (!$validation['success']) {
            return response()->json($validation, 422);
        }

        // Get flight with customer info
        $flight = Flight::with('customer')->findOrFail($validated['flight_id']);

        // Check if flight is verified
        if (!$flight->verified) {
            return response()->json([
                'success' => false,
                'message' => 'Chuyến bay chưa được xác thực. Vui lòng chọn chuyến bay đã được xác thực.'
            ], 400);
        }

        // Check available weight
        $availableWeight = $flight->max_weight - $flight->booked_weight;
        if ($availableWeight < 0.5) {
            return response()->json([
                'success' => false,
                'message' => 'Hành khách đã hết chỗ mang thêm (dưới 0.5kg)'
            ], 400);
        }

        // Check if sender already sent a pending request for this flight
        $exists = ModelsRequest::where('sender_id', auth()->id())
            ->where('flight_id', $flight->id)
            ->where('status', 'pending')
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã gửi yêu cầu cho chuyến bay này rồi!'
            ], 400);
        }

        // Check if sender is trying to send request to their own flight
        if ($flight->customer_id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể gửi yêu cầu cho chuyến bay của chính mình.'
            ], 400);
        }

        // Set priority level (default to normal)
        $priorityLevel = 'normal';
        $expiresInHours = 48; // Default 48 hours

        // Create the request
        $privateReq = ModelsRequest::create([
            'uuid'             => ModelsRequest::generateRequestUuid(),
            'sender_id'        => auth()->id(),
            'flight_id'        => $flight->id,
            'reward'           => $validated['reward'],
            'item_value'       => $validated['item_value'],
            'item_description' => $validated['item_description'],
            'note'             => $validated['note'] ?? null,
            'priority_level'   => $priorityLevel,
            'status'           => 'pending',
            'expires_at'       => now()->addHours($expiresInHours),
        ]);

        // Gửi notification tới customer (push notification + Firebase)
        $customer = $flight->customer;
        if ($customer) {
            $sender = auth()->user();

            // Push notification vào Firebase
            $this->firebaseService->pushNotification(
                $customer->id,
                'Yêu cầu mới',
                "Bạn có yêu cầu mới từ {$sender->name} với phần thưởng " . number_format($validated['reward']) . ' VNĐ',
                [
                    'type' => 'new_request',
                    'request_id' => $privateReq->id,
                    'request_uuid' => $privateReq->uuid,
                    'flight_id' => $flight->id,
                    'sender_id' => $sender->id,
                    'sender_name' => $sender->name,
                    'reward' => $validated['reward'],
                ]
            );

            // Gửi push notification qua Expo (nếu có token)
            if ($customer->fcm_token) {
                ExpoPushService::sendNotification(
                    $customer->fcm_token,
                    'Yêu cầu mới',
                    "Bạn có yêu cầu mới từ {$sender->name} với phần thưởng " . number_format($validated['reward']) . ' VNĐ',
                    [
                        'type' => 'new_request',
                        'request_id' => $privateReq->id,
                        'flight_id' => $flight->id,
                    ]
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi yêu cầu thành công! Hành khách sẽ phản hồi trong 24h.',
            'data'    => $privateReq
        ], 201);
    }

    public function accept(string $id)
    {
        return $this->updateStatus($id, 'accepted');
    }

    public function decline(string $id)
    {
        return $this->updateStatus($id, 'declined');
    }

    private function updateStatus(string $id, string $newStatus = 'accepted')
    {
        $request = ModelsRequest::with('flight')->where('id', $id)->firstOrFail();

        // 1. Kiểm tra quyền: chỉ customer của chuyến bay mới được thao tác
        if ($request->flight->customer_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thực hiện hành động này.'
            ], 403);
        }

        // 2. Không cho thao tác nếu đã hết hạn hoặc đã xử lý rồi
        if ($request->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Yêu cầu này đã được xử lý trước đó.'
            ], 400);
        }

        if ($request->expires_at->isPast()) {
            $request->update(['status' => 'expired']);
            return response()->json([
                'success' => false,
                'message' => 'Yêu cầu đã hết hạn.'
            ], 400);
        }

        // Nếu là decline, chỉ cập nhật status và gửi notification
        if ($newStatus === 'declined') {
            $request->update([
                'status' => 'declined',
                'responded_at' => now(),
            ]);

            // Push notification vào Firebase cho sender
            $sender = $request->sender;
            if ($sender) {
                $customer = $request->flight->customer;
                $this->firebaseService->pushNotification(
                    $sender->id,
                    'Yêu cầu bị từ chối',
                    "Yêu cầu của bạn đã bị {$customer->name} từ chối.",
                    [
                        'type' => 'request_declined',
                        'request_id' => $request->id,
                        'request_uuid' => $request->uuid,
                        'flight_id' => $request->flight_id,
                    ]
                );

                // Gửi push notification qua Expo (cho background/killed state)
                if ($sender->fcm_token) {
                    ExpoPushService::sendNotification(
                        $sender->fcm_token,
                        'Yêu cầu bị từ chối',
                        "Yêu cầu của bạn đã bị {$customer->name} từ chối.",
                        [
                            'type' => 'request_declined',
                            'request_id' => $request->id,
                            'request_uuid' => $request->uuid,
                            'flight_id' => $request->flight_id,
                        ]
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã từ chối yêu cầu.',
                'data' => $request->fresh()
            ], 200);
        }

        // Nếu là accept, tạo order
        try {
            // 3. Tạo Order + cập nhật trạng thái trong transaction (an toàn tuyệt đối)
            return DB::transaction(function () use ($request) {
                // Tạo chat room trên Firebase trước
                $chatId = $this->firebaseService->createChatRoomForOrder(
                    $request->id, // Tạm thời dùng request_id, sẽ update sau khi có order_id
                    $request->sender_id,
                    $request->flight->customer_id
                );

                // Lấy weight từ request (desired_weight hoặc default 0.5kg)
                $weight = $request->desired_weight ?? 0.5;

                // Tạo đơn hàng
                $order = Order::create([
                    'uuid'                   => Order::generateOrderUuid(),
                    'request_id'             => $request->id,
                    'sender_id'              => $request->sender_id,
                    'customer_id'            => $request->flight->customer_id,
                    'flight_id'              => $request->flight_id,
                    'chat_id'                => $chatId, // Lưu chat_id vào order
                    'reward'                 => $request->reward,
                    'service_fee'            => 0, // bạn tính sau hoặc để config
                    'insurance_fee'          => 0,
                    'total_amount'           => $request->reward, // tạm thời = reward
                    'escrow_amount'          => $request->reward, // tiền sẽ giữ hộ
                    'escrow_status'          => 'held',
                    'tracking_code'          => \App\Models\Order::generateTrackingCode(), // Format: SK + random số và string
                    'status'                 => 'confirmed', // trạng thái đầu tiên
                    'confirmed_at'           => now(),
                    'customer_note'          => $request->note,
                    'meeting_point_departure' => null, // sẽ update sau khi chat
                    'insured'                => false,
                    'metadata'               => [
                        'time_slot'  => $request->time_slot,
                        'item_value' => $request->item_value,
                        'weight'     => $weight, // Lưu weight để có thể truy xuất sau này
                    ],
                ]);

                // Cập nhật booked_weight của flight
                $flight = $request->flight;
                if ($flight) {
                    $flight->increaseBookedWeight($weight);
                }

                // Cập nhật chat room trên Firebase với order_id thực tế
                if ($chatId) {
                    $this->firebaseService->update("chats/{$chatId}", [
                        'order_id' => $order->id,
                        'updated_at' => now()->timestamp,
                    ]);
                }

                $order->load(['sender', 'customer', 'flight']);

                // $this->walletService->holdEscrow($order);

                // Cập nhật request
                $request->update([
                    'status'        => 'accepted',
                ]);

                // Tự động từ chối các request pending khác cùng chuyến bay
                ModelsRequest::where('flight_id', $request->flight_id)
                    ->where('id', '!=', $request->id)
                    ->where('status', 'pending')
                    ->update([
                        'status'        => 'auto_declined',
                    ]);

                // Push notification vào Firebase cho sender
                $sender = $request->sender;
                if ($sender) {
                    $customer = $request->flight->customer;
                    $this->firebaseService->pushNotification(
                        $sender->id,
                        'Yêu cầu được chấp nhận',
                        "Yêu cầu của bạn đã được {$customer->name} chấp nhận. Đơn hàng #{$order->tracking_code} đã được tạo.",
                        [
                            'type' => 'request_accepted',
                            'request_id' => $request->id,
                            'request_uuid' => $request->uuid,
                            'order_id' => $order->id,
                            'order_uuid' => $order->uuid,
                            'tracking_code' => $order->tracking_code,
                            'chat_id' => $chatId,
                        ]
                    );

                    // Gửi push notification qua Expo (cho background/killed state)
                    if ($sender->fcm_token) {
                        ExpoPushService::sendNotification(
                            $sender->fcm_token,
                            'Yêu cầu được chấp nhận',
                            "Yêu cầu của bạn đã được {$customer->name} chấp nhận. Đơn hàng #{$order->tracking_code} đã được tạo.",
                            [
                                'type' => 'request_accepted',
                                'request_id' => $request->id,
                                'request_uuid' => $request->uuid,
                                'order_id' => $order->id,
                                'order_uuid' => $order->uuid,
                                'tracking_code' => $order->tracking_code,
                                'chat_id' => $chatId,
                            ]
                        );
                    }
                }

                // Trả về thông tin đẹp cho Customer
                return response()->json([
                    'success' => true,
                    'message' => 'Đã chấp nhận yêu cầu, giữ hộ tiền và tạo đơn hàng thành công!',
                    'data' => [
                        'order'    => $order,
                        'request'  => $request,
                    ]
                ], 200);
            });
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Không thể giữ hộ tiền do ví không đủ.',
                'errors'  => $e->errors(),
            ], 422);
        }
    }

    // danh sách requests đang chờ
    public function listPendingRequests()
    {
        $requests = ModelsRequest::with(['sender', 'flight'])
            ->whereHas('flight', fn($q) => $q->where('customer_id', auth()->id()))
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    public function priorityForCustomer(Request $request)
    {
        $customerId = $request->user()->id;
        $perPage = (int) min($request->query('per_page', 10), 50);

        $requests = ModelsRequest::with([
            'sender:id,name,avatar,phone',
            'flight',
        ])
            ->whereHas('flight', fn($q) => $q->where('customer_id', $customerId))
            ->priorityOnly()
            ->active()
            ->orderByRaw("FIELD(priority_level, 'urgent','priority','normal')")
            ->orderBy('expires_at')
            ->paginate($perPage);

        $requests->getCollection()->transform(fn($req) => $this->transformCustomerRequest($req, $customerId));

        return response()->json([
            'success' => true,
            'data'    => $requests,
        ]);
    }

    public function matchingForCustomer(Request $request)
    {
        $user = $request->user();
        $customerId = $user->id;
        $perPage = (int) min($request->query('per_page', 15), 50);

        // Chỉ cho phép xem khi user ở role customer
        if ($user->role === 'sender') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đang ở vai trò người gửi. Vui lòng chuyển sang vai trò hành khách để xem các yêu cầu.'
            ], 403);
        }

        $builder = ModelsRequest::with([
            'sender',
            'flight',
        ])
            ->whereHas('flight', fn($q) => $q->where('customer_id', $customerId))
            ->where('sender_id', '!=', $customerId) // Loại trừ requests của chính user khi họ là sender
            ->active();

        if ($request->filled('priority_level') && in_array($request->priority_level, ['normal', 'priority', 'urgent'])) {
            $builder->where('priority_level', $request->priority_level);
        }

        if ($request->filled('time_slot')) {
            $builder->where('time_slot', $request->time_slot);
        }

        if ($request->filled('min_reward')) {
            $builder->where('reward', '>=', (int) $request->min_reward);
        }

        if ($request->filled('max_reward')) {
            $builder->where('reward', '<=', (int) $request->max_reward);
        }

        $requests = $builder
            ->orderByDesc('reward')
            ->orderBy('expires_at')
            ->paginate($perPage);

        $requests->getCollection()->transform(fn($req) => $this->transformCustomerRequest($req, $customerId));

        return response()->json([
            'success' => true,
            'data'    => $requests,
        ]);
    }

    /**
     * Lấy danh sách requests của một flight (cho customer xem)
     */
    public function getRequestsByFlight(Request $request, string $flightId)
    {
        $user = auth()->user();

        // Chỉ cho phép xem khi user ở role customer
        if ($user->role === 'sender') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đang ở vai trò người gửi. Vui lòng chuyển sang vai trò hành khách để xem các yêu cầu.'
            ], 403);
        }

        $flight = Flight::findOrFail($flightId);

        // Chỉ customer của flight mới được xem requests
        if ($flight->customer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem requests của chuyến bay này.'
            ], 403);
        }

        $requests = ModelsRequest::with([
            'sender',
            'flight',
            'order', // Include order if request is accepted/confirmed
        ])
            ->where('flight_id', $flightId)
            ->where('sender_id', '!=', $user->id) // Loại trừ requests của chính user khi họ là sender
            // Lấy tất cả requests với mọi trạng thái, không chỉ pending
            ->orderByRaw("FIELD(status, 'pending', 'accepted', 'confirmed', 'declined', 'expired', 'cancelled')")
            ->orderByRaw("FIELD(priority_level, 'urgent','priority','normal')")
            ->orderByDesc('reward')
            ->orderByDesc('created_at')
            ->get();

        $requests->transform(fn($req) => $this->transformCustomerRequest($req, $user->id));

        return response()->json([
            'success' => true,
            'data'    => $requests,
        ]);
    }

    private function transformCustomerRequest(ModelsRequest $request, ?int $customerId = null): array
    {
        $flight = $request->flight;
        $sender = $request->sender;

        return [
            'id'              => $request->id,
            'uuid'            => $request->uuid,
            'status'          => $request->status,
            'priority_level'  => $request->priority_level,
            'priority_label'  => $request->priority_label,
            'reward'          => (float) $request->reward,
            'expires_at'      => $request->expires_at?->toIso8601String(),
            'time_slot'       => $request->time_slot,
            'created_at'      => $request->created_at?->toIso8601String(),
            'responded_at'    => $request->responded_at?->toIso8601String(),
            'can_accept'      => $request->can_accept && $flight?->customer_id === $customerId,
            'is_expired'      => $request->is_expired,
            'item'            => [
                'type'        => $request->item_type,
                'value'       => $request->item_value,
                'description' => $request->item_description,
            ],
            'sender'          => [
                'id'     => $sender?->id,
                'name'   => $sender?->name,
                'avatar' => $sender?->avatar,
                'phone'  => $sender?->phone,
            ],
            'flight'          => $flight ? [
                'id'               => $flight->id,
                'uuid'             => $flight->uuid,
                'from_airport'     => $flight->from_airport,
                'to_airport'       => $flight->to_airport,
                'flight_date'      => $flight->flight_date?->toDateString(),
                'airline'          => $flight->airline,
                'flight_number'    => $flight->flight_number,
                'available_weight' => $flight->available_weight,
            ] : null,
            'order'           => $request->order ? [
                'id'        => $request->order->id,
                'uuid'      => $request->order->uuid,
                'status'    => $request->order->status,
            ] : null,
            'order_id'        => $request->order_id,
            'note'            => $request->note,
            'item_description' => $request->item_description,
            'item_value'      => (float) $request->item_value,
        ];
    }

    // CHi tiết
    public function show(string $id)
    {
        $user = auth()->user();

        $request = ModelsRequest::with([
            'sender',
            'flight.customer',
            'order'
        ])
            ->where('id', $id)
            ->firstOrFail();

        // === KIỂM TRA QUYỀN TRUY CẬP ===
        $isSender   = $request->sender_id === $user->id;
        $isCustomer = $request->flight && $request->flight->customer_id === $user->id;

        // Kiểm tra role: sender chỉ xem được requests của chính họ, customer chỉ xem được requests trên flights của họ
        if ($isSender && $user->role !== 'sender') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đang ở vai trò hành khách. Vui lòng chuyển sang vai trò người gửi để xem yêu cầu này.'
            ], 403);
        }

        if ($isCustomer && $user->role !== 'customer') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đang ở vai trò người gửi. Vui lòng chuyển sang vai trò hành khách để xem yêu cầu này.'
            ], 403);
        }

        if (!$isSender && !$isCustomer) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem yêu cầu này.'
            ], 403);
        }

        // Chỉ Customer mới được xem nếu request còn pending hoặc đã xử lý của chính mình
        if (!$isSender && !in_array($request->status, ['pending', 'accepted', 'declined', 'auto_declined'])) {
            return response()->json([
                'success' => false,
                'message' => 'Yêu cầu này không còn tồn tại hoặc đã hết hạn.'
            ], 404);
        }

        // Nếu request đang chờ match (chưa có flight), chỉ sender mới xem được
        if (!$request->flight_id && !$isSender) {
            return response()->json([
                'success' => false,
                'message' => 'Request này đang chờ match, chỉ sender mới xem được.'
            ], 403);
        }

        // Transform dữ liệu đẹp cho frontend
        $data = [
            'id'              => $request->id,
            'uuid'              => $request->uuid,
            'status'            => $request->status,
            'status_label'      => $request->status,
            'created_at'        => $request->created_at->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i'),
            'expires_at'        => $request->expires_at?->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i'),
            'responded_at'      => $request->responded_at?->timezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i'),
            'can_accept'        => $isCustomer && $request->status === 'pending' && !$request->expires_at?->isPast(),
            'can_decline'       => $isCustomer && $request->status === 'pending' && !$request->expires_at?->isPast(),

            // Thông tin người gửi (Sender)
            'sender' => [
                'id'      => $request->sender->id,
                'name'    => $request->sender->name,
                'avatar'  => $request->sender->avatar,
                'phone'   => $request->sender->phone,
                'rating'  =>  0,
            ],

            // Thông tin chuyến bay (có thể null nếu đang chờ match)
            'flight' => $request->flight ? [
                'id'            => $request->flight->id,
                'uuid'          => $request->flight->uuid,
                'flight_number' => $request->flight->flight_number,
                'airline'       => $request->flight->airline,
                'from_airport'  => $request->flight->from_airport,
                'to_airport'    => $request->flight->to_airport,
                'flight_date'   => $request->flight->flight_date->format('d/m/Y'),
                'available_weight' => round($request->flight->max_weight - $request->flight->booked_weight, 2),
                'customer'      => $request->flight->customer ? [
                    'id'        => $request->flight->customer->id,
                    'name'      => $request->flight->customer->name,
                    'email'     => $request->flight->customer->email,
                    'phone'     => $request->flight->customer->phone,
                    'avatar'    => $request->flight->customer->avatar,
                    'kyc_status' => $request->flight->customer->kyc_status,
                ] : null,
            ] : null,

            // Nội dung yêu cầu
            'reward'            => (int) $request->reward,
            'item_value'        => (int) $request->item_value,
            'item_description'  => $request->item_description,
            'item_images'       => $request->item_images ?? [],
            'note'              => $request->note,

            // Thông tin matching (nếu đang chờ match)
            'from_airport'      => $request->from_airport,
            'to_airport'        => $request->to_airport,
            'desired_date'      => $request->desired_date?->format('Y-m-d'),
            'desired_time_slot' => $request->desired_time_slot,
            'desired_weight'    => $request->desired_weight ? (float) $request->desired_weight : null,
            'item_type'         => $request->item_type,
            'priority_level'    => $request->priority_level,

            // Nếu đã được chấp nhận → có đơn hàng
            'order' => $request->order ? [
                'uuid'          => $request->order->uuid,
                'tracking_code' => $request->order->tracking_code,
                'status'        => $request->order->status,
                'escrow_status' => $request->order->escrow_status,
            ] : null,
        ];

        return response()->json([
            'success' => true,
            'data'    => $data
        ]);
    }

    /**
     * Sender hủy request đã gửi (chỉ được hủy khi còn pending)
     */
    public function cancel(string $id)
    {
        $user = auth()->user();

        $request = ModelsRequest::with(['flight.customer', 'matches'])
            ->where('id', $id)
            ->firstOrFail();

        // 1. Chỉ người gửi mới được hủy
        if ($request->sender_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền hủy yêu cầu này.'
            ], 403);
        }

        // 2. Chỉ được hủy khi còn pending hoặc expired (không được hủy nếu đã accepted)
        if (!in_array($request->status, ['pending', 'expired'])) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể hủy yêu cầu này vì đã được xử lý.'
            ], 400);
        }

        // 3. Nếu đã hết hạn thì chỉ đánh dấu, không cần thông báo
        if ($request->expires_at?->isPast()) {
            $request->update(['status' => 'expired']);
            return response()->json([
                'success' => true,
                'message' => 'Yêu cầu đã hết hạn từ trước.'
            ]);
        }

        try {
            // Lưu flight_id trước khi thay đổi
            $hadFlightId = $request->flight_id !== null;
            $flightIdBeforeCancel = $request->flight_id;

            DB::transaction(function () use ($request, $flightIdBeforeCancel) {
                // 4. Nếu request đã gửi tới customer (có flight_id)
                if ($request->flight_id !== null) {
                    $flight = $request->flight;
                    $customer = $flight?->customer;

                    // Tìm RequestMatch tương ứng và đánh dấu là rejected
                    $match = RequestMatch::where('request_id', $request->id)
                        ->where('flight_id', $request->flight_id)
                        ->where('status', 'sent')
                        ->first();

                    if ($match) {
                        $match->status = 'rejected';
                        $match->save();
                    }

                    // Set flight_id = null để request quay lại trạng thái chờ match
                    $request->flight_id = null;
                    $request->status = 'pending'; // Quay lại pending để có thể match lại

                    // Gửi notification cho customer
                    if ($customer) {
                        $sender = auth()->user();

                        // Push notification vào Firebase
                        $this->firebaseService->pushNotification(
                            $customer->id,
                            'Yêu cầu đã bị hủy',
                            "Yêu cầu từ {$sender->name} đã bị hủy.",
                            [
                                'type' => 'request_cancelled',
                                'request_id' => $request->id,
                                'request_uuid' => $request->uuid,
                                'flight_id' => $flightIdBeforeCancel,
                                'sender_id' => $sender->id,
                                'sender_name' => $sender->name,
                            ]
                        );

                        // Gửi push notification qua Expo
                        if ($customer->fcm_token) {
                            ExpoPushService::sendNotification(
                                $customer->fcm_token,
                                'Yêu cầu đã bị hủy',
                                "Yêu cầu từ {$sender->name} đã bị hủy.",
                                [
                                    'type' => 'request_cancelled',
                                    'request_id' => $request->id,
                                    'flight_id' => $flightIdBeforeCancel,
                                ]
                            );
                        }
                    }
                } else {
                    // Request chưa gửi (đang chờ match), chỉ đổi status
                    $request->status = 'cancelled';
                }

                $request->save();
            });

            return response()->json([
                'success' => true,
                'message' => $hadFlightId
                    ? 'Đã hủy yêu cầu và gỡ khỏi customer. Request sẽ quay lại trạng thái chờ match.'
                    : 'Đã hủy yêu cầu thành công!',
                'data'    => $request->fresh(['flight.customer'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi hủy yêu cầu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật request đang chờ match (chỉ được cập nhật khi chưa có flight_id)
     */
    public function updateWaiting(Request $request, string $id)
    {
        $user = auth()->user();

        // Chỉ cho phép cập nhật khi user ở role sender
        if ($user->role === 'customer') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đang ở vai trò hành khách. Vui lòng chuyển sang vai trò người gửi để cập nhật yêu cầu.'
            ], 403);
        }

        $existingRequest = ModelsRequest::where('id', $id)
            ->where('sender_id', $user->id)
            ->firstOrFail();

        // Chỉ được cập nhật khi request đang chờ match (chưa có flight_id)
        if ($existingRequest->flight_id !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể chỉnh sửa request đã được gửi tới customer.'
            ], 400);
        }

        // Chỉ được cập nhật khi status = pending
        if ($existingRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể chỉnh sửa request đang ở trạng thái pending.'
            ], 400);
        }

        $validated = $request->validate([
            'from_airport' => 'required|string|size:3',
            'to_airport' => 'required|string|size:3',
            'desired_date' => 'required|date|after_or_equal:today',
            'desired_time_slot' => 'nullable|string|in:morning,afternoon,evening,any',
            'desired_weight' => 'nullable|numeric|min:0.5|max:50',
            'item_type' => 'required|string|in:document,contract,package,gift,other',
            'item_description' => 'required|string|max:1000',
            'item_images' => 'nullable|array',
            'item_images.*' => 'nullable|string|url',
            'item_value' => 'required|numeric|min:100000',
            'reward' => 'required|numeric|min:50000|max:10000000',
            'note' => 'nullable|string|max:500',
            'priority_level' => 'nullable|string|in:normal,priority,urgent',
        ]);

        $priorityLevel = $validated['priority_level'] ?? $existingRequest->priority_level ?? 'normal';
        $expiresInHours = match ($priorityLevel) {
            'urgent' => 12,
            'priority' => 24,
            default => 48,
        };

        try {
            DB::transaction(function () use ($existingRequest, $validated, $priorityLevel, $expiresInHours) {
                // Cập nhật thông tin request
                $existingRequest->update([
                    'from_airport' => $validated['from_airport'],
                    'to_airport' => $validated['to_airport'],
                    'desired_date' => $validated['desired_date'],
                    'desired_time_slot' => $validated['desired_time_slot'] ?? 'any',
                    'desired_weight' => $validated['desired_weight'] ?? null,
                    'item_type' => $validated['item_type'],
                    'item_description' => $validated['item_description'],
                    'item_images' => $validated['item_images'] ?? null,
                    'item_value' => $validated['item_value'],
                    'reward' => $validated['reward'],
                    'note' => $validated['note'] ?? null,
                    'priority_level' => $priorityLevel,
                    'expires_at' => now()->addHours($expiresInHours),
                ]);

                // Xóa các matches cũ và match lại
                $existingRequest->matches()->delete();
            });

            // Match lại request với các flights mới
            $matches = $this->matchingService->matchRequest($existingRequest->fresh());

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật request thành công! ' . (count($matches) > 0
                    ? "Tìm thấy " . count($matches) . " customer phù hợp."
                    : 'Hệ thống sẽ thông báo khi có khách hàng phù hợp.'),
                'data' => [
                    'request' => $existingRequest->fresh(),
                    'match_count' => count($matches),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo request không cần flight_id (chờ hệ thống match)
     */
    public function createWaiting(Request $request)
    {
        $user = auth()->user();

        // Chỉ cho phép tạo request chờ match khi user ở role sender
        if ($user->role === 'customer') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đang ở vai trò hành khách. Vui lòng chuyển sang vai trò người gửi để tạo yêu cầu.'
            ], 403);
        }

        $validated = $request->validate([
            'from_airport' => 'required|string|size:3',
            'to_airport' => 'required|string|size:3',
            'desired_date' => 'required|date|after_or_equal:today',
            'desired_time_slot' => 'nullable|string|in:morning,afternoon,evening,any',
            'desired_weight' => 'nullable|numeric|min:0.5|max:50',
            'item_type' => 'required|string|in:document,contract,package,gift,other',
            'item_description' => 'required|string|max:1000',
            'item_images' => 'nullable|array',
            'item_images.*' => 'nullable|string|url',
            'item_value' => 'required|numeric|min:100000',
            'reward' => 'required|numeric|min:50000|max:10000000',
            'note' => 'nullable|string|max:500',
            'priority_level' => 'nullable|string|in:normal,priority,urgent',
        ]);

        // Validate sender request
        $validation = $this->validateSenderRequest($validated);
        if (!$validation['success']) {
            return response()->json($validation, 422);
        }

        $priorityLevel = $validated['priority_level'] ?? 'normal';
        $expiresInHours = match ($priorityLevel) {
            'urgent' => 12,
            'priority' => 24,
            default => 48,
        };

        $waitingRequest = ModelsRequest::create([
            'uuid' => ModelsRequest::generateRequestUuid(),
            'sender_id' => auth()->id(),
            'flight_id' => null, // Chưa có flight
            'from_airport' => $validated['from_airport'],
            'to_airport' => $validated['to_airport'],
            'desired_date' => $validated['desired_date'],
            'desired_time_slot' => $validated['desired_time_slot'] ?? 'any',
            'desired_weight' => $validated['desired_weight'] ?? null,
            'item_type' => $validated['item_type'],
            'item_description' => $validated['item_description'],
            'item_images' => $validated['item_images'] ?? null,
            'item_value' => $validated['item_value'],
            'reward' => $validated['reward'],
            'note' => $validated['note'] ?? null,
            'priority_level' => $priorityLevel,
            'status' => 'pending',
            'expires_at' => now()->addHours($expiresInHours),
        ]);

        // Match ngay với flights hiện có
        $matches = $this->matchingService->matchRequest($waitingRequest);

        return response()->json([
            'success' => true,
            'message' => count($matches) > 0
                ? "Đã tạo request thành công! Tìm thấy " . count($matches) . " customer phù hợp."
                : 'Đã tạo request thành công! Hệ thống sẽ thông báo khi có khách hàng phù hợp.',
            'data' => [
                'request' => $waitingRequest->load('matches'),
                'match_count' => count($matches),
            ]
        ], 201);
    }

    /**
     * Lấy danh sách matches của một request
     */
    public function getMatches(string $id)
    {
        $request = ModelsRequest::with(['matches.flight.customer', 'matches.customer'])
            ->where('id', $id)
            ->firstOrFail();

        // Chỉ sender của request mới xem được
        if ($request->sender_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem matches của request này.'
            ], 403);
        }

        $matches = $request->matches()
            ->with(['flight.customer', 'customer'])
            ->orderByDesc('match_score')
            ->get()
            ->map(function ($match) {
                $flight = $match->flight;
                $customer = $match->customer;

                return [
                    'id' => $match->id,
                    'match_score' => (float) $match->match_score,
                    'status' => $match->status,
                    'matched_at' => $match->matched_at?->toIso8601String(),
                    'customer' => [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'phone' => $customer->phone,
                        'avatar' => $customer->avatar,
                    ],
                    'flight' => [
                        'id' => $flight->id,
                        'uuid' => $flight->uuid,
                        'airline' => $flight->airline,
                        'flight_number' => $flight->flight_number,
                        'from_airport' => $flight->from_airport,
                        'to_airport' => $flight->to_airport,
                        'flight_date' => $flight->flight_date->format('Y-m-d'),
                        'available_weight' => round($flight->available_weight, 2),
                        'verified' => $flight->verified,
                    ],
                ];
            });

        // Nếu request đã gửi (có flight_id), lấy thông tin flight và customer đã gửi
        $sentRequestInfo = null;
        if ($request->flight_id) {
            $sentFlight = $request->flight;
            $sentCustomer = $sentFlight->customer;
            $sentMatch = RequestMatch::where('request_id', $request->id)
                ->where('flight_id', $request->flight_id)
                ->where('status', 'sent')
                ->first();

            $sentRequestInfo = [
                'flight_id' => $sentFlight->id,
                'customer' => [
                    'id' => $sentCustomer->id,
                    'name' => $sentCustomer->name,
                    'phone' => $sentCustomer->phone,
                    'avatar' => $sentCustomer->avatar,
                ],
                'flight' => [
                    'id' => $sentFlight->id,
                    'uuid' => $sentFlight->uuid,
                    'airline' => $sentFlight->airline,
                    'flight_number' => $sentFlight->flight_number,
                    'from_airport' => $sentFlight->from_airport,
                    'to_airport' => $sentFlight->to_airport,
                    'flight_date' => $sentFlight->flight_date->format('Y-m-d'),
                    'available_weight' => round($sentFlight->available_weight, 2),
                ],
                'match_id' => $sentMatch?->id,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'request' => [
                    'id' => $request->id,
                    'uuid' => $request->uuid,
                    'from_airport' => $request->from_airport,
                    'to_airport' => $request->to_airport,
                    'desired_date' => $request->desired_date?->format('Y-m-d'),
                    'flight_id' => $request->flight_id,
                    'status' => $request->status,
                ],
                'sent_request' => $sentRequestInfo, // Thông tin request đã gửi (nếu có)
                'matches' => $matches,
                'total_matches' => $matches->count(),
            ]
        ]);
    }

    /**
     * Gửi request tới customer đã match
     */
    public function sendToMatch(string $id, string $matchId)
    {
        $request = ModelsRequest::findOrFail($id);

        // Chỉ sender của request mới được gửi
        if ($request->sender_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền gửi request này.'
            ], 403);
        }

        // Request phải đang chờ match (chưa có flight_id)
        if ($request->flight_id !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Request này đã được gửi tới một flight rồi.'
            ], 400);
        }

        $match = RequestMatch::where('id', $matchId)
            ->where('request_id', $request->id)
            ->where('status', 'pending')
            ->with('flight.customer')
            ->firstOrFail();

        $flight = $match->flight;

        // Kiểm tra flight còn available không
        if (!$flight->verified) {
            return response()->json([
                'success' => false,
                'message' => 'Chuyến bay này chưa được xác thực.'
            ], 400);
        }

        if ($flight->available_weight < ($request->desired_weight ?? 0.5)) {
            return response()->json([
                'success' => false,
                'message' => 'Chuyến bay này đã hết chỗ mang thêm.'
            ], 400);
        }

        // Kiểm tra xem đã có request nào gửi tới flight này chưa
        $existingRequest = ModelsRequest::where('sender_id', $request->sender_id)
            ->where('flight_id', $flight->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã gửi request tới chuyến bay này rồi.'
            ], 400);
        }

        try {
            DB::transaction(function () use ($request, $match, $flight) {
                // Update request với flight_id
                $request->flight_id = $flight->id;
                $request->save();

                // Update match status
                $match->markAsSent();

                // Gửi notification cho customer
                $customer = $flight->customer;
                if ($customer) {
                    $sender = auth()->user();

                    // Push notification vào Firebase
                    $this->firebaseService->pushNotification(
                        $customer->id,
                        'Yêu cầu mới',
                        "Bạn có yêu cầu mới từ {$sender->name} với phần thưởng " . number_format($request->reward) . ' VNĐ',
                        [
                            'type' => 'new_request',
                            'request_id' => $request->id,
                            'request_uuid' => $request->uuid,
                            'flight_id' => $flight->id,
                            'sender_id' => $sender->id,
                            'sender_name' => $sender->name,
                            'reward' => $request->reward,
                        ]
                    );

                    // Gửi push notification qua Expo
                    if ($customer->fcm_token) {
                        ExpoPushService::sendNotification(
                            $customer->fcm_token,
                            'Yêu cầu mới',
                            "Bạn có yêu cầu mới từ {$sender->name} với phần thưởng " . number_format($request->reward) . ' VNĐ',
                            [
                                'type' => 'new_request',
                                'request_id' => $request->id,
                                'flight_id' => $flight->id,
                            ]
                        );
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Đã gửi request tới customer thành công!',
                'data' => $request->fresh(['flight.customer'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi gửi request: ' . $e->getMessage()
            ], 500);
        }
    }
}
