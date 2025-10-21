<?php


namespace App\Http\Controllers\Api;

use App\Models\Order;
use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\OrderMatcherService;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $order = Order::create([
            'sender_id' => auth()->id(),
            'shipment_description' => $request->shipment_description,
            'pickup_location' => $request->pickup_location,
            'delivery_location' => $request->delivery_location,
            'status' => 'pending',
        ]);

        // Gọi service để attempt match
        app(OrderMatcherService::class)->attemptMatch($order);

        return response()->json(['order' => $order]);
    }
}
