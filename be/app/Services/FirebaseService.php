<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Database;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    protected Database $database;

    public function __construct()
    {
        // Khởi tạo Firebase bằng credentials và database URL trong .env
        $firebase = (new Factory)
            ->withServiceAccount(base_path(config('services.firebase.credentials')))
            ->withDatabaseUri(config('services.firebase.database_url'));

        $this->database = $firebase->createDatabase();
    }

    /**
     * Lưu dữ liệu tại path (ghi đè)
     */
    public function set(string $path, array $data)
    {
        try {
            return $this->database->getReference($path)->set($data);
        } catch (\Exception $e) {
            Log::error('Firebase set error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Thêm dữ liệu mới (push tạo key tự động)
     */
    public function push(string $path, array $data)
    {
        try {
            return $this->database->getReference($path)->push($data);
        } catch (\Exception $e) {
            Log::error('Firebase push error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Lấy dữ liệu tại path
     */
    public function get(string $path)
    {
        try {
            return $this->database->getReference($path)->getValue();
        } catch (\Exception $e) {
            Log::error('Firebase get error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Cập nhật một phần dữ liệu (merge)
     */
    public function update(string $path, array $data)
    {
        try {
            return $this->database->getReference($path)->update($data);
        } catch (\Exception $e) {
            Log::error('Firebase update error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Xoá dữ liệu tại path
     */
    public function delete(string $path)
    {
        try {
            return $this->database->getReference($path)->remove();
        } catch (\Exception $e) {
            Log::error('Firebase delete error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Push dữ liệu match order realtime
     */
    public function pushMatch(int $orderId, int $matchedOrderId)
    {
        $data = [
            'order_id' => $orderId,
            'matched_order_id' => $matchedOrderId,
            'status' => 'matched',
            'timestamp' => now()->timestamp,
        ];

        return $this->set("matches/{$orderId}", $data);
    }

    /**
     * Push tin nhắn realtime
     */
    public function pushChat(int $fromUserId, int $toUserId, string $message)
    {
        $chatPath = "chats/{$fromUserId}_{$toUserId}";
        $data = [
            'from' => $fromUserId,
            'to' => $toUserId,
            'message' => $message,
            'timestamp' => now()->timestamp,
        ];

        return $this->push($chatPath, $data);
    }

    /**
     * Push thông báo realtime
     */
    public function pushNotification(int $userId, string $title, string $body, array $extra = [])
    {
        $notificationPath = "notifications/{$userId}";
        $data = array_merge([
            'title' => $title,
            'body' => $body,
            'timestamp' => now()->timestamp,
            'read' => false,
        ], $extra);

        return $this->push($notificationPath, $data);
    }

    public function pushOrder(array $order)
    {
        return $this->set("orders/{$order['id']}", $order);
    }


    public function checkAndMatchOrder($newOrder)
    {
        $orders = $this->database->getReference("orders")->getValue();

        foreach ($orders as $id => $order) {
            // Kiểm tra điều kiện match cơ bản
            if (
                $order['status'] === 'pending' &&
                $order['role'] !== $newOrder['role'] &&
                $order['pickup_location'] === $newOrder['pickup_location'] &&
                $order['delivery_location'] === $newOrder['delivery_location'] &&
                !in_array($order['id'], $newOrder['rejected_matches'] ?? []) &&
                !in_array($newOrder['id'], $order['rejected_matches'] ?? [])
            ) {
                // Cập nhật status về pending_confirmation
                $this->database->getReference("orders/{$order['id']}/status")->set('pending_confirmation');
                $this->database->getReference("orders/{$newOrder['id']}/status")->set('pending_confirmation');

                // Tạo node match
                $this->database->getReference("matches/{$newOrder['id']}")->set([
                    'status' => 'pending_confirmation',
                    'matched_order_id' => $order['id'],
                    'chat_id' => null
                ]);

                $this->database->getReference("matches/{$order['id']}")->set([
                    'status' => 'pending_confirmation',
                    'matched_order_id' => $newOrder['id'],
                    'chat_id' => null
                ]);

                return true;
            }
        }

        return false;
    }

    public function confirmMatch($orderId, $userId, $action)
    {
        $match = $this->get("matches/{$orderId}");
        if (!$match) return false;

        $otherOrderId = $match['matched_order_id'];

        if ($action === 'confirm') {
            $chatId = $match['chat_id'] ?? $this->createChat($orderId, $otherOrderId);

            // 1️⃣ Đồng bộ Firebase
            $this->update("orders/{$orderId}", ['status' => 'matched', 'chat_id' => $chatId]);
            $this->update("orders/{$otherOrderId}", ['status' => 'matched', 'chat_id' => $chatId]);

            $this->update("matches/{$orderId}", ['status' => 'matched', 'chat_id' => $chatId]);
            $this->update("matches/{$otherOrderId}", ['status' => 'matched', 'chat_id' => $chatId]);

            // 2️⃣ Đồng bộ Laravel DB
            \App\Models\Order::where('id', $orderId)->update([
                'status' => 'matched',
                'chat_id' => $chatId,
                'matched_order_id' => $otherOrderId
            ]);
            \App\Models\Order::where('id', $otherOrderId)->update([
                'status' => 'matched',
                'chat_id' => $chatId,
                'matched_order_id' => $orderId
            ]);

            return ['chat_id' => $chatId];
        }

        if ($action === 'reject') {
            // Xóa match hiện tại Firebase
            $this->delete("matches/{$orderId}");
            $this->delete("matches/{$otherOrderId}");

            // Cập nhật status về pending Firebase
            $order = $this->get("orders/{$orderId}");
            $otherOrder = $this->get("orders/{$otherOrderId}");

            $order['status'] = 'pending';
            $otherOrder['status'] = 'pending';

            $order['rejected_matches'] = array_unique(array_merge($order['rejected_matches'] ?? [], [$otherOrderId]));
            $otherOrder['rejected_matches'] = array_unique(array_merge($otherOrder['rejected_matches'] ?? [], [$orderId]));

            $this->update("orders/{$orderId}", $order);
            $this->update("orders/{$otherOrderId}", $otherOrder);

            // Cập nhật status Laravel DB
            \App\Models\Order::where('id', $orderId)->update([
                'status' => 'pending',
            ]);
            \App\Models\Order::where('id', $otherOrderId)->update([
                'status' => 'pending',
            ]);

            // Tìm match mới cho cả 2 order
            $this->checkAndMatchOrder($order);
            $this->checkAndMatchOrder($otherOrder);

            return true;
        }
    }

    protected function createChat($orderId1, $orderId2)
    {
        $order1 = $this->database->getReference("orders/{$orderId1}")->getValue();
        $order2 = $this->database->getReference("orders/{$orderId2}")->getValue();

        if (!$order1 || !$order2) return null;

        $users = [$order1['user_id'], $order2['user_id']];

        // Tạo chat node mới
        $chatRef = $this->database->getReference("chats")->push([
            'orders' => [$orderId1, $orderId2],
            'users' => $users,
            'messages' => [],
            'created_at' => time()
        ]);

        return $chatRef->getKey();
    }
}
