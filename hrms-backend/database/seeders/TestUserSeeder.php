<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test employees
        $defaultPassword = Hash::make('password123'); // Default password for all test users
        
        $employees = [
            [
                'id' => 1,
                'first_name' => 'John',
                'middle_name' => 'M',
                'last_name' => 'Doe',
                'employee_code' => 'EMP001',
                'personal_email' => 'john.doe@personal.com',
                'phone' => '1234567890',
                'password' => $defaultPassword,
                'status' => 1,
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => now(),
            ],
            [
                'id' => 2,
                'first_name' => 'Jane',
                'middle_name' => null,
                'last_name' => 'Smith',
                'employee_code' => 'EMP002',
                'personal_email' => 'jane.smith@personal.com',
                'phone' => '0987654321',
                'password' => $defaultPassword,
                'status' => 1,
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => now(),
            ],
            [
                'id' => 3,
                'first_name' => 'Admin',
                'middle_name' => null,
                'last_name' => 'User',
                'employee_code' => 'EMP000',
                'personal_email' => 'admin@company.com',
                'phone' => '1111111111',
                'password' => $defaultPassword,
                'status' => 1,
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => now(),
            ],
        ];

        DB::table('employee_data')->insert($employees);

        // Create employment details
        $employmentDetails = [
            [
                'employee_id' => 1,
                'email' => 'john.doe@company.com',
                'designation' => 'Software Developer',
                'department_name' => 'IT',
                'role_id' => 7, // Developer
                'joining_date' => '2024-01-15',
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => now(),
            ],
            [
                'employee_id' => 2,
                'email' => 'jane.smith@company.com',
                'designation' => 'HR Manager',
                'department_name' => 'Human Resources',
                'role_id' => 2, // HR
                'joining_date' => '2023-06-01',
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => now(),
            ],
            [
                'employee_id' => 3,
                'email' => 'admin@company.com',
                'designation' => 'System Administrator',
                'department_name' => 'IT',
                'role_id' => 1, // SuperAdmin
                'joining_date' => '2022-01-01',
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => now(),
            ],
        ];

        DB::table('employment_details')->insert($employmentDetails);

        // Create user role mappings
        $userRoleMappings = [
            ['role_id' => 7, 'employee_id' => 1, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['role_id' => 2, 'employee_id' => 2, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
            ['role_id' => 1, 'employee_id' => 3, 'is_deleted' => false, 'created_by' => 'System', 'created_on' => now()],
        ];

        DB::table('user_role_mappings')->insert($userRoleMappings);
    }
}
