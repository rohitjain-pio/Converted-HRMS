# Module 3 — Attendance Management Migration Plan (Part 1)

**Version:** v1.0.0  
**Date:** November 13, 2025  
**Migration Type:** React + .NET → Vue.js + Laravel  

---

## 📋 Verification Checklist

✅ **Completed Analysis:**
- [x] Confirmed database entities and relationships in `HRMS_Script.sql` (Attendance, AttendanceAudit, AttendanceConfig tables)  
- [x] Verified .NET controllers and routes in `@Legacy-folder/Backend` (AttendanceController with 9 endpoints)  
- [x] Cross-checked React components in `@Legacy-folder/Frontend` (AttendanceTable, TimeInDialog, TimeOutDialog)  
- [x] Validated UI/UX layout and behavior from `@docs/ui-design/03-attendance-management-ui.md`  
- [x] Confirmed dependent modules and data flows (Employee Management, Time Doctor API)

---

## 🎯 Module Overview

### Purpose and Scope
**Module 3 — Attendance Management** provides comprehensive time tracking capabilities for employees through dual modes: automatic Time Doctor integration for productivity tracking and manual attendance entry for employees without Time Doctor access. The module maintains complete attendance records including work hours, time in/out, location tracking, and comprehensive audit trails.

### Core Functionalities
1. **Manual Attendance Entry** - Daily time logging with validation
2. **Automatic Time Doctor Sync** - Scheduled API integration for time tracking
3. **Attendance Configuration Management** - Per-employee mode toggle (Manual/Automatic)
4. **Audit Trail Management** - Complete action logging (Time In/Out/Break/Resume)
5. **Attendance Reporting** - Manager/HR reports with Excel export
6. **Time Zone Management** - IST to UTC conversion for global operations

### Module Dependencies
- **Employee Management Module** - Employee master data and employment details
- **Authentication Module** - User permissions and role-based access
- **Time Doctor External API** - Automatic timesheet synchronization
- **Notification System** - Alerts and status updates (implied)

### Technology Stack Mapping
| Legacy Technology | Target Technology | Migration Notes |
|-------------------|------------------|------------------|
| .NET 6 Web API | Laravel 11 API | RESTful endpoint mapping |
| Entity Framework | Eloquent ORM | Model relationship preservation |
| SQL Server | MySQL 8+ | Schema migration with data types |
| React 18 | Vue.js 3 | Component composition API |
| Material-UI v6.5.0 | Vuetify 3 | Design system consistency |
| Redux | Pinia | State management pattern |
| React Hook Form | VeeValidate | Form validation library |
| Axios | Axios (Vue) | HTTP client consistency |

---

## 🗄️ Database Migration Plan

### Verified Database Schema
Based on analysis of `Tables.md` and repository code, the following tables are confirmed:

#### 1. Attendance Table
```sql
-- Primary attendance record table
Table: Attendance
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, FK → EmployeeData.Id)
├── Date (date, NOT NULL) 
├── StartTime (time(7), NULL)
├── EndTime (time(7), NULL)
├── Day (varchar(50), NULL) -- Monday, Tuesday, etc.
├── AttendanceType (varchar(30), NULL) -- "Manual" or "TimeDoctor"
├── TotalHours (varchar(50), NULL) -- Format: "08:30"
├── Location (varchar(255), NULL)
├── CreatedOn (datetime, DEFAULT getdate())
├── CreatedBy (nvarchar(255), NULL)
├── ModifiedBy (nvarchar(255), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL, DEFAULT 0)
```

#### 2. AttendanceAudit Table
```sql
-- Audit trail for attendance actions
Table: AttendanceAudit  
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Action (varchar(255), NOT NULL) -- "Time In", "Time Out", "Break", "Resume"
├── Time (varchar(50), NOT NULL) -- Format: "09:30"
├── Comment (text, NULL)
├── Reason (text, NULL)
├── AttendanceId (bigint, FK → Attendance.Id)
└── IsDeleted (bit, NOT NULL, DEFAULT 0)
```

#### 3. EmploymentDetail Table (Attendance Configuration)
```sql
-- Contains attendance configuration per employee
Relevant Fields in EmploymentDetail:
├── IsManualAttendance (bit, NOT NULL, DEFAULT 0)
├── TimeDoctorUserId (varchar(20), NULL)
-- Other employment fields...
```

### Laravel Migration Files Required

#### 1. Create Attendance Migration
```php
// database/migrations/2024_11_13_000001_create_attendance_table.php
Schema::create('attendance', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('employee_id');
    $table->date('date');
    $table->time('start_time')->nullable();
    $table->time('end_time')->nullable();
    $table->string('day', 50)->nullable();
    $table->string('attendance_type', 30)->nullable();
    $table->string('total_hours', 50)->nullable();
    $table->string('location', 255)->nullable();
    $table->timestamp('created_on')->useCurrent();
    $table->string('created_by', 255)->nullable();
    $table->string('modified_by', 255)->nullable();
    $table->timestamp('modified_on')->nullable();
    $table->boolean('is_deleted')->default(false);
    
    $table->foreign('employee_id')->references('id')->on('employee_data');
    $table->index(['employee_id', 'date']);
    $table->index('attendance_type');
});
```

