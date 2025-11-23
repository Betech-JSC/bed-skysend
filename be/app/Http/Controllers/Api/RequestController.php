<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use App\Models\Request as ModelsRequest;
use App\Http\Requests\StorePrivateRequestRequest;
use App\Models\Order;

class RequestController extends Controller
{
    public function index()
    {
        $requests = ModelsRequest::with(['flight', 'customer'])
            ->where('sender_id', auth()->id())
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($requests);
    }

    public function store(StorePrivateRequestRequest $request) // Laravel tự validate
    {
        $validated = $request->validated(); // Đã được validate và an toàn

        $flight = Flight::with('customer')->findOrFail($validated['flight_id']);

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

        $privateReq = ModelsRequest::create([
            'uuid'             => \Str::uuid(),
            'sender_id'        => auth()->id(),
            'flight_id'        => $flight->id,
            'reward'           => $validated['reward'],
            'item_value'       => $validated['item_value'],
            'item_description' => $validated['item_description'],
            'time_slot'        => $validated['time_slot'],
            'note'             => $validated['note'],
            'status'           => 'pending',
            'expires_at'       => now()->addHours(24),
        ]);

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

    private function updateStatus(string $id, string $status)
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
        // 3. Tạo Order + cập nhật trạng thái trong transaction (an toàn tuyệt đối)
        return \DB::transaction(function () use ($request) {
            // Tạo đơn hàng
            $order = Order::create([
                'uuid'                   => \Str::uuid(),
                'request_id'             => $request->id,
                'sender_id'              => $request->sender_id,
                'customer_id'            => $request->flight->customer_id,
                'flight_id'              => $request->flight_id,
                'reward'                 => $request->reward,
                'service_fee'            => 0, // bạn tính sau hoặc để config
                'insurance_fee'          => 0,
                'total_amount'           => $request->reward, // tạm thời = reward
                'escrow_amount'          => $request->reward, // tiền sẽ giữ hộ
                'tracking_code'          => \Str::upper(\Str::random(8)), // VD: ABC123XY
                'status'                 => 'confirmed', // trạng thái đầu tiên
                'confirmed_at'           => now(),
                'customer_note'          => $request->note,
                'meeting_point_departure' => null, // sẽ update sau khi chat
                'insured'                => false,
                'metadata'               => [
                    'time_slot' => $request->time_slot,
                    'item_value' => $request->item_value,
                ],
            ]);

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

            // Trả về thông tin đẹp cho Customer
            return response()->json([
                'success' => true,
                'message' => 'Đã chấp nhận yêu cầu và tạo đơn hàng thành công!',
                'data' => [
                    'order'    => $order->load('sender', 'flight'),
                    'request'  => $request,
                ]
            ], 200);
        });
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
}
