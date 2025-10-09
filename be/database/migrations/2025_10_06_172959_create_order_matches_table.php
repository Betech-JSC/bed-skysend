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
        Schema::create('order_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders');  // Đơn hàng liên quan
            $table->foreignId('sender_id')->constrained('users');  // Người gửi
            $table->foreignId('receiver_id')->constrained('users');  // Người nhận
            $table->enum('status', ['pending', 'confirmed'])->default('pending');  // Trạng thái match: pending (chưa xác nhận), confirmed (đã xác nhận)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_matches');
    }
};
