<?php
/**
 * Add self-service profile permissions to all roles
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Adding Self-Service Profile Permissions ===\n\n";

// Check if self-service permissions exist
$selfPermissions = [
    'Read.OwnProfile' => 'Allow employees to view their own profile',
    'Edit.OwnProfile' => 'Allow employees to edit their own profile',
];

foreach ($selfPermissions as $value => $description) {
    $existing = DB::table('permissions')
        ->where('value', $value)
        ->first();
    
    if ($existing) {
        echo "✅ Permission already exists: {$value}\n";
    } else {
        // Insert new permission - use Employees module (ID: 1)
        $id = DB::table('permissions')->insertGetId([
            'name' => $description,
            'value' => $value,
            'module_id' => 1, // Employees module
            'created_by' => 'system',
            'created_on' => now(),
            'is_deleted' => false,
        ]);
        
        echo "✅ Created permission: {$value} (ID: {$id})\n";
    }
}

echo "\n=== Assigning Self-Service Permissions to ALL Roles ===\n\n";

// Get all roles
$roles = DB::table('roles')->get();

foreach ($roles as $role) {
    echo "Processing role: {$role->name} (ID: {$role->id})\n";
    
    // Get permission IDs
    $permissionIds = DB::table('permissions')
        ->whereIn('value', array_keys($selfPermissions))
        ->pluck('id')
        ->toArray();
    
    foreach ($permissionIds as $permissionId) {
        // Check if already assigned
        $exists = DB::table('role_permissions')
            ->where('role_id', $role->id)
            ->where('permission_id', $permissionId)
            ->exists();
        
        if (!$exists) {
            DB::table('role_permissions')->insert([
                'role_id' => $role->id,
                'permission_id' => $permissionId,
                'created_by' => 'system',
                'created_on' => now(),
            ]);
            echo "  ✅ Added permission ID {$permissionId}\n";
        } else {
            echo "  ⏭️  Already has permission ID {$permissionId}\n";
        }
    }
}

echo "\n=== Verification ===\n\n";

// Verify each role has the permissions
foreach ($roles as $role) {
    $count = DB::table('role_permissions as rp')
        ->join('permissions as p', 'p.id', '=', 'rp.permission_id')
        ->where('rp.role_id', $role->id)
        ->whereIn('p.value', array_keys($selfPermissions))
        ->count();
    
    echo "{$role->name}: {$count}/2 self-service permissions\n";
}

echo "\n✅ Done! All employees can now view and edit their own profiles.\n";
