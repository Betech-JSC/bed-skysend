<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    /**
     * Lấy danh sách thông báo của user đang đăng nhập, phân trang.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Đánh dấu một thông báo đã đọc.
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();

        // Kiểm tra thông báo có thuộc về user không
        if ($notification->user_id !== $user->id) {
            return response()->json([
                'message' => 'Không có quyền thao tác trên thông báo này.'
            ], 403);
        }

        // Cập nhật trạng thái thành 'read' nếu đang là 'unread'
        if ($notification->status === 'unread') {
            $notification->status = 'read';
            $notification->save();
        }

        return response()->json([
            'message' => 'Thông báo đã được đánh dấu là đã đọc.',
            'notification' => $notification
        ]);
    }
}
