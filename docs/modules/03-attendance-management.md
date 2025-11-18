# Module 03: Attendance Management

## Module Overview

**Purpose:**  
Provides comprehensive attendance tracking for employees through dual modes: automatic Time Doctor integration for productivity tracking and manual attendance entry for employees without Time Doctor access. Maintains complete attendance records including work hours, time in/out, location, and audit trail. Enables HR and managers to monitor employee attendance, generate reports, and ensure compliance with organizational attendance policies.

**Role in System:**  
Critical operational module for tracking employee work hours and presence. Integrates with Time Doctor for automatic attendance capture, maintains historical attendance records, provides attendance reports for payroll processing, enables attendance-based leave deduction, and supports productivity monitoring through time tracking integration.

## Implemented Features

### Attendance Configuration Management

1. **Employee-Level Attendance Configuration**
   - Attendance mode configuration per employee: Manual or Automatic
   - Configuration stored in AttendanceConfig table
   - Fields: EmployeeId, IsManualAttendance (boolean)
   - IsManualAttendance = true: Employee must manually log attendance
   - IsManualAttendance = false: Attendance automatically synced from Time Doctor

2. **Attendance Configuration Auto-Creation**
   - Attendance configuration created automatically during employee onboarding
   - If Time Doctor User ID found during employee creation: IsManualAttendance = false (automatic mode)
   - If Time Doctor User ID not found: IsManualAttendance = true (manual mode)
   - Ensures every employee has attendance tracking configured from day one

3. **Attendance Mode Toggle**
   - HR/Admin can toggle attendance mode for employee
   - Toggle from Manual to Automatic:
     - System checks if Time Doctor User ID exists for employee
     - If not exists: Fetches from Time Doctor API by email
     - If found: Updates Time Doctor User ID in EmploymentDetail, switches to automatic mode
     - If not found: Error returned, cannot switch to automatic
   - Toggle from Automatic to Manual:
     - Switch happens immediately
     - Employee can start logging attendance manually

4. **Attendance Configuration List**
   - HR/Admin can view attendance configuration for all employees
   - Paginated list with filters:
     - Employee name/code search
     - Department filter
     - Team filter
     - Attendance mode filter (Manual/Automatic)
     - Reporting manager filter (for managers to view own team config)
   - Columns: Employee code, Name, Email, Department, Attendance mode, Time Doctor User ID, Actions (Toggle mode)

### Manual Attendance Entry

5. **Daily Attendance Creation**
   - Employee with manual attendance mode can add daily attendance
   - Attendance fields:
     - Date (mandatory, cannot be future date)
     - Start time (Time In - mandatory)
     - End time (Time Out - optional, can be added later)
     - Location (optional - work location, WFH indicator)
     - Attendance type: Manual
     - Day (auto-calculated from date - Monday, Tuesday, etc.)
     - Total hours (auto-calculated from start and end time)
   - Audit trail: List of time in/out actions with timestamps

6. **Attendance Date Validation**
   - Date must be valid date format (YYYY-MM-DD)
   - Date cannot be future date
   - Date must be within allowed attendance entry period (e.g., cannot add attendance older than 30 days - implementation unclear)
   - Error message: "Cannot add attendance for future date"

7. **Total Hours Calculation**
   - If both start time and end time provided: Total hours = End time - Start time
   - If only start time provided: End time null, total hours = 00:00
   - Format: HH:MM (e.g., 08:30 for 8 hours 30 minutes)
   - Calculated dynamically when attendance saved

8. **Attendance Audit Trail**
   - Attendance actions logged as audit entries
   - Audit entry fields: Action (Time In/Time Out/Break), Time, CreatedBy
   - Example audit trail for day:
     - Time In: 09:00 AM (Action: "Time In", Time: "09:00", CreatedBy: "john.doe@company.com")
     - Break: 01:00 PM (Action: "Break", Time: "13:00")
     - Resume: 02:00 PM (Action: "Resume", Time: "14:00")
     - Time Out: 06:00 PM (Action: "Time Out", Time: "18:00")
   - Stored in AttendanceAudit table

