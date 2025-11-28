<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;

class AttachmentController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,webm,mpg,mpeg|max:51200', // max 50MB
            'attachable_type' => 'nullable|string',  // có thể để trống nếu chưa biết attach vào đâu
            'attachable_id'   => 'nullable|integer',
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();

        $isImage = str_starts_with($mime, 'image/');
        $isVideo = str_starts_with($mime, 'video/');

        if (!$isImage && !$isVideo) {
            return response()->json(['error' => 'Chỉ chấp nhận ảnh hoặc video'], 422);
        }

        // Thư mục theo ngày
        $folder = 'uploads/' . now()->format('Y/m/d');
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::random(20) . '_' . time() . '.' . $extension;

        // Lưu file
        $path = $file->storeAs($folder, $fileName, 'public');
        $url = Storage::url($path); // ← Đây là URL bạn cần

        // Tạo bản ghi Attachment (vẫn giữ polymorphic để sau này attach)
        $attachment = Attachment::create([
            'uuid'            => Uuid::uuid4()->toString(),
            'attachable_type' => $request->filled('attachable_type') ? $request->attachable_type : null,
            'attachable_id'   => $request->attachable_id ?? null,
            'type'            => $isImage ? 'image' : 'video',
            'file_name'       => $file->getClientOriginalName(),
            'file_path'       => $path,
            'url'             => $url,
            'file_size'       => $file->getSize(),
            'mime_type'       => $mime,
            'uploaded_by'     => auth()->id(),
        ]);

        // Nếu là ảnh → lấy width/height + thumbnail (tùy chọn)
        if ($isImage) {
            [$w, $h] = getimagesize($file->getRealPath());
            $attachment->update(['width' => $w, 'height' => $h]);
        }

        // Trả về đúng format mà hầu hết editor mong muốn
        return response()->json([
            'success' => true,
            'data' => [
                'url'     => $url,
                'file'    => $url,
                'location' => $url,
                'attachment_id' => $attachment->id,
                'uuid'    => $attachment->uuid,
                'type'    => $isImage ? 'image' : 'video',
            ]
        ]);
    }
}
