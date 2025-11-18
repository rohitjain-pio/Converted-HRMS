<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['id' => 1, 'name' => 'SuperAdmin', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 2, 'name' => 'HR', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 3, 'name' => 'Employee', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 4, 'name' => 'Accounts', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 5, 'name' => 'Manager', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 6, 'name' => 'IT', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 7, 'name' => 'Developer', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 8, 'name' => 'TeamLead', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
        ];

        DB::table('roles')->insert($roles);
    }
}