9. **Duplicate Attendance Prevention**
   - System checks if attendance already exists for employee and date
   - If exists: Update existing attendance instead of creating new
   - Prevents multiple attendance records for same day

10. **Manual Attendance Restriction Check**
    - Before allowing manual attendance entry: System checks IsManualAttendance flag
    - If IsManualAttendance = false: Error returned "Manual attendance not allowed for this employee. Attendance is automatically synced from Time Doctor."
    - Prevents manual entries for employees with automatic Time Doctor sync

### Attendance Update/Edit

11. **Attendance Record Update**
    - Employee or HR can update existing attendance record
    - Updatable fields: Start time, End time, Location
    - Date cannot be changed (must delete and recreate if date wrong)
    - Total hours recalculated on update

12. **Same-Day Attendance Update**
    - If updating attendance for current day:
      - If end time not provided: Total hours calculated based on current time
      - Allows ongoing attendance tracking
    - If updating past date:
      - Both start and end time mandatory
      - Total hours calculated from provided times

13. **Attendance Update Validation**
    - Attendance ID must exist
    - Employee ID must match logged-in user or user must have HR permission
    - Manual attendance mode must be enabled
    - Date cannot be future date
    - Start time must be before end time

14. **Attendance Modification Tracking**
    - Modified by (user email) and modified on (timestamp) tracked
    - Audit trail updated with modification action
    - Original values not retained (no history table visible in codebase)

### Automatic Time Doctor Integration

15. **Time Doctor Timesheet Sync Job**
    - Scheduled background job (Quartz.NET): FetchTimeDoctorTimeSheetJob
    - Runs daily at 5:00 AM (cron schedule: 0 0 5 * * ?)
    - Fetches timesheet summary stats for previous day from Time Doctor API

16. **Time Doctor API Integration**
    - API endpoint: GET /api/1.1/reports/summary
    - Query parameters:
      - company: YfQJah6-uiOk6nqu (Time Doctor company ID)
      - from: Start of previous day (e.g., 2025-10-30T00:00:00)
      - to: End of previous day (e.g., 2025-10-30T23:59:59)
      - user: all (fetch for all users)
      - fields: start, end, userId, total (timesheet fields)
      - group-by: userId (group stats by user)
      - period: days (daily stats)
      - sort: date
      - limit: 2000
    - Returns: Timesheet summary stats for all users for given date

17. **Time Doctor User Filtering**
    - Job fetches list of employees eligible for Time Doctor sync for date:
      - Employees with IsManualAttendance = false
      - Employees with valid Time Doctor User ID
      - Employees in Active status
      - Employees joined on or before sync date
    - Only syncs attendance for filtered employees

18. **Attendance Creation from Time Doctor Data**
    - For each employee in Time Doctor stats:
      - Extract start time, end time, total seconds worked
      - Convert total seconds to HH:MM format
      - Create Attendance record:
        - Date: Sync date
        - StartTime: From Time Doctor start
        - EndTime: From Time Doctor end
        - TotalHours: Calculated from total seconds
        - AttendanceType: "TimeDoctor"
        - Day: Day of week from date
        - CreatedBy: "admin"
      - Create audit trail with Time In and Time Out actions
      - Insert into Attendance table

19. **Time Doctor Sync Idempotency**
    - If attendance already exists for employee and date: Skip or update (implementation unclear)
    - Prevents duplicate attendance records from multiple job runs
    - Job logs count of users updated

20. **Time Doctor Sync Error Handling**
    - If API call fails: Error logged, job continues for next user
    - If user not found in Time Doctor stats: Skipped (no attendance created)
    - If API returns non-200 status: Error logged with request details
    - Job completion logged with success/failure status

