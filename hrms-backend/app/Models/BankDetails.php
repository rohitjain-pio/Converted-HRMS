<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class BankDetails extends BaseModel
{
    protected $table = 'bank_details';

    protected $fillable = [
        'employee_id', 'bank_name', 'account_no', 'branch_name',
        'ifsc_code', 'is_active', 'created_by', 'created_on',
        'modified_by', 'modifiedon', 'is_deleted'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'modifiedon' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    // Mutator: Encrypt account number before saving
    public function setAccountNoAttribute($value)
    {
        if ($value) {
            $this->attributes['account_no'] = Crypt::encryptString($value);
        }
    }

    // Accessor: Decrypt account number
    public function getAccountNoAttribute($value)
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    // Get masked account number (XXXX1234)
    public function getMaskedAccountNoAttribute(): ?string
    {
        $accountNo = $this->account_no;
        if (!$accountNo) return null;
        
        $length = strlen($accountNo);
        if ($length <= 4) return str_repeat('X', $length);
        
        return str_repeat('X', $length - 4) . substr($accountNo, -4);
    }

    public function scopeActive($query)
    {
        return parent::scopeActive($query)->where('is_active', 1);
    }
}
