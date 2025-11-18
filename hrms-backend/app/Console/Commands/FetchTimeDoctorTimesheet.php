<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TimeDoctorSyncService;
use Carbon\Carbon;

class FetchTimeDoctorTimesheet extends Command
{
    protected $signature = 'attendance:fetch-timedoctor {--date= : The date to fetch timesheet for (Y-m-d format)}';
    protected $description = 'Fetch Time Doctor timesheet data and sync attendance';

    protected $timeDoctorSyncService;

    public function __construct(TimeDoctorSyncService $timeDoctorSyncService)
    {
        parent::__construct();
        $this->timeDoctorSyncService = $timeDoctorSyncService;
    }

    public function handle()
    {
        $dateString = $this->option('date');
        $date = $dateString ? Carbon::parse($dateString) : Carbon::yesterday();

        $this->info("Fetching Time Doctor timesheet for: " . $date->toDateString());

        try {
            $result = $this->timeDoctorSyncService->syncTimesheetForDate($date);
            
            $this->info("Sync completed successfully!");
            $this->info("Users processed: " . $result['total_users']);
            $this->info("Attendance records created/updated: " . $result['synced_count']);
            
            if ($result['errors'] > 0) {
                $this->warn("Errors encountered: " . $result['errors']);
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to fetch Time Doctor timesheet: " . $e->getMessage());
            return 1;
        }
    }
}
