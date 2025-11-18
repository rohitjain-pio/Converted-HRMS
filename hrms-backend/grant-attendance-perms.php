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
        ->where(function($query) {
            $query->where('module', 'like', '%Attendance%')
                  ->orWhere('module', 'like', '%attendance%')
                  ->orWhere('name', 'like', '%attendance%');
        })
        ->get();
    
    echo "Found " . count($attendancePermissions) . " attendance-related permissions:\n";
    
    foreach ($attendancePermissions as $perm) {
        echo "- ID: {$perm->id}, Name: {$perm->name}, Module: {$perm->module}\n";
        
        // Check if role has this permission
        $hasPermission = DB::table('role_permissions')
            ->where('role_id', $roleId)
            ->where('permission_id', $perm->id)
            ->exists();
        
        if (!$hasPermission) {
            echo "  -> Adding permission...\n";
            DB::table('role_permissions')->insert([
                'role_id' => $roleId,
                'permission_id' => $perm->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            echo "  -> Added!\n";
        } else {
            echo "  -> Already has permission\n";
        }
    }
    
    echo "\nDone! User now has all attendance permissions.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
