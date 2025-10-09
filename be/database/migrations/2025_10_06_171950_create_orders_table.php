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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users');  // Người gửi
            $table->foreignId('receiver_id')->nullable()->constrained('users');  // Người nhận (được liên kết khi match)
            $table->string('shipment_description');  // Mô tả hàng hóa
            $table->string('pickup_location');  // Địa điểm người gửi giao hàng
            $table->string('delivery_location');  // Địa điểm giao hàng (dành cho người nhận)
            $table->enum('status', ['pending', 'matched', 'confirmed', 'delivered', 'cancelled'])->default('pending');  // Trạng thái đơn hàng
            $table->decimal('shipping_fee', 10, 2)->default(0);  // Phí vận chuyển
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
