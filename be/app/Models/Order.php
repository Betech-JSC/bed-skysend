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
        'sender_id',
        'receiver_id',
        'shipment_description',
        'pickup_location',
        'delivery_location',
        'status',
        'shipping_fee',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'shipping_fee' => 'decimal:2',
    ];

    /**
     * Get the sender (user who created the order).
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the receiver (user who matches the order).
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
