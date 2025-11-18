<?php
/**
 * Quick script to verify and reset admin credentials
 * Run this from command line: php verify-admin.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use Illuminate\Support\Facades\Hash;

echo "=== Admin User Verification ===\n\n";

// Find admin user
$employmentDetail = EmploymentDetail::where('email', 'admin@company.com')->first();

if (!$employmentDetail) {
    echo "❌ Employment detail not found for admin@company.com\n";
    echo "Creating admin user...\n";
    
    // Create admin user if doesn't exist
    $employee = EmployeeData::create([
        'first_name' => 'Admin',
        'last_name' => 'User',
        'employee_code' => 'EMP000',
        'personal_email' => 'admin@company.com',
        'phone' => '1111111111',
        'password' => Hash::make('password123'),
        'status' => 1,
        'is_deleted' => false,
        'created_by' => 'System',
        'created_on' => now(),
    ]);
    
    EmploymentDetail::create([
        'employee_id' => $employee->id,
        'email' => 'admin@company.com',
        'designation' => 'System Administrator',
        'department_name' => 'IT',
        'role_id' => 1,
        'joining_date' => '2022-01-01',
        'is_deleted' => false,
        'created_by' => 'System',
        'created_on' => now(),
    ]);
    
    echo "✅ Admin user created successfully!\n";
} else {
    echo "✅ Employment detail found:\n";
    echo "   Employee ID: {$employmentDetail->employee_id}\n";
    echo "   Email: {$employmentDetail->email}\n";
    echo "   Role ID: {$employmentDetail->role_id}\n\n";
    
    $employee = EmployeeData::find($employmentDetail->employee_id);
    
    if (!$employee) {
        echo "❌ Employee data not found!\n";
        exit(1);
    }
    
    echo "✅ Employee data found:\n";
    echo "   Name: {$employee->first_name} {$employee->last_name}\n";
    echo "   Code: {$employee->employee_code}\n";
    echo "   Email: {$employee->personal_email}\n";
    echo "   Status: {$employee->status}\n";
    echo "   Has Password: " . ($employee->password ? 'Yes' : 'No') . "\n\n";
    
    // Test password
    $testPassword = 'password123';
    if ($employee->password && Hash::check($testPassword, $employee->password)) {
        echo "✅ Password verification PASSED for: {$testPassword}\n";
    } else {
        echo "❌ Password verification FAILED\n";
        echo "Resetting password to: {$testPassword}\n";
        
        $employee->update([
            'password' => Hash::make($testPassword),
            'modified_by' => 'System',
        ]);
        
        echo "✅ Password reset successfully!\n";
    }
}

echo "\n=== Login Credentials ===\n";
echo "Email: admin@company.com\n";
echo "Password: password123\n";
echo "\n";

// Check permissions
echo "=== Checking Permissions ===\n";
$permissions = \DB::table('role_permissions')
    ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
    ->where('role_permissions.role_id', 1)
    ->where('role_permissions.is_active', 1)
    ->pluck('permissions.value')
    ->toArray();

echo "Total permissions for role_id 1: " . count($permissions) . "\n";

$attendancePerms = array_filter($permissions, function($p) {
    return str_starts_with($p, 'attendance.');
});

echo "Attendance permissions: " . count($attendancePerms) . "\n";
if (count($attendancePerms) > 0) {
    foreach ($attendancePerms as $perm) {
        echo "  - {$perm}\n";
    }
} else {
    echo "⚠️  No attendance permissions found! Run the permission setup SQL script.\n";
}

echo "\n✅ Verification complete!\n";
