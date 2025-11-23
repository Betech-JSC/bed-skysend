<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    use HasFactory;

    protected $fillable = [
        // ... các trường cũ ...
        // không cần attachments nữa
    ];

    // Quan hệ 1-n với attachments
    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable')->orderBy('order');
    }

    public function images()
    {
        return $this->attachments()->where('type', 'image');
    }

    public function videos()
    {
        return $this->attachments()->where('type', 'video');
    }
}
