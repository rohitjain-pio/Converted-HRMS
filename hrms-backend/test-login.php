<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use Illuminate\Support\Facades\Hash;

echo "=== Testing Login ===\n\n";

$email = 'admin@company.com';
$password = 'password123';

echo "Attempting login with:\n";
echo "Email: {$email}\n";
echo "Password: {$password}\n\n";

// Find employment detail
$employmentDetail = EmploymentDetail::where('email', $email)->first();

if (!$employmentDetail) {
    echo "❌ Employment detail not found for {$email}\n";
    exit(1);
}

echo "✅ Found employment detail:\n";
echo "   Employee ID: {$employmentDetail->employee_id}\n";
echo "   Email: {$employmentDetail->email}\n";
echo "   Role ID: {$employmentDetail->role_id}\n\n";

// Find employee
$employee = EmployeeData::where('id', $employmentDetail->employee_id)
    ->where('is_deleted', false)
    ->first();

if (!$employee) {
    echo "❌ Employee not found or is deleted\n";
    exit(1);
}

echo "✅ Found employee:\n";
echo "   ID: {$employee->id}\n";
echo "   Name: {$employee->first_name} {$employee->last_name}\n";
echo "   Code: {$employee->employee_code}\n";
echo "   Has Password: " . ($employee->password ? 'Yes' : 'No') . "\n";

if (!$employee->password) {
    echo "\n❌ Employee has no password set!\n";
    echo "Setting password to: {$password}\n";
    $employee->password = Hash::make($password);
    $employee->save();
    echo "✅ Password set successfully!\n";
} else {
    echo "   Password Hash (first 50 chars): " . substr($employee->password, 0, 50) . "...\n\n";
    
    // Test password verification
    echo "Testing password verification...\n";
    $isValid = Hash::check($password, $employee->password);
    
    if ($isValid) {
        echo "✅ Password verification PASSED!\n";
        echo "\nYou should be able to login with these credentials now.\n";
    } else {
        echo "❌ Password verification FAILED!\n";
        echo "Resetting password...\n";
        $employee->password = Hash::make($password);
        $employee->save();
        echo "✅ Password reset complete!\n";
        
        // Verify again
        $employee->refresh();
        if (Hash::check($password, $employee->password)) {
            echo "✅ New password verified successfully!\n";
        }
    }
}
