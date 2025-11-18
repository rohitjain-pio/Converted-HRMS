# Time Doctor Integration

## Overview
The Time Doctor integration automatically syncs attendance data from Time Doctor API to the HRMS system. This matches the exact flow from the legacy .NET application.

## Configuration

### Environment Variables (.env)
```env
TIMEDOCTOR_BASE_URL=https://api2.timedoctor.com/api/1.0/users
TIMEDOCTOR_SUMMARY_STATS_URL=https://api2.timedoctor.com/api/1.1/stats/timesheet/summary
TIMEDOCTOR_API_TOKEN=1exWaNOv3mvcgpPV5e2hIcuWfmvrSLBi0Sc_X1RwKQAM
TIMEDOCTOR_COMPANY_ID=YfQJah6-uiOk6nqu
```

## Features

### 1. Automatic Daily Sync
- **Schedule**: Daily at 5:00 AM
- **Purpose**: Automatically fetch previous day's timesheet data from Time Doctor
- **Command**: `php artisan attendance:fetch-timedoctor`
- **Legacy Reference**: `FetchTimeDoctorTimeSheetJob` (cron: "0 0 5 ? * *")

### 2. Manual Trigger via API
- **Endpoint**: `POST /api/attendance/trigger-timesheet-sync`
- **Permission**: `attendance.create`
- **Body**: 
  ```json
  {
    "forDate": "2025-11-16"
  }
  ```
- **Legacy Reference**: `AttendanceController.TriggerFetchTimeSheetSummaryStats`

### 3. Time Doctor User Validation
- **Service**: `TimeDoctorService`
- **Methods**:
  - `isTimeDoctorUserIdValid(email, timeDoctorUserId)` - Validate user ID belongs to email
  - `getTimeDoctorUserIdByEmail(email)` - Lookup Time Doctor user ID by email
  - `getTimeDoctorUserById(timeDoctorUserId)` - Get user details
  - `getActiveUsers()` - Get all active company users

## How It Works

### Sync Process (TimeDoctorSyncService)

1. **Get Eligible Employees**
   - Fetches employees with Time Doctor user IDs
   - Only includes employees where `is_manual_attendance = false`
   - Only includes employees who joined on or before the sync date
   - Excludes deleted employees

2. **Fetch Timesheet Data**
   - Calls Time Doctor API: `/api/1.1/stats/timesheet/summary`
   - Parameters:
     - `company`: Company ID
     - `from/to`: Start/end of day in ISO format
     - `user`: "all"
     - `fields`: "start,end,userId,total"
     - `group-by`: "userId"
     - `period`: "days"
     - `sort`: "date"
     - `limit`: "2000"

3. **Process Each Employee**
   - Matches employee's Time Doctor user ID with API response
   - Extracts start time, end time, total seconds
   - Calculates total hours (HH:MM format)
   - Creates audit trail with Time In/Time Out events

4. **Create/Update Attendance**
   - Creates new attendance record if none exists
   - Updates existing record if it's a TimeDoctor type
   - Does NOT overwrite manual attendance records
   - Sets attendance_type to "TimeDoctor"
   - Marks location as "Remote"
   - Sets created_by/modified_by to "system"

## Database Schema

### Attendance Record Structure
```php
[
    'employee_id' => int,
    'date' => 'Y-m-d',
    'day' => 'Monday',
    'start_time' => 'H:i:s',
    'end_time' => 'H:i:s',
    'total_hours' => 'HH:MM',
    'location' => 'Remote',
    'attendance_type' => 'TimeDoctor',
    'audit' => json [
        {
            'action': 'Time In',
            'time': 'HH:MM',
            'comment': null,
            'reason': null,
            'created_by': 'system'
        },
        {
            'action': 'Time Out',
            'time': 'HH:MM',
            'comment': null,
            'reason': null,
            'created_by': 'system'
        }
    ]
]
```

## Usage

### Run Manual Sync
```bash
# Sync yesterday's data (default)
php artisan attendance:fetch-timedoctor

# Sync specific date
php artisan attendance:fetch-timedoctor --date=2025-11-16
```

### API Trigger (Frontend)
```typescript
await attendanceApi.triggerTimeDoctorSync('2025-11-16')
```

## Logging

All sync operations are logged with trace IDs for debugging:
- Info: Sync start/end, employee count, success count
- Debug: Individual user lookups, no data scenarios
- Error: API failures, employee processing errors

Log entries include:
- `trace_id`: Unique identifier for each sync operation
- `employee_id`: Employee being processed
- `time_doctor_user_id`: Time Doctor user ID
- `date`: Date being synced
- `duration_seconds`: Total sync duration

## Error Handling

- **No employees found**: Logs info, returns success with 0 counts
- **API failure**: Logs error, throws exception
- **Individual employee errors**: Logged but don't stop the entire sync
- **Invalid stats data**: Employee skipped, error logged

## Legacy Mapping

| Legacy (.NET) | New (Laravel) |
|---------------|---------------|
| `FetchTimeDoctorTimeSheetJob` | `FetchTimeDoctorTimesheet` (Command) |
| `FetchTimeDoctorTimeSheetJob.Execute` | `TimeDoctorSyncService.syncTimesheetForDate` |
| `AttendanceService.AddAttendanceTimeDoctorStatAsync` | `TimeDoctorSyncService.syncAttendanceRecord` |
| `EmploymentDetailRepository.GetEmployeesForTimeDoctorStats` | `TimeDoctorSyncService.getEmployeesForSync` |
| `TimesheetSummaryStatsResponse` | Array response handling |
| `AttendanceController.TriggerFetchTimeSheetSummaryStats` | `AttendanceController.triggerTimeDoctorSync` |

## Testing

Test the sync with a specific date:
```bash
php artisan attendance:fetch-timedoctor --date=2025-11-15
```

Check logs for results:
```bash
tail -f storage/logs/laravel.log | grep "Time Doctor"
```
