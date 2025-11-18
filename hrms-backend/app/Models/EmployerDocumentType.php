<?php

namespace App\Models;

class EmployerDocumentType extends BaseModel
{
    protected $table = 'employer_document_type';

    protected $fillable = [
        'document_name', 'document_for', 'created_by',
        'created_on', 'modified_by', 'modified_on', 'is_deleted'
    ];

    public function scopePreviousEmployer($query)
    {
        return $query->where('document_for', 1);
    }

    public function scopeCurrentEmployer($query)
    {
        return $query->where('document_for', 2);
    }

    public function getDocumentForTextAttribute(): string
    {
        return match($this->document_for) {
            1 => 'Previous Employer',
            2 => 'Current Employer',
            default => 'Unknown'
        };
    }
}
