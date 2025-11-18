<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCertificate extends BaseModel
{
    protected $table = 'user_certificate';

    protected $fillable = [
        'employee_id', 'certificate_name', 'certificate_expiry',
        'file_name', 'file_original_name', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];

    protected $casts = [
        'certificate_expiry' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function scopeExpiring($query, int $days = 30)
    {
        return $query->whereNotNull('certificate_expiry')
            ->where('certificate_expiry', '<=', now()->addDays($days))
            ->where('certificate_expiry', '>=', now());
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('certificate_expiry')
            ->where('certificate_expiry', '<', now());
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->certificate_expiry && $this->certificate_expiry < now();
    }
}
