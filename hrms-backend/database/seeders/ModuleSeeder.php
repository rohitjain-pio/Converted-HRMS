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
        $modules = [
            ['id' => 1, 'module_name' => 'Authentication & Authorization', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 2, 'module_name' => 'Employee Management', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 3, 'module_name' => 'Attendance Management', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 4, 'module_name' => 'Leave Management', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 5, 'module_name' => 'Asset Management', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 6, 'module_name' => 'Exit Management', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 7, 'module_name' => 'Company Policy Management', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 8, 'module_name' => 'Reporting & Analytics', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
        ];

        DB::table('modules')->insert($modules);
    }
}
