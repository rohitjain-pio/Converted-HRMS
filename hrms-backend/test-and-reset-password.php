<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

try {
    $email = 'admin@programmers.io';
    $passwords = [
        'password',
        'admin',
        'admin123',
        '123456',
        'password123'
    ];
    
    echo "Testing login with different passwords...\n\n";
    
    $user = DB::table('users')->where('email', $email)->first();
    
    if (!$user) {
        echo "User not found!\n";
        exit;
    }
    
    foreach ($passwords as $password) {
        if (Hash::check($password, $user->password)) {
            echo "✓ CORRECT PASSWORD FOUND: {$password}\n";
            echo "Email: {$email}\n";
            exit;
        }
    }
    
    echo "None of the test passwords worked.\n";
    echo "Setting new password to 'password'...\n\n";
    
    DB::table('users')
        ->where('email', $email)
        ->update(['password' => Hash::make('password')]);
    
    echo "Password updated!\n";
    echo "Email: {$email}\n";
    echo "Password: password\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
