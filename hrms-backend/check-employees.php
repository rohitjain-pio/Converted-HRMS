<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\EmployeeData;

// Check all employees
$employees = EmployeeData::with('employmentDetail')
    ->where('is_deleted', 0)
    ->whereHas('employmentDetail', function($q) {
        $q->where('employee_status', '!=', 4);
    })
    ->get();

echo "=== All Employees (excluding ex-employees) ===\n\n";
echo "Total: {$employees->count()}\n\n";

foreach ($employees as $emp) {
    $branchId = $emp->employmentDetail->branch_id ?? 'NULL';
    echo "{$emp->employee_code} - {$emp->first_name} {$emp->last_name} - Branch ID: {$branchId}\n";
}

echo "\n=== Branch ID Mapping ===\n";
echo "401 = Hyderabad\n";
echo "402 = Jaipur\n";
echo "403 = Pune\n";

// Check attendance records
echo "\n=== Employees with Attendance ===\n\n";
$employeesWithAttendance = EmployeeData::whereHas('attendances')->count();
echo "Employees with attendance: {$employeesWithAttendance}\n";

$totalAttendance = \App\Models\Attendance::count();
echo "Total attendance records: {$totalAttendance}\n";
