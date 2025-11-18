<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\EmployeeData;

echo "=== Attendance Data Analysis ===\n\n";

// Check attendance table structure
$attendance = DB::table('attendance')->first();
if ($attendance) {
    echo "Attendance table columns:\n";
    foreach ($attendance as $key => $value) {
        echo "  - $key\n";
    }
    echo "\n";
}

// Count attendance by query method
echo "Attendance counts:\n";
$totalByCode = DB::table('attendance')->whereNotNull('employee_code')->count();
echo "  By employee_code: $totalByCode\n";

$totalById = DB::table('attendance')->whereNotNull('employee_id')->count();
echo "  By employee_id: $totalById\n";

// Check a sample employee
$employee = EmployeeData::where('employee_code', 'EMP005')->first();
if ($employee) {
    echo "\nChecking EMP005 (ID: {$employee->id}):\n";
    $byCode = DB::table('attendance')->where('employee_code', 'EMP005')->count();
    echo "  Attendance by code: $byCode\n";
    
    $byId = DB::table('attendance')->where('employee_id', $employee->id)->count();
    echo "  Attendance by ID: $byId\n";
}
