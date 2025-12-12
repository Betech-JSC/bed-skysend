<?php

namespace App\Jobs;

use App\Services\RequestMatchingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ReMatchRequestsJob implements ShouldQueue
{
    use Queueable, Dispatchable;

    /**
     * Execute the job.
     */
    public function handle(RequestMatchingService $matchingService): void
    {
        try {
            $totalMatches = $matchingService->reMatchAllWaitingRequests();

            Log::info('ReMatchRequestsJob completed', [
                'total_matches_created' => $totalMatches,
            ]);
        } catch (\Exception $e) {
            Log::error('ReMatchRequestsJob failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
