<?php
/**
 * Assign SuperAdmin role to admin@hrms.com
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'admin@hrms.com';

echo "=== Assigning SuperAdmin Role to admin@hrms.com ===\n\n";

// Find user
$user = DB::table('users')->where('email', $email)->first();

if (!$user) {
    echo "❌ User not found: $email\n";
    echo "Creating user...\n";
    
    // Create the user
    $userId = DB::table('users')->insertGetId([
        'name' => 'Admin User',
        'email' => $email,
        'password' => Hash::make('admin123'),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    $user = DB::table('users')->where('id', $userId)->first();
    echo "✅ User created: $email (ID: {$user->id})\n";
} else {
    echo "✅ User found: $email (ID: {$user->id})\n";
}

// Delete existing role mappings
DB::table('user_role_mappings')
    ->where('employee_id', $user->id)
    ->delete();

echo "✅ Cleared existing role mappings\n";

// Get SuperAdmin role (ID: 1)
$superAdminRole = DB::table('roles')->where('id', 1)->first();

if (!$superAdminRole) {
    echo "❌ SuperAdmin role not found\n";
    exit(1);
}

// Assign SuperAdmin role
DB::table('user_role_mappings')->insert([
    'employee_id' => $user->id,
    'role_id' => 1,
    'created_by' => 'admin',
    'created_on' => now(),
]);

echo "✅ Assigned SuperAdmin role (role_id: 1)\n";

// Verify
echo "\n=== Verification ===\n";
$mapping = DB::table('user_role_mappings')
    ->join('roles', 'user_role_mappings.role_id', '=', 'roles.id')
    ->where('user_role_mappings.employee_id', $user->id)
    ->select('roles.name', 'roles.id')
    ->first();

if ($mapping) {
    echo "Current Role: {$mapping->name} (ID: {$mapping->id})\n";
    
    // Count permissions
    $permissionCount = DB::table('role_permissions')
        ->where('role_id', $mapping->id)
        ->count();
    
    echo "Permissions assigned: $permissionCount\n";
}

echo "\n✅ Done! User can now login with SuperAdmin privileges.\n";
echo "Email: $email\n";
echo "Password: admin123\n";
echo "URL: http://localhost:5173/internal-login\n";
