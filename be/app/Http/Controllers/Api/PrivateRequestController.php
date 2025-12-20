<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use App\Models\Request as PrivateRequest;
use Illuminate\Http\Request;

class PrivateRequestController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();

        // Chỉ cho phép tạo request khi user ở role sender
        if ($user->role === 'customer') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đang ở vai trò hành khách. Vui lòng chuyển sang vai trò người gửi để tạo yêu cầu.'
            ], 403);
        }

        $validated = $request->validate([
            'flight_id'           => 'required|exists:flights,id',
            'reward'              => 'required|numeric|min:50000|max:10000000',
            'item_value'          => 'required|numeric|min:100000',
            'item_description'    => 'required|string|max:1000',
            'time_slot' => 'required|in:morning,afternoon,evening,any',
            'deadline_at'         => 'required|date|after:now',
            'note'                => 'nullable|string|max:500',
        ]);

        $flight = Flight::with('customer')->findOrFail($validated['flight_id']);

        // Không cho phép gửi request cho chính chuyến bay của mình
        if ($flight->customer_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể gửi yêu cầu cho chính chuyến bay của mình.'
            ], 403);
        }

        // Kiểm tra hành khách còn chỗ không
        if (($flight->max_weight - $flight->booked_weight) < 0.5) {
            return response()->json(['message' => 'Hành khách đã hết chỗ mang thêm'], 400);
        }

        // Tránh gửi trùng
        $exists = PrivateRequest::where('sender_id', auth()->id())
            ->where('flight_id', $flight->id)
            ->where('status', 'pending')
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Bạn đã gửi yêu cầu cho hành khách này rồi'], 400);
        }

        $privateReq = PrivateRequest::create([
            'uuid'              => PrivateRequest::generateRequestUuid(),
            'sender_id'         => auth()->id(),
            'customer_id'       => $flight->customer_id,
            'flight_id'         => $flight->id,
            'reward'            => $validated['reward'],
            'item_value'        => $validated['item_value'],
            'item_description'  => $validated['item_description'],
            'time_slot' => $validated['time_slot'],
            'deadline_at'       => $validated['deadline_at'],
            'note'              => $validated['note'],
            'status'            => 'pending',
            'expires_at'        => now()->addHours(24),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi yêu cầu thành công! Hành khách sẽ phản hồi trong 24h.',
            'data'    => $privateReq
        ], 200);
    }

    // Danh sách yêu cầu riêng đã gửi
    public function index()
    {
        $user = auth()->user();

        // Chỉ lấy requests khi user ở role sender
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

        $requests = PrivateRequest::with(['flight', 'customer'])
            ->where('sender_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($requests);
    }
}
