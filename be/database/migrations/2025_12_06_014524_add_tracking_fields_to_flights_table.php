<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('flights', function (Blueprint $table) {
            // Current position tracking
            $table->decimal('current_latitude', 10, 8)->nullable()->after('note');
            $table->decimal('current_longitude', 11, 8)->nullable()->after('current_latitude');
            $table->integer('current_altitude')->nullable()->after('current_longitude'); // feet
            
            // Tracking status
            $table->enum('tracking_status', [
                'scheduled',
                'boarding',
                'departed',
                'in_flight',
                'landed',
                'arrived'
            ])->default('scheduled')->after('current_altitude');
            
            // Timestamps for tracking milestones
            $table->timestamp('departed_at')->nullable()->after('tracking_status');
            $table->timestamp('landed_at')->nullable()->after('departed_at');
            $table->timestamp('estimated_arrival_at')->nullable()->after('landed_at');
            $table->timestamp('last_tracking_update_at')->nullable()->after('estimated_arrival_at');
            
            // Index for tracking queries
            $table->index('tracking_status');
            $table->index('last_tracking_update_at');
        });
    }

    public function down(): void
    {
        Schema::table('flights', function (Blueprint $table) {
            $table->dropIndex(['tracking_status']);
            $table->dropIndex(['last_tracking_update_at']);
            
            $table->dropColumn([
                'current_latitude',
                'current_longitude',
                'current_altitude',
                'tracking_status',
                'departed_at',
                'landed_at',
                'estimated_arrival_at',
                'last_tracking_update_at',
            ]);
        });
    }
};


