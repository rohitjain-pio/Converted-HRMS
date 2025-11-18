<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'admin@company.com')->first();

if ($user) {
    echo "✓ User found: {$user->email}\n";
    echo "  Password check ('password'): " . (Hash::check('password', $user->password) ? '✓ MATCH' : '✗ NO MATCH') . "\n";
    echo "  Password check ('admin123'): " . (Hash::check('admin123', $user->password) ? '✓ MATCH' : '✗ NO MATCH') . "\n";
    
    // Try updating password
    echo "\nUpdating password to 'password'...\n";
    $user->password = Hash::make('password');
    $user->save();
    echo "✓ Password updated successfully\n";
} else {
    echo "✗ User NOT found\n";
}
