<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';
    public $timestamps = false;

    protected $fillable = [
        'employee_id', 'date', 'start_time', 'end_time', 'day',
        'attendance_type', 'total_hours', 'location', 'created_on',
        'created_by', 'modified_by', 'modified_on'
    ];

    protected $casts = [
        'date' => 'date',
        // Don't cast time columns to datetime - they are TIME columns storing UTC values
        // Conversion to IST happens at the service layer via TimezoneHelper
        'created_on' => 'datetime',
        'modified_on' => 'datetime'
    ];

    // Relationships
    public function employee()
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function audits()
    {
        return $this->hasMany(AttendanceAudit::class);
    }

    // Scopes
    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // REMOVED: Automatic timezone conversion accessors/mutators
    // Timezone conversion must happen explicitly at the service layer via TimezoneHelper
    // Database stores all times in UTC, matching legacy .NET behavior
    // Legacy: TimeZoneInfo.ConvertTimeFromUtc() is called explicitly when building response DTOs
}
