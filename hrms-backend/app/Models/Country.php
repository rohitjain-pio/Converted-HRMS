<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends BaseModel
{
    protected $table = 'country';

    protected $fillable = [
        'country_name', 'country_code', 'created_by',
        'created_on', 'modified_by', 'modified_on', 'is_deleted'
    ];

    public function states(): HasMany
    {
        return $this->hasMany(State::class, 'country_id');
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class, 'country_id');
    }
}
