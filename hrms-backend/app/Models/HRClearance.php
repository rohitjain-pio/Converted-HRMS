<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HRClearance extends Model
{
    protected $table = 'hr_clearance';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'ResignationId', 'AdvanceBonusRecoveryAmount', 'ServiceAgreementDetails', 
        'CurrentEL', 'NumberOfBuyOutDays', 'ExitInterviewStatus', 'ExitInterviewDetails', 
        'Attachment', 'FileOriginalName', 'CreatedBy', 'CreatedOn', 'ModifiedBy', 'ModifiedOn'
    ];

    protected $casts = [
        'AdvanceBonusRecoveryAmount' => 'decimal:2',
        'CurrentEL' => 'decimal:2',
        'ExitInterviewStatus' => 'boolean',
        'CreatedOn' => 'datetime',
        'ModifiedOn' => 'datetime',
    ];

    // Relationship: HR Clearance belongs to Resignation
    public function resignation()
    {
        return $this->belongsTo(Resignation::class, 'ResignationId', 'Id');
    }
}
