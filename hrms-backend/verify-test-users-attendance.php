<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Verifying Employee Report Data               ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

echo "=== Test Users Attendance for 2025-11-18 ===\n";

$testUsers = [56, 57, 58, 59];

$attendance = DB::table('attendance')
    ->whereIn('employee_id', $testUsers)
    ->whereDate('date', '2025-11-18')
    ->select('employee_id', 'date', 'start_time', 'end_time', 'total_hours', 'attendance_type')
    ->get();

if ($attendance->isEmpty()) {
    echo "❌ No attendance records found for test users!\n";
} else {
    echo "✓ Found {$attendance->count()} attendance records:\n\n";
    
    foreach ($attendance as $att) {
        $employee = DB::table('employee_data')
            ->where('id', $att->employee_id)
            ->first();
        
        echo "Employee: {$employee->first_name} {$employee->last_name} (ID: {$att->employee_id})\n";
        echo "  Date: {$att->date}\n";
        echo "  Time: {$att->start_time} - {$att->end_time}\n";
        echo "  Total: {$att->total_hours}\n";
        echo "  Type: {$att->attendance_type}\n\n";
    }
}

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  ✓ Verification Complete!                     ║\n";
echo "╚════════════════════════════════════════════════╝\n";
