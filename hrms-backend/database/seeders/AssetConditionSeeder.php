<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssetConditionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('asset_condition')->insert([
            ['Id' => 1, 'Status' => 'Good', 'CreatedBy' => 'System', 'CreatedOn' => now()],
            ['Id' => 2, 'Status' => 'Fair', 'CreatedBy' => 'System', 'CreatedOn' => now()],
            ['Id' => 3, 'Status' => 'Damaged', 'CreatedBy' => 'System', 'CreatedOn' => now()],
            ['Id' => 4, 'Status' => 'Not Applicable', 'CreatedBy' => 'System', 'CreatedOn' => now()],
        ]);
    }
}
