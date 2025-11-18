<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Check employment_details for employee 1
    $employmentDetails = DB::table('employment_details')->where('employee_id', 1)->first();
    
    if (!$employmentDetails) {
        echo "Employment details not found\n";
        exit;
    }
    
    $roleId = $employmentDetails->role_id ?? null;
    
    echo "Employee ID: 1\n";
    echo "Role ID: {$roleId}\n\n";
    
    if (!$roleId) {
        echo "No role assigned\n";
        exit;
    }
    
    // Get all attendance-related permissions
    $attendancePermissions = DB::table('permissions')
        ->where('name', 'like', '%Attendance%')
        ->orWhere('name', 'like', '%attendance%')
        ->orWhere('value', 'like', '%attendance%')
        ->get();
    
    echo "Found " . count($attendancePermissions) . " attendance-related permissions:\n\n";
    
    $added = 0;
    $existing = 0;
    
    foreach ($attendancePermissions as $perm) {
        echo "- ID: {$perm->id}, Name: {$perm->name}, Value: {$perm->value}\n";
        
        // Check if role has this permission
        $hasPermission = DB::table('role_permissions')
            ->where('role_id', $roleId)
            ->where('permission_id', $perm->id)
            ->exists();
        
        if (!$hasPermission) {
            DB::table('role_permissions')->insert([
                'role_id' => $roleId,
                'permission_id' => $perm->id,
                'created_by' => 'system'
            ]);
            echo "  ✓ Added!\n";
            $added++;
        } else {
            echo "  • Already exists\n";
            $existing++;
        }
    }
    
    echo "\n=============================\n";
    echo "Summary:\n";
    echo "- Permissions added: $added\n";
    echo "- Already existing: $existing\n";
    echo "=============================\n";
    echo "\nDone! User now has all attendance permissions.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
