<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'image_path',
    ];

    /**
     * Mỗi ảnh thuộc về một đơn hàng.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Lấy đường dẫn đầy đủ của ảnh (nếu bạn lưu trong storage/public).
     */
    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }
}
