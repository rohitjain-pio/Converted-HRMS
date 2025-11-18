<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$emp = \App\Models\EmploymentDetail::with('branch')->first();

echo "Branch ID: " . ($emp->branch_id ?? 'NULL') . "\n";

if ($emp->relationLoaded('branch') && $emp->branch) {
    echo "Branch object loaded\n";
    $branch = $emp->branch;
    echo "Branch columns: " . json_encode($branch->getAttributes()) . "\n";
} else {
    echo "No branch relation loaded\n";
}

// Check if branch table exists and has data
$branches = \App\Models\Branch::take(5)->get();
echo "\nBranch table records: " . $branches->count() . "\n";
foreach ($branches as $branch) {
    echo "- ID: " . $branch->id . ", Name: " . $branch->branch . "\n";
}
