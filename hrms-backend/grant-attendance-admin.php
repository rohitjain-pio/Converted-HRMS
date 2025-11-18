<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::where('email', 'admin@programmers.io')->first();
if (!$user) {
    echo "User not found\n";
    exit(1);
}

// Find or create attendance module
$module = App\Models\Module::where('module_name', 'Attendance')->first();
if (!$module) {
    $module = App\Models\Module::create([
        'module_name' => 'Attendance',
        'is_deleted' => false,
        'created_by' => $user->id
    ]);
}

// Grant all attendance permissions
$permissions = [
    ['name' => 'attendance.read', 'value' => 'attendance.read'],
    ['name' => 'attendance.create', 'value' => 'attendance.create'],
    ['name' => 'attendance.edit', 'value' => 'attendance.edit'],
    ['name' => 'attendance.delete', 'value' => 'attendance.delete'],
    ['name' => 'attendance.admin', 'value' => 'attendance.admin'],
    ['name' => 'attendance.report', 'value' => 'attendance.report'],
    ['name' => 'attendance.export', 'value' => 'attendance.export'],
];

// Get or create Admin role
$role = App\Models\Role::where('name', 'Admin')->first();
if (!$role) {
    // Get first role or create one
    $role = App\Models\Role::first();
    if (!$role) {
        $role = App\Models\Role::create([
            'name' => 'Admin',
            'is_active' => true,
            'created_by' => $user->id
        ]);
    }
}

// Assign role to user if not already assigned
if (!$user->userRoles()->where('role_id', $role->id)->exists()) {
    App\Models\UserRole::create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'is_active' => true
    ]);
    echo "Assigned Admin role to user\n";
}

foreach ($permissions as $permData) {
    $permission = App\Models\Permission::where('value', $permData['value'])->first();
    if (!$permission) {
        $permission = App\Models\Permission::create([
            'name' => $permData['name'],
            'value' => $permData['value'],
            'module_id' => $module->id,
            'is_deleted' => false,
            'created_by' => $user->id
        ]);
    }
    
    // Link permission to role if not already linked
    if (!$role->rolePermissions()->where('permission_id', $permission->id)->exists()) {
        App\Models\RolePermission::create([
            'role_id' => $role->id,
            'permission_id' => $permission->id,
            'is_active' => true
        ]);
        echo "Granted permission: {$permData['name']}\n";
    } else {
        echo "Permission already exists: {$permData['name']}\n";
    }
}

echo "All attendance permissions granted to {$user->email}\n";
