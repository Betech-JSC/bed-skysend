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
        Schema::table('requests', function (Blueprint $table) {
            // Make flight_id nullable
            $table->foreignId('flight_id')->nullable()->change();

            // Add matching fields
            $table->char('from_airport', 3)->nullable()->after('flight_id');
            $table->char('to_airport', 3)->nullable()->after('from_airport');
            $table->date('desired_date')->nullable()->after('to_airport');
            $table->string('desired_time_slot')->nullable()->after('desired_date'); // morning, afternoon, evening, any
            $table->decimal('desired_weight', 4, 2)->nullable()->after('desired_time_slot'); // kg

            // Add index for matching
            $table->index(['from_airport', 'to_airport', 'desired_date', 'status'], 'idx_requests_matching');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Remove index
            $table->dropIndex('idx_requests_matching');

            // Remove matching fields
            $table->dropColumn(['from_airport', 'to_airport', 'desired_date', 'desired_time_slot', 'desired_weight']);

            // Make flight_id required again (but we can't easily restore the constraint, so we'll just make it not nullable)
            // Note: This might fail if there are null values, so handle with care
            $table->foreignId('flight_id')->nullable(false)->change();
        });
    }
};
