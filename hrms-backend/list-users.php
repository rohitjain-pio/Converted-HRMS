<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $users = DB::table('users')->get(['id', 'email', 'name']);
    
    echo "All users in the system:\n";
    echo "========================\n";
    
    foreach ($users as $user) {
        echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
