<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SmtpSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $smtpSettings = [
            [
                'key' => 'smtp_host',
                'value' => 'smtp.gmail.com',
                'type' => 'string',
                'group' => 'smtp',
                'description' => 'SMTP Server Host (ví dụ: smtp.gmail.com)',
            ],
            [
                'key' => 'smtp_port',
                'value' => '587',
                'type' => 'integer',
                'group' => 'smtp',
                'description' => 'SMTP Port (587 cho TLS, 465 cho SSL)',
            ],
            [
                'key' => 'smtp_username',
                'value' => '',
                'type' => 'string',
                'group' => 'smtp',
                'description' => 'SMTP Username (email đăng nhập)',
            ],
            [
                'key' => 'smtp_password',
                'value' => '',
                'type' => 'string',
                'group' => 'smtp',
                'description' => 'SMTP Password (mật khẩu hoặc app password)',
            ],
            [
                'key' => 'smtp_encryption',
                'value' => 'tls',
                'type' => 'string',
                'group' => 'smtp',
                'description' => 'SMTP Encryption (tls hoặc ssl)',
            ],
            [
                'key' => 'smtp_from_address',
                'value' => '',
                'type' => 'string',
                'group' => 'smtp',
                'description' => 'Email địa chỉ gửi (From Address)',
            ],
            [
                'key' => 'smtp_from_name',
                'value' => 'SkySend',
                'type' => 'string',
                'group' => 'smtp',
                'description' => 'Tên hiển thị khi gửi email (From Name)',
            ],
            [
                'key' => 'smtp_notification_emails',
                'value' => '[]',
                'type' => 'json',
                'group' => 'smtp',
                'description' => 'Danh sách email nhận thông báo (JSON array)',
            ],
            [
                'key' => 'smtp_enabled',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'smtp',
                'description' => 'Bật/tắt SMTP từ cấu hình',
            ],
        ];

        foreach ($smtpSettings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}