#### 2. Create AttendanceAudit Migration  
```php
// database/migrations/2024_11_13_000002_create_attendance_audit_table.php
Schema::create('attendance_audit', function (Blueprint $table) {
    $table->id();
    $table->string('action', 255);
    $table->string('time', 50);
    $table->text('comment')->nullable();
    $table->text('reason')->nullable();
    $table->unsignedBigInteger('attendance_id')->nullable();
    $table->boolean('is_deleted')->default(false);
    
    $table->foreign('attendance_id')->references('id')->on('attendance');
    $table->index('attendance_id');
});
```

#### 3. Update EmploymentDetail Migration
```php
// Add attendance configuration fields to existing employment_detail table
Schema::table('employment_detail', function (Blueprint $table) {
    $table->boolean('is_manual_attendance')->default(false);
    $table->string('time_doctor_user_id', 20)->nullable();
    
    $table->index('is_manual_attendance');
});
```

### Data Migration Strategy
1. **Preserve Legacy Data** - Exact field mapping without transformation
2. **Timezone Consistency** - Maintain UTC storage, convert IST for display
3. **Foreign Key Integrity** - Verify all employee references exist
4. **Audit Trail Preservation** - Migrate all historical audit records
5. **Configuration Migration** - Map attendance settings per employee

---

## 🔧 Backend Migration Plan (Laravel)

### 1. .NET to Laravel Controller Mapping

#### Verified .NET Endpoints → Laravel Routes
Based on `AttendanceController.cs` analysis:

```php
// routes/api.php - Attendance Management Routes
Route::middleware('auth:sanctum')->prefix('attendance')->group(function () {
    // Employee Attendance CRUD
    Route::post('add-attendance/{employeeId}', [AttendanceController::class, 'addAttendance'])
        ->middleware('permission:attendance.create');
        
    Route::get('get-attendance/{employeeId}', [AttendanceController::class, 'getAttendance'])
        ->middleware('permission:attendance.read');
        
    Route::put('update-attendance/{employeeId}/{attendanceId}', [AttendanceController::class, 'updateAttendance'])
        ->middleware('permission:attendance.edit');
    
    // Configuration Management
    Route::put('update-config', [AttendanceController::class, 'updateConfig'])
        ->middleware('permission:attendance.admin');
        
    Route::post('get-attendance-config-list', [AttendanceController::class, 'getAttendanceConfigList'])
        ->middleware('permission:attendance.admin');
    
    // Reporting
    Route::post('get-employee-report', [AttendanceController::class, 'getEmployeeReport'])
        ->middleware('permission:attendance.report');
        
    Route::post('export-employee-report-excel', [AttendanceController::class, 'exportEmployeeReportExcel'])
        ->middleware('permission:attendance.export');
    
    // Utility & Integration
    Route::get('get-employee-code-and-name-list', [AttendanceController::class, 'getEmployeeCodeAndNameList'])
        ->middleware('permission:attendance.read');
        
    Route::post('trigger-fetch-timesheet-summary-stats', [AttendanceController::class, 'triggerTimeDoctorSync'])
        ->middleware('permission:attendance.admin');
});
```

### 2. Laravel Eloquent Models

#### Attendance Model
```php
<?php
// app/Models/Attendance.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attendance extends Model
{
    use SoftDeletes;
    
    protected $table = 'attendance';
    
    protected $fillable = [
        'employee_id', 'date', 'start_time', 'end_time', 
        'day', 'attendance_type', 'total_hours', 'location',
        'created_by', 'modified_by'
    ];
    
    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'created_on' => 'datetime',
        'modified_on' => 'datetime',
        'is_deleted' => 'boolean'
    ];
    
    // Relationships
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
    
    public function audits()
    {
        return $this->hasMany(AttendanceAudit::class, 'attendance_id');
    }
    
    // Accessors
    public function getTotalHoursFormattedAttribute()
    {
        if ($this->start_time && $this->end_time) {
            $start = Carbon::parse($this->start_time);
            $end = Carbon::parse($this->end_time);
            return $start->diffForHumans($end, true);
        }
        return null;
    }
    
    // Scopes
    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }
    
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('attendance_type', $type);
    }
}
```

#### AttendanceAudit Model
```php
<?php
// app/Models/AttendanceAudit.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceAudit extends Model
{
    protected $table = 'attendance_audit';
    
    protected $fillable = [
        'attendance_id', 'action', 'time', 'comment', 'reason'
    ];
    
    protected $casts = [
        'is_deleted' => 'boolean'
    ];
    
    public function attendance()
    {
        return $this->belongsTo(Attendance::class, 'attendance_id');
    }
    
    // Scope for common audit actions
    public function scopeTimeInActions($query)
    {
        return $query->where('action', 'Time In');
    }
    
    public function scopeTimeOutActions($query)
    {
        return $query->where('action', 'Time Out');
    }
}
```

**[Continued in Part 2...]**

---

## 📄 Changelog
**Version:** v1.0.0  
**Date:** November 13, 2025  
**Changes:**  
- Initial migration plan created for Module 3 - Attendance Management
- Verified database schema and relationships from legacy system
- Mapped .NET controllers to Laravel routes with permission middleware
- Created Eloquent models with relationships and business logic
- Part 1 covers: Module Overview, Database Migration, and Backend Planning foundation

**Next in Part 2:**
- Complete Laravel Controller implementation
- Vue.js component migration strategy  
- Frontend state management with Pinia
- API integration layer and service mapping