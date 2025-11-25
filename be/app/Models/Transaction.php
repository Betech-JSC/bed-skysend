<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'wallet_id',
        'type',
        'method',
        'amount',
        'fee',
        'status',
        'description',
        'gateway_data',
        'completed_at'
    ];

    protected $casts = ['gateway_data' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }
}
