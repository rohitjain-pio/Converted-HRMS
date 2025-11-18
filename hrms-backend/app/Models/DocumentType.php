<?php

namespace App\Models;

class DocumentType extends BaseModel
{
    protected $table = 'document_type';

    protected $fillable = [
        'document_name', 'id_proof_for', 'created_by',
        'created_on', 'modified_by', 'modified_on', 'is_deleted'
    ];

    public function getProofTypeTextAttribute(): string
    {
        return match($this->id_proof_for) {
            1 => 'ID Proof',
            2 => 'Address Proof',
            3 => 'Both',
            default => 'Unknown'
        };
    }
}