21. **Manual Job Trigger for Time Doctor Sync**
    - API endpoint to manually trigger Time Doctor sync job for specific date
    - Used for:
      - Re-syncing failed dates
      - Syncing historical data
      - Testing sync process
    - Accepts date parameter to sync specific date
    - Triggers job immediately via Quartz scheduler

### Attendance Viewing & Reporting

22. **Employee Attendance View**
    - Employee can view own attendance records
    - Paginated list with filters:
      - Date range (from-to)
      - Default: Current week attendance
    - Page size configurable (default: 7 records per page for week view)
    - Columns: Date, Day, Start time, End time, Total hours, Location, Attendance type, Audit trail

23. **Attendance Date List**
    - API returns list of dates with attendance records for employee
    - Used for date picker in UI (highlight dates with attendance)
    - Helps employee quickly navigate to dates with attendance

24. **Today's Time In Status**
    - Response includes IsTimedIn flag indicating if employee timed in today
    - Calculated from today's attendance audit trail:
      - If last audit action is "Time Out": IsTimedIn = true (timed in for day)
      - If last audit action is "Time In" or no audit: IsTimedIn = false (not timed in or still in office)
    - Used in UI to show "Time In" or "Time Out" button

25. **Manual Attendance Flag in Response**
    - Attendance response includes IsManualAttendance flag
    - UI uses flag to enable/disable manual attendance entry buttons
    - If false: Manual entry buttons hidden, message shown "Attendance auto-synced from Time Doctor"

26. **UTC to IST Timezone Conversion**
    - Attendance stored in database in UTC timezone
    - API converts to IST (India Standard Time) before sending to UI
    - Conversion applied to:
      - Start time, End time
      - Audit trail times
    - Format: HH:MM (e.g., "09:30")
    - Ensures correct time display in user's timezone

27. **IST to UTC Conversion on Save**
    - Attendance input from UI is in IST
    - API converts to UTC before storing in database
    - Conversion applied to:
      - Start time, End time
      - Audit trail times
    - Ensures consistent UTC storage for global operations

### Manager/HR Attendance Reports

28. **Employee Attendance Report with Filters**
    - HR/Manager can view attendance reports for employees
    - Filters:
      - Employee search (name or code)
      - Department filter
      - Team filter
      - Date range filter (from-to)
      - Attendance mode filter (Manual/Automatic)
      - Reporting manager filter (managers see only own team)
    - Pagination supported

29. **Attendance Report Columns**
    - Employee code, Employee name, Email, Department, Designation, Team
    - Date, Day, Start time, End time, Total hours
    - Attendance type (Manual/TimeDoctor)
    - Location
    - Present/Absent indicator

30. **Attendance Summary Statistics**
    - Total working days in selected period
    - Total present days (count of attendance records)
    - Total absent days (working days - present days)
    - Total hours worked (sum of total hours across all days)
    - Average hours per day
    - (Implementation details not clear from codebase)

31. **Excel Export of Attendance Report**
    - Export attendance report to Excel with applied filters
    - Excel columns: Same as report columns
    - File name format: AttendanceReport_[FromDate]_[ToDate].xlsx
    - Used for payroll processing, compliance audits

### Attendance Dashboard (Implied)

32. **Today's Attendance Widget**
    - Shows employees who timed in today
    - Count of present employees for today
    - Count of absent employees (expected vs actual)
    - (Implementation not visible in codebase, likely on dashboard)

33. **Weekly Attendance Overview**
    - Shows attendance for current week
    - Day-wise attendance status (Present/Absent/Half-Day/Leave/Holiday)
    - Used by employee to see own week attendance

34. **Team Attendance View for Managers**
    - Manager can see team attendance for day/week
    - Quick view of who is present, absent, on leave
    - Used for team coordination and planning

## Data Models / Entities Used

### Primary Entities:

