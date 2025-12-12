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
        Schema::create('request_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->foreignId('flight_id')->constrained('flights')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();

            // Match score for ranking (0-100)
            $table->decimal('match_score', 5, 2)->default(0);

            // Status: pending, sent, accepted, rejected, expired
            $table->enum('status', ['pending', 'sent', 'accepted', 'rejected', 'expired'])
                ->default('pending');

            $table->timestamp('matched_at')->nullable();
            $table->timestamp('sent_at')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index(['request_id', 'status']);
            $table->index(['flight_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index('match_score');

            // Prevent duplicate matches
            $table->unique(['request_id', 'flight_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_matches');
    }
};
