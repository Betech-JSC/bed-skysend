<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'uuid',
        'request_id',
        'sender_id',
        'customer_id',
        'flight_id',
        'reward',
        'service_fee',
        'insurance_fee',
        'total_amount',
        'escrow_amount',
        'escrow_status',
        'tracking_code',
        'status',
        'confirmed_at',
        'picked_up_at',
        'delivered_at',
        'completed_at',
        'cancelled_at',
        'cancelled_by',
        'cancel_reason',
        'meeting_point_departure',
        'meeting_time_departure',
        'delivery_point_arrival',
        'delivery_time_arrival',
        'customer_note',
        'sender_note',
        'sender_rating',
        'sender_review',
        'customer_rating',
        'customer_review',
        'insured',
        'insured_amount',
        'compensation_claimed',
        'compensation_paid',
        'metadata',
    ];

    protected $casts = [
        'reward'              => 'decimal:2',
        'service_fee'         => 'decimal:2',
        'insurance_fee'       => 'decimal:2',
        'total_amount'        => 'decimal:2',
        'escrow_amount'       => 'decimal:2',
        'insured_amount'      => 'decimal:2',
        'compensation_paid'   => 'decimal:2',
        'confirmed_at'        => 'datetime',
        'picked_up_at'        => 'datetime',
        'delivered_at'        => 'datetime',
        'completed_at'        => 'datetime',
        'cancelled_at'        => 'datetime',
        'meeting_time_departure' => 'datetime',
        'delivery_time_arrival'  => 'datetime',
        'insured'             => 'boolean',
        'compensation_claimed' => 'boolean',
        'metadata'            => 'array',
        'sender_rating'       => 'integer',
        'customer_rating'     => 'integer',
    ];

    protected $appends = [
        'can_pickup',
        'can_deliver',
        'is_completed',
        'is_cancelled',
    ];

    // ==================================================================
    // QUAN HỆ
    // ==================================================================

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /** Ảnh/video giao nhận hàng */
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    // ==================================================================
    // ACCESSOR
    // ==================================================================

    public function getCanPickupAttribute(): bool
    {
        return $this->status === 'confirmed';
    }

    public function getCanDeliverAttribute(): bool
    {
        return $this->status === 'picked_up' || $this->status === 'in_transit';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getIsCancelledAttribute(): bool
    {
        return in_array($this->status, ['cancelled', 'failed']);
    }

    public function getTimelineAttribute(): array
    {
        return [
            ['status' => 'confirmed',      'time' => $this->confirmed_at,      'label' => 'Đã xác nhận'],
            ['status' => 'picked_up',      'time' => $this->picked_up_at,      'label' => 'Đã nhận đồ'],
            ['status' => 'in_transit',     'time' => $this->picked_up_at,      'label' => 'Đang vận chuyển'],
            ['status' => 'arrived',        'time' => null,                     'label' => 'Đã đến nơi'],
            ['status' => 'delivered',      'time' => $this->delivered_at,      'label' => 'Đã giao hàng'],
            ['status' => 'completed',      'time' => $this->completed_at,      'label' => 'Hoàn tất'],
        ];
    }

    // ==================================================================
    // SCOPE
    // ==================================================================

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['confirmed', 'picked_up', 'in_transit', 'arrived', 'delivered']);
    }

    public function scopeForSender($query, $userId)
    {
        return $query->where('sender_id', $userId);
    }

    public function scopeForCustomer($query, $userId)
    {
        return $query->where('customer_id', $userId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    // ==================================================================
    // HÀM TIỆN ÍCH (rất hay dùng)
    // ==================================================================

    /** Cập nhật trạng thái + thời gian */
    public function updateStatus(string $status, ?User $by = null): bool
    {
        $this->status = $status;

        match ($status) {
            'confirmed' => $this->confirmed_at = now(),
            'picked_up' => $this->picked_up_at = now(),
            'delivered' => $this->delivered_at = now(),
            'completed' => $this->completed_at = now(),
            'cancelled' => $this->cancelled_at = now(),
            default     => null,
        };

        if ($status === 'cancelled' && $by) {
            $this->cancelled_by = $by->id;
        }

        return $this->save();
    }

    /** Giải ngân tiền khi hoàn tất */
    public function releaseEscrow(): bool
    {
        $this->escrow_status = 'released';
        return $this->save();
    }

    /** Hoàn tiền khi hủy */
    public function refundEscrow(): bool
    {
        $this->escrow_status = 'refunded';
        return $this->save();
    }
}
