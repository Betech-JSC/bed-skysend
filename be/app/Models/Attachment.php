<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'attachable_type',
        'attachable_id',
        'type',
        'file_name',
        'file_path',
        'url',
        'thumbnail_url',
        'file_size',
        'mime_type',
        'width',
        'height',
        'duration',
        'order',
        'note',
        'uploaded_by'
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function attachable()
    {
        return $this->morphTo();
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getIsImageAttribute()
    {
        return $this->type === 'image';
    }

    public function getIsVideoAttribute()
    {
        return $this->type === 'video';
    }
}
