<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Exact modules from legacy 03_HRMS_MasterTable_Data.sql
        $modules = [
            ['id' => 1, 'module_name' => 'Employees', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 2, 'module_name' => 'Personal Details', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 3, 'module_name' => 'Nominee Details', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 4, 'module_name' => 'Employment Details', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 5, 'module_name' => 'Educational Details', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 6, 'module_name' => 'Role', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 7, 'module_name' => 'Email Notification', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 8, 'module_name' => 'Employee Group', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 9, 'module_name' => 'Survey Report', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 10, 'module_name' => 'My Surveys', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 11, 'module_name' => 'Events', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 12, 'module_name' => 'Company Policy', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 13, 'module_name' => 'Survey', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 14, 'module_name' => 'Certificate', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 15, 'module_name' => 'Professional Reference', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 16, 'module_name' => 'Previous Employer', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 17, 'module_name' => 'Official Details', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 18, 'module_name' => 'Attendance', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 19, 'module_name' => 'Leave', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 20, 'module_name' => 'Asset', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 21, 'module_name' => 'KPI', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 22, 'module_name' => 'Developer', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 23, 'module_name' => 'Grievances', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
            ['id' => 24, 'module_name' => 'Support', 'is_active' => true, 'created_by' => 'admin', 'created_on' => now()],
        ];

        DB::table('modules')->insert($modules);
    }
}
