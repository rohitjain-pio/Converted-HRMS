<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PreviousEmployer extends BaseModel
{
    protected $table = 'previous_employer';

    protected $fillable = [
        'employee_id', 'company_name', 'designation', 'employment_start_date',
        'employment_end_date', 'duration', 'reason_for_leaving', 'manager_name',
        'manager_contact', 'company_address', 'hr_name', 'hr_contact',
        'created_by', 'created_on', 'modified_by', 'modified_on', 'is_deleted'
    ];

    protected $casts = [
        'employment_start_date' => 'date',
        'employment_end_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function references(): HasMany
    {
        return $this->hasMany(ProfessionalReference::class, 'previous_employer_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PreviousEmployerDocument::class, 'previous_employer_id');
    }

    public function calculateDuration(): void
    {
        if ($this->employment_start_date && $this->employment_end_date) {
            $diff = $this->employment_start_date->diff($this->employment_end_date);
            $years = $diff->y;
            $months = $diff->m;
            
            $parts = [];
            if ($years > 0) $parts[] = "$years " . ($years == 1 ? 'year' : 'years');
            if ($months > 0) $parts[] = "$months " . ($months == 1 ? 'month' : 'months');
            
            $this->duration = implode(' ', $parts) ?: '0 months';
        }
    }
}
