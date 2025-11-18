<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "=== Setting up admin@company.com ===\n\n";

$user = User::where('email', 'admin@company.com')->first();

if (!$user) {
    $employee = \App\Models\EmployeeData::where('employee_code', 'EMP000')->first();
    if ($employee) {
        $user = User::create([
            'name' => 'Admin User',
            'email' => 'admin@company.com',
            'password' => Hash::make('password'),
            'employee_id' => $employee->id
        ]);
        echo "✓ User created\n";
    }
}

if ($user) {
    // Ensure user has employee_id
    if (!$user->employee_id) {
        $employee = \App\Models\EmployeeData::where('employee_code', 'EMP000')->first();
        if ($employee) {
            $user->employee_id = $employee->id;
            $user->save();
            echo "✓ Linked user to employee {$employee->employee_code}\n";
        }
    }
    
    if ($user->employee_id) {
        // Check user_role_mappings
        $roleMapping = DB::table('user_role_mappings')
            ->where('employee_id', $user->employee_id)
            ->first();
        
        if (!$roleMapping) {
            // Add SuperAdmin role (role_id = 1)
            DB::table('user_role_mappings')->insert([
                'employee_id' => $user->employee_id,
                'role_id' => 1,
                'created_on' => now(),
                'created_by' => 'system'
            ]);
            echo "✓ Added SuperAdmin role\n";
        } else {
            echo "✓ User already has role: {$roleMapping->role_id}\n";
        }
    }
    
    echo "\nUser Details:\n";
    echo "  Email: {$user->email}\n";
    echo "  Password: password\n";
    echo "  Employee ID: {$user->employee_id}\n";
}
