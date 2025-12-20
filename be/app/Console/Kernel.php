<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule)
    {
        // Re-match requests mỗi 5 phút
        $schedule->job(\App\Jobs\ReMatchRequestsJob::class)->everyMinute();

        // Cleanup expired flights hàng ngày lúc 2:00 AM
        $schedule->command('cleanup:expired-flights')->dailyAt('02:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