- **Attendance**: Daily attendance record
  - Fields: Id, EmployeeId, Date, Day (Monday, Tuesday, etc.), StartTime, EndTime, TotalHours, Location, AttendanceType (Manual/TimeDoctor), CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **AttendanceAudit**: Audit trail for attendance actions
  - Fields: Id, AttendanceId, Action (Time In/Time Out/Break/Resume), Time, CreatedBy, CreatedOn

- **AttendanceConfig**: Attendance configuration per employee
  - Fields: Id, EmployeeId, IsManualAttendance (boolean), CreatedBy, CreatedOn, ModifiedBy, ModifiedOn

### Related Entities:

- **EmploymentDetail**: Links to employee and stores Time Doctor User ID
  - Fields used: EmployeeId, Email, TimeDoctorUserId, IsManualAttendance (denormalized from AttendanceConfig)

- **EmployeeData**: Employee master for name and details in reports

### DTOs:

- **AttendanceRequestDto**: Add/update attendance request
  - Fields: Date, StartTime, EndTime, Location, AttendanceType, Audit (list of audit entries)

- **AttendanceResponseDto**: Attendance records response
  - Fields: AttendaceReport (list of AttendanceRowDto), TotalRecords, IsManualAttendance, IsTimedIn, Dates (list of dates with attendance)

- **AttendanceRowDto**: Single attendance record
  - Fields: Id, Date, Day, StartTime, EndTime, TotalHours, Location, AttendanceType, Audit (list of audit entries)

- **AttendanceAuditDto**: Audit entry
  - Fields: Action, Time, CreatedBy

- **AttendanceConfigRequestDto**: Attendance config update request
  - Fields: EmployeeId, IsManualAttendance

- **AttendancConfigSearchResponseDto**: Paginated attendance config list
  - Fields: AttendanceConfigList (list of AttendancConfigDto), TotalRecords

- **AttendancConfigDto**: Attendance config details
  - Fields: EmployeeId, EmployeeCode, EmployeeName, Email, Department, Designation, Team, IsManualAttendance, TimeDoctorUserId

- **AttendanceConfigSearchRequestDto**: Search filters for attendance config list
  - Fields: EmployeeCode, EmployeeName, DepartmentId, TeamId, IsManualAttendance, ReportingManagerId

- **EmployeeReportSearchRequestDto**: Filters for attendance report
  - Fields: EmployeeCode, EmployeeName, DepartmentId, DesignationId, TeamId, DateFrom, DateTo, IsManualAttendance, ReportingManagerId

- **EmployeeReportResponseDto**: Attendance report response
  - Fields: EmployeeReportList (list of attendance records), TotalRecords

- **TimesheetSummaryStatsResponse**: Time Doctor API response
  - Fields: Data (nested array of TimesheetSummaryStatsItemResponse)

- **TimesheetSummaryStatsItemResponse**: Time Doctor user stats
  - Fields: UserId (Time Doctor User ID), Start (DateTime), End (DateTime), Total (total seconds), Date (list of dates)

## External Dependencies or Services

1. **Time Doctor API**
   - Purpose: Fetch daily timesheet summary stats for employees
   - API: GET https://api2.timedoctor.com/api/1.1/reports/summary
   - Authentication: Bearer token in header
   - Used by: FetchTimeDoctorTimeSheetJob (scheduled job)
   - Returns: Start time, end time, total seconds worked for each user for given date

2. **Quartz.NET Scheduler**
   - Purpose: Schedule Time Doctor sync job
   - Job: FetchTimeDoctorTimeSheetJob
   - Cron schedule: 0 0 5 * * ? (daily at 5:00 AM)
   - Job can be manually triggered via API for specific date

3. **Serilog Logger**
   - Purpose: Log Time Doctor sync job execution, errors, success count
   - Logs: Job start, API call failures, users updated count, job completion

4. **CronLog Service (DevToolService)**
   - Purpose: Track scheduled job execution history
   - Fields logged: RequestId, TypeId (FetchTimeDoctorTimeSheetStats), Payload, StartedAt, CompletedAt
   - Used for monitoring job runs and debugging failures

