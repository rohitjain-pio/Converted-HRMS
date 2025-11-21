<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Constants\Permissions;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Based on Legacy DB: 03_HRMS_MasterTable_Data.sql
     */
    public function run(): void
    {
        // Clear existing menus
        DB::table('menu_permissions')->truncate();
        DB::table('menus')->truncate();

        echo "Starting menu seeding based on legacy structure...\n";

        // ==========================================
        // TOP-LEVEL MENUS (ParentMenuId = NULL)
        // ==========================================

        // 1. Employees
        $employees = Menu::create([
            'menu_name' => 'Employees',
            'menu_path' => '/employees',
            'icon' => 'mdi-account-group',
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($employees, [Permissions::EMPLOYEE_VIEW]);

        // 2. Roles
        $roles = Menu::create([
            'menu_name' => 'Roles',
            'menu_path' => '/roles',
            'icon' => 'mdi-shield-account',
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($roles, [Permissions::ROLE_VIEW]);

        // 3. Settings
        $settings = Menu::create([
            'menu_name' => 'Settings',
            'menu_path' => '/settings',
            'icon' => 'mdi-cog',
            'display_order' => 3,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($settings, [Permissions::SETTINGS_VIEW]);

        // 4. Employee Group
        $employeeGroup = Menu::create([
            'menu_name' => 'Employee Group',
            'menu_path' => '/employee-group',
            'icon' => 'mdi-account-multiple',
            'display_order' => 4,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($employeeGroup, [Permissions::EMPLOYEE_VIEW]);

        // 5. Survey
        $survey = Menu::create([
            'menu_name' => 'Survey',
            'menu_path' => '/survey',
            'icon' => 'mdi-clipboard-text',
            'display_order' => 5,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($survey, [Permissions::DASHBOARD_VIEW]); // Using generic permission

        // 6. Events
        $events = Menu::create([
            'menu_name' => 'Events',
            'menu_path' => '/events',
            'icon' => 'mdi-calendar-star',
            'display_order' => 6,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($events, [Permissions::DASHBOARD_VIEW]);

        // 7. Company Policy
        $companyPolicy = Menu::create([
            'menu_name' => 'Company Policy',
            'menu_path' => '/company-policy',
            'icon' => 'mdi-file-document',
            'display_order' => 7,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($companyPolicy, [Permissions::POLICY_VIEW]);

        // 14. Attendance
        $attendance = Menu::create([
            'menu_name' => 'Attendance',
            'menu_path' => '/attendance',
            'icon' => 'mdi-calendar-check',
            'display_order' => 8,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($attendance, [Permissions::ATTENDANCE_VIEW]);

        // 20. Leave
        $leave = Menu::create([
            'menu_name' => 'Leave',
            'menu_path' => '/leave',
            'icon' => 'mdi-beach',
            'display_order' => 9,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($leave, [Permissions::LEAVE_VIEW]);

        // 24. IT Assets
        $itAssets = Menu::create([
            'menu_name' => 'IT Assets',
            'menu_path' => '/it-assets',
            'icon' => 'mdi-laptop',
            'display_order' => 10,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($itAssets, [Permissions::ASSET_VIEW]);

        // 25. KPI
        $kpi = Menu::create([
            'menu_name' => 'KPI',
            'menu_path' => '/kpi',
            'icon' => 'mdi-chart-line',
            'display_order' => 11,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($kpi, [Permissions::DASHBOARD_VIEW]);

        // 26. My KPI
        $myKpi = Menu::create([
            'menu_name' => 'My KPI',
            'menu_path' => '/my-kpi',
            'icon' => 'mdi-account-star',
            'display_order' => 12,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($myKpi, [Permissions::DASHBOARD_VIEW]);

        // 27. Goals
        $goals = Menu::create([
            'menu_name' => 'Goals',
            'menu_path' => '/goals',
            'icon' => 'mdi-target',
            'display_order' => 13,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($goals, [Permissions::DASHBOARD_VIEW]);

        // 28. KPI Management
        $kpiManagement = Menu::create([
            'menu_name' => 'KPI Management',
            'menu_path' => '/kpi-management',
            'icon' => 'mdi-chart-box',
            'display_order' => 14,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($kpiManagement, [Permissions::DASHBOARD_VIEW]);

        // 29. Developer
        $developer = Menu::create([
            'menu_name' => 'Developer',
            'menu_path' => '/developer',
            'icon' => 'mdi-code-tags',
            'display_order' => 15,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($developer, [Permissions::AUDIT_VIEW]);

        // 32. Grievance
        $grievance = Menu::create([
            'menu_name' => 'Grievance',
            'menu_path' => '/grievance',
            'icon' => 'mdi-alert-circle',
            'display_order' => 16,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($grievance, [Permissions::GRIEVANCE_VIEW]);

        // 37. Support
        $support = Menu::create([
            'menu_name' => 'Support',
            'menu_path' => '/support',
            'icon' => 'mdi-lifebuoy',
            'display_order' => 17,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($support, [Permissions::DASHBOARD_VIEW]);

        // ==========================================
        // SUB-MENUS (Under Survey - ID 5)
        // ==========================================

        // 8. Survey Report
        Menu::create([
            'menu_name' => 'Survey Report',
            'menu_path' => '/survey/report',
            'parent_menu_id' => $survey->id,
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 9. My Surveys
        Menu::create([
            'menu_name' => 'My Surveys',
            'menu_path' => '/survey/my-surveys',
            'parent_menu_id' => $survey->id,
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // ==========================================
        // SUB-MENUS (Under Settings - ID 3)
        // ==========================================

        // 10. Email and Notification
        Menu::create([
            'menu_name' => 'Email and Notification',
            'menu_path' => '/settings/email-notification',
            'parent_menu_id' => $settings->id,
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 11. Department
        Menu::create([
            'menu_name' => 'Department',
            'menu_path' => '/settings/department',
            'parent_menu_id' => $settings->id,
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 12. Team
        Menu::create([
            'menu_name' => 'Team',
            'menu_path' => '/settings/team',
            'parent_menu_id' => $settings->id,
            'display_order' => 3,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 13. Designation
        Menu::create([
            'menu_name' => 'Designation',
            'menu_path' => '/settings/designation',
            'parent_menu_id' => $settings->id,
            'display_order' => 4,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // ==========================================
        // SUB-MENUS (Under Employees - ID 1)
        // ==========================================

        // 18. Employees List
        Menu::create([
            'menu_name' => 'Employees List',
            'menu_path' => '/employees/list',
            'icon' => 'mdi-account-multiple',
            'parent_menu_id' => $employees->id,
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 19. Employee Exit - CRITICAL: This is where exit management lives
        $employeeExit = Menu::create([
            'menu_name' => 'Employee Exit',
            'menu_path' => '/employees/employee-exit',
            'icon' => 'mdi-exit-to-app',
            'parent_menu_id' => $employees->id,
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);
        $this->attachPermissions($employeeExit, [
            Permissions::EXIT_VIEW,
            Permissions::EXIT_INITIATE,
        ]);

        // ==========================================
        // SUB-MENUS (Under Attendance - ID 14)
        // ==========================================

        // 15. My Attendance
        Menu::create([
            'menu_name' => 'My Attendance',
            'menu_path' => '/attendance/my-attendance',
            'parent_menu_id' => $attendance->id,
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 16. Attendance Configuration
        Menu::create([
            'menu_name' => 'Attendance Configuration',
            'menu_path' => '/attendance/configuration',
            'parent_menu_id' => $attendance->id,
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 17. Employee Report
        Menu::create([
            'menu_name' => 'Employee Report',
            'menu_path' => '/attendance/employee-report',
            'parent_menu_id' => $attendance->id,
            'display_order' => 3,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // ==========================================
        // SUB-MENUS (Under Leave - ID 20)
        // ==========================================

        // 21. Apply Leave
        Menu::create([
            'menu_name' => 'Apply Leave',
            'menu_path' => '/leave/apply',
            'parent_menu_id' => $leave->id,
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 22. Leave Approval
        Menu::create([
            'menu_name' => 'Leave Approval',
            'menu_path' => '/leave/approval',
            'parent_menu_id' => $leave->id,
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 23. Leave Calendar
        Menu::create([
            'menu_name' => 'Leave Calendar',
            'menu_path' => '/leave/calendar',
            'parent_menu_id' => $leave->id,
            'display_order' => 3,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // ==========================================
        // SUB-MENUS (Under Developer - ID 29)
        // ==========================================

        // 30. Logs
        Menu::create([
            'menu_name' => 'Logs',
            'menu_path' => '/developer/logs',
            'parent_menu_id' => $developer->id,
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 31. Cron Jobs
        Menu::create([
            'menu_name' => 'Cron Jobs',
            'menu_path' => '/developer/cron-jobs',
            'parent_menu_id' => $developer->id,
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // ==========================================
        // SUB-MENUS (Under Grievance - ID 32)
        // ==========================================

        // 33. My Grievance
        Menu::create([
            'menu_name' => 'My Grievance',
            'menu_path' => '/grievance/my-grievance',
            'parent_menu_id' => $grievance->id,
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 34. All Grievance
        Menu::create([
            'menu_name' => 'All Grievance',
            'menu_path' => '/grievance/all',
            'parent_menu_id' => $grievance->id,
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 35. Grievance Configuration
        Menu::create([
            'menu_name' => 'Grievance Configuration',
            'menu_path' => '/grievance/configuration',
            'parent_menu_id' => $grievance->id,
            'display_order' => 3,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // ==========================================
        // SUB-MENUS (Under Support - ID 37)
        // ==========================================

        // 38. My Support
        Menu::create([
            'menu_name' => 'My Support',
            'menu_path' => '/support/my-support',
            'parent_menu_id' => $support->id,
            'display_order' => 1,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        // 39. Support Queries
        Menu::create([
            'menu_name' => 'Support Queries',
            'menu_path' => '/support/queries',
            'parent_menu_id' => $support->id,
            'display_order' => 2,
            'is_active' => true,
            'created_by' => 'system',
        ]);

        echo "Menu seeding completed successfully!\n";
        echo "Total menus created: " . Menu::count() . "\n";
        echo "Parent menus: " . Menu::whereNull('parent_menu_id')->count() . "\n";
        echo "Sub-menus: " . Menu::whereNotNull('parent_menu_id')->count() . "\n";
    }

    /**
     * Attach permissions to a menu
     */
    private function attachPermissions(Menu $menu, array $permissions): void
    {
        foreach ($permissions as $permission) {
            if (Permissions::exists($permission)) {
                DB::table('menu_permissions')->insert([
                    'menu_id' => $menu->id,
                    'permission' => $permission,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
