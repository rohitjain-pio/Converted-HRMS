<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TimeDoctorSyncService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Testing Time Doctor Sync                     ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

// Check test users
echo "=== Test Users with Time Doctor IDs ===\n";
$users = DB::table('employment_details')
    ->where('time_doctor_user_id', '!=', '')
    ->whereNotNull('time_doctor_user_id')
    ->select('employee_id', 'email', 'time_doctor_user_id', 'is_manual_attendance', 'joining_date')
    ->get();

echo "Found " . $users->count() . " users with Time Doctor IDs:\n";
foreach ($users as $user) {
    echo "  - Email: {$user->email}\n";
    echo "    TD ID: {$user->time_doctor_user_id}\n";
    echo "    Manual: " . ($user->is_manual_attendance ? 'Yes' : 'No') . "\n";
    echo "    Joined: {$user->joining_date}\n\n";
}

// Check configuration
echo "=== Time Doctor Configuration ===\n";
echo "API Token: " . (config('services.timedoctor.api_token') ? 'SET' : 'NOT SET') . "\n";
echo "Company ID: " . config('services.timedoctor.company_id') . "\n";
echo "Summary URL: " . config('services.timedoctor.summary_stats_url') . "\n\n";

// Test the sync
echo "=== Running Time Doctor Sync ===\n";
$service = new TimeDoctorSyncService();
$date = Carbon::today(); // Test for today

try {
    $result = $service->syncTimesheetForDate($date);
    
    echo "✓ Sync completed!\n";
    echo "  Total users: {$result['total_users']}\n";
    echo "  Synced: {$result['synced_count']}\n";
    echo "  Errors: {$result['errors']}\n\n";
    
    // Check if any attendance was created
    echo "=== Checking Attendance Records ===\n";
    $attendance = DB::table('attendance')
        ->whereDate('date', $date)
        ->where('attendance_type', 'TimeDoctor')
        ->select('employee_id', 'date', 'start_time', 'end_time', 'total_hours')
        ->get();
    
    echo "Found " . $attendance->count() . " Time Doctor attendance records for " . $date->toDateString() . ":\n";
    foreach ($attendance as $att) {
        echo "  - Employee ID: {$att->employee_id}\n";
        echo "    Date: {$att->date}\n";
        echo "    Time: {$att->start_time} - {$att->end_time}\n";
        echo "    Total: {$att->total_hours}\n\n";
    }
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
