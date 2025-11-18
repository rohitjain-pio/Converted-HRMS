<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule Time Doctor sync to run daily at 5:00 AM (Production)
// Legacy: FetchTimeDoctorTimeSheetJob cron: "0 0 5 ? * *"
// Matches legacy .NET Quartz.NET scheduler exactly
Schedule::command('attendance:fetch-timedoctor')->dailyAt('05:00');

// TESTING MODE (Disabled for Production)
// Uncomment the line below for testing with 5-minute intervals
// Schedule::command('attendance:fetch-timedoctor')->everyFiveMinutes();
