<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Attendance;
use App\Helpers\TimezoneHelper;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Timezone Conversion Verification             ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

$testEmployeeId = 57; // anand.sharma@programmers.io
$testDate = '2025-11-18';

echo "Checking Employee ID: $testEmployeeId for date: $testDate\n\n";

$attendance = Attendance::where('employee_id', $testEmployeeId)
    ->whereDate('date', $testDate)
    ->first();

if (!$attendance) {
    echo "❌ No attendance record found!\n";
    exit(1);
}

echo "=== Raw Database Values (Stored as UTC) ===\n";
echo "Start Time: {$attendance->start_time}\n";
echo "End Time: {$attendance->end_time}\n";
echo "Total Hours: {$attendance->total_hours}\n";
echo "Type: {$attendance->attendance_type}\n\n";

echo "=== Converting to IST (Asia/Kolkata, UTC+5:30) ===\n";
$startTimeIst = TimezoneHelper::utcToIst($attendance->start_time);
$endTimeIst = TimezoneHelper::utcToIst($attendance->end_time);

echo "Start Time IST: {$startTimeIst}\n";
echo "End Time IST: {$endTimeIst}\n\n";

echo "=== Verification ===\n";
// Time Doctor API returns times like "2025-11-18T05:59:30Z" (UTC)
// When stored as 05:59:30 in DB, should convert to 11:29:30 IST
echo "Expected conversion:\n";
echo "  05:59:30 UTC → 11:29:30 IST (adds 5:30)\n";
echo "  07:24:00 UTC → 12:54:00 IST (adds 5:30)\n\n";

echo "Actual conversion result:\n";
echo "  {$attendance->start_time} UTC → {$startTimeIst} IST\n";
echo "  {$attendance->end_time} UTC → {$endTimeIst} IST\n\n";

if ($startTimeIst === '11:29' && $endTimeIst === '12:54') {
    echo "✓ Timezone conversion is CORRECT!\n";
} else {
    echo "❌ Timezone conversion is INCORRECT!\n";
    echo "Expected: 11:29 - 12:54 IST\n";
    echo "Got: {$startTimeIst} - {$endTimeIst} IST\n";
}

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  Check Complete!                              ║\n";
echo "╚════════════════════════════════════════════════╝\n";
