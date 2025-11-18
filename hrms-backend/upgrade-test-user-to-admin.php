<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Updating Test User to SuperAdmin Role        ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

echo "=== Available Roles ===\n";
$roles = DB::table('roles')->get();
foreach ($roles as $role) {
    $permCount = DB::table('role_permissions')->where('role_id', $role->id)->count();
    echo "  {$role->id}: {$role->name} ({$permCount} permissions)\n";
}

echo "\n=== Updating rohit.jain@programmers.io to SuperAdmin ===\n";

// Get employee ID
$employment = DB::table('employment_details')
    ->where('email', 'rohit.jain@programmers.io')
    ->first();

if (!$employment) {
    echo "❌ User not found\n";
    exit(1);
}

// Update employment_details role_id to SuperAdmin (1)
DB::table('employment_details')
    ->where('email', 'rohit.jain@programmers.io')
    ->update(['role_id' => 1]);

echo "✓ Updated employment_details.role_id to 1 (SuperAdmin)\n";

// Update user_role_mappings
$existingMapping = DB::table('user_role_mappings')
    ->where('employee_id', $employment->employee_id)
    ->first();

if ($existingMapping) {
    DB::table('user_role_mappings')
        ->where('employee_id', $employment->employee_id)
        ->update(['role_id' => 1]);
    echo "✓ Updated user_role_mappings to SuperAdmin\n";
} else {
    DB::table('user_role_mappings')->insert([
        'employee_id' => $employment->employee_id,
        'role_id' => 1,
        'created_by' => 'system',
        'created_on' => now()
    ]);
    echo "✓ Created user_role_mappings entry for SuperAdmin\n";
}

echo "\n=== Verification ===\n";
$updated = DB::table('employment_details')
    ->where('email', 'rohit.jain@programmers.io')
    ->first();

echo "Email: {$updated->email}\n";
echo "Role ID: {$updated->role_id}\n";
echo "Role Name: " . DB::table('roles')->where('id', $updated->role_id)->value('name') . "\n";

$superAdminPerms = DB::table('role_permissions')->where('role_id', 1)->count();
echo "SuperAdmin has {$superAdminPerms} permissions\n";

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  ✓ Test User Updated to SuperAdmin!           ║\n";
echo "╚════════════════════════════════════════════════╝\n";
echo "\nYou can now login with:\n";
echo "  Email: rohit.jain@programmers.io\n";
echo "  Password: password\n";
echo "  Role: SuperAdmin (full access)\n";
