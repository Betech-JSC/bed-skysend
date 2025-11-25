<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFlightRequest;
use App\Http\Requests\UpdateFlightRequest;
use Illuminate\Http\Request;

use App\Models\Flight;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class FlightController extends Controller
{
    /**
     * Lấy danh sách chuyến bay đã đăng của user hiện tại
     */
    public function index(Request $request)
    {
        $user_id = auth()->id();

        $query = Flight::where('customer_id', $user_id)
            ->with('requests')
            ->latest(); // mới nhất trước

        // Tùy chọn: lọc theo trạng thái (pending, verified, cancelled...)
        if ($request->has('status') && in_array($request->status, ['pending', 'verified', 'completed'])) {
            $query->where('status', $request->status);
        }

        // Phân trang (10 chuyến/trang - bạn có thể đổi)
        $flights = $query->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách chuyến bay thành công',
            'data'    => $flights->items(),
            'pagination' => [
                'current_page' => $flights->currentPage(),
                'total_pages'  => $flights->lastPage(),
                'total_items'  => $flights->total(),
                'per_page'     => $flights->perPage(),
                'has_more'     => $flights->hasMorePages(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $flight = Flight::create([
            'uuid'           => Str::uuid(),
            'customer_id'    => auth()->id(),
            'from_airport'   => strtoupper($request->from_airport),
            'to_airport'     => strtoupper($request->to_airport),
            'flight_date'    => $request->flight_date,
            'airline'        => $request->airline,
            'flight_number'  => strtoupper($request->flight_number),
            'max_weight'     => $request->max_weight,
            'item_type'     => $request->item_type,
            'booked_weight'  => 0.00,
            'note'           => $request->note,
            'verified'       => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đăng chuyến bay thành công!',
            'data'    => $flight,
        ], 201);
    }

    public function show($id)
    {
        $flight = Flight::where('customer_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $flight
        ]);
    }


    public function update(UpdateFlightRequest $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $flight = Flight::where('customer_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $flight->update([
                'from_airport'   => strtoupper($request->filled('from_airport') ? $request->from_airport : $flight->from_airport),
                'to_airport'     => strtoupper($request->filled('to_airport') ? $request->to_airport : $flight->to_airport),
                'flight_date'    => $request->filled('flight_date') ? $request->flight_date : $flight->flight_date,
                'airline'        => $request->filled('airline') ? $request->airline : $flight->airline,
                'flight_number'  => strtoupper($request->filled('flight_number') ? $request->flight_number : $flight->flight_number),
                'max_weight'     => $request->filled('max_weight') ? $request->max_weight : $flight->max_weight,
                'item_value'     => $request->item_value,
                'item_type'     => $request->item_type,
                'note'           => $request->filled('note') ? $request->note : $flight->note,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật chuyến bay thành công!',
                'data'    => $flight
            ]);
        });
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $flight = Flight::where('customer_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            // Không cho hủy nếu đã có người đặt hàng
            if ($flight->booked_weight > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể hủy vì đã có khách đặt hàng!',
                ], 403);
            }

            // Nếu đã hủy rồi thì không cho hủy lại
            if ($flight->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Chuyến bay đã được hủy trước đó!',
                ], 400);
            }

            // HỦY CHUYẾN BAY - chỉ đổi status là đủ!
            $flight->update([
                'status' => 'cancelled'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hủy chuyến bay thành công!',
                'data'    => $flight
            ]);
        });
    }
}
