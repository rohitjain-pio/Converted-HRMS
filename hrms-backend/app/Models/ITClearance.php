<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ITClearance extends Model
{
    protected $table = 'it_clearance';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'ResignationId', 'AccessRevoked', 'AssetReturned', 'AssetCondition', 
        'AttachmentUrl', 'Note', 'ITClearanceCertification', 'FileOriginalName', 
        'CreatedBy', 'CreatedOn', 'ModifiedBy', 'ModifiedOn'
    ];

    protected $casts = [
        'AccessRevoked' => 'boolean',
        'AssetReturned' => 'boolean',
        'ITClearanceCertification' => 'boolean',
        'CreatedOn' => 'datetime',
        'ModifiedOn' => 'datetime',
    ];

    // Relationship: IT Clearance belongs to Resignation
    public function resignation()
    {
        return $this->belongsTo(Resignation::class, 'ResignationId', 'Id');
    }

    // Relationship: IT Clearance has one Asset Condition
    public function assetConditionDetails()
    {
        return $this->belongsTo(AssetCondition::class, 'AssetCondition', 'Id');
    }
}
