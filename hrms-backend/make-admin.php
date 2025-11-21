<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

echo "=== Creating Simple Admin User ===\n\n";

// Create admin role if not exists
$adminRole = Role::firstOrCreate(
    ['name' => 'Admin'],
    ['guard_name' => 'web']
);

echo "✅ Admin role: {$adminRole->name}\n";

// Admin credentials
$adminEmail = 'admin@hrms.com';
$adminPassword = 'admin123';

// Check if user exists
$user = User::where('email', $adminEmail)->first();

if ($user) {
    echo "⚠️ User already exists: {$adminEmail}\n";
    echo "Updating password...\n";
    
    $user->password = Hash::make($adminPassword);
    $user->save();
} else {
    echo "Creating new user...\n";
    
    $user = User::create([
        'name' => 'Admin User',
        'email' => $adminEmail,
        'password' => Hash::make($adminPassword),
    ]);
    
    echo "✅ User created: {$user->email}\n";
}

// Assign admin role
if (!$user->hasRole('Admin')) {
    $user->assignRole($adminRole);
    echo "✅ Admin role assigned\n";
} else {
    echo "✅ User already has Admin role\n";
}

// Assign all permissions to admin role
$permissions = Permission::all();
if ($permissions->count() > 0) {
    $adminRole->syncPermissions($permissions);
    echo "✅ {$permissions->count()} permissions assigned to Admin role\n";
}

echo "\n=== SUCCESS ===\n\n";
echo "🌐 Login URL: http://localhost:5174\n";
echo "📧 Email: {$adminEmail}\n";
echo "🔑 Password: {$adminPassword}\n";
echo "👤 User ID: {$user->id}\n";
echo "🎭 Role: Admin\n";
echo "\n✅ Ready to login!\n";
