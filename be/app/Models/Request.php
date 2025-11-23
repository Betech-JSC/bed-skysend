<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

use Illuminate\Support\Str;

class Request extends Model
{
    protected $fillable = [
        'uuid',
        'sender_id',
        'flight_id',

        'time_slot',
        'item_type',
        'item_description',
        'item_value',
        'reward',
        'status',
        'accepted_by',
        'accepted_at',
        'confirmed_by',
        'confirmed_at',
        'expires_at',
        'note',

    ];

    protected $casts = [
        'accepted_at'   => 'datetime',
        'confirmed_at'  => 'datetime',
        'expires_at'    => 'datetime',
        'item_value'    => 'decimal:2',
        'reward'        => 'decimal:2',
    ];

    protected $appends = [
        'is_expired',
        'can_accept',
        'can_confirm',
        'attachment_count',
    ];

    // ==================================================================
    // QUAN HỆ
    // ==================================================================

    /** Người gửi yêu cầu */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /** Hành khách đã nhận mang hộ */
    public function acceptedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    /** Người xác nhận cuối cùng (sender) */
    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    /** Order được tạo từ request này */
    public function order(): HasOne
    {
        return $this->hasOne(Order::class);
    }

    /** Tất cả ảnh/video/file đính kèm */
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable')->orderBy('order');
    }

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }

    /** Chỉ ảnh */
    public function images(): MorphMany
    {
        return $this->attachments()->where('type', 'image');
    }

    /** Chỉ video */
    public function videos(): MorphMany
    {
        return $this->attachments()->where('type', 'video');
    }

    /** Chỉ tài liệu (PDF, DOC…) */
    public function documents(): MorphMany
    {
        return $this->attachments()->where('type', 'document');
    }

    // ==================================================================
    // ACCESSOR
    // ==================================================================

    /** Đã hết hạn chưa */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at?->isPast() ?? false;
    }

    /** Hành khách còn được phép nhận không */
    public function getCanAcceptAttribute(): bool
    {
        return $this->status === 'pending' && ! $this->is_expired;
    }

    /** Sender còn được phép xác nhận không */
    public function getCanConfirmAttribute(): bool
    {
        return $this->status === 'accepted' && ! $this->is_expired && is_null($this->order);
    }

    /** Số lượng file đính kèm */
    public function getAttachmentCountAttribute(): int
    {
        return $this->attachments()->count();
    }

    /** Thumbnail đầu tiên (dùng làm ảnh đại diện) */
    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->images()->first()?->url;
    }

    // ==================================================================
    // SCOPE SIÊU MẠNH
    // ==================================================================

    /** Chỉ lấy request còn hiệu lực */
    public function scopeActive($query)
    {
        return $query->where('status', 'pending')
            ->where('expires_at', '>', now());
    }

    /** Chỉ lấy request đã được accept nhưng chưa confirm */
    public function scopeAcceptedButNotConfirmed($query)
    {
        return $query->where('status', 'accepted')
            ->whereNull('confirmed_at')
            ->where('expires_at', '>', now());
    }

    /** Request của người dùng hiện tại */
    public function scopeMine($query)
    {
        return $query->where('sender_id', auth()->id());
    }

    // ==================================================================
    // HÀM TIỆN ÍCH
    // ==================================================================

    /** Hành khách nhận mang hộ */
    public function accept(User $customer): bool
    {
        if (! $this->can_accept) {
            return false;
        }

        $this->status      = 'accepted';
        $this->accepted_by = $customer->id;
        $this->accepted_at = now();

        return $this->save();
    }

    /** Sender xác nhận → tạo Order */
    public function confirm(User $sender): ?Order
    {
        if (! $this->can_confirm || $sender->id !== $this->sender_id) {
            return null;
        }

        $this->status        = 'confirmed';
        $this->confirmed_by  = $sender->id;
        $this->confirmed_at  = now();
        $this->save();

        // Tạo Order tự động (có thể dùng Event hoặc Service)
        return Order::create([
            'uuid'           => Str::uuid(),
            'request_id'     => $this->id,
            'sender_id'      => $this->sender_id,
            'customer_id'    => $this->accepted_by,
            'flight_id'      => null, // sẽ gán sau nếu cần
            'reward'         => $this->reward,
            'service_fee'    => $this->reward * 0.15,
            'total_amount'   => $this->reward * 1.15,
            'tracking_code'  => 'SK' . now()->format('Ymd') . str_pad(Order::count() + 1, 5, '0', STR_PAD_LEFT),
            'status'         => 'confirmed',
            'escrow_status'  => 'held',
            'confirmed_at'   => now(),
        ]);
    }

    /** Tự động hết hạn */
    public function markAsExpired(): bool
    {
        if ($this->is_expired && $this->status === 'pending') {
            $this->status = 'expired';
            return $this->save();
        }
        return false;
    }

    /** Kéo dài thời hạn */
    public function extendExpiresAt(int $hours = 24): bool
    {
        $this->expires_at = now()->addHours($hours);
        return $this->save();
    }

    // ==================================================================
    // BOOT (tự động tạo UUID + expires_at)
    // ==================================================================

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (empty($request->uuid)) {
                $request->uuid = Str::uuid();
            }
            if (empty($request->expires_at)) {
                $request->expires_at = now()->addHours(48);
            }
        });
    }
}
