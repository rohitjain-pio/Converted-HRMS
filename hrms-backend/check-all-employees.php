<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\EmployeeData;

// Check ALL employees
echo "=== ALL Employees in Database ===\n\n";
$allEmployees = EmployeeData::with('employmentDetail')->where('is_deleted', 0)->get();
echo "Total (is_deleted=0): {$allEmployees->count()}\n\n";

foreach ($allEmployees as $emp) {
    $empStatus = $emp->employmentDetail->employee_status ?? 'NULL';
    $branchId = $emp->employmentDetail->branch_id ?? 'NULL';
    $statusLabel = match((int)$empStatus) {
        1 => 'Active',
        2 => 'F&F Pending',
        3 => 'On Notice',
        4 => 'Ex Employee',
        default => 'Unknown'
    };
    
    echo "{$emp->employee_code} - {$emp->first_name} {$emp->last_name}\n";
    echo "  Status: {$empStatus} ({$statusLabel})\n";
    echo "  Branch: {$branchId}\n";
    echo "  Has Attendance: " . (\App\Models\Attendance::where('employee_id', $emp->id)->exists() ? 'YES' : 'NO') . "\n\n";
}

// Check what the query returns
echo "\n=== Employee Report Query (Active Only) ===\n\n";
$activeEmployees = EmployeeData::with('employmentDetail')
    ->where('is_deleted', 0)
    ->whereHas('employmentDetail', function($q) {
        $q->where('employee_status', '!=', 4);
    })
    ->get();
    
echo "Total Active Employees: {$activeEmployees->count()}\n\n";
foreach ($activeEmployees as $emp) {
    echo "{$emp->employee_code} - {$emp->first_name} {$emp->last_name}\n";
}
