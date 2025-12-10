<?php

// app/Services/ExpoPushService.php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    /**
     * Lấy URL logo app cho notification
     *
     * @return string|null
     */
    private static function getAppIconUrl(): ?string
    {
        $iconPath = public_path('logo/icon.png');

        // Kiểm tra file có tồn tại không
        if (!file_exists($iconPath)) {
            Log::warning('App icon not found at: ' . $iconPath);
            return null;
        }

        // Tạo URL đầy đủ cho logo - sử dụng url() helper để đảm bảo absolute URL
        $baseUrl = config('app.url', url('/'));
        $iconUrl = rtrim($baseUrl, '/') . '/logo/icon.png';

        // Log để debug
        Log::info('App icon URL: ' . $iconUrl);

        return $iconUrl;
    }

    /**
     * Gửi notification tới Expo Push Token
     *
     * @param string|array $token Expo Push Token hoặc mảng token
     * @param string $title Tiêu đề
     * @param string $body Nội dung
     * @param array $data Dữ liệu bổ sung
     */
    public static function sendNotification($token, string $title, string $body, array $data = [])
    {
        try {
            // Chuyển token về array nếu là string
            $tokens = is_array($token) ? $token : [$token];

            // Lấy URL logo app
            $iconUrl = self::getAppIconUrl();

            // Tạo payload cho Expo API
            $payloads = array_map(function ($t) use ($title, $body, $data, $iconUrl) {
                $payload = [
                    'to' => $t,
                    'title' => $title,
                    'body' => $body,
                    'data' => $data,
                    'sound' => 'default', // bật âm thanh notification
                ];

                // Thêm icon nếu có URL
                if ($iconUrl) {
                    $payload['icon'] = $iconUrl;
                }

                return $payload;
            }, $tokens);

            Log::info('Payload', $payloads);

            // Gửi request tới Expo Push API
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', $payloads);

            // Log lỗi nếu không thành công
            if (!$response->successful()) {
                Log::error('Expo push failed', [
                    'response' => $response->body(),
                    'tokens' => $tokens,
                ]);
            } else {
                // Log response ok
                Log::info('Expo push response', ['response' => $response->json()]);
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Expo push exception: ' . $e->getMessage());
            return null;
        }
    }
}
