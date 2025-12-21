<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    public function upload(Request $request)
    {
        /** @phpstan-ignore-next-line */
        $userId = auth()->check() ? auth()->id() : null;
        Log::info('📤 [Upload] Bắt đầu upload file', [
            'user_id' => $userId,
            'has_files' => $request->hasFile('files'),
            'files_count' => $request->hasFile('files') ? count($request->file('files')) : 0,
            'all_input_keys' => array_keys($request->all()),
        ]);

        try {
            $request->validate([
                'files'   => 'required|array',
                'files.*' => 'required|file|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,webm,mpg,mpeg,pdf,doc,docx,xls,xlsx,txt,zip,rar|max:51200',
            ]);

            Log::info('✅ [Upload] Validation passed', [
                'files_count' => count($request->file('files')),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [Upload] Validation failed', [
                'errors' => $e->errors(),
                'request_data' => [
                    'has_files' => $request->hasFile('files'),
                    'files_keys' => $request->hasFile('files') ? array_keys($request->file('files')) : [],
                ],
            ]);
            throw $e;
        }

        $uploaded = [];
        $fileIndex = 0;

        foreach ($request->file('files') as $index => $file) {
            $fileIndex++;
            Log::info("📄 [Upload] Xử lý file #{$fileIndex}", [
                'index' => $index,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension(),
            ]);

            try {
                $mime = $file->getMimeType();
                $isImage = str_starts_with($mime, 'image/');
                $isVideo = str_starts_with($mime, 'video/');
                $isDocument = in_array($mime, [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'application/zip',
                    'application/x-rar-compressed',
                ]);

                Log::info("🔍 [Upload] File #{$fileIndex} - Phân loại", [
                    'mime_type' => $mime,
                    'is_image' => $isImage,
                    'is_video' => $isVideo,
                    'is_document' => $isDocument,
                ]);

                if (!$isImage && !$isVideo && !$isDocument) {
                    Log::warning("⚠️ [Upload] File #{$fileIndex} - Loại file không được hỗ trợ", [
                        'mime_type' => $mime,
                        'original_name' => $file->getClientOriginalName(),
                    ]);
                    continue;
                }
            } catch (\Exception $e) {
                Log::error("❌ [Upload] File #{$fileIndex} - Lỗi khi phân loại file", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                continue;
            }

            try {
                // Folder by date
                $folder = 'uploads/' . now()->format('Y/m/d');

                $extension = $file->getClientOriginalExtension() ?: 'jpg';
                $fileName = Str::random(20) . '_' . time() . Str::random(3) . '.' . $extension;

                Log::info("💾 [Upload] File #{$fileIndex} - Bắt đầu lưu file", [
                    'folder' => $folder,
                    'file_name' => $fileName,
                    'extension' => $extension,
                ]);

                // Save file
                $path = $file->storeAs($folder, $fileName, 'public');

                if (!$path) {
                    Log::error("❌ [Upload] File #{$fileIndex} - Không thể lưu file", [
                        'folder' => $folder,
                        'file_name' => $fileName,
                    ]);
                    continue;
                }

                Log::info("✅ [Upload] File #{$fileIndex} - Đã lưu file thành công", [
                    'path' => $path,
                ]);

                // 🔥 FULL DOMAIN URL
                $url = asset("storage/" . $path);

                Log::info("💾 [Upload] File #{$fileIndex} - Lưu vào database", [
                    'url' => $url,
                    'file_size' => $file->getSize(),
                ]);

                // Save to DB
                $attachment = Attachment::create([
                    'original_name' => $file->getClientOriginalName(),
                    'type'         => $isImage ? 'image' : ($isVideo ? 'video' : 'document'),
                    'file_name'    => $fileName,
                    'file_path'    => $path,
                    'file_url'     => $url,
                    'file_size'    => $file->getSize(),
                    'mime_type'    => $mime,
                    'uploaded_by'  => $userId,
                    'sort_order'   => 0,
                ]);

                Log::info("✅ [Upload] File #{$fileIndex} - Đã lưu vào database thành công", [
                    'attachment_id' => $attachment->id,
                    'url' => $url,
                ]);

                $uploaded[] = [
                    'success'       => true,
                    'file_url'      => $url,
                    'file'          => $url,
                    'location'      => $url,
                    'attachment_id' => $attachment->id,
                ];
            } catch (\Exception $e) {
                Log::error("❌ [Upload] File #{$fileIndex} - Lỗi khi xử lý file", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'original_name' => $file->getClientOriginalName(),
                ]);
                // Continue với file tiếp theo thay vì dừng toàn bộ
            }
        }

        // Nếu upload nhiều file => trả về array
        Log::info('📤 [Upload] Hoàn thành upload', [
            'total_files' => $fileIndex,
            'uploaded_count' => count($uploaded),
            'uploaded_ids' => array_column($uploaded, 'attachment_id'),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $uploaded
        ]);
    }
}
