<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNomineeInfo extends BaseModel
{
    protected $table = 'user_nominee_info';

    protected $fillable = [
        'employee_id', 'nominee_name', 'relationship_id', 'dob',
        'contact_no', 'address', 'percentage', 'nominee_type',
        'is_nominee_minor', 'care_of', 'file_name', 'file_original_name',
        'created_by', 'created_on', 'modified_by', 'modified_on', 'is_deleted'
    ];

    protected $casts = [
        'dob' => 'date',
        'percentage' => 'decimal:2',
        'is_nominee_minor' => 'boolean',
    ];

    protected $appends = ['age'];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function relationship(): BelongsTo
    {
        return $this->belongsTo(Relationship::class, 'relationship_id');
    }

    /**
     * Validate that total percentage for employee = 100%
     * CRITICAL: This is a key business rule from legacy system
     */
    public static function validateTotalPercentage(int $employeeId, ?int $excludeNomineeId = null): bool
    {
        $query = self::where('employee_id', $employeeId)
            ->where('is_deleted', 0);
        
        if ($excludeNomineeId) {
            $query->where('id', '!=', $excludeNomineeId);
        }
        
        $total = $query->sum('percentage');
        
        return $total == 100;
    }

    /**
     * Get remaining percentage available for employee
     */
    public static function getRemainingPercentage(int $employeeId, ?int $excludeNomineeId = null): float
    {
        $query = self::where('employee_id', $employeeId)
            ->where('is_deleted', 0);
        
        if ($excludeNomineeId) {
            $query->where('id', '!=', $excludeNomineeId);
        }
        
        $total = $query->sum('percentage');
        
        return 100 - $total;
    }

    public function getAgeAttribute(): ?int
    {
        return $this->dob ? $this->dob->age : null;
    }
}
