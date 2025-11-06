<?php

namespace App\Console\Commands;

use App\Services\ExpoPushService;
use Illuminate\Console\Command;
use App\Services\FirebaseService;
use App\Services\FCMService;
use Illuminate\Support\Facades\Log;

class ListenChatFirebase extends Command
{
    protected $signature = 'firebase:listen-chat';
    protected $description = 'Listen for new chats in Firebase and send notifications';

    protected FirebaseService $firebase;

    public function __construct()
    {
        parent::__construct();
        $this->firebase = new FirebaseService();
    }

    public function handle()
    {
        $this->info("Listening for new chats...");

        $processedMessages = []; // track messages already processed

        while (true) {

            try {
                $chats = $this->firebase->get('chats') ?? [];

                foreach ($chats as $chatId => $chat) {
                    $messages = $chat['messages'] ?? [];

                    foreach ($messages as $messageId => $message) {
                        // Skip if already processed
                        if (in_array($messageId, $processedMessages)) continue;

                        $processedMessages[] = $messageId;

                        // Gửi notification tới user nhận
                        $toUserId = $message['to'] ?? null;
                        $fromUserId = $message['from'] ?? null;
                        $text = $message['text'] ?? '';

                        if ($toUserId) {
                            // Lấy FCM token từ DB user
                            $user = \App\Models\User::find($toUserId);

                            if ($user && $user->fcm_token) {
                                FCMService::sendNotification(
                                    $user->fcm_token,
                                    "Tin nhắn mới",
                                    $text,
                                    ['chat_id' => $chatId, 'from_user' => $fromUserId]
                                );
                                $this->info("Sent notification to user {$toUserId}: {$text}");
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error("Error polling Firebase: " . $e->getMessage());
                Log::error("ListenChatFirebase error: " . $e->getMessage());
            }

            // Sleep 1 giây trước khi poll tiếp
            sleep(1);
        }
    }
}
