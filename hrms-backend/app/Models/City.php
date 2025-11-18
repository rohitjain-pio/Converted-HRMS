<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class City extends BaseModel
{
    protected $table = 'city';

    protected $fillable = [
        'state_id', 'country_id', 'city_name', 'created_by',
        'created_on', 'modified_by', 'modified_on', 'is_deleted'
    ];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class, 'state_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }
}
