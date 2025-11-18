<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AttendanceAudit extends Model
{
    protected $table = 'attendance_audit';
    public $timestamps = false;

    protected $fillable = [
        'attendance_id', 'action', 'time', 'comment', 'reason'
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    // REMOVED: Automatic timezone conversion accessors/mutators
    // Timezone conversion must happen explicitly at the service layer via TimezoneHelper
    // Database stores all times in UTC, matching legacy .NET behavior
    // Legacy: TimeZoneInfo.ConvertTimeFromUtc() is called explicitly when building response DTOs
}
