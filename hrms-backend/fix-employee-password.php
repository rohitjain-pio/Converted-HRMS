<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

try {
    // Find employment details
    $employmentDetail = DB::table('employment_details')
        ->where('email', 'admin@programmers.io')
        ->first();
    
    if (!$employmentDetail) {
        echo "Employment detail not found for admin@programmers.io\n";
        exit;
    }
    
    echo "Employment Detail:\n";
    echo "- Employee ID: {$employmentDetail->employee_id}\n";
    echo "- Email: {$employmentDetail->email}\n\n";
    
    // Find employee data
    $employee = DB::table('employee_data')
        ->where('id', $employmentDetail->employee_id)
        ->first();
    
    if (!$employee) {
        echo "Employee data not found\n";
        exit;
    }
    
    echo "Employee Data:\n";
    echo "- ID: {$employee->id}\n";
    echo "- Full Name: {$employee->full_name}\n";
    echo "- Password field exists: " . (isset($employee->password) ? 'Yes' : 'No') . "\n";
    echo "- Password value: " . ($employee->password ?? 'NULL') . "\n";
    echo "- is_deleted: {$employee->is_deleted}\n\n";
    
    // Set password
    $newPassword = 'password123';
    $hashedPassword = Hash::make($newPassword);
    
    DB::table('employee_data')
        ->where('id', $employee->id)
        ->update(['password' => $hashedPassword]);
    
    echo "Password updated successfully!\n";
    echo "Email: admin@programmers.io\n";
    echo "Password: {$newPassword}\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
