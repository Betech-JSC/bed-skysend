<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'files'   => 'required|array',
            'files.*' => 'required|file|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,webm,mpg,mpeg|max:51200',
        ]);

        $uploaded = [];

        foreach ($request->file('files') as $file) {

            $mime = $file->getMimeType();
            $isImage = str_starts_with($mime, 'image/');
            $isVideo = str_starts_with($mime, 'video/');

            if (!$isImage && !$isVideo) {
                continue;
            }

            // Folder by date
            $folder = 'uploads/' . now()->format('Y/m/d');

            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $fileName = Str::random(20) . '_' . time() . Str::random(3) . '.' . $extension;

            // Save file
            $path = $file->storeAs($folder, $fileName, 'public');

            // 🔥 FULL DOMAIN URL
            $url = asset("storage/" . $path);

            // Save to DB
            $attachment = Attachment::create([
                'type'        => $isImage ? 'image' : 'video',
                'file_name'   => $file->getClientOriginalName(),
                'file_path'   => $path,
                'file_url'    => $url,
                'file_size'   => $file->getSize(),
                'mime_type'   => $mime,
                'uploaded_by' => auth()->id(),
            ]);

            $uploaded[] = [
                'success'       => true,
                'file_url'      => $url,
                'file'          => $url,
                'location'      => $url,
                'attachment_id' => $attachment->id,
            ];
        }

        // Nếu upload nhiều file => trả về array
        return response()->json([
            'success' => true,
            'data'    => $uploaded
        ]);
    }
}
