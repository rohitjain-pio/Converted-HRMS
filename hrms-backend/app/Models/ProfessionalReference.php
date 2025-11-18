<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfessionalReference extends BaseModel
{
    protected $table = 'professional_reference';

    protected $fillable = [
        'previous_employer_id', 'reference_name', 'designation', 'company_name',
        'contact_number', 'email', 'relationship_with_reference',
        'verification_status', 'verification_date', 'verification_notes',
        'created_by', 'created_on', 'modified_by', 'modified_on', 'is_deleted'
    ];

    protected $casts = [
        'verification_date' => 'datetime',
    ];

    public function previousEmployer(): BelongsTo
    {
        return $this->belongsTo(PreviousEmployer::class, 'previous_employer_id');
    }

    public function scopePending($query)
    {
        return $query->where('verification_status', 1);
    }

    public function scopeCompleted($query)
    {
        return $query->where('verification_status', 3);
    }

    public function getVerificationStatusTextAttribute(): string
    {
        return match($this->verification_status) {
            1 => 'Pending',
            2 => 'In Progress',
            3 => 'Completed',
            4 => 'Not Responding',
            default => 'Unknown'
        };
    }
}