## APIs or Endpoints

**POST /api/Attendance/AddAttendance/{employeeId}**
- **Purpose:** Add daily attendance record
- **Request:** AttendanceRequestDto (date, startTime, endTime, location, attendanceType, audit)
- **Process:**
  - Validate IsManualAttendance flag (must be true)
  - Check if attendance already exists for employee and date
  - If exists: Update existing record
  - If not exists: Create new attendance record
  - Convert IST to UTC for storage
  - Calculate total hours from audit trail or start/end times
  - Insert Attendance and AttendanceAudit records
- **Response:** Success/Failure message
- **Auth Required:** Yes
- **Permissions:** Attendance.Create

**PUT /api/Attendance/UpdateAttendance/{employeeId}/{attendanceId}**
- **Purpose:** Update existing attendance record
- **Request:** AttendanceRequestDto
- **Process:**
  - Validate IsManualAttendance flag
  - Validate attendance ID exists
  - Validate date not future date
  - Fetch existing attendance, convert UTC to IST for comparison
  - Update start time, end time, location
  - Recalculate total hours
  - Convert IST to UTC for storage
  - Update Attendance record with ModifiedBy and ModifiedOn
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** Attendance.Edit

**GET /api/Attendance/GetAttendance/{employeeId}**
- **Purpose:** Fetch attendance records for employee with pagination
- **Query params:** dateFrom, dateTo, pageIndex, pageSize
- **Response:** AttendanceResponseDto with attendance list, IsManualAttendance flag, IsTimedIn flag, dates list
- **Process:**
  - Fetch attendance records from database (UTC)
  - Convert UTC to IST before response
  - Calculate IsTimedIn from today's last audit action
  - Fetch dates with attendance for date picker
- **Auth Required:** Yes
- **Permissions:** Attendance.Read

**POST /api/Attendance/UpdateAttendanceConfig/{employeeId}**
- **Purpose:** Toggle attendance mode between Manual and Automatic
- **Process:**
  - Fetch employee employment details
  - If switching from Manual to Automatic:
    - Check if Time Doctor User ID exists
    - If not: Fetch from Time Doctor API by email
    - If found: Update Time Doctor User ID in EmploymentDetail
    - If not found: Return error
  - Toggle IsManualAttendance flag in AttendanceConfig
  - Update database
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** Attendance.Admin

**POST /api/Attendance/GetAttendanceConfigList**
- **Purpose:** Fetch paginated attendance configuration list with filters
- **Request:** SearchRequestDto<AttendanceConfigSearchRequestDto> (employeeCode, employeeName, departmentId, teamId, isManualAttendance, reportingManagerId, pagination)
- **Response:** AttendancConfigSearchResponseDto with config list and total records
- **Auth Required:** Yes
- **Permissions:** Attendance.Admin

**POST /api/Attendance/GetEmployeeReport**
- **Purpose:** Fetch attendance report for employees with filters
- **Request:** SearchRequestDto<EmployeeReportSearchRequestDto> (employeeCode, employeeName, departmentId, dateFrom, dateTo, isManualAttendance, reportingManagerId, pagination)
- **Response:** EmployeeReportResponseDto with attendance records and total records
- **Auth Required:** Yes
- **Permissions:** Attendance.ViewReport

**POST /api/Attendance/GetAttendanceReportInExcel**
- **Purpose:** Export attendance report to Excel
- **Request:** SearchRequestDto<EmployeeReportSearchRequestDto> (same filters as GetEmployeeReport)
- **Response:** Excel file (byte array)
- **Auth Required:** Yes
- **Permissions:** Attendance.Export

