<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepartmentClearance extends Model
{
    protected $table = 'department_clearance';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'ResignationId', 'KTStatus', 'KTNotes', 'Attachment', 'KTUsers', 
        'FileOriginalName', 'CreatedBy', 'CreatedOn', 'ModifiedBy', 'ModifiedOn'
    ];

    protected $casts = [
        'CreatedOn' => 'datetime',
        'ModifiedOn' => 'datetime',
    ];

    // Relationship: Department Clearance belongs to Resignation
    public function resignation()
    {
        return $this->belongsTo(Resignation::class, 'ResignationId', 'Id');
    }
}
