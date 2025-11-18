<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class State extends BaseModel
{
    protected $table = 'state';

    protected $fillable = [
        'country_id', 'state_name', 'state_code', 'created_by',
        'created_on', 'modified_by', 'modified_on', 'is_deleted'
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class, 'state_id');
    }
}
