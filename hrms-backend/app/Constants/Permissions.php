<?php

namespace App\Constants;

class Permissions
{
    // ==========================================
    // EMPLOYEE MODULE PERMISSIONS
    // ==========================================
    const EMPLOYEE_VIEW = 'Read.Employees';
    const EMPLOYEE_CREATE = 'Create.Employees';
    const EMPLOYEE_EDIT = 'Edit.Employees';
    const EMPLOYEE_DELETE = 'Delete.Employees';
    const EMPLOYEE_EXPORT = 'Export.Employees';
    const EMPLOYEE_IMPORT = 'Import.Employees';
    const EMPLOYEE_VIEW_SALARY = 'Read.EmployeeSalary';
    const EMPLOYEE_EDIT_SALARY = 'Edit.EmployeeSalary';

    // ==========================================
    // LEAVE MODULE PERMISSIONS
    // ==========================================
    const LEAVE_VIEW = 'Read.Leaves';
    const LEAVE_CREATE = 'Create.Leaves';
    const LEAVE_EDIT = 'Edit.Leaves';
    const LEAVE_DELETE = 'Delete.Leaves';
    const LEAVE_APPROVE = 'Approve.Leaves';
    const LEAVE_REJECT = 'Reject.Leaves';
    const LEAVE_VIEW_ALL = 'Read.AllLeaves';
    const LEAVE_CANCEL = 'Cancel.Leaves';

    // ==========================================
    // ATTENDANCE MODULE PERMISSIONS
    // ==========================================
    const ATTENDANCE_VIEW = 'Read.Attendance';
    const ATTENDANCE_CREATE = 'Create.Attendance';
    const ATTENDANCE_EDIT = 'Edit.Attendance';
    const ATTENDANCE_DELETE = 'Delete.Attendance';
    const ATTENDANCE_VIEW_ALL = 'Read.AllAttendance';
    const ATTENDANCE_APPROVE = 'Approve.Attendance';
    const ATTENDANCE_ADMIN = 'Admin.AttendanceConfiguration';
    const ATTENDANCE_REPORT = 'Read.AttendanceReports';

    // ==========================================
    // ROLE & PERMISSION MODULE PERMISSIONS
    // ==========================================
    const ROLE_VIEW = 'Read.Roles';
    const ROLE_CREATE = 'Create.Roles';
    const ROLE_EDIT = 'Edit.Roles';
    const ROLE_DELETE = 'Delete.Roles';
    const PERMISSION_VIEW = 'Read.Permissions';
    const PERMISSION_EDIT = 'Edit.Permissions';

    // ==========================================
    // DEPARTMENT MODULE PERMISSIONS
    // ==========================================
    const DEPARTMENT_VIEW = 'Read.Departments';
    const DEPARTMENT_CREATE = 'Create.Departments';
    const DEPARTMENT_EDIT = 'Edit.Departments';
    const DEPARTMENT_DELETE = 'Delete.Departments';

    // ==========================================
    // TEAM MODULE PERMISSIONS
    // ==========================================
    const TEAM_VIEW = 'Read.Teams';
    const TEAM_CREATE = 'Create.Teams';
    const TEAM_EDIT = 'Edit.Teams';
    const TEAM_DELETE = 'Delete.Teams';

    // ==========================================
    // ASSET MODULE PERMISSIONS
    // ==========================================
    const ASSET_VIEW = 'Read.Assets';
    const ASSET_CREATE = 'Create.Assets';
    const ASSET_EDIT = 'Edit.Assets';
    const ASSET_DELETE = 'Delete.Assets';
    const ASSET_ASSIGN = 'Assign.Assets';
    const ASSET_RETURN = 'Return.Assets';

    // ==========================================
    // EXIT MODULE PERMISSIONS
    // ==========================================
    const EXIT_VIEW = 'Read.ExitManagement';
    const EXIT_CREATE = 'Create.ExitManagement';
    const EXIT_EDIT = 'Edit.ExitManagement';
    const EXIT_DELETE = 'Delete.ExitManagement';
    const EXIT_APPROVE = 'Approve.ExitManagement';
    const EXIT_REJECT = 'Reject.ExitManagement';
    const EXIT_INITIATE = 'Initiate.Exit';
    const EXIT_CLEARANCE = 'Clearance.Exit';

    // ==========================================
    // POLICY MODULE PERMISSIONS
    // ==========================================
    const POLICY_VIEW = 'Read.Policies';
    const POLICY_CREATE = 'Create.Policies';
    const POLICY_EDIT = 'Edit.Policies';
    const POLICY_DELETE = 'Delete.Policies';
    const POLICY_PUBLISH = 'Publish.Policies';

    // ==========================================
    // GRIEVANCE MODULE PERMISSIONS
    // ==========================================
    const GRIEVANCE_VIEW = 'Read.Grievances';
    const GRIEVANCE_CREATE = 'Create.Grievances';
    const GRIEVANCE_EDIT = 'Edit.Grievances';
    const GRIEVANCE_DELETE = 'Delete.Grievances';
    const GRIEVANCE_RESOLVE = 'Resolve.Grievances';
    const GRIEVANCE_VIEW_ALL = 'Read.AllGrievances';

    // ==========================================
    // HOLIDAY MODULE PERMISSIONS
    // ==========================================
    const HOLIDAY_VIEW = 'Read.Holidays';
    const HOLIDAY_CREATE = 'Create.Holidays';
    const HOLIDAY_EDIT = 'Edit.Holidays';
    const HOLIDAY_DELETE = 'Delete.Holidays';

    // ==========================================
    // REPORTING MODULE PERMISSIONS
    // ==========================================
    const REPORT_VIEW = 'Read.Reports';
    const REPORT_GENERATE = 'Generate.Reports';
    const REPORT_EXPORT = 'Export.Reports';
    const REPORT_VIEW_EMPLOYEE = 'Read.EmployeeReports';
    const REPORT_VIEW_ATTENDANCE = 'Read.AttendanceReports';
    const REPORT_VIEW_LEAVE = 'Read.LeaveReports';

    // ==========================================
    // DASHBOARD PERMISSIONS
    // ==========================================
    const DASHBOARD_VIEW = 'Read.Dashboard';
    const DASHBOARD_VIEW_ADMIN = 'Read.AdminDashboard';
    const DASHBOARD_VIEW_HR = 'Read.HRDashboard';
    const DASHBOARD_VIEW_MANAGER = 'Read.ManagerDashboard';
    const DASHBOARD_VIEW_EMPLOYEE = 'Read.EmployeeDashboard';

    // ==========================================
    // AUDIT TRAIL PERMISSIONS
    // ==========================================
    const AUDIT_VIEW = 'Read.AuditTrail';
    const AUDIT_EXPORT = 'Export.AuditTrail';

    // ==========================================
    // SETTINGS PERMISSIONS
    // ==========================================
    const SETTINGS_VIEW = 'Read.Settings';
    const SETTINGS_EDIT = 'Edit.Settings';
    const SETTINGS_SYSTEM = 'Edit.SystemSettings';

    // ==========================================
    // USER PROFILE PERMISSIONS
    // ==========================================
    const PROFILE_VIEW_OWN = 'Read.OwnProfile';
    const PROFILE_EDIT_OWN = 'Edit.OwnProfile';
    const PROFILE_VIEW_ALL = 'Read.AllProfiles';

    /**
     * Get all permissions as array
     */
    public static function all(): array
    {
        $reflection = new \ReflectionClass(self::class);
        return array_values($reflection->getConstants());
    }

    /**
     * Check if permission exists
     */
    public static function exists(string $permission): bool
    {
        return in_array($permission, self::all());
    }
}
