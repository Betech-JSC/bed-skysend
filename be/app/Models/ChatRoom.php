<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    protected $fillable = [
        'order_id',
        'user1_id',
        'user2_id',
    ];
}
