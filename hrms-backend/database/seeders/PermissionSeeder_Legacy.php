<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder_Legacy extends Seeder
{
    /**
     * Run the database seeds.
     * Exact permissions from legacy 03_HRMS_MasterTable_Data.sql
     */
    public function run(): void
    {
        $permissions = [
            // Module 1: Employees
            ['id' => 1, 'name' => 'Read Employees', 'value' => 'Read.Employees', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 2, 'name' => 'Create Employees', 'value' => 'Create.Employees', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 3, 'name' => 'Edit Employees', 'value' => 'Edit.Employees', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 4, 'name' => 'Delete Employees', 'value' => 'Delete.Employees', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 5, 'name' => 'View Employees', 'value' => 'View.Employees', 'module_id' => 1, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 2: Personal Details
            ['id' => 6, 'name' => 'Read Personal Details', 'value' => 'Read.PersonalDetails', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 7, 'name' => 'Create Personal Details', 'value' => 'Create.PersonalDetails', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 8, 'name' => 'Edit Personal Details', 'value' => 'Edit.PersonalDetails', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 9, 'name' => 'Delete Personal Details', 'value' => 'Delete.PersonalDetails', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 10, 'name' => 'View Personal Details', 'value' => 'View.PersonalDetails', 'module_id' => 2, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 3: Nominee Details
            ['id' => 11, 'name' => 'Read Nominee Details', 'value' => 'Read.NomineeDetails', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 12, 'name' => 'Create Nominee Details', 'value' => 'Create.NomineeDetails', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 13, 'name' => 'Edit Nominee Details', 'value' => 'Edit.NomineeDetails', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 14, 'name' => 'Delete Nominee Details', 'value' => 'Delete.NomineeDetails', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 15, 'name' => 'View Nominee Details', 'value' => 'View.NomineeDetails', 'module_id' => 3, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 4: Employment Details
            ['id' => 16, 'name' => 'Read Employment Details', 'value' => 'Read.EmploymentDetails', 'module_id' => 4, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 17, 'name' => 'Create Employment Details', 'value' => 'Create.EmploymentDetails', 'module_id' => 4, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 18, 'name' => 'Edit Employment Details', 'value' => 'Edit.EmploymentDetails', 'module_id' => 4, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 19, 'name' => 'Delete Employment Details', 'value' => 'Delete.EmploymentDetails', 'module_id' => 4, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 20, 'name' => 'View Employment Details', 'value' => 'View.EmploymentDetails', 'module_id' => 4, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 5: Educational Details
            ['id' => 21, 'name' => 'Read Educational Details', 'value' => 'Read.EducationalDetails', 'module_id' => 5, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 22, 'name' => 'Create Educational Details', 'value' => 'Create.EducationalDetails', 'module_id' => 5, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 23, 'name' => 'Edit Educational Details', 'value' => 'Edit.EducationalDetails', 'module_id' => 5, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 24, 'name' => 'Delete Educational Details', 'value' => 'Delete.EducationalDetails', 'module_id' => 5, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 25, 'name' => 'View Educational Details', 'value' => 'View.EducationalDetails', 'module_id' => 5, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 6: Role
            ['id' => 26, 'name' => 'Read Role', 'value' => 'Read.Role', 'module_id' => 6, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 27, 'name' => 'Create Role', 'value' => 'Create.Role', 'module_id' => 6, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 28, 'name' => 'Edit Role', 'value' => 'Edit.Role', 'module_id' => 6, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 29, 'name' => 'Delete Role', 'value' => 'Delete.Role', 'module_id' => 6, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 30, 'name' => 'View Role', 'value' => 'View.Role', 'module_id' => 6, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 7: Email Notification
            ['id' => 31, 'name' => 'Read Email Notification', 'value' => 'Read.EmailNotification', 'module_id' => 7, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 32, 'name' => 'Create Email Notification', 'value' => 'Create.EmailNotification', 'module_id' => 7, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 33, 'name' => 'Edit Email Notification', 'value' => 'Edit.EmailNotification', 'module_id' => 7, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 34, 'name' => 'Delete Email Notification', 'value' => 'Delete.EmailNotification', 'module_id' => 7, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 35, 'name' => 'View Email Notification', 'value' => 'View.EmailNotification', 'module_id' => 7, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 8: Employee Group
            ['id' => 36, 'name' => 'Read Employee Group', 'value' => 'Read.EmployeeGroup', 'module_id' => 8, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 37, 'name' => 'Create Employee Group', 'value' => 'Create.EmployeeGroup', 'module_id' => 8, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 38, 'name' => 'Edit Employee Group', 'value' => 'Edit.EmployeeGroup', 'module_id' => 8, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 39, 'name' => 'Delete Employee Group', 'value' => 'Delete.EmployeeGroup', 'module_id' => 8, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 40, 'name' => 'View Employee Group', 'value' => 'View.EmployeeGroup', 'module_id' => 8, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 9: Survey Report
            ['id' => 41, 'name' => 'Read Survey Report', 'value' => 'Read.SurveyReport', 'module_id' => 9, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 42, 'name' => 'Create Survey Report', 'value' => 'Create.SurveyReport', 'module_id' => 9, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 43, 'name' => 'Edit Survey Report', 'value' => 'Edit.SurveyReport', 'module_id' => 9, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 44, 'name' => 'Delete Survey Report', 'value' => 'Delete.SurveyReport', 'module_id' => 9, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 45, 'name' => 'View Survey Report', 'value' => 'View.SurveyReport', 'module_id' => 9, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 10: My Surveys
            ['id' => 46, 'name' => 'Read My Surveys', 'value' => 'Read.MySurveys', 'module_id' => 10, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 47, 'name' => 'Create My Surveys', 'value' => 'Create.MySurveys', 'module_id' => 10, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 48, 'name' => 'Edit My Surveys', 'value' => 'Edit.MySurveys', 'module_id' => 10, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 49, 'name' => 'Delete My Surveys', 'value' => 'Delete.MySurveys', 'module_id' => 10, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 50, 'name' => 'View My Surveys', 'value' => 'View.MySurveys', 'module_id' => 10, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 11: Events
            ['id' => 51, 'name' => 'Read Events', 'value' => 'Read.Events', 'module_id' => 11, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 52, 'name' => 'Create Events', 'value' => 'Create.Events', 'module_id' => 11, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 53, 'name' => 'Edit Events', 'value' => 'Edit.Events', 'module_id' => 11, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 54, 'name' => 'Delete Events', 'value' => 'Delete.Events', 'module_id' => 11, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 55, 'name' => 'View Events', 'value' => 'View.Events', 'module_id' => 11, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 12: Company Policy
            ['id' => 56, 'name' => 'Read Company Policy', 'value' => 'Read.CompanyPolicy', 'module_id' => 12, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 57, 'name' => 'Create Company Policy', 'value' => 'Create.CompanyPolicy', 'module_id' => 12, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 58, 'name' => 'Edit Company Policy', 'value' => 'Edit.CompanyPolicy', 'module_id' => 12, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 59, 'name' => 'Delete Company Policy', 'value' => 'Delete.CompanyPolicy', 'module_id' => 12, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 60, 'name' => 'View Company Policy', 'value' => 'View.CompanyPolicy', 'module_id' => 12, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 13: Survey
            ['id' => 61, 'name' => 'Read Survey', 'value' => 'Read.Survey', 'module_id' => 13, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 62, 'name' => 'Create Survey', 'value' => 'Create.Survey', 'module_id' => 13, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 63, 'name' => 'Edit Survey', 'value' => 'Edit.Survey', 'module_id' => 13, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 64, 'name' => 'Delete Survey', 'value' => 'Delete.Survey', 'module_id' => 13, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 65, 'name' => 'View Survey', 'value' => 'View.Survey', 'module_id' => 13, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 66, 'name' => 'Publish Survey', 'value' => 'Publish.Survey', 'module_id' => 13, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 14: Certificate
            ['id' => 67, 'name' => 'Read Certificate', 'value' => 'Read.Certificate', 'module_id' => 14, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 68, 'name' => 'Create Certificate', 'value' => 'Create.Certificate', 'module_id' => 14, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 69, 'name' => 'Edit Certificate', 'value' => 'Edit.Certificate', 'module_id' => 14, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 70, 'name' => 'Delete Certificate', 'value' => 'Delete.Certificate', 'module_id' => 14, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 71, 'name' => 'View Certificate', 'value' => 'View.Certificate', 'module_id' => 14, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 15: Professional Reference
            ['id' => 72, 'name' => 'Read ProfessionalReference', 'value' => 'Read.ProfessionalReference', 'module_id' => 15, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 73, 'name' => 'Create ProfessionalReference', 'value' => 'Create.ProfessionalReference', 'module_id' => 15, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 74, 'name' => 'Edit ProfessionalReference', 'value' => 'Edit.ProfessionalReference', 'module_id' => 15, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 75, 'name' => 'Delete ProfessionalReference', 'value' => 'Delete.ProfessionalReference', 'module_id' => 15, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 76, 'name' => 'View ProfessionalReference', 'value' => 'View.ProfessionalReference', 'module_id' => 15, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 16: Previous Employer
            ['id' => 77, 'name' => 'Read PreviousEmployer', 'value' => 'Read.PreviousEmployer', 'module_id' => 16, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 78, 'name' => 'Create PreviousEmployer', 'value' => 'Create.PreviousEmployer', 'module_id' => 16, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 79, 'name' => 'Edit PreviousEmployer', 'value' => 'Edit.PreviousEmployer', 'module_id' => 16, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 80, 'name' => 'Delete PreviousEmployer', 'value' => 'Delete.PreviousEmployer', 'module_id' => 16, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 81, 'name' => 'View PreviousEmployer', 'value' => 'View.PreviousEmployer', 'module_id' => 16, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 17: Official Details
            ['id' => 82, 'name' => 'Read OfficialDetails', 'value' => 'Read.OfficialDetails', 'module_id' => 17, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 83, 'name' => 'Create OfficialDetails', 'value' => 'Create.OfficialDetails', 'module_id' => 17, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 84, 'name' => 'Edit OfficialDetails', 'value' => 'Edit.OfficialDetails', 'module_id' => 17, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 85, 'name' => 'Delete OfficialDetails', 'value' => 'Delete.OfficialDetails', 'module_id' => 17, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 86, 'name' => 'View OfficialDetails', 'value' => 'View.OfficialDetails', 'module_id' => 17, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 18: Attendance
            ['id' => 87, 'name' => 'Read Attendance', 'value' => 'Read.Attendance', 'module_id' => 18, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 88, 'name' => 'Create Attendance', 'value' => 'Create.Attendance', 'module_id' => 18, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 89, 'name' => 'Edit Attendance', 'value' => 'Edit.Attendance', 'module_id' => 18, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 90, 'name' => 'Delete Attendance', 'value' => 'Delete.Attendance', 'module_id' => 18, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 91, 'name' => 'View Attendance', 'value' => 'View.Attendance', 'module_id' => 18, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 19: Leave
            ['id' => 92, 'name' => 'Read Leave', 'value' => 'Read.Leave', 'module_id' => 19, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 93, 'name' => 'Create Leave', 'value' => 'Create.Leave', 'module_id' => 19, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 94, 'name' => 'Edit Leave', 'value' => 'Edit.Leave', 'module_id' => 19, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 95, 'name' => 'Delete Leave', 'value' => 'Delete.Leave', 'module_id' => 19, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 96, 'name' => 'View Leave', 'value' => 'View.Leave', 'module_id' => 19, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 20: Asset
            ['id' => 97, 'name' => 'Read Asset', 'value' => 'Read.Asset', 'module_id' => 20, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 98, 'name' => 'Create Asset', 'value' => 'Create.Asset', 'module_id' => 20, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 99, 'name' => 'Edit Asset', 'value' => 'Edit.Asset', 'module_id' => 20, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 100, 'name' => 'Delete Asset', 'value' => 'Delete.Asset', 'module_id' => 20, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 101, 'name' => 'View Asset', 'value' => 'View.Asset', 'module_id' => 20, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 21: KPI
            ['id' => 106, 'name' => 'Read KPI', 'value' => 'Read.KPI', 'module_id' => 21, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 107, 'name' => 'Create KPI', 'value' => 'Create.KPI', 'module_id' => 21, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 108, 'name' => 'Edit KPI', 'value' => 'Edit.KPI', 'module_id' => 21, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 109, 'name' => 'Delete KPI', 'value' => 'Delete.KPI', 'module_id' => 21, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 110, 'name' => 'View KPI', 'value' => 'View.KPI', 'module_id' => 21, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 111, 'name' => 'Read KPI Goals', 'value' => 'Read.KPIGoals', 'module_id' => 21, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 112, 'name' => 'Read KPI DashBoard', 'value' => 'Read.KPIDashboard', 'module_id' => 21, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 22: Developer
            ['id' => 118, 'name' => 'Read Logs', 'value' => 'Read.Logs', 'module_id' => 22, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 23: Grievances
            ['id' => 119, 'name' => 'Read Grievances', 'value' => 'Read.Grievances', 'module_id' => 23, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 120, 'name' => 'Create Grievances', 'value' => 'Create.Grievances', 'module_id' => 23, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 121, 'name' => 'Edit Grievances', 'value' => 'Edit.Grievances', 'module_id' => 23, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 122, 'name' => 'Delete Grievances', 'value' => 'Delete.Grievances', 'module_id' => 23, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 123, 'name' => 'View Grievances', 'value' => 'View.Grievances', 'module_id' => 23, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 124, 'name' => 'Read All Grievances', 'value' => 'Read.AllGrievances', 'module_id' => 23, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 125, 'name' => 'Read Grievances Configuration', 'value' => 'Read.GrievancesConfiguration', 'module_id' => 23, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],

            // Module 24: Support
            ['id' => 126, 'name' => 'Read Support', 'value' => 'Read.Support', 'module_id' => 24, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 127, 'name' => 'Create Support', 'value' => 'Create.Support', 'module_id' => 24, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 128, 'name' => 'Edit Support', 'value' => 'Edit.Support', 'module_id' => 24, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 129, 'name' => 'Delete Support', 'value' => 'Delete.Support', 'module_id' => 24, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 130, 'name' => 'View Support', 'value' => 'View.Support', 'module_id' => 24, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 131, 'name' => 'Read All Support', 'value' => 'Read.AllSupport', 'module_id' => 24, 'is_deleted' => false, 'created_by' => 'admin', 'created_on' => now()],
        ];

        DB::table('permissions')->insert($permissions);
    }
}
