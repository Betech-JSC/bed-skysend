<?php

namespace App\Console\Commands;

use App\Models\Flight;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupExpiredFlights extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:expired-flights';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Soft delete flights that have passed their flight date by more than 1 day (excluding flights with active orders)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of expired flights...');

        // Calculate the cutoff date: flights with flight_date < (today - 1 day)
        $cutoffDate = now()->subDay()->toDateString();

        $this->info("Looking for flights with flight_date < {$cutoffDate}");

        // Find flights that are expired (flight_date < today - 1 day) and not already soft deleted
        $expiredFlights = Flight::where('flight_date', '<', $cutoffDate)
            ->get();

        if ($expiredFlights->isEmpty()) {
            $this->info('No expired flights found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$expiredFlights->count()} expired flight(s) to process.");

        $deletedCount = 0;
        $skippedCount = 0;

        $bar = $this->output->createProgressBar($expiredFlights->count());
        $bar->start();

        foreach ($expiredFlights as $flight) {
            // Check if flight has active orders
            $activeOrders = $flight->orders()
                ->whereIn('status', ['confirmed', 'picked_up', 'in_transit', 'arrived', 'delivered'])
                ->count();

            if ($activeOrders > 0) {
                $skippedCount++;
                $bar->advance();
                continue;
            }

            // Soft delete the flight
            $flight->delete();
            $deletedCount++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Cleanup completed:");
        $this->info("  - Deleted: {$deletedCount} flight(s)");
        $this->info("  - Skipped (has active orders): {$skippedCount} flight(s)");

        // Log the result
        Log::info('Expired flights cleanup completed', [
            'deleted_count' => $deletedCount,
            'skipped_count' => $skippedCount,
            'cutoff_date' => $cutoffDate,
        ]);

        return Command::SUCCESS;
    }
}
