<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDocument extends BaseModel
{
    protected $table = 'user_document';

    protected $fillable = [
        'employee_id', 'document_type_id', 'document_no',
        'document_expiry', 'file_name', 'file_original_name',
        'created_by', 'created_on', 'modified_by', 'modified_on',
        'is_deleted'
    ];

    protected $casts = [
        'document_expiry' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }

    public function scopeExpiring($query, int $days = 30)
    {
        return $query->whereNotNull('document_expiry')
            ->where('document_expiry', '<=', now()->addDays($days))
            ->where('document_expiry', '>=', now());
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('document_expiry')
            ->where('document_expiry', '<', now());
    }
}
