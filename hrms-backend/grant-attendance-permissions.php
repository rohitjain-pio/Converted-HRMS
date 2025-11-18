<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Get user with ID 1
    $user = DB::table('users')->where('id', 1)->first();
    
    if (!$user) {
        echo "User not found\n";
        exit;
    }
    
    echo "User ID: {$user->id}\n";
    echo "User Email: {$user->email}\n";
    echo "Role ID: {$user->role_id}\n\n";
    
    // Check current permissions
    $permissions = DB::table('role_permissions')
        ->where('role_id', $user->role_id)
        ->get();
    
    echo "Current permissions count: " . count($permissions) . "\n";
    
    // Check if attendance permissions exist
    $attendancePermissions = DB::table('permissions')
        ->where('module', 'like', '%attendance%')
        ->orWhere('name', 'like', '%attendance%')
        ->get();
    
    echo "\nAttendance-related permissions:\n";
    foreach ($attendancePermissions as $perm) {
        echo "- ID: {$perm->id}, Name: {$perm->name}, Module: {$perm->module}\n";
        
        // Check if role has this permission
        $hasPermission = DB::table('role_permissions')
            ->where('role_id', $user->role_id)
            ->where('permission_id', $perm->id)
            ->exists();
        
        if (!$hasPermission) {
            echo "  -> Adding permission to role\n";
            DB::table('role_permissions')->insert([
                'role_id' => $user->role_id,
                'permission_id' => $perm->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else {
            echo "  -> Already has permission\n";
        }
    }
    
    echo "\nDone!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