**POST /api/Attendance/TriggerTimeDoctorSyncJob**
- **Purpose:** Manually trigger Time Doctor sync job for specific date
- **Request:** JobTriggerRequest (fetchForDate: date to sync)
- **Process:**
  - Create job with date parameter
  - Trigger job via Quartz scheduler
  - Job runs immediately with specified date
- **Response:** Success message with job trigger confirmation
- **Auth Required:** Yes
- **Permissions:** Attendance.Admin

**GET /api/Attendance/GetEmployeeCodeAndNameList**
- **Purpose:** Get employee list for dropdowns in filters
- **Query params:** employeeCode, employeeName, exEmployee (include ex-employees)
- **Response:** List of EmployeeCodeServiceDto (EmployeeId, EmployeeCode, EmployeeName)
- **Auth Required:** Yes
- **Permissions:** Attendance.Read

## UI Components / Screens

### My Attendance Page
- **Location:** `/attendance/my-attendance`
- **Components:**
  - Date range filter (default: current week)
  - Week view calendar or table
  - Each day shows: Date, Day, Start time, End time, Total hours, Location, Edit button
  - Add Attendance button (visible if IsManualAttendance = true)
  - Time In/Time Out button (for current day, visible if IsManualAttendance = true)
  - Attendance summary: Total days, Total hours
- **Behavior:**
  - Default view: Current week attendance
  - Click Add Attendance: Open attendance entry form
  - Click Edit: Open edit form with existing values
  - Time In button: Add start time for today
  - Time Out button: Add end time for today
  - If IsManualAttendance = false: Show message "Attendance auto-synced from Time Doctor. Manual entry not allowed."

### Add/Edit Attendance Form
- **Location:** Modal or inline form
- **Components:**
  - Date picker (disabled if editing)
  - Start time picker (HH:MM format)
  - End time picker (HH:MM format, optional)
  - Location text input (optional)
  - Audit trail section (list of Time In/Out/Break actions with times)
  - Add Audit Entry button (to log breaks)
  - Save button, Cancel button
- **Validation:**
  - Date mandatory, cannot be future date
  - Start time mandatory
  - End time must be after start time (if provided)
  - Time format validation (HH:MM)
- **Behavior:**
  - Total hours auto-calculated and displayed when both times entered
  - Add Audit Entry: Add break or resume action with time
  - Save: Validate and submit, show success message, refresh attendance list

### Attendance Configuration Page (HR/Admin)
- **Location:** `/attendance/configuration`
- **Components:**
  - Search and filter panel:
    - Employee name/code search
    - Department dropdown
    - Team dropdown
    - Attendance mode dropdown (All/Manual/Automatic)
  - Data table:
    - Columns: Employee code, Name, Department, Team, Attendance mode badge, Time Doctor ID, Toggle button
    - Pagination controls
  - Toggle button per employee to switch mode
- **Behavior:**
  - Toggle button: Click to switch between Manual and Automatic
  - If switching to Automatic: Check Time Doctor ID, show confirmation dialog
  - If Time Doctor ID not found: Error message, switch not allowed
  - Refresh list after successful toggle

### Attendance Report Page (HR/Manager)
- **Location:** `/attendance/reports`
- **Components:**
  - Advanced filter panel:
    - Employee multi-select
    - Department, Team, Designation dropdowns
    - Date range picker (from-to)
    - Attendance mode filter
    - Search button, Clear filters button
  - Data table:
    - Columns: Employee code, Name, Date, Day, Start time, End time, Total hours, Attendance type, Location
    - Summary row: Total days, Total hours
    - Pagination controls
  - Export to Excel button
- **Behavior:**
  - Apply filters: Fetch attendance records via API
  - Excel export: Download file with filtered data
  - Click employee name: Navigate to employee attendance detail
  - Manager sees only own team attendance

## Workflow or Process Description

