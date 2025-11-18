<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class EmployeeData extends Model
{
    use HasApiTokens;

    protected $table = 'employee_data';
    public $timestamps = false;
    
    const CREATED_AT = 'created_on';
    const UPDATED_AT = 'modified_on';

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'father_name',
        'gender',
        'dob',
        'blood_group',
        'marital_status',
        'personal_email',
        'phone',
        'alternate_phone',
        'emergency_contact_person',
        'emergency_contact_no',
        'pan_number',
        'adhar_number',
        'pf_number',
        'esi_no',
        'has_esi',
        'has_pf',
        'uan_no',
        'passport_no',
        'passport_expiry',
        'pf_date',
        'nationality',
        'interest',
        'file_name',
        'file_original_name',
        'employee_code',
        'status',
        'refresh_token',
        'refresh_token_expiry_date',
        'created_by',
        'created_on',
        'modified_by',
        'modified_on',
        'is_deleted'
    ];

    protected $hidden = [
        'refresh_token',
    ];

    protected $casts = [
        'dob' => 'date',
        'has_esi' => 'boolean',
        'has_pf' => 'boolean',
        'uan_no' => 'boolean',
        'is_deleted' => 'boolean',
        'refresh_token_expiry_date' => 'datetime',
        'passport_expiry' => 'datetime',
        'pf_date' => 'datetime',
    ];

    // Relationships
    public function employmentDetail()
    {
        return $this->hasOne(EmploymentDetail::class, 'employee_id', 'id');
    }

    public function userRoleMapping()
    {
        return $this->hasOne(UserRoleMapping::class, 'employee_id', 'id');
    }

    // Module-2 Relationships
    public function addresses()
    {
        return $this->hasMany(Address::class, 'employee_id');
    }

    public function currentAddress()
    {
        return $this->hasOne(Address::class, 'employee_id')->where('address_type', 1);
    }

    public function permanentAddress()
    {
        return $this->hasOne(PermanentAddress::class, 'employee_id');
    }

    public function bankDetails()
    {
        return $this->hasMany(BankDetails::class, 'employee_id');
    }

    public function activeBankDetails()
    {
        return $this->hasOne(BankDetails::class, 'employee_id')
            ->where('is_active', 1)
            ->where('is_deleted', 0);
    }

    // Aliases for easier access in exports
    public function address()
    {
        return $this->currentAddress();
    }

    public function bankDetail()
    {
        return $this->activeBankDetails();
    }

    /**
     * Scope to get only active (non-deleted) employees
     */
    public function scopeActive($query)
    {
        return $query->where('is_deleted', 0);
    }

    public function documents()
    {
        return $this->hasMany(UserDocument::class, 'employee_id');
    }

    public function qualifications()
    {
        return $this->hasMany(UserQualificationInfo::class, 'employee_id');
    }

    public function certificates()
    {
        return $this->hasMany(UserCertificate::class, 'employee_id');
    }

    public function nominees()
    {
        return $this->hasMany(UserNomineeInfo::class, 'employee_id');
    }

    public function previousEmployers()
    {
        return $this->hasMany(PreviousEmployer::class, 'employee_id');
    }

    public function currentEmployerDocuments()
    {
        return $this->hasMany(CurrentEmployerDocument::class, 'employee_id');
    }

    // Accessor for full name
    public function getFullNameAttribute()
    {
        // Try legacy PascalCase columns first, then fall back to snake_case
        $firstName = $this->attributes['FirstName'] ?? $this->attributes['first_name'] ?? '';
        $middleName = $this->attributes['MiddleName'] ?? $this->attributes['middle_name'] ?? '';
        $lastName = $this->attributes['LastName'] ?? $this->attributes['last_name'] ?? '';
        return trim("$firstName $middleName $lastName");
    }
    
    // Accessor for password
    public function getPasswordAttribute()
    {
        return $this->attributes['Password'] ?? $this->attributes['password'] ?? null;
    }

    /**
     * Calculate profile completeness score (0-100%)
     * Based on 8 sections with weighted scoring
     * Feature from legacy system: Profile completeness tracking
     */
    public function calculateProfileCompleteness(): int
    {
        $sections = [
            'personal' => 20,
            'employment' => 15,
            'address' => 10,
            'bank' => 10,
            'documents' => 15,
            'education' => 10,
            'family' => 10,
            'nominee' => 10,
        ];

        $completed = 0;

        // Personal details (20%)
        if ($this->isPersonalDetailsComplete()) {
            $completed += $sections['personal'];
        }

        // Employment details (15%)
        if ($this->employmentDetail && $this->employmentDetail->isComplete()) {
            $completed += $sections['employment'];
        }

        // Address (10%)
        if ($this->currentAddress && $this->permanentAddress) {
            $completed += $sections['address'];
        }

        // Bank details (10%)
        if ($this->activeBankDetails) {
            $completed += $sections['bank'];
        }

        // Documents (15%) - At least 2 documents required
        if ($this->documents()->active()->count() >= 2) {
            $completed += $sections['documents'];
        }

        // Education (10%) - At least 1 qualification
        if ($this->qualifications()->active()->count() > 0) {
            $completed += $sections['education'];
        }

        // Nominee (10%) - Total percentage must = 100%
        if ($this->nominees()->active()->sum('percentage') == 100) {
            $completed += $sections['nominee'];
        }

        return $completed;
    }

    /**
     * Check if personal details section is complete
     */
    protected function isPersonalDetailsComplete(): bool
    {
        return !empty($this->first_name) &&
               !empty($this->last_name) &&
               !empty($this->dob) &&
               !empty($this->gender) &&
               !empty($this->phone) &&
               !empty($this->emergency_contact_person) &&
               !empty($this->emergency_contact_no);
    }

    /**
     * Generate next sequential employee code (EMP-0001, EMP-0002, ...)
     * Feature from legacy system: Sequential employee code generation
     */
    public static function generateNextEmployeeCode(): string
    {
        $lastEmployee = self::orderBy('id', 'desc')->first();
        
        if (!$lastEmployee || !$lastEmployee->employee_code) {
            return 'EMP0001';
        }

        // Extract number from format EMP-XXXX
        $lastCode = (int) substr($lastEmployee->employee_code, 4);
        $nextCode = $lastCode + 1;
        
        return 'EMP' . str_pad($nextCode, 4, '0', STR_PAD_LEFT);
    }
}
