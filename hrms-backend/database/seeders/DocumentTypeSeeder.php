<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Seed document types from legacy system
     * Legacy: DocumentType table - ID proof documents for employees
     * id_proof_for values:
     * 1 = Address Proof (Passport, Voter Card, Driving License)
     * 2 = Age/DOB Proof (Birth Certificate)
     * 3 = Identity Proof (PAN Card, Aadhar Card)
     */
    public function run(): void
    {
        $documentTypes = [
            [
                'id' => 1,
                'document_name' => 'PAN Card',
                'id_proof_for' => 3, // Identity Proof
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 2,
                'document_name' => 'Aadhar Card',
                'id_proof_for' => 3, // Identity Proof
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 3,
                'document_name' => 'Passport',
                'id_proof_for' => 1, // Address Proof
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 4,
                'document_name' => 'Voter Card',
                'id_proof_for' => 1, // Address Proof
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 5,
                'document_name' => 'Driving License',
                'id_proof_for' => 1, // Address Proof
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
            [
                'id' => 6,
                'document_name' => 'Birth Certificate',
                'id_proof_for' => 2, // Age/DOB Proof
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0,
            ],
        ];

        // Clear existing data
        DB::table('document_type')->truncate();
        
        // Insert legacy document types
        DB::table('document_type')->insert($documentTypes);

        $this->command->info('Document types seeded successfully (6 types from legacy system)!');
    }
}
