<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Checking Exit Management Permissions ===\n\n";

// Find all exit-related permissions
$exitPermissions = DB::table('permissions')
    ->where('value', 'LIKE', '%Exit%')
    ->orWhere('name', 'LIKE', '%Exit%')
    ->orWhere('value', 'LIKE', '%Resignation%')
    ->orWhere('name', 'LIKE', '%Resignation%')
    ->get();

echo "Exit-related permissions in system:\n";
foreach ($exitPermissions as $perm) {
    echo "  - ID: {$perm->id}, Value: {$perm->value}, Name: {$perm->name}\n";
}

// Check which ones SuperAdmin has
echo "\n📋 SuperAdmin (Role ID 1) has these exit permissions:\n";
$superAdminExitPerms = DB::table('role_permissions')
    ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
    ->where('role_permissions.role_id', 1)
    ->where(function($q) {
        $q->where('permissions.value', 'LIKE', '%Exit%')
          ->orWhere('permissions.name', 'LIKE', '%Exit%')
          ->orWhere('permissions.value', 'LIKE', '%Resignation%')
          ->orWhere('permissions.name', 'LIKE', '%Resignation%');
    })
    ->select('permissions.id', 'permissions.value', 'permissions.name')
    ->get();

if ($superAdminExitPerms->count() > 0) {
    foreach ($superAdminExitPerms as $perm) {
        echo "  ✅ {$perm->value}\n";
    }
} else {
    echo "  ❌ No exit management permissions assigned\n";
}

// Check what permissions SuperAdmin is missing
echo "\n📌 Missing exit permissions for SuperAdmin:\n";
$missingPerms = $exitPermissions->whereNotIn('id', $superAdminExitPerms->pluck('id'));
foreach ($missingPerms as $perm) {
    echo "  ❌ {$perm->value} ({$perm->name})\n";
}

if ($missingPerms->count() > 0) {
    echo "\n=== Adding Missing Permissions ===\n";
    foreach ($missingPerms as $perm) {
        // Check if already exists
        $exists = DB::table('role_permissions')
            ->where('role_id', 1)
            ->where('permission_id', $perm->id)
            ->exists();
        
        if (!$exists) {
            DB::table('role_permissions')->insert([
                'role_id' => 1,
                'permission_id' => $perm->id,
            ]);
            echo "  ✅ Added: {$perm->value}\n";
        }
    }
}

echo "\n=== Complete ===\n";
