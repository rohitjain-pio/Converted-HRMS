<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DesignationSeeder extends Seeder
{
    /**
     * Seed designations from legacy system
     */
    public function run(): void
    {
        $designations = [
            'Chief Executive Officer',
            'Chief Technology Officer',
            'Chief Financial Officer',
            'VP Engineering',
            'Engineering Manager',
            'Senior Software Engineer',
            'Software Engineer',
            'Junior Software Engineer',
            'QA Lead',
            'QA Engineer',
            'HR Manager',
            'HR Executive',
            'Finance Manager',
            'Accountant',
            'Sales Manager',
            'Business Development Executive',
        ];

        foreach ($designations as $designation) {
            DB::table('designation')->insert([
                'designation' => $designation,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }
    }
}
