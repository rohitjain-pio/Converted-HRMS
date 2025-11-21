<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Checking Roles & Assigning Admin Access ===\n\n";

// Get all roles
$roles = DB::table('roles')->get();

echo "Available Roles:\n";
foreach ($roles as $role) {
    echo "  - ID: {$role->id}, Name: {$role->name}\n";
}

// Find admin/superadmin role
$adminRole = DB::table('roles')
    ->where('name', 'LIKE', '%admin%')
    ->orWhere('name', 'LIKE', '%Admin%')
    ->first();

if (!$adminRole) {
    // Try to find first role with highest privileges
    $adminRole = DB::table('roles')->orderBy('id')->first();
}

if ($adminRole) {
    echo "\n✅ Using role: {$adminRole->name} (ID: {$adminRole->id})\n";
    
    // Get the admin user
    $adminUser = DB::table('users')->where('email', 'admin@hrms.com')->first();
    
    if ($adminUser) {
        // Check if role assignment exists (table uses employee_id, not user_id)
        $hasRole = DB::table('user_role_mappings')
            ->where('employee_id', $adminUser->id)
            ->where('role_id', $adminRole->id)
            ->exists();
            
        if (!$hasRole) {
            DB::table('user_role_mappings')->insert([
                'employee_id' => $adminUser->id,
                'role_id' => $adminRole->id,
                'created_by' => 'System',
                'created_on' => now(),
                'is_deleted' => 0,
            ]);
            echo "✅ Assigned role '{$adminRole->name}' to admin@hrms.com\n";
        } else {
            echo "✅ User already has this role\n";
        }
        
        // Get all permissions for this role
        $permissions = DB::table('role_permissions')
            ->where('role_id', $adminRole->id)
            ->count();
            
        echo "🔐 Role has {$permissions} permissions\n";
    } else {
        echo "❌ Admin user not found\n";
    }
} else {
    echo "⚠️ No suitable admin role found\n";
}

echo "\n=== Complete ===\n";
