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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_gateway_id')->constrained('payment_gateways');  // Liên kết với bảng payment_gateways
            $table->string('method_name');  // Tên phương thức thanh toán (Ví dụ: Credit Card, Bank Transfer)
            $table->string('method_code')->nullable();  // Mã phương thức thanh toán (Ví dụ: paypal_credit_card)
            $table->enum('status', ['active', 'inactive'])->default('active');  // Trạng thái của phương thức thanh toán
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
