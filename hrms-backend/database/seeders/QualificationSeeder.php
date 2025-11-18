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

        // Insert employer document types
        $empDocTypes = [
            ['doc_type_name' => 'Appointment Letter', 'doc_type_code' => 'APL'],
            ['doc_type_name' => 'Relieving Letter', 'doc_type_code' => 'REL'],
            ['doc_type_name' => 'Experience Certificate', 'doc_type_code' => 'EXP'],
            ['doc_type_name' => 'Salary Slip', 'doc_type_code' => 'SAL'],
            ['doc_type_name' => 'Offer Letter', 'doc_type_code' => 'OFF'],
            ['doc_type_name' => 'Pay Stub', 'doc_type_code' => 'PAY'],
        ];

        foreach ($empDocTypes as $docType) {
            DB::table('employer_document_type')->insert([
                'doc_type_name' => $docType['doc_type_name'],
                'doc_type_code' => $docType['doc_type_code'],
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }
    }
}
