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
        Schema::create('shipping_fees', function (Blueprint $table) {
            $table->id();
            $table->string('fee_type');  // Loại phí (Ví dụ: weight, distance, time)
            $table->decimal('fee_value', 10, 2);  // Giá trị của phí (tùy theo loại phí)
            $table->enum('fee_condition', ['fixed', 'variable']);  // Loại phí: cố định hoặc thay đổi (dựa vào trọng lượng, khoảng cách, v.v.)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_fees');
    }
};
