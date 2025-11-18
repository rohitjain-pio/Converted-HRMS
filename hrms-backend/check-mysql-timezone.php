<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  MySQL Timezone and Column Type Check        ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

echo "=== MySQL Timezone Settings ===\n";
$timezones = DB::select('SELECT @@global.time_zone AS global_tz, @@session.time_zone AS session_tz');
foreach ($timezones as $tz) {
    echo "Global Time Zone: {$tz->global_tz}\n";
    echo "Session Time Zone: {$tz->session_tz}\n";
}
echo "\n";

echo "=== Attendance Table Column Types ===\n";
$columns = DB::select("SHOW COLUMNS FROM attendance WHERE Field IN ('start_time', 'end_time', 'date')");
foreach ($columns as $col) {
    echo "Column: {$col->Field}\n";
    echo "  Type: {$col->Type}\n";
    echo "  Null: {$col->Null}\n";
    echo "  Default: {$col->Default}\n\n";
}

echo "=== Test Insert and Read ===\n";
DB::statement("SET time_zone = '+00:00'");
echo "Set session timezone to UTC\n";

$test = DB::selectOne("SELECT '05:59:30' AS test_time");
echo "Test query result: {$test->test_time}\n\n";

echo "=== Legacy Database Connection Check ===\n";
try {
    $legacyConfig = config('database.connections.legacy');
    if ($legacyConfig) {
        echo "Legacy database timezone config: " . ($legacyConfig['timezone'] ?? 'not set') . "\n";
    }
} catch (\Exception $e) {
    echo "No legacy connection configured\n";
}

$currentConfig = config('database.connections.' . config('database.default'));
echo "Current database timezone config: " . ($currentConfig['timezone'] ?? 'not set') . "\n";

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  Check Complete!                              ║\n";
echo "╚════════════════════════════════════════════════╝\n";
