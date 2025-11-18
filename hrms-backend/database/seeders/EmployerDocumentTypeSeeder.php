<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployerDocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Legacy: EmployerDocumentType table seed data
     * These are company-issued employment documents
     * Using doc_type_name and doc_type_code columns from actual schema
     */
    public function run(): void
    {
        $documentTypes = [
            [
                'id' => 1,
                'doc_type_name' => 'Offer Letter',
                'doc_type_code' => 'OFFLET',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 2,
                'doc_type_name' => 'Appointment Letter',
                'doc_type_code' => 'APPLET',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 3,
                'doc_type_name' => 'Experience Letter',
                'doc_type_code' => 'EXPLET',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 4,
                'doc_type_name' => 'Increment Letter',
                'doc_type_code' => 'INCLET',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 5,
                'doc_type_name' => 'Bank Statements',
                'doc_type_code' => 'BANSTA',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 6,
                'doc_type_name' => 'Cancelled Cheque',
                'doc_type_code' => 'CANCHE',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 7,
                'doc_type_name' => 'Past Salary Slips',
                'doc_type_code' => 'PASSAL',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 8,
                'doc_type_name' => 'Confirmation Letter',
                'doc_type_code' => 'CONLET',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 9,
                'doc_type_name' => 'Promotion Letter',
                'doc_type_code' => 'PROLET',
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
        ];

        // Clear existing data
        DB::table('employer_document_type')->truncate();
        
        // Insert legacy employer document types
        DB::table('employer_document_type')->insert($documentTypes);

        $this->command->info('Employer document types seeded successfully (9 types from legacy system)!');
    }
}

