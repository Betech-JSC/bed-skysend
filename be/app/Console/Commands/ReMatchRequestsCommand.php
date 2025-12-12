<?php

namespace App\Console\Commands;

use App\Jobs\ReMatchRequestsJob;
use Illuminate\Console\Command;

class ReMatchRequestsCommand extends Command
{
    protected $signature = 'requests:rematch';
    protected $description = 'Re-match all waiting requests with available flights';

    public function handle()
    {
        $this->info('Starting to re-match all waiting requests...');

        try {
            dispatch(new ReMatchRequestsJob());
            $this->info('ReMatchRequestsJob has been dispatched successfully!');
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
