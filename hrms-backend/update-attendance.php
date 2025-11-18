<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $result = DB::table('employment_details')
        ->where('employee_id', 1)
        ->update(['is_manual_attendance' => 1]);
    
    echo "Updated $result row(s)\n";
    
    $employee = DB::table('employment_details')
        ->where('employee_id', 1)
        ->first();
    
    echo "Current value: is_manual_attendance = " . ($employee->is_manual_attendance ?? 'NULL') . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
