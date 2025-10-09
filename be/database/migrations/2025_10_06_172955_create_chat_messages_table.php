<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();  // Mã ID cho tin nhắn
            $table->foreignId('order_id')->constrained('orders');  // Liên kết với bảng orders
            $table->foreignId('user_id')->constrained('users');  // Liên kết với bảng users (người gửi tin nhắn)
            $table->text('message');  // Nội dung tin nhắn
            $table->timestamps();  // Thời gian tạo và cập nhật tin nhắn
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
