<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/Flight.php
class Flight extends Model
{
    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable')->orderBy('order');
    }

    // Chủ yếu là ảnh vé máy bay
    public function boardingPass()
    {
        return $this->attachments()->where('type', 'image')->first();
    }
}
