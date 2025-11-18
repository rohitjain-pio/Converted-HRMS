<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Authentication & Authorization Module (Module ID: 1)
            ['name' => 'View Users', 'value' => 'auth.users.view', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Create Users', 'value' => 'auth.users.create', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Edit Users', 'value' => 'auth.users.edit', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Delete Users', 'value' => 'auth.users.delete', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Manage Roles', 'value' => 'auth.roles.manage', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Manage Permissions', 'value' => 'auth.permissions.manage', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            
            // Employee Management Module (Module ID: 2)
            ['name' => 'View Employees', 'value' => 'employee.view', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Create Employees', 'value' => 'employee.create', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Edit Employees', 'value' => 'employee.edit', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Delete Employees', 'value' => 'employee.delete', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            
            // Attendance Management Module (Module ID: 3)
            ['name' => 'View Attendance', 'value' => 'attendance.read', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Create Attendance', 'value' => 'attendance.create', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Edit Attendance', 'value' => 'attendance.edit', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Delete Attendance', 'value' => 'attendance.delete', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Attendance Configuration Admin', 'value' => 'attendance.admin', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'View Attendance Reports', 'value' => 'attendance.report', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['name' => 'Export Attendance Reports', 'value' => 'attendance.export', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
        ];

        DB::table('permissions')->insert($permissions);
        
        // Assign all permissions to SuperAdmin role
        $permissionIds = DB::table('permissions')->pluck('id');
        $rolePermissions = [];
        
        foreach ($permissionIds as $permissionId) {
            $rolePermissions[] = [
                'role_id' => 1, // SuperAdmin
                'permission_id' => $permissionId,
                'is_active' => true,
                'created_by' => 'System',
                'created_on' => now(),
            ];
        }
        
        DB::table('role_permissions')->insert($rolePermissions);
    }
}
