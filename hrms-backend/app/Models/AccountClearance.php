<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountClearance extends Model
{
    protected $table = 'account_clearance';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'ResignationId', 'FnFStatus', 'FnFAmount', 'IssueNoDueCertificate', 
        'Note', 'AccountAttachment', 'FileOriginalName', 
        'CreatedBy', 'CreatedOn', 'ModifiedBy', 'ModifiedOn'
    ];

    protected $casts = [
        'FnFStatus' => 'boolean',
        'FnFAmount' => 'decimal:2',
        'IssueNoDueCertificate' => 'boolean',
        'CreatedOn' => 'datetime',
        'ModifiedOn' => 'datetime',
    ];

    // Relationship: Account Clearance belongs to Resignation
    public function resignation()
    {
        return $this->belongsTo(Resignation::class, 'ResignationId', 'Id');
    }
}
