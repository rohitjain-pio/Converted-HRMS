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
            ['id' => 1, 'document_name' => 'Offer Letter', 'document_for' => 2, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['id' => 2, 'document_name' => 'Appointment Letter', 'document_for' => 2, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['id' => 3, 'document_name' => 'Experience Letter', 'document_for' => 1, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['id' => 4, 'document_name' => 'Increment Letter', 'document_for' => 2, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['id' => 5, 'document_name' => 'Bank Statements', 'document_for' => 1, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['id' => 6, 'document_name' => 'Cancelled Cheque', 'document_for' => 2, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['id' => 7, 'document_name' => 'Past Salary Slips', 'document_for' => 1, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['id' => 8, 'document_name' => 'Confirmation Letter', 'document_for' => 2, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
            ['id' => 9, 'document_name' => 'Promotion Letter', 'document_for' => 2, 'created_by' => 'system', 'created_on' => now(), 'is_deleted' => 0],
        ];

        DB::table('employer_document_type')->insert($documentTypes);
    }
}

