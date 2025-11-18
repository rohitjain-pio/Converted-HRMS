<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends BaseModel
{
    protected $table = 'address';

    protected $fillable = [
        'employee_id',
        'line1',
        'line2',
        'city_id',
        'country_id',
        'state_id',
        'address_type',
        'pincode',
        'created_by',
        'created_on',
        'modified_by',
        'modified_on',
        'is_deleted'
    ];

    // Relationships
    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class, 'state_id');
    }

    // Scopes
    public function scopeCurrent($query)
    {
        return $query->where('address_type', 1);
    }

    // Accessors
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->line1,
            $this->line2,
            $this->city?->city_name,
            $this->state?->state_name,
            $this->country?->country_name,
            $this->pincode
        ]);
        
        return implode(', ', $parts);
    }
}
