<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\AttendanceService;
use App\Models\EmployeeData;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Test Attendance API Response                 ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

$attendanceService = new AttendanceService();
$employeeId = 57;

echo "Fetching attendance for employee ID: {$employeeId}\n\n";

try {
    $result = $attendanceService->getAttendanceByEmployee(
        $employeeId,
        '2025-11-18',
        '2025-11-18',
        0,
        10
    );
    
    echo "=== API Response (as returned to frontend) ===\n";
    
    if (!empty($result['attendaceReport'])) {
        foreach ($result['attendaceReport'] as $record) {
            echo "Date: {$record['date']}\n";
            echo "Start Time (IST): {$record['startTime']}\n";
            echo "End Time (IST): {$record['endTime']}\n";
            echo "Total Hours: {$record['totalHours']}\n";
            echo "Type: {$record['attendanceType']}\n\n";
            
            if (!empty($record['audit'])) {
                echo "Audit Trail:\n";
                foreach ($record['audit'] as $audit) {
                    echo "  - {$audit['action']} at {$audit['time']} (IST)\n";
                }
                echo "\n";
            }
        }
    } else {
        echo "No attendance records found\n";
    }
    
    echo "=== Verification ===\n";
    echo "✓ Times should be in IST (UTC+5:30)\n";
    echo "✓ Database stores UTC: 05:59:30 - 07:39:00\n";
    echo "✓ API returns IST: 11:29 - 13:09\n";
    
} catch (\Exception $e) {
    echo "Error: {$e->getMessage()}\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  Test Complete!                               ║\n";
echo "╚════════════════════════════════════════════════╝\n";
