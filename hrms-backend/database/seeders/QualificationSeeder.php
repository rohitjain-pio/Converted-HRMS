<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QualificationSeeder extends Seeder
{
    /**
     * Seed qualifications and universities from legacy system
     */
    public function run(): void
    {
        // Insert qualifications
        $qualifications = [
            'B.Tech',
            'B.E.',
            'BCA',
            'MCA',
            'M.Tech',
            'M.E.',
            'MBA',
            'B.Com',
            'M.Com',
            'B.Sc',
            'M.Sc',
            'BBA',
            'Diploma',
            '12th',
            '10th',
        ];

        foreach ($qualifications as $qual) {
            DB::table('qualification')->insert([
                'qualification_name' => $qual,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }

        // Insert universities
        $universities = [
            'Anna University',
            'VTU (Visvesvaraya Technological University)',
            'Mumbai University',
            'Delhi University',
            'Pune University',
            'JNTU (Jawaharlal Nehru Technological University)',
            'Osmania University',
            'Bangalore University',
            'Madras University',
            'Calcutta University',
            'IIT (Indian Institute of Technology)',
            'NIT (National Institute of Technology)',
            'BITS Pilani',
            'Other',
        ];

        foreach ($universities as $univ) {
            DB::table('university')->insert([
                'university_name' => $univ,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }

        // Insert relationships
        $relationships = [
            'Father',
            'Mother',
            'Spouse',
            'Son',
            'Daughter',
            'Brother',
            'Sister',
            'Guardian',
        ];

        foreach ($relationships as $rel) {
            DB::table('relationship')->insert([
                'relationship_name' => $rel,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }
    }
}
