<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Checking EMP0008 Details ===\n\n";

$employment = DB::table('employment_details')
    ->where('employee_code', 'EMP0008')
    ->first();

echo "Employment Details:\n";
if ($employment) {
    echo "  Branch ID: " . ($employment->branch_id ?? 'NULL') . "\n";
    echo "  Employee Status: " . ($employment->employee_status ?? 'NULL') . "\n";
    echo "  First Name: {$employment->first_name}\n";
    echo "  Time Doctor ID: " . ($employment->time_doctor_id ?? 'NULL') . "\n";
} else {
    echo "  NOT FOUND\n";
}

$attendanceCount = DB::table('attendance')
    ->where('employee_code', 'EMP0008')
    ->count();

echo "\nAttendance Records: $attendanceCount\n";
