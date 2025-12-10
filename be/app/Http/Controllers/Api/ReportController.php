<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /**
     * Báo cáo người dùng
     */
    public function reportUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reported_user_id' => 'required|exists:users,id',
            'reason' => 'required|string|in:spam,inappropriate,harassment,fake,scam,other',
            'description' => 'required|string|min:10|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reporter = $request->user();
        $reportedUserId = $request->reported_user_id;

        // Không cho phép báo cáo chính mình
        if ($reporter->id == $reportedUserId) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể báo cáo chính mình',
            ], 400);
        }

        try {
            // Lưu vào bảng reports (nếu có) hoặc bảng user_reports
            $reportData = [
                'reporter_id' => $reporter->id,
                'reported_user_id' => $reportedUserId,
                'reason' => $request->reason,
                'description' => $request->description,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Kiểm tra xem bảng reports có tồn tại không
            if (DB::getSchemaBuilder()->hasTable('reports')) {
                DB::table('reports')->insert($reportData);
            } elseif (DB::getSchemaBuilder()->hasTable('user_reports')) {
                DB::table('user_reports')->insert($reportData);
            } else {
                // Nếu không có bảng, lưu vào logs hoặc gửi email
                \Log::info('User Report', $reportData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Báo cáo của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.',
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Report user error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại sau.',
            ], 500);
        }
    }
}
