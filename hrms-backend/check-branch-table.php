<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check if branch table exists
$db = \DB::connection();
$tables = $db->select("SHOW TABLES LIKE 'branch%'");

echo "Branch-related tables:\n";
foreach ($tables as $table) {
    $tableName = array_values((array)$table)[0];
    echo "- $tableName\n";
    
    // Get columns
    $columns = $db->select("DESCRIBE $tableName");
    echo "  Columns: ";
    foreach ($columns as $col) {
        echo $col->Field . ", ";
    }
    echo "\n";
    
    // Count records
    $count = $db->select("SELECT COUNT(*) as cnt FROM $tableName")[0]->cnt;
    echo "  Records: $count\n\n";
}

// Check employment_details branch_id values
$branchIds = $db->select("SELECT DISTINCT branch_id FROM employment_details WHERE branch_id IS NOT NULL LIMIT 10");
echo "Distinct branch_id values in employment_details:\n";
foreach ($branchIds as $row) {
    echo "- " . $row->branch_id . "\n";
}
