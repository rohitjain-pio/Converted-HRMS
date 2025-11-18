<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;
$dates = DB::table('attendance')->selectRaw('MIN(date) as min_date, MAX(date) as max_date')->first();
echo "Attendance date range:\n  From: {$dates->min_date}\n  To: {$dates->max_date}\n";
