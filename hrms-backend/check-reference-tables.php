<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Department;
use App\Models\Designation;

echo "=== Checking Reference Tables ===\n\n";

$deptCount = Department::count();
$desigCount = Designation::count();

echo "Department table count: $deptCount\n";
echo "Designation table count: $desigCount\n\n";

echo "Checking specific records:\n";
$dept304 = Department::find(304);
if ($dept304) {
    echo "Department 304 found:\n";
    print_r($dept304->toArray());
} else {
    echo "Department 304 NOT FOUND\n";
}

echo "\n";

$desig205 = Designation::find(205);
if ($desig205) {
    echo "Designation 205 found:\n";
    print_r($desig205->toArray());
} else {
    echo "Designation 205 NOT FOUND\n";
}

echo "\n";
$desig1 = Designation::find(1);
if ($desig1) {
    echo "Designation 1 found:\n";
    print_r($desig1->toArray());
} else {
    echo "Designation 1 NOT FOUND\n";
}

echo "\n=== Sample Departments ===\n";
$depts = Department::take(5)->get();
foreach ($depts as $dept) {
    echo "ID: {$dept->id}, Name: {$dept->department_name}\n";
}

echo "\n=== Sample Designations ===\n";
$desigs = Designation::take(5)->get();
foreach ($desigs as $desig) {
    echo "ID: {$desig->id}, Name: {$desig->designation_name}\n";
}
