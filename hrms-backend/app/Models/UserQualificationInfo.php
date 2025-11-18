<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserQualificationInfo extends BaseModel
{
    protected $table = 'user_qualification_info';

    protected $fillable = [
        'employee_id', 'qualification_id', 'university_id', 'degree_name',
        'college_name', 'aggregate_percentage', 'year_from', 'year_to',
        'file_name', 'file_original_name', 'created_by', 'created_on',
        'modified_by', 'modified_on', 'is_deleted'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function qualification(): BelongsTo
    {
        return $this->belongsTo(Qualification::class, 'qualification_id');
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id');
    }

    public function getDurationAttribute(): ?string
    {
        if ($this->year_from && $this->year_to) {
            $years = $this->year_to - $this->year_from;
            return $years > 1 ? "$years years" : "$years year";
        }
        return null;
    }
}
