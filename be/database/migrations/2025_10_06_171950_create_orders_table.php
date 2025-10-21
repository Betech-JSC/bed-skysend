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
            // Ai tạo đơn, có thể là sender hoặc carrier
            $table->foreignId('user_id')->constrained('users');

            // Loại đơn: sender hoặc carrier (hoặc role tạo đơn)
            $table->enum('role', ['sender', 'carrier']);

            // Các trường chung mô tả đơn hàng
            $table->string('shipment_description')->nullable();

            $table->string('pickup_location')->nullable();
            $table->string('delivery_location')->nullable();

            // Thông tin chuyến bay (có thể null)
            $table->string('flight_number')->nullable();
            $table->timestamp('flight_time')->nullable();

            $table->decimal('package_weight', 8, 2)->nullable();
            $table->string('package_dimensions')->nullable();

            // Trạng thái đơn hàng
            $table->enum('status', ['pending', 'matched', 'confirmed', 'delivered', 'cancelled'])->default('pending');

            // Liên kết 2 đơn với nhau khi match thành công (ví dụ: order của bên kia)
            $table->foreignId('matched_order_id')->nullable()->constrained('orders');

            $table->decimal('shipping_fee', 10, 2)->default(0);
            $table->text('special_instructions')->nullable();

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
