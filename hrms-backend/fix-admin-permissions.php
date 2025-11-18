<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Find the user by email
    $user = DB::table('users')->where('email', 'admin@company.com')->first();
    
    if (!$user) {
        echo "User not found with email: admin@company.com\n";
        exit;
    }
    
    echo "User ID: {$user->id}\n";
    echo "User Email: {$user->email}\n";
    
    // Get employee details
    $employmentDetails = DB::table('employment_details')->where('employee_id', $user->id)->first();
    
    if (!$employmentDetails) {
        echo "Employment details not found\n";
        exit;
    }
    
    $roleId = $employmentDetails->role_id ?? null;
    
    echo "Role ID: {$roleId}\n\n";
    
    if (!$roleId) {
        echo "No role assigned\n";
        exit;
    }
    
    // Get role name
    $role = DB::table('roles')->where('id', $roleId)->first();
    echo "Role Name: " . ($role->name ?? 'Unknown') . "\n\n";
    
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
            echo "✓ Added: {$perm->name} (ID: {$perm->id})\n";
            $added++;
        } else {
            echo "• Already has: {$perm->name} (ID: {$perm->id})\n";
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
