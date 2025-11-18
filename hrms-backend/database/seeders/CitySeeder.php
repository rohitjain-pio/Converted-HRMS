<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    public function run()
    {
        $cities = [
            // Andhra Pradesh (state_id = 1)
            ['state_id' => 1, 'city_name' => 'Visakhapatnam', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 1, 'city_name' => 'Vijayawada', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 1, 'city_name' => 'Guntur', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 1, 'city_name' => 'Nellore', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 1, 'city_name' => 'Tirupati', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Delhi (state_id = 11)
            ['state_id' => 11, 'city_name' => 'New Delhi', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 11, 'city_name' => 'Delhi', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 11, 'city_name' => 'Dwarka', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 11, 'city_name' => 'Rohini', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Gujarat (state_id = 12)
            ['state_id' => 12, 'city_name' => 'Ahmedabad', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 12, 'city_name' => 'Surat', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 12, 'city_name' => 'Vadodara', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 12, 'city_name' => 'Rajkot', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Haryana (state_id = 13)
            ['state_id' => 13, 'city_name' => 'Faridabad', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 13, 'city_name' => 'Gurgaon', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 13, 'city_name' => 'Panipat', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 13, 'city_name' => 'Ambala', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Karnataka (state_id = 15)
            ['state_id' => 15, 'city_name' => 'Bangalore', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 15, 'city_name' => 'Mysore', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 15, 'city_name' => 'Mangalore', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 15, 'city_name' => 'Hubli', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Kerala (state_id = 16)
            ['state_id' => 16, 'city_name' => 'Thiruvananthapuram', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 16, 'city_name' => 'Kochi', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 16, 'city_name' => 'Kozhikode', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 16, 'city_name' => 'Thrissur', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Maharashtra (state_id = 19)
            ['state_id' => 19, 'city_name' => 'Mumbai', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 19, 'city_name' => 'Pune', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 19, 'city_name' => 'Nagpur', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 19, 'city_name' => 'Thane', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 19, 'city_name' => 'Nashik', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Punjab (state_id = 24)
            ['state_id' => 24, 'city_name' => 'Ludhiana', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 24, 'city_name' => 'Amritsar', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 24, 'city_name' => 'Jalandhar', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 24, 'city_name' => 'Patiala', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Rajasthan (state_id = 25)
            ['state_id' => 25, 'city_name' => 'Jaipur', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 25, 'city_name' => 'Jodhpur', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 25, 'city_name' => 'Udaipur', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 25, 'city_name' => 'Kota', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Tamil Nadu (state_id = 26)
            ['state_id' => 26, 'city_name' => 'Chennai', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 26, 'city_name' => 'Coimbatore', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 26, 'city_name' => 'Madurai', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 26, 'city_name' => 'Tiruchirappalli', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Telangana (state_id = 27)
            ['state_id' => 27, 'city_name' => 'Hyderabad', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 27, 'city_name' => 'Warangal', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 27, 'city_name' => 'Nizamabad', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 27, 'city_name' => 'Karimnagar', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 27, 'city_name' => 'Khammam', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // Uttar Pradesh (state_id = 29)
            ['state_id' => 29, 'city_name' => 'Lucknow', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 29, 'city_name' => 'Kanpur', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 29, 'city_name' => 'Agra', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 29, 'city_name' => 'Varanasi', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 29, 'city_name' => 'Noida', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],

            // West Bengal (state_id = 32)
            ['state_id' => 32, 'city_name' => 'Kolkata', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 32, 'city_name' => 'Howrah', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 32, 'city_name' => 'Durgapur', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
            ['state_id' => 32, 'city_name' => 'Siliguri', 'is_deleted' => 0, 'created_by' => 'system', 'created_on' => now()],
        ];

        DB::table('city')->insert($cities);
    }
}
