<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\EmployeeData;
use App\Models\Attendance;

echo "=== Attendance Data Check ===\n\n";

$totalAttendance = DB::table('attendance')->count();
echo "Total attendance records: $totalAttendance\n\n";

// Check employees with attendance
$employeesWithAttendance = DB::table('attendance')
    ->join('employee_data', 'attendance.employee_id', '=', 'employee_data.id')
    ->select('employee_data.employee_code', 'employee_data.first_name', 'employee_data.last_name', DB::raw('COUNT(*) as count'))
    ->groupBy('employee_data.id', 'employee_data.employee_code', 'employee_data.first_name', 'employee_data.last_name')
    ->get();

echo "Employees with attendance:\n";
foreach ($employeesWithAttendance as $emp) {
    echo "  {$emp->employee_code} - {$emp->first_name} {$emp->last_name}: {$emp->count} records\n";
}

// Test date range query for one employee
echo "\nTesting date range query for EMP001:\n";
$employee = EmployeeData::where('employee_code', 'EMP001')->first();
if ($employee) {
    $records = Attendance::where('employee_id', $employee->id)
        ->whereBetween('date', ['2024-10-19', '2024-11-18'])
        ->orderBy('date')
        ->limit(5)
        ->get();
    
    echo "  Found {$records->count()} records in range (showing first 5):\n";
    foreach ($records as $record) {
        echo "    {$record->date}: {$record->total_hours}\n";
    }
}
