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
        Schema::create('airports', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique(); // nên thêm unique cho mã sân bay
            $table->string('city_code', 10);
            $table->string('name_vi');
            $table->string('name_en');
            $table->string('latitude_deg');
            $table->string('longitude_deg');
            $table->string('country');
            $table->string('country_code');
            $table->string('continent');
            $table->string('timezone')->nullable();
            $table->timestamps();

            // Optional: thêm index để tìm kiếm nhanh hơn
            $table->index('city_code');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('airports');
    }
};
