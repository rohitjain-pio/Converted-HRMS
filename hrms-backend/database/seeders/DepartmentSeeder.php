<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    /**
     * Seed departments from legacy system
     */
    public function run(): void
    {
        $departments = [
            'Information Technology',
            'Human Resources',
            'Finance',
            'Operations',
            'Sales & Marketing',
            'Administration',
            'Quality Assurance',
            'Customer Support',
            'Research & Development',
        ];

        foreach ($departments as $dept) {
            DB::table('department')->insert([
                'department' => $dept,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }
    }
}
