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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders');  // Liên kết với bảng orders
            $table->foreignId('payment_gateway_id')->constrained('payment_gateways');  // Liên kết với bảng payment_gateways
            $table->foreignId('payment_method_id')->constrained('payment_methods');  // Liên kết với bảng payment_methods
            $table->decimal('amount', 10, 2);  // Số tiền thanh toán
            $table->string('transaction_id')->nullable();  // Mã giao dịch từ cổng thanh toán
            $table->enum('payment_status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');  // Trạng thái thanh toán
            $table->timestamp('payment_date')->useCurrent();  // Thời gian thanh toán
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
