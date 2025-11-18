<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploymentDetail extends Model
{
    protected $table = 'employment_details';
    public $timestamps = false;
    
    const CREATED_AT = 'created_on';
    const UPDATED_AT = 'modified_on';

    protected $fillable = [
        'employee_id',
        'email',
        'joining_date',
        'designation',
        'designation_id',
        'department_id',
        'department_name',
        'team_id',
        'team_name',
        'role_id',
        'reporting_manger_id',
        'immediate_manager',
        'reporting_manager_name',
        'reporting_manager_email',
        'job_type',
        'employment_status',
        'employee_status',
        'linked_in_url',
        'branch_id',
        'background_verificationstatus',
        'criminal_verification',
        'total_experience_year',
        'total_experience_month',
        'relevant_experience_year',
        'relevant_experience_month',
        'probation_months',
        'confirmation_date',
        'extended_confirmation_date',
        'is_prob_extended',
        'prob_extended_weeks',
        'is_confirmed',
        'exit_date',
        'is_manual_attendance',
        'time_doctor_user_id',
        'is_reporting_manager',
        'is_deleted',
        'created_by',
        'created_on',
        'modified_by',
        'modified_on'
    ];

    protected $casts = [
        'joining_date' => 'date',
        'confirmation_date' => 'date',
        'extended_confirmation_date' => 'date',
        'exit_date' => 'date',
        'is_deleted' => 'boolean',
        'is_manual_attendance' => 'boolean',
        'is_prob_extended' => 'boolean',
        'is_confirmed' => 'boolean',
        'is_reporting_manager' => 'boolean',
        'criminal_verification' => 'boolean',
    ];

    // Relationships
    public function employee()
    {
        return $this->belongsTo(EmployeeData::class, 'EmployeeId', 'Id');
    }

    public function reportingManager()
    {
        return $this->belongsTo(EmployeeData::class, 'ReportingMangerId', 'Id');
    }

    public function immediateManager()
    {
        return $this->belongsTo(EmployeeData::class, 'ImmediateManager', 'Id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'RoleId', 'Id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    public function designationModel()
    {
        return $this->belongsTo(Designation::class, 'designation_id', 'id');
    }

    // Alias for easier access
    public function designation()
    {
        return $this->belongsTo(Designation::class, 'designation_id', 'id');
    }

    /**
     * Check if employment details are complete
     */
    public function isComplete(): bool
    {
        return !empty($this->email) && 
               !empty($this->joining_date) && 
               !empty($this->department_id) && 
               !empty($this->designation);
    }
}
