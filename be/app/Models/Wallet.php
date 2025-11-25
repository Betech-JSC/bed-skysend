<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $fillable = ['user_id', 'balance', 'frozen_balance'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function deposit($amount, $description = null, $gateway_data = null)
    {
        $this->increment('balance', $amount);
        return $this->transactions()->create([
            'uuid'         => Str::uuid(),
            'type'         => 'deposit',
            'amount'       => $amount,
            'status'       => 'completed',
            'description'  => $description,
            'gateway_data' => $gateway_data,
            'completed_at' => now(),
        ]);
    }
}
