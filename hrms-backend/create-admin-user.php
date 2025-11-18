<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Checking Users ===\n\n";

$users = User::all();

if ($users->count() > 0) {
    echo "Found {$users->count()} users:\n\n";
    foreach ($users as $user) {
        echo "  - {$user->email} (ID: {$user->id})\n";
    }
    
    echo "\nTrying to create admin@company.com user...\n";
    
    // Get first employee
    $employee = \App\Models\EmployeeData::first();
    
    if ($employee) {
        $newUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@company.com',
            'password' => Hash::make('password'),
            'employee_id' => $employee->id
        ]);
        
        echo "✓ User created successfully!\n";
        echo "  Email: {$newUser->email}\n";
        echo "  Password: password\n";
    } else {
        echo "✗ No employees found to link user\n";
    }
} else {
    echo "No users found in database\n";
}
