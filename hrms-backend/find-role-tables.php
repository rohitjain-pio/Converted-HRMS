<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Finding Role-Related Tables ===\n\n";

$tables = DB::select('SHOW TABLES');

foreach ($tables as $table) {
    foreach ((array)$table as $key => $value) {
        if (stripos($value, 'role') !== false || stripos($value, 'user') !== false) {
            echo "  - {$value}\n";
        }
    }
}

echo "\n=== Complete ===\n";
