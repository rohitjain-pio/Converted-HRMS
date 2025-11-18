<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    /**
     * Seed countries and states (India with major states)
     */
    public function run(): void
    {
        // Insert India
        $countryId = DB::table('country')->insertGetId([
            'country_name' => 'India',
            'country_code' => 'IN',
            'created_by' => 'system',
            'created_on' => now(),
            'is_deleted' => 0
        ]);

        // Insert Indian states
        $states = [
            ['state_name' => 'Andhra Pradesh', 'state_code' => 'AP'],
            ['state_name' => 'Karnataka', 'state_code' => 'KA'],
            ['state_name' => 'Kerala', 'state_code' => 'KL'],
            ['state_name' => 'Tamil Nadu', 'state_code' => 'TN'],
            ['state_name' => 'Telangana', 'state_code' => 'TG'],
            ['state_name' => 'Maharashtra', 'state_code' => 'MH'],
            ['state_name' => 'Gujarat', 'state_code' => 'GJ'],
            ['state_name' => 'Rajasthan', 'state_code' => 'RJ'],
            ['state_name' => 'Punjab', 'state_code' => 'PB'],
            ['state_name' => 'Haryana', 'state_code' => 'HR'],
            ['state_name' => 'Delhi', 'state_code' => 'DL'],
            ['state_name' => 'Uttar Pradesh', 'state_code' => 'UP'],
            ['state_name' => 'West Bengal', 'state_code' => 'WB'],
        ];

        foreach ($states as $state) {
            DB::table('state')->insert([
                'country_id' => $countryId,
                'state_name' => $state['state_name'],
                'state_code' => $state['state_code'],
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }

        // Add USA
        $usaId = DB::table('country')->insertGetId([
            'country_name' => 'United States',
            'country_code' => 'US',
            'created_by' => 'system',
            'created_on' => now(),
            'is_deleted' => 0
        ]);

        $usStates = [
            ['state_name' => 'California', 'state_code' => 'CA'],
            ['state_name' => 'New York', 'state_code' => 'NY'],
            ['state_name' => 'Texas', 'state_code' => 'TX'],
        ];

        foreach ($usStates as $state) {
            DB::table('state')->insert([
                'country_id' => $usaId,
                'state_name' => $state['state_name'],
                'state_code' => $state['state_code'],
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }
    }
}
