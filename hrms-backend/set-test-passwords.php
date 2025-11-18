<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "Adding passwords to test users...\n";

$testEmails = [
    'rohit.jain@programmers.io',
    'anand.sharma@programmers.io',
    'rohit.jain@programmers.ai',
    'anand.sharma@programmers.ai'
];

$employeeIds = DB::table('employment_details')
    ->whereIn('email', $testEmails)
    ->pluck('employee_id')
    ->toArray();

$updated = DB::table('employee_data')
    ->whereIn('id', $employeeIds)
    ->update(['password' => Hash::make('password')]);

echo "Updated $updated users with password 'password'\n";
