<?php
/**
 * Assign all permissions to SuperAdmin role
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Assigning All Permissions to SuperAdmin ===\n\n";

$superAdminRoleId = 1;

// Get all permissions
$allPermissions = DB::table('permissions')->select('id')->get();

echo "Total permissions in database: " . count($allPermissions) . "\n";

// Clear existing permissions for SuperAdmin
DB::table('role_permissions')->where('role_id', $superAdminRoleId)->delete();
echo "✅ Cleared existing permissions\n";

// Assign all permissions to SuperAdmin
$insertData = [];
foreach ($allPermissions as $permission) {
    $insertData[] = [
        'role_id' => $superAdminRoleId,
        'permission_id' => $permission->id,
        'created_by' => 'system',
        'created_on' => now(),
    ];
}

DB::table('role_permissions')->insert($insertData);

echo "✅ Assigned " . count($insertData) . " permissions to SuperAdmin\n";

// Verify
$count = DB::table('role_permissions')->where('role_id', $superAdminRoleId)->count();
echo "✅ Verification: SuperAdmin now has $count permissions\n";

echo "\n✅ Done! SuperAdmin has full access to all features.\n";
