<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== ENSURING SUPERADMIN HAS ALL EXIT MANAGEMENT PERMISSIONS ===\n\n";

// Use SuperAdmin role ID = 1 (from previous scripts)
$roleId = 1;

echo "SuperAdmin Role ID: {$roleId}\n\n";

// Get all Exit Management permissions
$exitPermissions = DB::table('permissions')
    ->where('value', 'LIKE', '%ExitManagement%')
    ->orWhere('value', 'LIKE', '%Exit%')
    ->get();

echo "Found " . $exitPermissions->count() . " Exit-related permissions\n\n";

foreach ($exitPermissions as $permission) {
    echo "Checking: {$permission->value}\n";
    
    // Check if role already has the permission
    $exists = DB::table('role_permissions')
        ->where('role_id', $roleId)
        ->where('permission_id', $permission->id)
        ->exists();
    
    if ($exists) {
        echo "  ✓ Already exists\n";
    } else {
        DB::table('role_permissions')->insert([
            'role_id' => $roleId,
            'permission_id' => $permission->id,
            'is_active' => 1,
            'created_by' => 'admin',
            'created_on' => now()
        ]);
        echo "  ✓ Added\n";
    }
}

echo "\n=== DONE ===\n";
