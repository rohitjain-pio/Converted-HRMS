<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Adding Frontend-Compatible Permissions ===\n\n";

// The frontend expects lowercase permissions like: employee.view, employee.create, etc.
// Backend has: View.Employees, Create.Employees, etc.
// We need to add the frontend format OR update the frontend to match backend

$frontendPermissions = [
    // Employee permissions
    ['value' => 'employee.view', 'name' => 'View Employee', 'module' => 'Employees'],
    ['value' => 'employee.create', 'name' => 'Create Employee', 'module' => 'Employees'],
    ['value' => 'employee.edit', 'name' => 'Edit Employee', 'module' => 'Employees'],
    ['value' => 'employee.delete', 'name' => 'Delete Employee', 'module' => 'Employees'],
    
    // Attendance permissions already exist in lowercase format (attendance.*)
];

$employeesModule = DB::table('modules')->where('module_name', 'Employees')->first();
$employeesModuleId = $employeesModule ? $employeesModule->id : 1;

$addedCount = 0;

foreach ($frontendPermissions as $perm) {
    // Check if permission exists
    $existing = DB::table('permissions')->where('value', $perm['value'])->first();
    
    if (!$existing) {
        echo "Creating: {$perm['value']}\n";
        $permId = DB::table('permissions')->insertGetId([
            'value' => $perm['value'],
            'name' => $perm['name'],
            'module_id' => $employeesModuleId,
            'created_by' => 'System',
            'created_on' => now(),
        ]);
    } else {
        $permId = $existing->id;
        echo "Exists: {$perm['value']}\n";
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
        echo "  ✅ Assigned to SuperAdmin\n";
        $addedCount++;
    } else {
        echo "  ✓ Already assigned\n";
    }
}

$newTotal = DB::table('role_permissions')->where('role_id', 1)->count();

echo "\n✅ SuperAdmin now has {$newTotal} total permissions\n";
echo "\n⚠️ You MUST log out and log in again!\n";

echo "\n=== Complete ===\n";
