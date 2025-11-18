<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\AttendanceService;

echo "=== Testing Employee Report Service ===\n\n";

$service = new AttendanceService();

$params = [
    'pageIndex' => 0,
    'pageSize' => 10,
    'dateFrom' => '2024-10-19',
    'dateTo' => '2024-11-18'
];

try {
    $result = $service->getEmployeeReport($params);
    
    echo "✓ Service call successful\n\n";
    echo "Total Records: {$result['totalRecords']}\n";
    echo "Employee Reports Count: " . count($result['employeeReports']) . "\n\n";
    
    if (count($result['employeeReports']) > 0) {
        echo "First Employee Details:\n";
        $first = $result['employeeReports'][0];
        
        echo "  Employee Code: {$first['employeeCode']}\n";
        echo "  Employee Name: {$first['employeeName']}\n";
        echo "  Department: {$first['department']}\n";
        echo "  Branch: {$first['branch']}\n";
        echo "  Total Hours: {$first['totalHour']}\n";
        echo "  Dates with attendance: " . count($first['workedHoursByDate']) . "\n";
        
        if (count($first['workedHoursByDate']) > 0) {
            echo "\n  Sample Attendance (first 5 days):\n";
            $count = 0;
            foreach ($first['workedHoursByDate'] as $date => $hours) {
                echo "    - $date: $hours\n";
                $count++;
                if ($count >= 5) break;
            }
        }
        
        echo "\n\nAll Employees:\n";
        foreach ($result['employeeReports'] as $emp) {
            echo "  - {$emp['employeeCode']}: {$emp['employeeName']} (Branch: {$emp['branch']})\n";
        }
    }
} catch (\Exception $e) {
    echo "✗ Error: {$e->getMessage()}\n";
    echo "Trace: {$e->getTraceAsString()}\n";
}
