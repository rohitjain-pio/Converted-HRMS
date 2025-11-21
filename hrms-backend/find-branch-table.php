<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Finding Branch/Location Tables ===\n\n";

$tables = DB::select('SHOW TABLES');

echo "Tables with 'branch' or 'location' in name:\n";
foreach ($tables as $table) {
    foreach ((array)$table as $key => $value) {
        if (stripos($value, 'branch') !== false || stripos($value, 'location') !== false) {
            echo "  - {$value}\n";
            
            // Get structure
            $columns = DB::select("SHOW COLUMNS FROM {$value}");
            foreach ($columns as $col) {
                echo "    • {$col->Field} ({$col->Type})\n";
            }
        }
    }
}

echo "\n=== Complete ===\n";
