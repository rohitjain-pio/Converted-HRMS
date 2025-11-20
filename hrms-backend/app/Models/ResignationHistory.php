<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResignationHistory extends Model
{
    protected $table = 'resignation_history';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'ResignationId', 'ResignationStatus', 'EarlyReleaseStatus', 'CreatedOn', 'CreatedBy'
    ];

    protected $casts = [
        'CreatedOn' => 'datetime',
    ];

    // Relationship: History belongs to Resignation
    public function resignation()
    {
        return $this->belongsTo(Resignation::class, 'ResignationId', 'Id');
    }
}