### Manual Attendance Entry Workflow:
1. Employee logs into portal
2. Navigates to Attendance → My Attendance
3. Sees current week attendance calendar
4. Clicks "Add Attendance" for today or past date
5. Attendance entry form opens
6. Employee enters start time (e.g., 09:00 AM)
7. Employee enters end time (e.g., 06:00 PM)
8. Optionally enters location (e.g., "Office - Mumbai" or "Work From Home")
9. Clicks Save
10. System validates: Date not future, start time < end time, manual mode enabled
11. System converts IST to UTC
12. System calculates total hours: 9 hours
13. System creates Attendance record with audit trail (Time In at 09:00, Time Out at 18:00)
14. Success message displayed
15. Attendance calendar refreshed with new entry

### Automatic Time Doctor Sync Workflow:
1. Scheduled job (FetchTimeDoctorTimeSheetJob) triggers at 5:00 AM daily
2. Job fetches list of employees eligible for sync (IsManualAttendance = false, Active status, has Time Doctor ID)
3. Job calls Time Doctor API: GET /reports/summary for previous day (e.g., Oct 30, 2025)
4. Time Doctor API returns timesheet stats for all users
5. Job loops through eligible employees:
   - Find matching Time Doctor stats by TimeDoctorUserId
   - If stats found: Extract start time, end time, total seconds
   - Convert total seconds to HH:MM format
   - Create Attendance record: Date = Oct 30, StartTime, EndTime, TotalHours, AttendanceType = "TimeDoctor"
   - Create audit trail with Time In and Time Out actions
   - Insert into database
   - Counter: Users updated++
6. Job completes, logs success: "Successfully ran FetchTimeDoctorTimeSheetJob, X users updated"
7. Employee logs in later, views attendance, sees Oct 30 attendance auto-populated from Time Doctor

### Attendance Mode Toggle Workflow:
1. HR navigates to Attendance → Configuration
2. Sees list of employees with current attendance mode
3. Employee "John Doe" has Manual mode, but HR wants to switch to Automatic
4. HR clicks Toggle button for John Doe
5. System checks: Does John have Time Doctor User ID?
6. If No: System calls Time Doctor API to fetch user ID by john.doe@company.com
   - If found: System saves Time Doctor ID in EmploymentDetail.TimeDoctorUserId
   - If not found: Error message "Time Doctor user not found for this employee. Cannot enable automatic attendance."
7. If Yes: System switches IsManualAttendance from true to false in AttendanceConfig
8. Success message: "Attendance mode changed to Automatic for John Doe"
9. John's future attendance will be auto-synced from Time Doctor (starting tomorrow's 5 AM job run)
10. John can no longer manually log attendance

### Manual Job Trigger for Historical Sync:
1. HR realizes Time Doctor sync failed for Oct 28 due to API downtime
2. HR navigates to Attendance → Admin Tools
3. Clicks "Trigger Time Doctor Sync"
4. Selects date: Oct 28, 2025
5. Clicks Trigger button
6. System creates manual job trigger with date parameter
7. Job runs immediately for Oct 28
8. Fetches Time Doctor stats for Oct 28
9. Creates/updates attendance records for all eligible employees for Oct 28
10. Job completes, HR sees success message: "Time Doctor sync completed for Oct 28, 2025. X users updated"

## Error Handling / Edge Cases

**Future Date Attendance:**
- Error: Employee attempts to add attendance for future date
- Validation: Date <= Today
- Error message: "Cannot add attendance for future date"

**Manual Entry Not Allowed:**
- Error: Employee with automatic mode (IsManualAttendance = false) attempts manual entry
- Validation: Check IsManualAttendance flag before allowing add/update
- Error message: "Manual attendance not allowed. Your attendance is automatically synced from Time Doctor."

**Time Doctor API Failure:**
- Error: Time Doctor API returns 500 or times out during scheduled sync
- Handling: Log error with request details, skip sync for that run, retry in next scheduled run
- Error logged: "Failed to fetch timesheet data - Status: 500"

