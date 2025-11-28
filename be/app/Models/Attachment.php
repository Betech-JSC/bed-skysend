<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $fillable = [
        'type',
        'file_name',
        'file_path',
        'file_url',
        'file_size',
        'mime_type',
        'uploaded_by'
    ];
}
