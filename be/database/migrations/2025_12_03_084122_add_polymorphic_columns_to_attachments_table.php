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
        Schema::table('attachments', function (Blueprint $table) {
            // Thêm polymorphic columns nếu chưa có
            if (!Schema::hasColumn('attachments', 'attachable_id')) {
                $table->unsignedBigInteger('attachable_id')->nullable()->after('type');
            }
            if (!Schema::hasColumn('attachments', 'attachable_type')) {
                $table->string('attachable_type')->nullable()->after('attachable_id');
            }
            
            // Thêm index cho polymorphic relationship
            $table->index(['attachable_type', 'attachable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            $table->dropIndex(['attachable_type', 'attachable_id']);
            $table->dropColumn(['attachable_id', 'attachable_type']);
        });
    }
};
