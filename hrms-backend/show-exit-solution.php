<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Solution Options ===\n\n";

// Option 1: Grant permission to Manager role
$managerRole = DB::table('roles')->where('id', 5)->first();
$permission = DB::table('permissions')->where('value', 'Read.ExitManagement')->first();

echo "Option 1: Grant 'Read.ExitManagement' to Manager role\n";
echo "  Command: Add permission {$permission->id} to role {$managerRole->id} ({$managerRole->name})\n\n";

// Option 2: Remove permission requirement from route
echo "Option 2: Remove permission requirement from frontend route\n";
echo "  Change route meta from: permissions: ['Read.ExitManagement']\n";
echo "  To: permissions: [] or remove meta.permissions\n\n";

// Option 3: Make route accessible to all authenticated users
echo "Option 3: Make route accessible to all authenticated users\n";
echo "  Remove the permissions check entirely\n\n";

echo "=== All Roles ===\n";
$roles = DB::table('roles')->get();
foreach ($roles as $role) {
    $permCount = DB::table('role_permissions')
        ->where('role_id', $role->id)
        ->count();
    echo "  {$role->id}. {$role->name} ({$permCount} permissions)\n";
}

echo "\n=== Exit Management Permissions ===\n";
$exitPerms = DB::table('permissions')
    ->where('name', 'like', '%Exit%')
    ->orWhere('name', 'like', '%Resignation%')
    ->get(['id', 'name', 'value']);

foreach ($exitPerms as $perm) {
    echo "  {$perm->id}. {$perm->name} ({$perm->value})\n";
    
    $roles = DB::table('role_permissions')
        ->join('roles', 'role_permissions.role_id', '=', 'roles.id')
        ->where('role_permissions.permission_id', $perm->id)
        ->pluck('roles.name')
        ->toArray();
    
    if (empty($roles)) {
        echo "     → Not assigned to any role\n";
    } else {
        echo "     → Assigned to: " . implode(', ', $roles) . "\n";
    }
}

echo "\n=== Recommendation ===\n";
echo "Since this is a test/development environment:\n";
echo "1. Grant exit permissions to Manager role (or HR role for production)\n";
echo "2. Or temporarily remove permission check from route for testing\n";
