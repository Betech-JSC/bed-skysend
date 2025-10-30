<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\OrderMatcherService;

class OrderController extends Controller
{
    /**
     * Store a newly created order.
     */
    public function create(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'role' => 'required|in:sender,carrier',
            'shipment_description' => 'required|string',
            'pickup_location' => 'required|string',
            'delivery_location' => 'required|string',
            'flight_number' => 'nullable|string',
            'flight_time' => 'nullable|date',
            'package_weight' => 'nullable|numeric',
            'package_dimensions' => 'nullable|string',
        ]);

        // Create the order
        $order = Order::create([
            'user_id' => auth()->id(),
            'role' => $validated['role'],
            'shipment_description' => $validated['shipment_description'],
            'pickup_location' => $validated['pickup_location'],
            'delivery_location' => $validated['delivery_location'],
            'flight_number' => $validated['flight_number'] ?? null,
            'flight_time' => $validated['flight_time'] ?? null,
            'package_weight' => $validated['package_weight'] ?? null,
            'package_dimensions' => $validated['package_dimensions'] ?? null,
            'special_instructions' => $validated['special_instructions'] ?? null,
            'status' => 'pending',
        ]);

        // Save images if uploaded
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('order_images', 'public'); // Lưu vào storage/app/public/order_images
                $order->images()->create(['image_path' => $path]);
            }
        }

        return ApiResponse::success(['order' => $order], 'Order created successfully');
    }


    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Order::where('user_id', $user->id)
            ->where('role', $request->role);

        // Optional filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(10);

        // Map collection bên trong paginate sang transform
        $orders->getCollection()->transform(function ($order) {
            return $order->transform(); // gọi method transform() trong model Order
        });

        return ApiResponse::success(['orders' => $orders], 'Orders retrieved successfully');
    }


    /**
     * Display the specified order.
     */
    public function show($orderId)
    {
        $order = Order::findOrFail($orderId);

        // Ensure the order belongs to the authenticated user
        if ($order->user_id !== auth()->id()) {
            return ApiResponse::error('Unauthorized', 403);
        }

        return ApiResponse::success(['order' => $order], 'Order retrieved successfully');
    }

    /**
     * Update the status of the specified order.
     */
    public function updateStatus(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        // Ensure the user is authorized to update the order status
        if ($order->user_id !== auth()->id()) {
            return ApiResponse::error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,matched,confirmed,delivered,cancelled',
        ]);

        // Update the status only if it is valid and update the matched_order_id accordingly
        if ($validated['status'] == 'delivered') {
            // Allow creating a new order only when the previous one is delivered
            $order->update([
                'status' => 'delivered'
            ]);
        } else {
            $order->update([
                'status' => $validated['status']
            ]);
        }

        return ApiResponse::success(['order' => $order], 'Order status updated successfully');
    }


    /**
     * Cancel the specified order.
     */
    public function cancel($orderId)
    {
        $order = Order::findOrFail($orderId);

        // Ensure the user is authorized to cancel the order
        if ($order->user_id !== auth()->id()) {
            return ApiResponse::error('Unauthorized', 403);
        }

        // You can also add additional logic to prevent cancellation based on the order status
        if ($order->status == 'delivered') {
            return ApiResponse::error('Cannot cancel a delivered order', 400);
        }

        $order->update(['status' => 'cancelled']);

        return ApiResponse::success(['order' => $order], 'Order cancelled successfully');
    }

    /**
     * Match two orders.
     */
    public function matchOrder(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'matched_order_id' => 'required|exists:orders,id',
        ]);

        // Find the orders
        $order = Order::findOrFail($validated['order_id']);
        $matchedOrder = Order::findOrFail($validated['matched_order_id']);

        // Ensure both orders belong to the same user or have the correct permissions
        if ($order->user_id !== auth()->id() || $matchedOrder->user_id !== auth()->id()) {
            return ApiResponse::error('Unauthorized', 403);
        }

        // Link the orders together
        $order->update(['matched_order_id' => $matchedOrder->id]);
        $matchedOrder->update(['matched_order_id' => $order->id]);

        return ApiResponse::success([
            'order' => $order,
            'matched_order' => $matchedOrder
        ], 'Orders matched successfully');
    }
}
