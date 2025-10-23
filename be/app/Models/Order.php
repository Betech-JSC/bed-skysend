<?php

namespace App\Models;

use App\Enums\OrderStatus;
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

    /**
     * Get the matched order (if the order has been matched with another).
     */
    public function matchedOrder()
    {
        return $this->belongsTo(Order::class, 'matched_order_id');
    }
}