**Time Doctor User Not Found in Stats:**
- Error: Employee has Time Doctor ID but not in API response for sync date
- Handling: Skip user (no attendance created), log info message
- Possible reasons: Employee didn't work that day, Time Doctor offline, user suspended in Time Doctor

**Overlapping Attendance Entries:**
- Error: System logic allows only one attendance per employee per day
- Handling: If attendance exists, update existing instead of creating new
- Prevents duplicate attendance records

**Invalid Time Format:**
- Error: User enters time in wrong format (e.g., "9 AM" instead of "09:00")
- Validation: Client-side time picker enforces HH:MM format
- Server-side: Parse time, if invalid return error

**End Time Before Start Time:**
- Error: End time earlier than start time (e.g., Start: 18:00, End: 09:00)
- Validation: End time > Start time
- Error message: "End time must be after start time"

**Timezone Conversion Issues:**
- Error: DST changes or incorrect timezone setting causes wrong time display
- Handling: All times stored in UTC, converted to IST for display
- DST handling: IST doesn't observe DST, so no DST issues for Indian employees

**Concurrent Attendance Updates:**
- Error: Employee and HR update same attendance record simultaneously
- Handling: Last write wins (no optimistic concurrency control visible)
- Potential data loss of first update

**Missing Time Doctor User ID on Toggle:**
- Error: HR toggles to Automatic mode, but Time Doctor API fails to find user
- Handling: Return error, do not toggle mode, prompt HR to check employee email or Time Doctor account
- Error message: "Time Doctor user not found. Please ensure employee email matches Time Doctor account."

## Integration Points with Other Modules

**Integration with Employee Management:**
- EmployeeId links attendance to employee
- TimeDoctorUserId from EmploymentDetail used for sync
- IsManualAttendance flag determines attendance mode
- Active employee status required for Time Doctor sync

**Integration with Leave Management:**
- Leave dates may be excluded from attendance reports (on leave = no attendance expected)
- Attendance may be used to validate half-day leave claims
- Absent days without approved leave may trigger alerts

**Integration with Dashboard:**
- Today's attendance count displayed on dashboard
- Weekly attendance summary widget
- Team attendance overview for managers

**Integration with Payroll (External):**
- Attendance records exported for payroll processing
- Total hours worked used for salary calculation
- Absent days without leave may result in pay deduction
- Excel export used for payroll integration

**Integration with Notification System:**
- Notifications for missing attendance (if configured)
- Alerts for attendance below threshold hours
- Manager notifications for team attendance issues

## Dependencies / Reused Components

**Backend:**
- TimeDoctorClient: Fetch Time Doctor User ID and timesheet stats
- Quartz.NET: Schedule Time Doctor sync job
- AutoMapper: Map between Attendance entities and DTOs
- Dapper: Execute attendance queries
- Serilog: Log job execution and errors

**Frontend:**
- Material-UI DatePicker, TimePicker: Attendance date and time input
- SWR: Fetch and cache attendance data
- React Hook Form: Attendance form management
- Axios: API calls

**Shared:**
- TimeZoneConverter: Convert between UTC and IST
- DateHelper: Calculate total hours, validate dates
- ExcelExporter: Export attendance report to Excel

**Testing:**
Unit tests: Attendance service methods, date validations, timezone conversions, total hours calculation
Integration tests: Add attendance end-to-end, Time Doctor sync job, attendance report generation
Performance tests: Attendance list with large dataset, Excel export with 10,000 records

---

**Module Dependencies:**
- **Depends On:** Employee Management (EmployeeId, Time Doctor User ID), Authentication (user permissions)
- **Used By:** Dashboard, Reports, Payroll integration, Leave Management (attendance validation)

**Key Features:**
- Dual mode attendance (Manual/Automatic)
- Time Doctor integration for automatic tracking
- Daily scheduled sync job
- Attendance configuration per employee
- Timezone-aware storage and display
- Audit trail for all attendance actions
- Advanced filtering and reporting
- Excel export for payroll
