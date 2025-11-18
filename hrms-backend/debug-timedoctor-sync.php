<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TimeDoctorSyncService;
use Carbon\Carbon;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Testing TimeDoctorSyncService Debug          ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

$syncService = new TimeDoctorSyncService();
$date = Carbon::parse('2025-11-18');

echo "Running sync for date: {$date->toDateString()}\n\n";

// Enable query logging
\DB::enableQueryLog();

try {
    $result = $syncService->syncTimesheetForDate($date);
    
    echo "Sync Result:\n";
    print_r($result);
    echo "\n";
    
    echo "=== Checking Database Values ===\n";
    $attendance = \App\Models\Attendance::where('employee_id', 57)
        ->whereDate('date', '2025-11-18')
        ->first();
    
    if ($attendance) {
        echo "Employee 57 Attendance:\n";
        echo "  Start Time: {$attendance->start_time}\n";
        echo "  End Time: {$attendance->end_time}\n";
        echo "  Total Hours: {$attendance->total_hours}\n";
        echo "  Type: {$attendance->attendance_type}\n\n";
    } else {
        echo "No attendance record found for employee 57\n\n";
    }
    
    // Show last few queries
    $queries = \DB::getQueryLog();
    echo "=== Last INSERT/UPDATE Query ===\n";
    foreach (array_slice($queries, -5) as $query) {
        if (stripos($query['query'], 'insert') !== false || stripos($query['query'], 'update') !== false) {
            echo "SQL: {$query['query']}\n";
            echo "Bindings: " . json_encode($query['bindings']) . "\n\n";
        }
    }
    
} catch (\Exception $e) {
    echo "Error: {$e->getMessage()}\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  Debug Complete!                              ║\n";
echo "╚════════════════════════════════════════════════╝\n";
