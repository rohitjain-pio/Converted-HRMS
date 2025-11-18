<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\Auth\AuthService;

echo "=== Testing OAuth Refresh Token Flow ===\n\n";

$service = new AuthService();

// Test 1: Login
echo "Step 1: Login with rohit.jain@programmers.io\n";
$authResult = $service->authenticateWithCredentials('rohit.jain@programmers.io', 'password');

if (!$authResult) {
    echo "❌ Login FAILED\n";
    exit(1);
}

echo "✓ Login successful\n";
echo "  Employee ID: {$authResult['employee_id']}\n";
echo "  Email: {$authResult['email']}\n";
echo "  Role: {$authResult['role']}\n";
echo "  Permissions: " . count($authResult['permissions']) . "\n";
echo "  Has access token: " . (isset($authResult['token']) ? 'YES' : 'NO') . "\n";
echo "  Has refresh token: " . (isset($authResult['refresh_token']) ? 'YES' : 'NO') . "\n";
echo "  Refresh token length: " . strlen($authResult['refresh_token']) . "\n\n";

$refreshToken = $authResult['refresh_token'];

// Test 2: Refresh token
echo "Step 2: Refresh access token\n";
$refreshResult = $service->refreshToken($refreshToken);

if (!$refreshResult) {
    echo "❌ Token refresh FAILED\n";
    exit(1);
}

echo "✓ Token refresh successful\n";
echo "  New access token received: " . (isset($refreshResult['token']) ? 'YES' : 'NO') . "\n";
echo "  New token length: " . strlen($refreshResult['token']) . "\n\n";

// Test 3: Invalid refresh token
echo "Step 3: Test invalid refresh token\n";
$invalidResult = $service->refreshToken('invalid_token_12345');

if ($invalidResult) {
    echo "❌ Invalid token was accepted (security issue!)\n";
    exit(1);
}

echo "✓ Invalid token correctly rejected\n\n";

echo "╔════════════════════════════════════════════════╗\n";
echo "║  ✓ OAuth Refresh Token Flow VERIFIED!        ║\n";
echo "╚════════════════════════════════════════════════╝\n";
