<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Carbon\Carbon;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Testing Carbon Timezone Parsing             ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

$timeDoctorResponse = "2025-11-18T05:59:30.000Z";

echo "Time Doctor API returns: {$timeDoctorResponse}\n\n";

echo "=== Test 1: Carbon::parse() ===\n";
$dt1 = Carbon::parse($timeDoctorResponse);
echo "Result: {$dt1->toIso8601String()}\n";
echo "Timezone: {$dt1->timezoneName}\n";
echo "format('H:i:s'): {$dt1->format('H:i:s')}\n\n";

echo "=== Test 2: Carbon::parse() with explicit UTC ===\n";
$dt2 = Carbon::parse($timeDoctorResponse, 'UTC');
echo "Result: {$dt2->toIso8601String()}\n";
echo "Timezone: {$dt2->timezoneName}\n";
echo "format('H:i:s'): {$dt2->format('H:i:s')}\n\n";

echo "=== Test 3: copy()->setTimezone('UTC') ===\n";
$dt3 = Carbon::parse($timeDoctorResponse)->copy()->setTimezone('UTC');
echo "Result: {$dt3->toIso8601String()}\n";
echo "Timezone: {$dt3->timezoneName}\n";
echo "format('H:i:s'): {$dt3->format('H:i:s')}\n\n";

echo "=== Test 4: Carbon::createFromFormat with explicit UTC ===\n";
$dt4 = Carbon::createFromFormat('Y-m-d\TH:i:s.v\Z', $timeDoctorResponse, 'UTC');
echo "Result: {$dt4->toIso8601String()}\n";
echo "Timezone: {$dt4->timezoneName}\n";
echo "format('H:i:s'): {$dt4->format('H:i:s')}\n\n";

echo "=== Current App Timezone ===\n";
echo "config('app.timezone'): " . config('app.timezone') . "\n";
echo "date_default_timezone_get(): " . date_default_timezone_get() . "\n\n";

echo "=== Expected Result ===\n";
echo "Database should store: 05:59:30 (UTC)\n";
echo "Display should show: 11:29:30 (IST, adds 5:30)\n";

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  Test Complete!                               ║\n";
echo "╚════════════════════════════════════════════════╝\n";
