<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeamsSeeder extends Seeder
{
    public function run()
    {
        $teams = [
            ['team_name' => 'Development Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'QA Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'DevOps Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'UI/UX Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'Product Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'Sales Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'Marketing Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'HR Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'Finance Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['team_name' => 'Operations Team', 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
        ];

        DB::table('team')->insert($teams);
        
        $this->command->info('Teams seeded successfully!');
    }
}
