<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\EmploymentDetail;
use App\Models\Department;
use App\Models\Designation;

echo "=== Checking Employment Details ===\n\n";

$employments = EmploymentDetail::with(['department', 'designation'])
    ->where('is_deleted', false)
    ->take(2)
    ->get();
echo "Total employment records: " . $employments->count() . "\n\n";
foreach ($employments as $employment) {
    echo "Employee ID: {$employment->employee_id}\n";
    echo "Department ID: {$employment->department_id}\n";
    echo "Designation ID: {$employment->designation_id}\n";
    echo "Branch Code: {$employment->branch_code}\n";
    
    // Check if there's a designation column
    $attributes = $employment->getAttributes();
    if (isset($attributes['designation'])) {
        echo "RAW designation column value: " . $attributes['designation'] . "\n";
    }
    if (isset($attributes['department'])) {
        echo "RAW department column value: " . $attributes['department'] . "\n";
    }
    
    echo "Department relation loaded: " . ($employment->relationLoaded('department') ? 'Yes' : 'No') . "\n";
    echo "Designation relation loaded: " . ($employment->relationLoaded('designation') ? 'Yes' : 'No') . "\n";
    
    if ($employment->department) {
        echo "Department object exists: Yes\n";
        echo "Department name: {$employment->department->department_name}\n";
    } else {
        echo "Department object: NULL\n";
        
        // Try manual lookup
        if ($employment->department_id) {
            $dept = Department::find($employment->department_id);
            if ($dept) {
                echo "Manual lookup found department: {$dept->department_name}\n";
            } else {
                echo "Manual lookup: Department ID {$employment->department_id} not found\n";
            }
        }
    }
    
    // Check type of designation
    echo "Designation type: " . gettype($employment->designation) . "\n";
    if (is_object($employment->designation) && method_exists($employment->designation, 'getAttributes')) {
        echo "Designation object exists: Yes\n";
        echo "Designation name: {$employment->designation->designation_name}\n";
    } elseif (is_string($employment->designation)) {
        echo "Designation is a STRING (column conflict): {$employment->designation}\n";
    } else {
        echo "Designation object: NULL\n";
        
        // Try manual lookup
        if ($employment->designation_id) {
            $desig = Designation::find($employment->designation_id);
            if ($desig) {
                echo "Manual lookup found designation: {$desig->designation_name}\n";
            } else {
                echo "Manual lookup: Designation ID {$employment->designation_id} not found\n";
            }
        }
    }
    
    echo "\n" . str_repeat("-", 50) . "\n\n";
}
