<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Get user with ID 1
    $user = DB::table('users')->where('id', 1)->first();
    
    if (!$user) {
        echo "User not found\n";
        exit;
    }
    
    echo "User structure:\n";
    print_r($user);
    
    // Try to find role through employee_data
    $employeeData = DB::table('employee_data')->where('user_id', 1)->first();
    
    if ($employeeData) {
        echo "\nEmployee Data:\n";
        print_r($employeeData);
    }
    
    // Check employment_details
    $employmentDetails = DB::table('employment_details')->where('employee_id', 1)->first();
    
    if ($employmentDetails) {
        echo "\nEmployment Details:\n";
        print_r($employmentDetails);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
