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
        Schema::create('fee_rules', function (Blueprint $table) {
            $table->id();
            $table->string('rule_name');  // Tên quy tắc tính phí (Ví dụ: Phí theo trọng lượng)
            $table->decimal('min_value', 10, 2);  // Giá trị tối thiểu
            $table->decimal('max_value', 10, 2);  // Giá trị tối đa
            $table->decimal('fee_amount', 10, 2);  // Phí tính cho khoảng giá trị
            $table->enum('fee_type', ['weight', 'distance', 'time', 'service']);  // Loại phí (trọng lượng, khoảng cách, thời gian)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_rules');
    }
};
