<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resignation extends Model
{
    protected $table = 'resignation';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'EmployeeId', 'DepartmentID', 'ReportingManagerId', 'LastWorkingDay', 'Reason', 
        'ExitDiscussion', 'Status', 'Process', 'ProcessedBy', 'ProcessedAt', 
        'SettlementStatus', 'SettlementDate', 'IsActive', 'EarlyReleaseDate', 
        'IsEarlyRequestRelease', 'IsEarlyRequestApproved', 'EarlyReleaseStatus', 
        'KTStatus', 'ExitInterviewStatus', 'ITDues', 'AccountNoDue', 
        'RejectResignationReason', 'RejectEarlyReleaseReason', 
        'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy'
    ];

    protected $casts = [
        'LastWorkingDay' => 'date',
        'ProcessedAt' => 'datetime',
        'SettlementDate' => 'datetime',
        'EarlyReleaseDate' => 'datetime',
        'ExitDiscussion' => 'boolean',
        'IsActive' => 'boolean',
        'IsEarlyRequestRelease' => 'boolean',
        'IsEarlyRequestApproved' => 'boolean',
        'KTStatus' => 'boolean',
        'ExitInterviewStatus' => 'boolean',
        'ITDues' => 'boolean',
        'AccountNoDue' => 'boolean',
        'CreatedOn' => 'datetime',
        'ModifiedOn' => 'datetime',
    ];

    // Relationship: Resignation has one HR Clearance
    public function hrClearance()
    {
        return $this->hasOne(HRClearance::class, 'ResignationId', 'Id');
    }

    // Relationship: Resignation has one Department Clearance
    public function departmentClearance()
    {
        return $this->hasOne(DepartmentClearance::class, 'ResignationId', 'Id');
    }

    // Relationship: Resignation has one IT Clearance
    public function itClearance()
    {
        return $this->hasOne(ITClearance::class, 'ResignationId', 'Id');
    }

    // Relationship: Resignation has one Account Clearance
    public function accountClearance()
    {
        return $this->hasOne(AccountClearance::class, 'ResignationId', 'Id');
    }

    // Relationship: Resignation has many History entries
    public function history()
    {
        return $this->hasMany(ResignationHistory::class, 'ResignationId', 'Id');
    }

    // Relationship: Resignation belongs to an Employee
    public function employee()
    {
        return $this->belongsTo(EmployeeData::class, 'EmployeeId', 'id');
    }

    // Relationship: Resignation belongs to a Department
    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentID', 'id');
    }

    // Relationship: Resignation belongs to a Reporting Manager (Employee)
    public function reportingManager()
    {
        return $this->belongsTo(EmployeeData::class, 'ReportingManagerId', 'id');
    }

    // Relationship: Resignation processed by Employee
    public function processedByEmployee()
    {
        return $this->belongsTo(EmployeeData::class, 'ProcessedBy', 'id');
    }
}
