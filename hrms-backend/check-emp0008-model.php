<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\EmployeeData;

echo "=== Checking EMP0008 ===\n\n";

$employee = EmployeeData::where('employee_code', 'EMP0008')->first();

if ($employee) {
    echo "Employee Data Found:\n";
    echo "  ID: {$employee->id}\n";
    echo "  Employee Code: {$employee->employee_code}\n";
    echo "  First Name: {$employee->first_name}\n";
    echo "  Last Name: {$employee->last_name}\n";
    
    if ($employee->employmentDetail) {
        echo "\nEmployment Detail Found:\n";
        echo "  Branch ID: {$employee->employmentDetail->branch_id}\n";
        echo "  Department ID: {$employee->employmentDetail->department_id}\n";
        echo "  Employee Status: " . ($employee->employmentDetail->employee_status ?? 'NULL') . "\n";
        echo "  Time Doctor ID: " . ($employee->employmentDetail->time_doctor_id ?? 'NULL') . "\n";
    } else {
        echo "\nEmployment Detail: NOT FOUND\n";
    }
} else {
    echo "Employee NOT FOUND in employee_data table\n";
}
