<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Thay đổi từ string sang JSON để lưu nhiều ảnh
            $table->json('pickup_photos')->nullable()->after('picked_up_at');
            $table->json('delivery_photos')->nullable()->after('delivered_at');
        });

        // Migrate dữ liệu cũ: chuyển từ string sang array
        DB::table('orders')->whereNotNull('pickup_photo')->get()->each(function ($order) {
            DB::table('orders')
                ->where('id', $order->id)
                ->update(['pickup_photos' => json_encode([['url' => $order->pickup_photo, 'uploaded_at' => $order->picked_up_at]])]);
        });

        DB::table('orders')->whereNotNull('delivery_photo')->get()->each(function ($order) {
            DB::table('orders')
                ->where('id', $order->id)
                ->update(['delivery_photos' => json_encode([['url' => $order->delivery_photo, 'uploaded_at' => $order->delivered_at]])]);
        });

        // Xóa cột cũ sau khi migrate
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['pickup_photo', 'delivery_photo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Khôi phục cột cũ
            $table->string('pickup_photo')->nullable()->after('picked_up_at');
            $table->string('delivery_photo')->nullable()->after('delivered_at');
        });

        // Migrate dữ liệu ngược lại: lấy ảnh đầu tiên từ array
        DB::table('orders')->whereNotNull('pickup_photos')->get()->each(function ($order) {
            $photos = json_decode($order->pickup_photos, true);
            if (!empty($photos) && isset($photos[0]['url'])) {
                DB::table('orders')
                    ->where('id', $order->id)
                    ->update(['pickup_photo' => $photos[0]['url']]);
            }
        });

        DB::table('orders')->whereNotNull('delivery_photos')->get()->each(function ($order) {
            $photos = json_decode($order->delivery_photos, true);
            if (!empty($photos) && isset($photos[0]['url'])) {
                DB::table('orders')
                    ->where('id', $order->id)
                    ->update(['delivery_photo' => $photos[0]['url']]);
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['pickup_photos', 'delivery_photos']);
        });
    }
};
