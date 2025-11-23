<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\Request;

class FlightSearchController extends Controller
{
    public function index(Request $request)
    {
        $query = Flight::with([
            'customer' => fn($q) => $q->select('id', 'name', 'avatar', 'rating', 'total_trips', 'kyc_verified')
        ])
            ->where('verified', true)
            ->where('flight_date', '>=', now()->subHours(6)) // chỉ hiển thị chuyến bay sắp tới
            ->whereRaw('max_weight - booked_weight > 0.5'); // còn ít nhất 0.5kg trống

        // 1. Thành phố đi
        if ($request->filled('from_city')) {
            $query->whereHas(
                'fromAirportMapping',
                fn($q) =>
                $q->where('city_name', 'LIKE', "%{$request->from_city}%")
            );
        }

        // 2. Thành phố đến
        if ($request->filled('to_city')) {
            $query->whereHas(
                'toAirportMapping',
                fn($q) =>
                $q->where('city_name', 'LIKE', "%{$request->to_city}%")
            );
        }

        // 3. Ngày bay (±1 ngày để tăng kết quả)
        if ($request->filled('date')) {
            $date = $request->date;
            $query->whereBetween('flight_date', [
                \Carbon\Carbon::parse($date)->subDay(),
                \Carbon\Carbon::parse($date)->addDay()
            ]);
        }

        // 4. Khung giờ ưu tiên
        if ($request->filled('time_slot')) {
            $slot = $request->time_slot; // morning, afternoon, evening, any
            if ($slot !== 'any') {
                $ranges = [
                    'morning'    => ['05:00', '11:59'],
                    'afternoon'  => ['12:00', '17:59'],
                    'evening'    => ['18:00', '23:59'],
                ];
                if (isset($ranges[$slot])) {
                    $query->whereTime('departure_time', '>=', $ranges[$slot][0])
                        ->whereTime('departure_time', '<=', $ranges[$slot][1]);
                }
            }
        }

        // 5. Rating tối thiểu
        if ($request->filled('min_rating')) {
            $query->whereHas(
                'customer',
                fn($q) =>
                $q->where('rating', '>=', $request->min_rating)
            );
        }

        // Sắp xếp ưu tiên
        $flights = $query->orderByDesc('customer.rating')
            ->orderBy('flight_date')
            ->orderBy('departure_time')
            ->paginate(20);

        // Thêm thông tin khả dụng cho frontend
        $flights->getCollection()->transform(function ($flight) {
            $flight->available_weight = $flight->max_weight - $flight->booked_weight;
            $flight->can_send_request = true; // có thể gửi
            return $flight;
        });

        return response()->json([
            'success' => true,
            'data'    => $flights,
            'filters' => $request->all()
        ]);
    }
}
