<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Checking & Adding Missing Permissions ===\n\n";

// Check what permissions SuperAdmin currently has
$currentPerms = DB::table('role_permissions')
    ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
    ->where('role_permissions.role_id', 1)
    ->pluck('permissions.value')
    ->toArray();

echo "SuperAdmin currently has " . count($currentPerms) . " permissions\n\n";

// Define required permissions for the pages user mentioned
$requiredPermissions = [
    // Employee list page
    'View.Employees',
    'Read.Employees',
    
    // Attendance pages
    'attendance.create',
    'attendance.read',
    'attendance.edit',
    'attendance.delete',
    'attendance.admin',
    'attendance.report',
    'attendance.export',
    'Create.Attendance',
    'Read.Attendance',
    'Edit.Attendance',
    'Delete.Attendance',
    'View.Attendance',
];

echo "📋 Checking required permissions:\n";
$missingPermissions = [];

foreach ($requiredPermissions as $perm) {
    $has = in_array($perm, $currentPerms);
    $icon = $has ? '✅' : '❌';
    echo "  {$icon} {$perm}\n";
    
    if (!$has) {
        $missingPermissions[] = $perm;
    }
}

if (empty($missingPermissions)) {
    echo "\n✅ All required permissions already assigned!\n";
    exit;
}

echo "\n🔧 Creating & assigning missing permissions...\n";

// Get or create Attendance module
$attendanceModule = DB::table('modules')->where('module_name', 'Attendance')->first();
if (!$attendanceModule) {
    $attendanceModuleId = DB::table('modules')->insertGetId([
        'module_name' => 'Attendance',
        'is_active' => 1,
        'created_by' => 'System',
        'created_on' => now(),
    ]);
    echo "  ✅ Created Attendance module (ID: {$attendanceModuleId})\n";
} else {
    $attendanceModuleId = $attendanceModule->id;
}

// Get Employees module
$employeesModule = DB::table('modules')->where('module_name', 'Employees')->first();
$employeesModuleId = $employeesModule ? $employeesModule->id : 1;

$addedCount = 0;

foreach ($missingPermissions as $permValue) {
    // Check if permission exists
    $existingPerm = DB::table('permissions')->where('value', $permValue)->first();
    
    if (!$existingPerm) {
        // Create permission
        $moduleId = (stripos($permValue, 'attendance') !== false) ? $attendanceModuleId : $employeesModuleId;
        $name = str_replace('.', ' ', $permValue);
        $name = ucwords(str_replace('attendance.', '', strtolower($name)));
        
        $permId = DB::table('permissions')->insertGetId([
            'value' => $permValue,
            'name' => $name,
            'module_id' => $moduleId,
            'created_by' => 'System',
            'created_on' => now(),
        ]);
        echo "  ✅ Created permission: {$permValue}\n";
    } else {
        $permId = $existingPerm->id;
    }
    
    // Assign to SuperAdmin
    $hasRole = DB::table('role_permissions')
        ->where('role_id', 1)
        ->where('permission_id', $permId)
        ->exists();
    
    if (!$hasRole) {
        DB::table('role_permissions')->insert([
            'role_id' => 1,
            'permission_id' => $permId,
            'created_by' => 'System',
        ]);
        $addedCount++;
    }
}

$newTotal = DB::table('role_permissions')->where('role_id', 1)->count();

echo "\n✅ Added {$addedCount} permissions to SuperAdmin\n";
echo "✅ SuperAdmin now has {$newTotal} total permissions\n";

echo "\n=== ⚠️ IMPORTANT ===\n";
echo "You MUST log out and log in again to get the new permissions!\n";
echo "The current token doesn't have these permissions.\n";

echo "\n=== Complete ===\n";
