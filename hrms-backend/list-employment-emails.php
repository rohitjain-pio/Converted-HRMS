<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $employmentDetails = DB::table('employment_details')->get(['employee_id', 'email']);
    
    echo "All employment details:\n";
    echo "=======================\n";
    
    foreach ($employmentDetails as $detail) {
        echo "Employee ID: {$detail->employee_id}, Email: {$detail->email}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
