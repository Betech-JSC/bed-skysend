<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestMatch extends Model
{
    protected $fillable = [
        'request_id',
        'flight_id',
        'customer_id',
        'match_score',
        'status',
        'matched_at',
        'sent_at',
    ];

    protected $casts = [
        'match_score' => 'decimal:2',
        'matched_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    // ==================================================================
    // RELATIONSHIPS
    // ==================================================================

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    // ==================================================================
    // METHODS
    // ==================================================================

    public function markAsSent(): bool
    {
        $this->status = 'sent';
        $this->sent_at = now();
        return $this->save();
    }

    public function markAsAccepted(): bool
    {
        $this->status = 'accepted';
        return $this->save();
    }

    public function markAsRejected(): bool
    {
        $this->status = 'rejected';
        return $this->save();
    }

    public function markAsExpired(): bool
    {
        $this->status = 'expired';
        return $this->save();
    }

    // ==================================================================
    // SCOPES
    // ==================================================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'sent']);
    }
}
