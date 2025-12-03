<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Pagination\LengthAwarePaginator;

class FlightController extends Controller
{
    /**
     * Danh sách chuyến bay
     */
    public function index(): Response
    {
        $query = Flight::with(['customer', 'requests', 'orders']);

        // Filter theo verified
        if (Request::has('verified')) {
            $query->where('verified', filter_var(Request::get('verified'), FILTER_VALIDATE_BOOLEAN));
        }

        // Filter theo status
        if (Request::has('status') && Request::get('status')) {
            $query->where('status', Request::get('status'));
        }

        // Filter theo route
        if (Request::has('from_airport')) {
            $query->where('from_airport', Request::get('from_airport'));
        }
        if (Request::has('to_airport')) {
            $query->where('to_airport', Request::get('to_airport'));
        }

        // Filter theo ngày
        if (Request::has('flight_date_from')) {
            $query->where('flight_date', '>=', Request::get('flight_date_from'));
        }
        if (Request::has('flight_date_to')) {
            $query->where('flight_date', '<=', Request::get('flight_date_to'));
        }

        // Search
        if (Request::has('search')) {
            $search = Request::get('search');
            $query->where(function ($q) use ($search) {
                $q->where('flight_number', 'like', "%{$search}%")
                    ->orWhere('airline', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortBy = Request::get('sort_by', 'created_at');
        $sortOrder = Request::get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = Request::get('per_page', 15);
        $flightsPaginated = $query->paginate($perPage)->appends(Request::all());

        // Transform data
        $transformedFlights = $flightsPaginated->items();
        foreach ($transformedFlights as $key => $flight) {
            $transformedFlights[$key] = [
                'id' => $flight->id,
                'uuid' => $flight->uuid,
                'customer' => [
                    'id' => $flight->customer->id ?? null,
                    'name' => $flight->customer->name ?? 'N/A',
                    'email' => $flight->customer->email ?? 'N/A',
                ],
                'from_airport' => $flight->from_airport,
                'to_airport' => $flight->to_airport,
                'flight_date' => $flight->flight_date->format('Y-m-d'),
                'airline' => $flight->airline,
                'flight_number' => $flight->flight_number,
                'status' => $flight->status,
                'verified' => $flight->verified,
                'verified_at' => $flight->verified_at?->format('Y-m-d H:i:s'),
                'max_weight' => $flight->max_weight,
                'booked_weight' => $flight->booked_weight,
                'available_weight' => $flight->available_weight,
                'requests_count' => $flight->requests->count(),
                'orders_count' => $flight->orders->count(),
                'created_at' => $flight->created_at->format('Y-m-d H:i:s'),
            ];
        }

        // Create new paginator with transformed data
        $flights = new LengthAwarePaginator(
            $transformedFlights,
            $flightsPaginated->total(),
            $flightsPaginated->perPage(),
            $flightsPaginated->currentPage(),
            ['path' => $flightsPaginated->path()]
        );
        $flights->appends(Request::all());

        return Inertia::render('Admin/Flights/Index', [
            'filters' => Request::only('search', 'verified', 'status', 'from_airport', 'to_airport', 'flight_date_from', 'flight_date_to', 'sort_by', 'sort_order'),
            'flights' => $flights,
        ]);
    }

    /**
     * Chi tiết chuyến bay
     */
    public function show($id): Response
    {
        $flight = Flight::with([
            'customer',
            'requests.sender',
            'orders.sender',
            'orders.customer',
            'attachments',
        ])->findOrFail($id);

        return Inertia::render('Admin/Flights/Show', [
            'flight' => $flight,
        ]);
    }

    /**
     * Xác thực chuyến bay
     */
    public function verify($id): RedirectResponse
    {
        $flight = Flight::findOrFail($id);

        if ($flight->verified) {
            return redirect()->back()->with('error', 'Chuyến bay đã được xác thực trước đó');
        }

        $admin = auth('admin')->user();

        DB::transaction(function () use ($flight, $admin) {
            $flight->markAsVerified($admin);
        });

        return redirect()->back()->with('success', 'Đã xác thực chuyến bay thành công');
    }

    /**
     * Từ chối chuyến bay
     */
    public function reject($id): RedirectResponse
    {
        $flight = Flight::findOrFail($id);

        Request::validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($flight->verified) {
            return redirect()->back()->with('error', 'Không thể từ chối chuyến bay đã được xác thực');
        }

        $flight->update([
            'status' => 'rejected',
            'note' => ($flight->note ? $flight->note . "\n\n" : '') . 'Lý do từ chối: ' . Request::get('reason'),
        ]);

        return redirect()->back()->with('success', 'Đã từ chối chuyến bay');
    }

    /**
     * Hủy chuyến bay
     */
    public function cancel($id): RedirectResponse
    {
        $flight = Flight::findOrFail($id);

        Request::validate([
            'reason' => 'required|string|max:500',
        ]);

        // Kiểm tra đơn hàng đang xử lý
        $activeOrders = $flight->orders()
            ->whereIn('status', ['confirmed', 'picked_up', 'in_transit', 'arrived', 'delivered'])
            ->count();

        if ($activeOrders > 0) {
            return redirect()->back()->with('error', 'Không thể hủy chuyến bay vì có đơn hàng đang xử lý');
        }

        DB::transaction(function () use ($flight) {
            $flight->update([
                'status' => 'cancelled',
                'note' => ($flight->note ? $flight->note . "\n\n" : '') . 'Lý do hủy: ' . Request::get('reason'),
            ]);

            // Từ chối tất cả requests pending
            $flight->requests()
                ->where('status', 'pending')
                ->update(['status' => 'expired']);
        });

        return redirect()->back()->with('success', 'Đã hủy chuyến bay thành công');
    }
}
