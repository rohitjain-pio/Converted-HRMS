<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetCondition extends Model
{
    protected $table = 'asset_condition';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'Id', 'Status', 'CreatedBy', 'CreatedOn'
    ];

    protected $casts = [
        'CreatedOn' => 'datetime',
    ];

    // Relationship: Asset Condition has many IT Clearances
    public function itClearances()
    {
        return $this->hasMany(ITClearance::class, 'AssetCondition', 'Id');
    }
}
