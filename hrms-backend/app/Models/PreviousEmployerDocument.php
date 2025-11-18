<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreviousEmployerDocument extends BaseModel
{
    protected $table = 'previous_employer_document';

    protected $fillable = [
        'previous_employer_id', 'document_type_id', 'file_name',
        'file_original_name', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];

    public function previousEmployer(): BelongsTo
    {
        return $this->belongsTo(PreviousEmployer::class, 'previous_employer_id');
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(EmployerDocumentType::class, 'document_type_id');
    }
}
