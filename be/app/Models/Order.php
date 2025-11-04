<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id', // Trường này thay cho sender_id và receiver_id
        'role',    // Loại người tạo đơn (sender hoặc carrier)
        'shipment_description',
        'pickup_location',
        'delivery_location',
        'flight_number',
        'flight_time',
        'package_weight',
        'package_dimensions',
        'status',
        'matched_order_id', // Liên kết với đơn đã được match
        'shipping_fee',
        'special_instructions',
    ];

    protected $casts = [
        'shipping_fee' => 'decimal:2', // Định dạng số cho phí vận chuyển
        'flight_time' => 'datetime', // Nếu có thời gian bay, cần ánh xạ vào kiểu datetime
    ];

    // Trong Order.php
    public function pickupRegion()
    {
        return $this->belongsTo(Region::class, 'pickup_location'); // pickup_location lưu region_id
    }

    public function deliveryRegion()
    {
        return $this->belongsTo(Region::class, 'delivery_location'); // delivery_location lưu region_id
    }

    // Đơn đã match với đơn này
    public function matchedOrder()
    {
        return $this->belongsTo(Order::class, 'matched_order_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the sender (user who created the order).
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'user_id')->where('role', 'sender');
    }

    /**
     * Get the carrier (user who matches the order).
     */
    public function carrier()
    {
        return $this->belongsTo(User::class, 'user_id')->where('role', 'carrier');
    }

    public function images()
    {
        return $this->hasMany(OrderImage::class);
    }

    public function transform()
    {
        return [
            'id' => $this->id,
            'shipment_description' => $this->shipment_description,
            'pickup_location' => $this->pickupRegion ? $this->pickupRegion->transform() : null,
            'delivery_location' => $this->deliveryRegion ? $this->deliveryRegion->transform() : null,
            'flight_number' => $this->flight_number,
            'flight_time' => $this->flight_time,
            'package_weight' => $this->package_weight,
            'package_dimensions' => $this->package_dimensions,
            'status' => $this->status,
            'matched_order_id' => $this->matched_order_id,
            'shipping_fee' => $this->shipping_fee,
            'special_instructions' => $this->special_instructions,
            'chat_id' => $this->chat_id,
            'images' => $this->images->map(fn($img) => $img->transform()),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'matched_order' => $this->matchedOrder ? [
                'id' => $this->matchedOrder->id,
                'role' => $this->matchedOrder->role,
                'status' => $this->matchedOrder->status,
                'user' => [
                    'id' => $this->matchedOrder->user->id,
                    'name' => $this->matchedOrder->user->name,
                    'email' => $this->matchedOrder->user->email,
                ]
            ] : null,
        ];
    }
}
