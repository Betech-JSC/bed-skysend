<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use App\Models\Order;
use App\Models\Request;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dashboard tổng quan
     */
    public function index(): Response
    {
        // Thống kê users
        $usersStats = [
            'total' => User::count(),
            'senders' => User::where('role', 'sender')->count(),
            'customers' => User::where('role', 'customer')->count(),
            'banned' => User::onlyTrashed()->count(),
        ];

        // Thống kê flights
        $flightsStats = [
            'total' => Flight::count(),
            'verified' => Flight::where('verified', true)->count(),
            'pending' => Flight::where('verified', false)->where('status', 'pending')->count(),
            'cancelled' => Flight::where('status', 'cancelled')->count(),
            'with_orders' => Flight::has('orders')->count(),
        ];

        // Thống kê orders
        $ordersStats = [
            'total' => Order::count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'in_transit' => Order::whereIn('status', ['picked_up', 'in_transit', 'arrived'])->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
            'total_escrow' => Order::whereIn('escrow_status', ['held', 'paid'])->sum('escrow_amount'),
        ];

        // Đơn hàng gần đây
        $recentOrders = Order::with(['sender', 'customer', 'flight'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'uuid' => $order->uuid,
                    'tracking_code' => $order->tracking_code,
                    'sender_name' => $order->sender->name ?? 'N/A',
                    'customer_name' => $order->customer->name ?? 'N/A',
                    'status' => $order->status,
                    'reward' => $order->reward,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Dữ liệu thống kê theo thời gian (30 ngày gần nhất)
        $days = 30;
        $startDate = Carbon::now()->subDays($days);
        
        // Tạo mảng các ngày
        $dateLabels = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $dateLabels[] = Carbon::now()->subDays($i)->format('Y-m-d');
        }

        // Thống kê Orders theo ngày
        $ordersByDate = Order::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();
        
        $ordersData = array_map(function ($date) use ($ordersByDate) {
            return $ordersByDate[$date] ?? 0;
        }, $dateLabels);

        // Thống kê Requests theo ngày
        $requestsByDate = Request::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();
        
        $requestsData = array_map(function ($date) use ($requestsByDate) {
            return $requestsByDate[$date] ?? 0;
        }, $dateLabels);

        // Thống kê Flights theo ngày
        $flightsByDate = Flight::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();
        
        $flightsData = array_map(function ($date) use ($flightsByDate) {
            return $flightsByDate[$date] ?? 0;
        }, $dateLabels);

        // Thống kê doanh thu theo ngày
        $revenueByDate = Order::where('created_at', '>=', $startDate)
            ->where('status', 'completed')
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->groupBy('date')
            ->pluck('total', 'date')
            ->toArray();
        
        $revenueData = array_map(function ($date) use ($revenueByDate) {
            return (float) ($revenueByDate[$date] ?? 0);
        }, $dateLabels);

        // Format labels cho biểu đồ (chỉ hiển thị ngày/tháng)
        $chartLabels = array_map(function ($date) {
            return Carbon::parse($date)->format('d/m');
        }, $dateLabels);

        // Dữ liệu phân bố theo status cho biểu đồ tròn
        // Orders by status
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        
        $ordersStatusLabels = [
            'confirmed' => 'Đã xác nhận',
            'picked_up' => 'Đã lấy hàng',
            'in_transit' => 'Đang vận chuyển',
            'arrived' => 'Đã đến nơi',
            'delivered' => 'Đã giao hàng',
            'completed' => 'Hoàn thành',
            'cancelled' => 'Đã hủy',
        ];
        
        $ordersStatusData = [];
        $ordersStatusLabelsData = [];
        foreach ($ordersByStatus as $status => $count) {
            $ordersStatusLabelsData[] = $ordersStatusLabels[$status] ?? $status;
            $ordersStatusData[] = $count;
        }

        // Requests by status
        $requestsByStatus = Request::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        
        $requestsStatusLabels = [
            'pending' => 'Chờ xử lý',
            'waiting' => 'Đang chờ',
            'matched' => 'Đã khớp',
            'accepted' => 'Đã chấp nhận',
            'confirmed' => 'Đã xác nhận',
            'completed' => 'Hoàn thành',
            'cancelled' => 'Đã hủy',
        ];
        
        $requestsStatusData = [];
        $requestsStatusLabelsData = [];
        foreach ($requestsByStatus as $status => $count) {
            $requestsStatusLabelsData[] = $requestsStatusLabels[$status] ?? $status;
            $requestsStatusData[] = $count;
        }

        // Flights by status and verified
        $flightsVerified = Flight::where('verified', true)->count();
        $flightsPending = Flight::where('verified', false)->where('status', '!=', 'cancelled')->count();
        $flightsCancelled = Flight::where('status', 'cancelled')->count();
        
        $flightsStatusLabelsData = ['Đã xác thực', 'Chờ xác thực', 'Đã hủy'];
        $flightsStatusData = [$flightsVerified, $flightsPending, $flightsCancelled];

        // Dữ liệu cho biểu đồ cột so sánh tổng quan
        $comparisonData = [
            'labels' => ['Đơn hàng', 'Yêu cầu', 'Chuyến bay'],
            'total' => [
                Order::count(),
                Request::count(),
                Flight::count(),
            ],
            'completed' => [
                Order::where('status', 'completed')->count(),
                Request::where('status', 'completed')->count(),
                Flight::where('verified', true)->count(),
            ],
            'pending' => [
                Order::whereIn('status', ['confirmed', 'picked_up', 'in_transit', 'arrived'])->count(),
                Request::whereIn('status', ['pending', 'waiting', 'matched'])->count(),
                Flight::where('verified', false)->where('status', 'pending')->count(),
            ],
        ];

        return Inertia::render('Admin/Dashboard/Index', [
            'usersStats' => $usersStats,
            'flightsStats' => $flightsStats,
            'ordersStats' => $ordersStats,
            'recentOrders' => $recentOrders,
            'chartData' => [
                'labels' => $chartLabels,
                'orders' => $ordersData,
                'requests' => $requestsData,
                'flights' => $flightsData,
                'revenue' => $revenueData,
            ],
            'pieChartData' => [
                'orders' => [
                    'labels' => $ordersStatusLabelsData,
                    'data' => $ordersStatusData,
                ],
                'requests' => [
                    'labels' => $requestsStatusLabelsData,
                    'data' => $requestsStatusData,
                ],
                'flights' => [
                    'labels' => $flightsStatusLabelsData,
                    'data' => $flightsStatusData,
                ],
            ],
            'comparisonData' => $comparisonData,
        ]);
    }
}
