<?php
/**
 * Assign SuperAdmin role and permissions to test user
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Assigning SuperAdmin Role ===\n\n";

$email = 'rohit.jain@programmers.io';

// Get employee
$employment = DB::table('employment_details')
    ->where('email', $email)
    ->where('is_deleted', false)
    ->first();

if (!$employment) {
    echo "❌ Employment record not found\n";
    exit(1);
}

echo "✅ Found employee ID: {$employment->employee_id}\n";

// Get SuperAdmin role
$superAdminRole = DB::table('roles')
    ->where('name', 'SuperAdmin')
    ->first();

if (!$superAdminRole) {
    echo "❌ SuperAdmin role not found\n";
    exit(1);
}

echo "✅ Found SuperAdmin role ID: {$superAdminRole->id}\n\n";

// Update role in employment_details
DB::table('employment_details')
    ->where('id', $employment->id)
    ->update([
        'role_id' => $superAdminRole->id,
        'modified_by' => 'system',
        'modified_on' => now(),
    ]);

echo "✅ Updated role to SuperAdmin\n\n";

// Check permissions
$permissionCount = DB::table('role_permissions')
    ->where('role_id', $superAdminRole->id)
    ->count();

echo "SuperAdmin permissions: {$permissionCount}\n";

if ($permissionCount === 0) {
    echo "\n⚠️  SuperAdmin has no permissions assigned\n";
    echo "Assigning all permissions...\n\n";
    
    // Get all permissions
    $permissions = DB::table('permissions')->get();
    
    echo "Found {$permissions->count()} permissions in database\n";
    
    // Clear existing
    DB::table('role_permissions')
        ->where('role_id', $superAdminRole->id)
        ->delete();
    
    // Insert all permissions
    $insertData = [];
    foreach ($permissions as $permission) {
        $insertData[] = [
            'role_id' => $superAdminRole->id,
            'permission_id' => $permission->id,
            'created_by' => 'system',
            'created_on' => now(),
        ];
    }
    
    DB::table('role_permissions')->insert($insertData);
    
    $newCount = DB::table('role_permissions')
        ->where('role_id', $superAdminRole->id)
        ->count();
    
    echo "✅ Assigned {$newCount} permissions to SuperAdmin\n\n";
}

// Final test
echo "=== Final Verification ===\n\n";

$authService = app(\App\Services\Auth\AuthService::class);

try {
    $authData = $authService->authenticateWithCredentials($email, 'password');
    
    if ($authData) {
        echo "✅ Authentication: SUCCESS\n";
        echo "   Employee ID: {$authData['employee_id']}\n";
        echo "   Name: {$authData['name']}\n";
        echo "   Email: {$authData['email']}\n";
        echo "   Role ID: {$authData['role']}\n";
        echo "   Permissions: " . count($authData['permissions']) . "\n";
        echo "   Token: " . substr($authData['token'], 0, 50) . "...\n\n";
        
        echo "✅ Ready for login!\n\n";
    } else {
        echo "❌ Authentication failed\n\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "   {$e->getFile()}:{$e->getLine()}\n\n";
}

echo "=== Login Credentials ===\n";
echo "Email: {$email}\n";
echo "Password: password\n";
echo "URL: http://localhost:5175/internal-login\n";
