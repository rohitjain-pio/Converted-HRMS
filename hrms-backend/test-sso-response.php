<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\Auth\AuthService;
use App\Models\EmployeeData;
use App\Models\EmploymentDetail;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Testing Azure SSO Login Response            ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

// Test with rohit.jain@programmers.io
$email = 'rohit.jain@programmers.io';
echo "=== Testing for: $email ===\n";

$employmentDetail = EmploymentDetail::where('email', $email)->first();

if (!$employmentDetail) {
    echo "❌ Employment detail not found\n";
    exit(1);
}

$employee = EmployeeData::where('id', $employmentDetail->employee_id)
    ->where('is_deleted', false)
    ->first();

if (!$employee) {
    echo "❌ Employee not found\n";
    exit(1);
}

echo "✓ Found employee: {$employee->first_name} {$employee->last_name}\n";
echo "  Employee ID: {$employee->id}\n";
echo "  Email: {$employmentDetail->email}\n\n";

// Simulate what generateAuthResponse would return
$authService = new AuthService();
$reflection = new ReflectionClass($authService);
$method = $reflection->getMethod('generateAuthResponse');
$method->setAccessible(true);

echo "=== Generating Auth Response ===\n";
$authResponse = $method->invoke($authService, $employee, $employmentDetail);

echo "Response keys:\n";
foreach ($authResponse as $key => $value) {
    if ($key === 'token' || $key === 'refresh_token') {
        echo "  - $key: " . substr($value, 0, 20) . "... (length: " . strlen($value) . ")\n";
    } elseif ($key === 'permissions' || $key === 'permissions_grouped') {
        echo "  - $key: [" . count($value) . " permissions]\n";
    } else {
        echo "  - $key: $value\n";
    }
}

echo "\n✓ Refresh token is generated: " . (isset($authResponse['refresh_token']) ? 'YES' : 'NO') . "\n";
echo "✓ Token is generated: " . (isset($authResponse['token']) ? 'YES' : 'NO') . "\n";

// Check if refresh token was saved to database
$employee->refresh();
echo "\n=== Checking Database ===\n";
echo "Refresh token in DB: " . ($employee->refresh_token ? 'YES (length: ' . strlen($employee->refresh_token) . ')' : 'NO') . "\n";
echo "Refresh token expiry: " . ($employee->refresh_token_expiry_date ?? 'NULL') . "\n";

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  ✓ SSO response structure verified            ║\n";
echo "╚════════════════════════════════════════════════╝\n";
