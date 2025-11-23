// database/migrations/2025_04_06_000001_create_requests_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Người gửi (Sender)
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();

            // Thông tin điểm đi - đến (lưu cả tên thành phố + mã sân bay để dễ search)
            $table->string('city_from');           // "Hà Nội", "TP.HCM"
            $table->char('from_airport', 3);       // HAN, SGN
            $table->string('city_to');
            $table->char('to_airport', 3);

            // Thời gian
            $table->date('send_date');                                 // Ngày muốn gửi
            $table->enum('preferred_time_slot', ['morning', 'afternoon', 'evening', 'any'])
                ->default('any');                                     // Khung giờ ưu tiên

            // Thông tin tài liệu
            $table->enum('item_type', ['document', 'contract', 'package', 'gift', 'other']);
            $table->text('item_description')->nullable();
            $table->decimal('item_value', 15, 2);           // Giá trị ước tính (để bồi thường nếu mất)
            $table->decimal('reward', 12, 2);               // Tiền công trả hành khách

            // Trạng thái
            $table->enum('status', ['pending', 'accepted', 'confirmed', 'cancelled', 'expired', 'completed'])
                ->default('pending');
            $table->foreignId('accepted_by')->nullable()->constrained('users'); // Customer nào nhận
            $table->timestamp('accepted_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users');
            $table->timestamp('confirmed_at')->nullable();

            // Hạn sử dụng
            $table->timestamp('expires_at')->index();       // Tự động hết hạn sau 48h

            $table->timestamps();

            // Index tối ưu cho matching
            $table->index(['from_airport', 'to_airport', 'send_date']);
            $table->index(['status', 'expires_at']);
            $table->index('reward'); // Sắp xếp theo tiền công cao
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
