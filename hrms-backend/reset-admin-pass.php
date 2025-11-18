<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

try {
    $email = 'admin@programmers.io';
    $newPassword = 'password123';
    
    $hashedPassword = Hash::make($newPassword);
    
    $updated = DB::table('users')
        ->where('email', $email)
        ->update(['password' => $hashedPassword]);
    
    if ($updated) {
        echo "Password updated successfully!\n\n";
        echo "Email: {$email}\n";
        echo "New Password: {$newPassword}\n";
    } else {
        echo "User not found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
