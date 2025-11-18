<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Helpers\TimezoneHelper;
use Carbon\Carbon;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Testing Timezone Conversion Logic            ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

// Test 1: Convert 8:50 AM IST to UTC
echo "=== Test 1: IST to UTC ===\n";
$istTime = "08:50";
$date = "2025-11-18";
$utcTime = TimezoneHelper::istToUtc($istTime, $date);
echo "Input:  $istTime IST on $date\n";
echo "Output: $utcTime UTC\n";
echo "Expected: 03:20 UTC (8:50 AM - 5:30 hours)\n\n";

// Test 2: Convert UTC back to IST
echo "=== Test 2: UTC to IST ===\n";
$utcInput = "03:20";
$istOutput = TimezoneHelper::utcToIst($utcInput);
echo "Input:  $utcInput UTC\n";
echo "Output: $istOutput IST\n";
echo "Expected: 08:50 IST (3:20 AM + 5:30 hours)\n\n";

// Test 3: Convert 2:00 PM IST to UTC
echo "=== Test 3: Another IST to UTC ===\n";
$istTime2 = "14:00";
$utcTime2 = TimezoneHelper::istToUtc($istTime2, $date);
echo "Input:  $istTime2 IST on $date\n";
echo "Output: $utcTime2 UTC\n";
echo "Expected: 08:30 UTC (2:00 PM - 5:30 hours)\n\n";

// Test 4: Convert 6:30 PM IST to UTC
echo "=== Test 4: Evening Time IST to UTC ===\n";
$istTime3 = "18:30";
$utcTime3 = TimezoneHelper::istToUtc($istTime3, $date);
echo "Input:  $istTime3 IST on $date\n";
echo "Output: $utcTime3 UTC\n";
echo "Expected: 13:00 UTC (6:30 PM - 5:30 hours)\n\n";

// Test 5: Verify audit conversion
echo "=== Test 5: Audit Array Conversion ===\n";
$auditData = [
    ['time' => '08:50', 'action' => 'Time In'],
    ['time' => '18:30', 'action' => 'Time Out']
];
$auditUtc = TimezoneHelper::convertAuditToUtc($auditData, $date);
echo "Input Audit (IST):\n";
print_r($auditData);
echo "\nOutput Audit (UTC):\n";
print_r($auditUtc);
echo "\n";

echo "╔════════════════════════════════════════════════╗\n";
echo "║  ✓ Timezone conversion tests completed        ║\n";
echo "╚════════════════════════════════════════════════╝\n";
