<?php
/**
 * Assign SuperAdmin role to rohit.jain@programmers.io
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Hash;

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'rohit.jain@programmers.io';

echo "=== Assigning SuperAdmin Role ===\n\n";

// Find user
$user = DB::table('users')->where('email', $email)->first();

if (!$user) {
    echo "❌ User not found: $email\n";
    exit(1);
}

echo "✅ User found: $email (ID: {$user->id})\n";

// Delete existing role mappings
DB::table('user_role_mappings')
    ->where('employee_id', $user->id)
    ->delete();

echo "✅ Cleared existing role mappings\n";

// Assign SuperAdmin role
DB::table('user_role_mappings')->insert([
    'employee_id' => $user->id,
    'role_id' => 1, // SuperAdmin
    'is_deleted' => false,
    'created_by' => $email,
    'created_on' => now(),
]);

echo "✅ Assigned SuperAdmin role (role_id: 1)\n";

// Verify
$role = DB::table('user_role_mappings as urm')
    ->join('roles as r', 'r.id', '=', 'urm.role_id')
    ->where('urm.employee_id', $user->id)
    ->where('urm.is_deleted', false)
    ->select('r.name', 'r.id')
    ->first();

echo "\n=== Verification ===\n";
echo "Current Role: {$role->name} (ID: {$role->id})\n";

// Count permissions
$permCount = DB::table('role_permissions')
    ->where('role_id', 1)
    ->count();

echo "Permissions assigned: $permCount\n";

echo "\n✅ Done! User can now login with SuperAdmin privileges.\n";
echo "Email: $email\n";
echo "Password: password\n";
echo "URL: http://localhost:5175/internal-login\n";
