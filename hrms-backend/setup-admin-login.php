<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

try {
    $email = 'admin@company.com';
    
    // Find employment details
    $employmentDetail = DB::table('employment_details')
        ->where('email', $email)
        ->first();
    
    if (!$employmentDetail) {
        echo "Employment detail not found for {$email}\n";
        exit;
    }
    
    echo "Employment Detail:\n";
    echo "- Employee ID: {$employmentDetail->employee_id}\n";
    echo "- Email: {$employmentDetail->email}\n";
    echo "- Role ID: {$employmentDetail->role_id}\n\n";
    
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
    echo "- Full Name: " . ($employee->full_name ?? $employee->first_name ?? 'N/A') . "\n";
    echo "- is_deleted: " . ($employee->is_deleted ?? 0) . "\n\n";
    
    // Set password and ensure not deleted
    $newPassword = 'password';
    $hashedPassword = Hash::make($newPassword);
    
    DB::table('employee_data')
        ->where('id', $employee->id)
        ->update([
            'password' => $hashedPassword,
            'is_deleted' => 0
        ]);
    
    echo "✓ Password updated successfully!\n";
    echo "✓ is_deleted set to 0\n\n";
    echo "Login Credentials:\n";
    echo "==================\n";
    echo "Email: {$email}\n";
    echo "Password: {$newPassword}\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
