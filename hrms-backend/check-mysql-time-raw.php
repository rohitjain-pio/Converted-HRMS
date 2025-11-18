<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Raw MySQL TIME Data Check                    ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

$result = DB::selectOne('SELECT @@session.time_zone AS session_tz, start_time, end_time FROM attendance WHERE employee_id = 57 AND date = "2025-11-18" LIMIT 1');

echo "Session Timezone: {$result->session_tz}\n";
echo "Start Time from DB: {$result->start_time}\n";
echo "End Time from DB: {$result->end_time}\n\n";

// Try querying with different timezone
DB::statement("SET time_zone = 'SYSTEM'");
$result2 = DB::selectOne('SELECT @@session.time_zone AS session_tz, start_time, end_time FROM attendance WHERE employee_id = 57 AND date = "2025-11-18" LIMIT 1');
echo "After setting to SYSTEM:\n";
echo "Session Timezone: {$result2->session_tz}\n";
echo "Start Time from DB: {$result2->start_time}\n";
echo "End Time from DB: {$result2->end_time}\n\n";

// Check actual bytes in database
$hex = DB::selectOne('SELECT HEX(start_time) AS hex_start FROM attendance WHERE employee_id = 57 AND date = "2025-11-18" LIMIT 1');
echo "HEX representation of start_time: {$hex->hex_start}\n";

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  Check Complete!                              ║\n";
echo "╚════════════════════════════════════════════════╝\n";
