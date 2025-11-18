<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Attendance;

echo "Deleting TimeDoctor attendance records for 2025-11-18...\n";

$deleted = Attendance::whereDate('date', '2025-11-18')
    ->where('attendance_type', 'TimeDoctor')
    ->delete();

echo "✓ Deleted {$deleted} TimeDoctor attendance records\n\n";
echo "Now run: php artisan attendance:fetch-timedoctor --date=2025-11-18\n";
