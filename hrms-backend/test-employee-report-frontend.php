<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\AttendanceService;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Employee Report - Frontend Verification      ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

$service = new AttendanceService();

$params = [
    'pageIndex' => 0,
    'pageSize' => 10,
    'dateFrom' => '2025-11-18',
    'dateTo' => '2025-11-18'
];

echo "Testing Employee Report API\n";
echo "Date Range: {$params['dateFrom']} to {$params['dateTo']}\n\n";

try {
    $result = $service->getEmployeeReport($params);
    
    echo "Total Employees: {$result['totalRecords']}\n\n";
    
    // Find test users (EMP0006-EMP0009)
    $testUsers = array_filter($result['employeeReports'], function($emp) {
        return preg_match('/EMP000[6-9]/', $emp['employeeCode']);
    });
    
    if (empty($testUsers)) {
        echo "❌ No test users (EMP0006-EMP0009) found in results!\n";
        echo "\nAll employees in results:\n";
        foreach ($result['employeeReports'] as $emp) {
            echo "  - {$emp['employeeCode']}: {$emp['employeeName']}\n";
        }
    } else {
        echo "✓ Test Users Found:\n\n";
        
        foreach ($testUsers as $emp) {
            echo "═══════════════════════════════════════════════\n";
            echo "Employee: {$emp['employeeCode']} - {$emp['employeeName']}\n";
            echo "═══════════════════════════════════════════════\n";
            echo "Email: {$emp['employeeEmail']}\n";
            echo "Department: {$emp['department']}\n";
            echo "Branch: " . ($emp['branch'] ?? 'N/A') . "\n";
            echo "Total Hours: {$emp['totalHour']}\n";
            echo "Manual Attendance: " . ($emp['isManualAttendance'] ? 'Yes' : 'No') . "\n";
            echo "\nworkedHoursByDate:\n";
            
            if (empty($emp['workedHoursByDate'])) {
                echo "  ❌ EMPTY - No attendance data for date range!\n";
            } else {
                echo "  ✓ Has " . count($emp['workedHoursByDate']) . " date(s) with attendance:\n";
                foreach ($emp['workedHoursByDate'] as $date => $hours) {
                    echo "    {$date}: {$hours}\n";
                }
            }
            echo "\n";
        }
        
        echo "═══════════════════════════════════════════════\n";
        echo "FRONTEND EXPECTATION:\n";
        echo "═══════════════════════════════════════════════\n";
        echo "The employee report page should display:\n";
        echo "  - Employee list with codes and names\n";
        echo "  - Total hours for each employee\n";
        echo "  - Attendance timeline/calendar showing worked hours per date\n";
        echo "  - Times should be in IST format (HH:MM)\n";
        echo "\nIf workedHoursByDate is empty, the timeline will be blank!\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  Verification Complete                        ║\n";
echo "╚════════════════════════════════════════════════╝\n";
