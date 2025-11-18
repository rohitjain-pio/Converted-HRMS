<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Constants\Permissions;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing menus
        DB::table('menu_permissions')->truncate();
        DB::table('menus')->truncate();

        // Dashboard
        $dashboard = Menu::create([
            'menu_name' => 'Dashboard',
            'menu_path' => '/dashboard',
            'icon' => 'mdi-view-dashboard',
            'display_order' => 1,
            'is_active' => true,
        ]);
        $this->attachPermissions($dashboard, [
            Permissions::DASHBOARD_VIEW,
        ]);

        // Employee Management
        $employees = Menu::create([
            'menu_name' => 'Employees',
            'menu_path' => '/employees',
            'icon' => 'mdi-account-group',
            'display_order' => 2,
            'is_active' => true,
        ]);
        $this->attachPermissions($employees, [
            Permissions::EMPLOYEE_VIEW,
        ]);

        // Employee sub-menus
        $employeeList = Menu::create([
            'menu_name' => 'Employee List',
            'menu_path' => '/employees/list',
            'parent_menu_id' => $employees->id,
            'display_order' => 1,
            'is_active' => true,
        ]);
        $this->attachPermissions($employeeList, [
            Permissions::EMPLOYEE_VIEW,
        ]);

        $addEmployee = Menu::create([
            'menu_name' => 'Add Employee',
            'menu_path' => '/employees/add',
            'parent_menu_id' => $employees->id,
            'display_order' => 2,
            'is_active' => true,
        ]);
        $this->attachPermissions($addEmployee, [
            Permissions::EMPLOYEE_CREATE,
        ]);

        // Attendance Management
        $attendance = Menu::create([
            'menu_name' => 'Attendance',
            'menu_path' => '/attendance',
            'icon' => 'mdi-calendar-check',
            'display_order' => 3,
            'is_active' => true,
        ]);
        $this->attachPermissions($attendance, [
            'attendance.read',
        ]);

        $myAttendance = Menu::create([
            'menu_name' => 'My Attendance',
            'menu_path' => '/attendance/my-attendance',
            'parent_menu_id' => $attendance->id,
            'display_order' => 1,
            'is_active' => true,
        ]);
        $this->attachPermissions($myAttendance, [
            'attendance.read',
        ]);

        $attendanceConfig = Menu::create([
            'menu_name' => 'Configuration',
            'menu_path' => '/attendance/configuration',
            'parent_menu_id' => $attendance->id,
            'display_order' => 2,
            'is_active' => true,
        ]);
        $this->attachPermissions($attendanceConfig, [
            'attendance.admin',
        ]);

        $attendanceReport = Menu::create([
            'menu_name' => 'Employee Report',
            'menu_path' => '/attendance/employee-report',
            'parent_menu_id' => $attendance->id,
            'display_order' => 3,
            'is_active' => true,
        ]);
        $this->attachPermissions($attendanceReport, [
            'attendance.report',
        ]);

        // Leave Management
        $leave = Menu::create([
            'menu_name' => 'Leave Management',
            'menu_path' => '/leave',
            'icon' => 'mdi-calendar-remove',
            'display_order' => 4,
            'is_active' => true,
        ]);
        $this->attachPermissions($leave, [
            Permissions::LEAVE_VIEW,
        ]);

        $leaveRequests = Menu::create([
            'menu_name' => 'Leave Requests',
            'menu_path' => '/leave/requests',
            'parent_menu_id' => $leave->id,
            'display_order' => 1,
            'is_active' => true,
        ]);
        $this->attachPermissions($leaveRequests, [
            Permissions::LEAVE_VIEW,
        ]);

        $myLeaves = Menu::create([
            'menu_name' => 'My Leaves',
            'menu_path' => '/leave/my-leaves',
            'parent_menu_id' => $leave->id,
            'display_order' => 2,
            'is_active' => true,
        ]);
        // No specific permission needed - all employees can view their leaves

        // Asset Management
        $assets = Menu::create([
            'menu_name' => 'Assets',
            'menu_path' => '/assets',
            'icon' => 'mdi-laptop',
            'display_order' => 5,
            'is_active' => true,
        ]);
        $this->attachPermissions($assets, [
            Permissions::ASSET_VIEW,
        ]);

        // Exit Management
        $exit = Menu::create([
            'menu_name' => 'Exit Management',
            'menu_path' => '/exit',
            'icon' => 'mdi-exit-to-app',
            'display_order' => 6,
            'is_active' => true,
        ]);
        $this->attachPermissions($exit, [
            Permissions::EXIT_VIEW,
        ]);

        // Company Policy Management
        $policies = Menu::create([
            'menu_name' => 'Policies',
            'menu_path' => '/policies',
            'icon' => 'mdi-file-document',
            'display_order' => 7,
            'is_active' => true,
        ]);
        $this->attachPermissions($policies, [
            Permissions::POLICY_VIEW,
        ]);

        // Holiday Management
        $holidays = Menu::create([
            'menu_name' => 'Holidays',
            'menu_path' => '/holidays',
            'icon' => 'mdi-beach',
            'display_order' => 8,
            'is_active' => true,
        ]);
        $this->attachPermissions($holidays, [
            Permissions::HOLIDAY_VIEW,
        ]);

        // Reports & Analytics
        $reports = Menu::create([
            'menu_name' => 'Reports',
            'menu_path' => '/reports',
            'icon' => 'mdi-chart-bar',
            'display_order' => 9,
            'is_active' => true,
        ]);
        $this->attachPermissions($reports, [
            Permissions::REPORT_VIEW,
        ]);

        // Settings
        $settings = Menu::create([
            'menu_name' => 'Settings',
            'menu_path' => '/settings',
            'icon' => 'mdi-cog',
            'display_order' => 10,
            'is_active' => true,
        ]);

        $roles = Menu::create([
            'menu_name' => 'Roles & Permissions',
            'menu_path' => '/settings/roles',
            'parent_menu_id' => $settings->id,
            'display_order' => 1,
            'is_active' => true,
        ]);
        $this->attachPermissions($roles, [
            Permissions::ROLE_VIEW,
        ]);

        $auditLog = Menu::create([
            'menu_name' => 'Audit Log',
            'menu_path' => '/settings/audit-log',
            'parent_menu_id' => $settings->id,
            'display_order' => 2,
            'is_active' => true,
        ]);
        $this->attachPermissions($auditLog, [
            Permissions::AUDIT_VIEW,
        ]);

        $this->command->info('Menu seeding completed successfully!');
    }

    /**
     * Attach permissions to a menu
     *
     * @param Menu $menu
     * @param array $permissionValues
     */
    protected function attachPermissions(Menu $menu, array $permissionValues): void
    {
        $permissionIds = DB::table('permissions')
            ->whereIn('value', $permissionValues)
            ->pluck('id')
            ->toArray();

        if (!empty($permissionIds)) {
            $attachData = [];
            foreach ($permissionIds as $permissionId) {
                $attachData[$permissionId] = [
                    'created_by' => 'System',
                    'created_on' => now(),
                ];
            }
            $menu->permissions()->attach($attachData);
        }
    }
}
