<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurrentEmployerDocument extends BaseModel
{
    protected $table = 'current_employer_document';

    protected $fillable = [
        'employee_id', 'document_type_id', 'file_name',
        'file_original_name', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(EmployerDocumentType::class, 'document_type_id');
    }
}
