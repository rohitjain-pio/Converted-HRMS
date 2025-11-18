# Module 12: Audit Trail & Logging

## Module Overview

**Module Name:** Audit Trail & Logging  
**Module ID:** 12  
**Purpose:** Comprehensive audit trail system to track all user actions, data modifications, system events, and scheduled job executions for compliance, security monitoring, troubleshooting, and forensic analysis. Provides immutable logs, change history tracking, and user activity monitoring across all HRMS modules.

**Technology Stack:**
- Backend: ASP.NET Core 8.0 Web API with Serilog
- Database: SQL Server with audit tables
- Logging: Serilog with SQL Server sink and Console output
- Frontend: React with log viewer UI
- Scheduled Jobs: Quartz.NET with CronLog tracking

**Key Capabilities:**
- Structured logging for all API requests and errors
- Attendance audit trail (StartTime, EndTime, TotalHours changes)
- Company policy version history tracking
- Scheduled job execution logs (CronLog)
- User activity monitoring (login, logout, data modifications)
- Log levels: Verbose, Debug, Information, Warning, Error, Fatal
- Centralized log storage in SQL Server
- Log search and filtering by level, message, date range, exception
- Immutable audit records (cannot be deleted or modified)

---

## Architecture Overview

### Components

**1. Serilog (Logging Framework)**
- **Location:** Configured in `HRMS.API/Extensions/HostingExtensions.cs`
- **Purpose:** Structured logging to SQL Server and Console
- **Sinks:** MSSqlServer (Logs table), Console
- **Configuration:**
```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.MSSqlServer(
        connectionString: Configuration.GetConnectionString("DefaultConnection"),
        tableName: "Logs",
        autoCreateSqlTable: true,
        columnOptions: new ColumnOptions()
    )
    .CreateLogger();
```

**2. AttendanceAudit Table**
- **Purpose:** Track all attendance data modifications (manual edits, Time Doctor sync updates)
- **Tracked Fields:** StartTime, EndTime, TotalHours, Location, Note, Reason
- **Change Detection:** Compare old vs. new values, log differences
- **Use Cases:** Investigate disputed attendance records, track manager edits, payroll audit

**3. CronLog Table**
- **Purpose:** Track scheduled job executions (Time Doctor sync, leave accrual, grievance updates)
- **Key Fields:** TypeId (job type), StartedAt, CompletedAt, Payload (job parameters), RequestId (traceability)
- **Use Cases:** Monitor job health, troubleshoot failed jobs, verify nightly sync completed

**4. CompanyPolicyHistory Table**
- **Purpose:** Version control for company policy documents
- **Tracked Fields:** VersionNumber, EffectiveDate, FilePath, UploadedBy, UploadedOn
- **Use Cases:** Compliance audits, rollback to previous policy version, track policy changes over time

**5. DevToolController (Log Viewer)**
- **Location:** `HRMS.API/Controllers/DevToolController.cs`
- **Purpose:** API endpoints for log retrieval and job monitoring
- **Methods:** GetLogs, GetCronLogs, RunCron

**6. ILogger Injection (All Services)**
- **Purpose:** Log business logic events, errors, and debug information
- **Usage Pattern:**
```csharp
public class EmployeeService
{
    private readonly Serilog.ILogger _logger;
    
    public EmployeeService(Serilog.ILogger logger)
    {
        _logger = logger;
    }
    
    public async Task AddEmployee(EmployeeRequestDto request)
    {
        _logger.Information("Adding new employee: {EmployeeName}", request.FirstName + " " + request.LastName);
        try
        {
            // Business logic
            _logger.Information("Employee added successfully: EmployeeId={EmployeeId}", newEmployeeId);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Failed to add employee: {Request}", request);
            throw;
        }
    }
}
```

---

## Database Schema

### 1. Logs Table (Serilog Auto-Created)
```sql
CREATE TABLE Logs (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TimeStamp DATETIME NOT NULL DEFAULT GETUTCDATE(),
    Level NVARCHAR(128) NULL, -- Information, Warning, Error, Fatal, Debug, Verbose
    Message NVARCHAR(MAX) NULL,
    Exception NVARCHAR(MAX) NULL,
    Properties NVARCHAR(MAX) NULL, -- Structured log properties (JSON)
    MessageTemplate NVARCHAR(MAX) NULL, -- Log template with placeholders
    LogEvent NVARCHAR(MAX) NULL -- Full Serilog event (rarely used)
)

CREATE INDEX IX_Logs_TimeStamp ON Logs(TimeStamp DESC);
CREATE INDEX IX_Logs_Level ON Logs(Level);
```

**Sample Data:**
| Id  | TimeStamp           | Level       | Message                                      | Exception                          |
|-----|---------------------|-------------|----------------------------------------------|------------------------------------|
| 101 | 2025-01-15 14:32:15 | Information | User 1234 logged in                          | NULL                               |
| 102 | 2025-01-15 14:35:20 | Error       | Failed to fetch Time Doctor data             | HttpRequestException: Timeout...   |
| 103 | 2025-01-15 14:40:10 | Warning     | Attendance record missing for employee 5678  | NULL                               |

---

### 2. AttendanceAudit Table
```sql
CREATE TABLE AttendanceAudit (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    AttendanceId BIGINT NOT NULL,
    FieldName NVARCHAR(100) NOT NULL, -- StartTime, EndTime, TotalHours, Location, Note, Reason
    OldValue NVARCHAR(500) NULL,
    NewValue NVARCHAR(500) NULL,
    ChangedBy NVARCHAR(100) NOT NULL, -- User who made the change
    ChangedOn DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ChangeReason NVARCHAR(500) NULL, -- Optional explanation for change
    
    FOREIGN KEY (AttendanceId) REFERENCES Attendance(Id)
)

CREATE INDEX IX_AttendanceAudit_AttendanceId ON AttendanceAudit(AttendanceId);
CREATE INDEX IX_AttendanceAudit_ChangedOn ON AttendanceAudit(ChangedOn DESC);
```

**Sample Data:**
| Id  | AttendanceId | FieldName  | OldValue | NewValue | ChangedBy        | ChangedOn           | ChangeReason          |
|-----|--------------|------------|----------|----------|------------------|---------------------|-----------------------|
| 1   | 5678         | StartTime  | 09:30    | 09:00    | manager@hrms.com | 2025-01-15 10:00:00 | Employee arrived early|
| 2   | 5678         | EndTime    | 18:00    | 19:30    | manager@hrms.com | 2025-01-15 10:00:00 | Worked late           |
| 3   | 5678         | TotalHours | 08:30    | 10:30    | manager@hrms.com | 2025-01-15 10:00:00 | Auto-calculated       |

**Use Case:** Manager edits employee attendance to correct clock-in time. System logs 3 audit records: StartTime change (09:30 → 09:00), EndTime change (18:00 → 19:30), TotalHours change (08:30 → 10:30).

---

### 3. CronLog Table
```sql
CREATE TABLE CronLog (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    TypeId INT NOT NULL, -- CronType enum: 1=TimeDoctorSync, 2=LeaveAccrual, 3=GrievanceLevelUpdate, 4=CompOffExpire
    RequestId NVARCHAR(100) NULL, -- HTTP request ID for traceability
    StartedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CompletedAt DATETIME NULL, -- NULL if job still running or failed
    Payload NVARCHAR(MAX) NULL, -- JSON with job parameters (e.g., {"forDate": "2025-01-15"})
    CreatedBy NVARCHAR(100) NOT NULL,
    CreatedOn DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ModifiedBy NVARCHAR(100) NULL,
    ModifiedOn DATETIME NULL
)

CREATE INDEX IX_CronLog_TypeId ON CronLog(TypeId);
CREATE INDEX IX_CronLog_StartedAt ON CronLog(StartedAt DESC);
```

**Sample Data:**
| Id  | TypeId | RequestId    | StartedAt           | CompletedAt         | Payload                          |
|-----|--------|--------------|---------------------|---------------------|----------------------------------|
| 101 | 1      | req-abc-123  | 2025-01-15 02:00:00 | 2025-01-15 02:15:32 | {"forDate": "2025-01-14"}        |
| 102 | 1      | req-abc-124  | 2025-01-16 02:00:00 | NULL                | {"forDate": "2025-01-15"}        |
| 103 | 2      | req-def-456  | 2025-01-01 03:00:00 | 2025-01-01 03:02:15 | {"forMonth": 1, "forYear": 2025} |

**Job Status:**
- **Completed:** CompletedAt IS NOT NULL
- **Running:** CompletedAt IS NULL, StartedAt within last hour
- **Failed:** CompletedAt IS NULL, StartedAt older than expected duration

**Use Case:** Time Doctor sync job (TypeId=1) runs nightly at 2 AM. If job fails (CompletedAt=NULL), admin receives alert, checks Logs table for errors, manually re-triggers job via DevToolController.

---

### 4. CompanyPolicyHistory Table
```sql
CREATE TABLE CompanyPolicyHistory (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    CompanyPolicyId BIGINT NOT NULL,
    VersionNumber INT NOT NULL,
    EffectiveDate DATE NOT NULL,
    FilePath NVARCHAR(500) NOT NULL, -- Path to policy document in storage
    UploadedBy NVARCHAR(100) NOT NULL,
    UploadedOn DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ChangeDescription NVARCHAR(1000) NULL, -- Summary of changes from previous version
    IsActive BIT NOT NULL DEFAULT 0, -- Only one version active at a time
    
    FOREIGN KEY (CompanyPolicyId) REFERENCES CompanyPolicy(Id)
)

CREATE INDEX IX_CompanyPolicyHistory_CompanyPolicyId ON CompanyPolicyHistory(CompanyPolicyId);
CREATE INDEX IX_CompanyPolicyHistory_EffectiveDate ON CompanyPolicyHistory(EffectiveDate DESC);
```

**Sample Data:**
| Id  | CompanyPolicyId | VersionNumber | EffectiveDate | FilePath                     | UploadedBy       | ChangeDescription                |
|-----|-----------------|---------------|---------------|------------------------------|------------------|----------------------------------|
| 1   | 5               | 1             | 2024-01-01    | /policies/leave_v1.pdf       | hr@hrms.com      | Initial policy                   |
| 2   | 5               | 2             | 2024-07-01    | /policies/leave_v2.pdf       | hr@hrms.com      | Increased casual leave to 12 days|
| 3   | 5               | 3             | 2025-01-01    | /policies/leave_v3.pdf       | hr@hrms.com      | Added comp-off policy            |

**Use Case:** Employee disputes leave rejection, claims policy allowed 10 sick leaves. HR checks CompanyPolicyHistory, finds employee joined in June 2024, so Version 2 (12 casual leaves) was effective. HR resolves dispute.

---

### 5. Stored Procedure: GetLogs
```sql
CREATE OR ALTER PROCEDURE [dbo].[GetLogs]
    @LogLevel NVARCHAR(50) = NULL,
    @Message NVARCHAR(MAX) = NULL,
    @Exception NVARCHAR(MAX) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @StartIndex INT = 0,
    @PageSize INT = 10,
    @SortColumn NVARCHAR(50) = 'TimeStamp',
    @SortDesc BIT = 1
AS
BEGIN
    SELECT COUNT(*) OVER() AS TotalRecords,
           Id, TimeStamp, Level AS LogLevel, Message, Exception, Properties
    FROM Logs
    WHERE (@LogLevel IS NULL OR Level = @LogLevel)
      AND (@Message IS NULL OR Message LIKE '%' + @Message + '%')
      AND (@Exception IS NULL OR Exception LIKE '%' + @Exception + '%')
      AND (@StartDate IS NULL OR TimeStamp >= @StartDate)
      AND (@EndDate IS NULL OR TimeStamp <= @EndDate)
    ORDER BY 
        CASE WHEN @SortColumn = 'TimeStamp' AND @SortDesc = 0 THEN TimeStamp END ASC,
        CASE WHEN @SortColumn = 'TimeStamp' AND @SortDesc = 1 THEN TimeStamp END DESC,
        CASE WHEN @SortColumn = 'Level' AND @SortDesc = 0 THEN Level END ASC,
        CASE WHEN @SortColumn = 'Level' AND @SortDesc = 1 THEN Level END DESC
    OFFSET @StartIndex ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
```

---

### 6. Stored Procedure: GetCronLogs
```sql
CREATE OR ALTER PROCEDURE [dbo].[GetCronLogs]
    @TypeId INT = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @StartIndex INT = 0,
    @PageSize INT = 10,
    @SortColumn NVARCHAR(50) = 'StartedAt',
    @SortDesc BIT = 1
AS
BEGIN
    SELECT COUNT(*) OVER() AS TotalRecords,
           Id, TypeId, RequestId, StartedAt, CompletedAt, Payload,
           CASE 
               WHEN CompletedAt IS NOT NULL THEN 'Completed'
               WHEN CompletedAt IS NULL AND DATEDIFF(HOUR, StartedAt, GETUTCDATE()) < 1 THEN 'Running'
               ELSE 'Failed'
           END AS Status
    FROM CronLog
    WHERE (@TypeId IS NULL OR TypeId = @TypeId)
      AND (@StartDate IS NULL OR StartedAt >= @StartDate)
      AND (@EndDate IS NULL OR StartedAt <= @EndDate)
    ORDER BY 
        CASE WHEN @SortColumn = 'StartedAt' AND @SortDesc = 0 THEN StartedAt END ASC,
        CASE WHEN @SortColumn = 'StartedAt' AND @SortDesc = 1 THEN StartedAt END DESC
    OFFSET @StartIndex ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
```

---

## Features List

### Feature 1: Structured Application Logging
**Description:** Log all API requests, errors, warnings, and debug information with structured properties for easy searching and filtering.

**Business Rules:**
- Log levels: Verbose (trace), Debug, Information, Warning, Error, Fatal
- Minimum log level: Information (production), Debug (development)
- Console sink: Real-time logs in development
- SQL Server sink: Persistent logs for production monitoring
- Sensitive data (passwords, tokens) never logged
- Structured properties: UserId, EmployeeId, RequestId, Action

**Logging Examples:**
```csharp
// Information: Normal operations
_logger.Information("Employee {EmployeeId} logged in", employeeId);

// Warning: Non-critical issues
_logger.Warning("Attendance record missing for employee {EmployeeId} on {Date}", employeeId, date);

// Error: Failed operations (with exception)
try
{
    await _timeDoctorClient.FetchTimeSheetStats(date);
}
catch (HttpRequestException ex)
{
    _logger.Error(ex, "Failed to fetch Time Doctor data for {Date}", date);
    throw;
}

// Debug: Development troubleshooting
_logger.Debug("Fetched {Count} employees from database in {ElapsedMs}ms", employees.Count, stopwatch.ElapsedMilliseconds);
```

**Log Query Examples:**
```sql
-- All errors in last 24 hours
SELECT * FROM Logs 
WHERE Level = 'Error' 
  AND TimeStamp > DATEADD(HOUR, -24, GETUTCDATE());

-- Failed Time Doctor sync attempts
SELECT * FROM Logs 
WHERE Message LIKE '%Time Doctor%' 
  AND Level = 'Error'
ORDER BY TimeStamp DESC;
```

---

### Feature 2: Attendance Audit Trail
**Description:** Track all attendance data modifications with old/new value comparison, change timestamp, and user who made the change.

**Business Rules:**
- Audit logged for every field change: StartTime, EndTime, TotalHours, Location, Note, Reason
- Cannot edit attendance audit records (immutable)
- Manager can view audit trail for their team members
- HR can view all audit trails
- Audit retention: Permanent (no deletion)

**Audit Trigger Logic:**
```csharp
public async Task UpdateAttendanceAsync(long attendanceId, AttendanceRequestDto request)
{
    var existingAttendance = await _repository.GetAttendanceByIdAsync(attendanceId);
    
    var audits = new List<AttendanceAudit>();
    
    // StartTime changed?
    if (existingAttendance.StartTime != request.StartTime)
    {
        audits.Add(new AttendanceAudit
        {
            AttendanceId = attendanceId,
            FieldName = "StartTime",
            OldValue = existingAttendance.StartTime.ToString("HH:mm"),
            NewValue = request.StartTime.ToString("HH:mm"),
            ChangedBy = HttpContext.User.Identity.Name,
            ChangedOn = DateTime.UtcNow,
            ChangeReason = request.Reason
        });
    }
    
    // EndTime changed?
    if (existingAttendance.EndTime != request.EndTime)
    {
        audits.Add(new AttendanceAudit
        {
            AttendanceId = attendanceId,
            FieldName = "EndTime",
            OldValue = existingAttendance.EndTime?.ToString("HH:mm") ?? "NULL",
            NewValue = request.EndTime?.ToString("HH:mm") ?? "NULL",
            ChangedBy = HttpContext.User.Identity.Name,
            ChangedOn = DateTime.UtcNow,
            ChangeReason = request.Reason
        });
    }
    
    // TotalHours recalculated?
    var newTotalHours = CalculateTotalHours(request.StartTime, request.EndTime);
    if (existingAttendance.TotalHours != newTotalHours)
    {
        audits.Add(new AttendanceAudit
        {
            AttendanceId = attendanceId,
            FieldName = "TotalHours",
            OldValue = $"{existingAttendance.TotalHours:F2}",
            NewValue = $"{newTotalHours:F2}",
            ChangedBy = "System (Auto-calculated)",
            ChangedOn = DateTime.UtcNow
        });
    }
    
    // Update attendance record
    await _repository.UpdateAttendanceAsync(attendanceId, request);
    
    // Insert audit records
    await _repository.InsertAttendanceAuditsAsync(audits);
    
    _logger.Information("Attendance {AttendanceId} updated by {User}, {Count} fields changed", 
        attendanceId, HttpContext.User.Identity.Name, audits.Count);
}
```

**Audit Retrieval API:**
```csharp
[HttpGet]
[Route("GetAttendanceAudit/{attendanceId}")]
public async Task<IActionResult> GetAttendanceAudit(long attendanceId)
{
    var audits = await _attendanceService.GetAttendanceAuditAsync(attendanceId);
    return Ok(audits);
}
```

**Audit Response:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": [
    {
      "id": 1,
      "attendanceId": 5678,
      "fieldName": "StartTime",
      "oldValue": "09:30",
      "newValue": "09:00",
      "changedBy": "manager@hrms.com",
      "changedOn": "2025-01-15T10:00:00Z",
      "changeReason": "Employee arrived early, clocked in at 09:00 but system recorded 09:30"
    },
    {
      "id": 2,
      "attendanceId": 5678,
      "fieldName": "EndTime",
      "oldValue": "18:00",
      "newValue": "19:30",
      "changedBy": "manager@hrms.com",
      "changedOn": "2025-01-15T10:00:00Z",
      "changeReason": "Employee worked late to complete project deadline"
    },
    {
      "id": 3,
      "attendanceId": 5678,
      "fieldName": "TotalHours",
      "oldValue": "08:30",
      "newValue": "10:30",
      "changedBy": "System (Auto-calculated)",
      "changedOn": "2025-01-15T10:00:00Z",
      "changeReason": null
    }
  ]
}
```

---

### Feature 3: Scheduled Job Execution Logs (CronLog)
**Description:** Track all scheduled job executions with start time, completion time, payload, and status for monitoring job health and troubleshooting failures.

**Business Rules:**
- CronLog entry created at job start (StartedAt = NOW(), CompletedAt = NULL)
- CronLog updated at job completion (CompletedAt = NOW())
- Payload stored as JSON with job parameters
- RequestId links to HTTP request if manually triggered
- Job types: 1=TimeDoctorSync, 2=LeaveAccrual, 3=GrievanceLevelUpdate, 4=CompOffExpire

**Job Execution Flow:**
```csharp
public class FetchTimeDoctorTimeSheetJob : IJob
{
    private readonly IDevToolService _devToolService;
    private readonly Serilog.ILogger _logger;
    
    public async Task Execute(IJobExecutionContext context)
    {
        var forDate = context.MergedJobDataMap.GetString("fetchForDate");
        var requestId = context.MergedJobDataMap.GetString("RequestId");
        
        _logger.Information("Starting Time Doctor sync job for {Date}, RequestId: {RequestId}", forDate, requestId);
        
        // Create CronLog entry (job started)
        var cronLog = new CronLog
        {
            TypeId = CronType.FetchTimeDoctorTimeSheetStats,
            RequestId = requestId,
            StartedAt = DateTime.UtcNow,
            Payload = JsonConvert.SerializeObject(new { forDate }),
            CreatedBy = "System",
            CreatedOn = DateTime.UtcNow
        };
        var cronLogId = await _devToolService.CreateCronLog(cronLog);
        
        try
        {
            // Fetch Time Doctor data
            var timeSheetStats = await _timeDoctorClient.FetchTimeSheetStats(forDate);
            
            // Update attendance records
            await _attendanceService.UpdateAttendanceFromTimeDoctor(timeSheetStats);
            
            _logger.Information("Time Doctor sync completed successfully for {Date}, {Count} records updated", 
                forDate, timeSheetStats.Count);
            
            // Update CronLog (job completed)
            await _devToolService.UpdateCronLogCompletion(cronLogId, DateTime.UtcNow);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Time Doctor sync failed for {Date}", forDate);
            
            // CronLog not updated (CompletedAt remains NULL = failed job)
            throw;
        }
    }
}
```

**CronLog Query (Failed Jobs):**
```sql
-- Find failed Time Doctor sync jobs in last 7 days
SELECT * FROM CronLog
WHERE TypeId = 1
  AND CompletedAt IS NULL
  AND StartedAt > DATEADD(DAY, -7, GETUTCDATE())
ORDER BY StartedAt DESC;
```

---

### Feature 4: Company Policy Version History
**Description:** Track all company policy document versions with effective date, uploader, change description, and ability to view historical versions.

**Business Rules:**
- New version created on every policy update
- VersionNumber auto-incremented
- Only one version marked IsActive = 1 (current version)
- Previous versions remain accessible for compliance audits
- ChangeDescription required (summary of changes)

**Version Creation Flow:**
```csharp
public async Task UpdateCompanyPolicyAsync(long policyId, UpdateCompanyPolicyRequestDto request)
{
    var existingPolicy = await _repository.GetCompanyPolicyByIdAsync(policyId);
    
    // Deactivate current version
    await _repository.DeactivateCurrentPolicyVersionAsync(policyId);
    
    // Get next version number
    var nextVersion = await _repository.GetNextVersionNumberAsync(policyId);
    
    // Create new version in history
    var policyHistory = new CompanyPolicyHistory
    {
        CompanyPolicyId = policyId,
        VersionNumber = nextVersion,
        EffectiveDate = request.EffectiveDate,
        FilePath = request.FilePath, // Uploaded to Azure Blob Storage
        UploadedBy = HttpContext.User.Identity.Name,
        UploadedOn = DateTime.UtcNow,
        ChangeDescription = request.ChangeDescription,
        IsActive = true
    };
    await _repository.CreatePolicyHistoryAsync(policyHistory);
    
    // Update current policy
    existingPolicy.EffectiveDate = request.EffectiveDate;
    existingPolicy.FilePath = request.FilePath;
    existingPolicy.ModifiedBy = HttpContext.User.Identity.Name;
    existingPolicy.ModifiedOn = DateTime.UtcNow;
    await _repository.UpdateCompanyPolicyAsync(existingPolicy);
    
    _logger.Information("Company policy {PolicyId} updated to version {Version} by {User}", 
        policyId, nextVersion, HttpContext.User.Identity.Name);
}
```

**View Policy History API:**
```csharp
[HttpPost]
[Route("GetCompanyPolicyHistoryList")]
public async Task<IActionResult> GetHistoryListById(SearchRequestDto<CompanyPolicyHistorySearchRequestDto> requestDto)
{
    var response = await _companyPolicyService.GetCompanyPolicyHistoryListById(requestDto);
    return StatusCode(response.StatusCode, response);
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 3,
    "policyHistoryList": [
      {
        "id": 3,
        "companyPolicyId": 5,
        "versionNumber": 3,
        "effectiveDate": "2025-01-01",
        "filePath": "/policies/leave_v3.pdf",
        "uploadedBy": "hr@hrms.com",
        "uploadedOn": "2024-12-15T10:00:00Z",
        "changeDescription": "Added comp-off policy, increased sick leave to 15 days",
        "isActive": true
      },
      {
        "id": 2,
        "companyPolicyId": 5,
        "versionNumber": 2,
        "effectiveDate": "2024-07-01",
        "filePath": "/policies/leave_v2.pdf",
        "uploadedBy": "hr@hrms.com",
        "uploadedOn": "2024-06-20T14:30:00Z",
        "changeDescription": "Increased casual leave from 10 to 12 days",
        "isActive": false
      },
      {
        "id": 1,
        "companyPolicyId": 5,
        "versionNumber": 1,
        "effectiveDate": "2024-01-01",
        "filePath": "/policies/leave_v1.pdf",
        "uploadedBy": "admin@hrms.com",
        "uploadedOn": "2023-12-10T09:00:00Z",
        "changeDescription": "Initial leave policy",
        "isActive": false
      }
    ]
  }
}
```

---

### Feature 5: User Activity Monitoring
**Description:** Track user login, logout, and data modification activities for security monitoring and compliance.

**Business Rules:**
- Login/logout logged to Serilog (Information level)
- Failed login attempts logged (Warning level)
- Data modifications logged with entity type and entity ID
- Sensitive actions logged (password change, role change, permission grant)

**Logging Examples:**
```csharp
// Login success
_logger.Information("User {UserId} logged in from IP {IpAddress}", userId, ipAddress);

// Login failure
_logger.Warning("Failed login attempt for email {Email} from IP {IpAddress}", email, ipAddress);

// Data modification
_logger.Information("Employee {EmployeeId} updated by user {UserId}, fields changed: {Fields}", 
    employeeId, userId, string.Join(", ", changedFields));

// Sensitive action
_logger.Information("User {UserId} granted permission {Permission} to role {RoleId}", 
    userId, permission, roleId);
```

---

## Workflows

### Workflow 1: Investigate Disputed Attendance Record
**Actors:** Employee, Manager, HR Admin

**Steps:**
1. **Dispute:** Employee claims they worked 10 hours on Jan 15, 2025, but payroll shows only 8 hours
2. Employee emails manager: "My attendance for Jan 15 shows 8 hours, but I worked until 8 PM (10 hours)"
3. Manager logs into HRMS, navigates to "Attendance" → "Employee Report"
4. Manager filters: Employee = John Doe, Date = 2025-01-15
5. Manager sees attendance record: StartTime = 09:30, EndTime = 18:00, TotalHours = 08:30
6. Manager clicks "View Audit Trail" button
7. Frontend calls `GET /api/Attendance/GetAttendanceAudit/5678`
8. Backend returns audit trail:
```json
{
  "result": [
    {
      "id": 1,
      "fieldName": "StartTime",
      "oldValue": "09:00",
      "newValue": "09:30",
      "changedBy": "system@timedoctor.com",
      "changedOn": "2025-01-16T02:15:32Z",
      "changeReason": "Time Doctor sync: corrected clock-in time"
    },
    {
      "id": 2,
      "fieldName": "EndTime",
      "oldValue": "20:00",
      "newValue": "18:00",
      "changedBy": "system@timedoctor.com",
      "changedOn": "2025-01-16T02:15:32Z",
      "changeReason": "Time Doctor sync: corrected clock-out time"
    }
  ]
}
```
9. Manager sees Time Doctor sync changed EndTime from 20:00 to 18:00 (should have been 20:00)
10. Manager investigates Time Doctor portal, finds employee's last activity at 20:00
11. Manager realizes Time Doctor sync had incorrect data
12. Manager manually edits attendance record:
    - EndTime: 18:00 → 20:00
    - Reason: "Corrected based on Time Doctor portal, employee worked until 8 PM"
13. System creates new audit records:
```json
{
  "fieldName": "EndTime",
  "oldValue": "18:00",
  "newValue": "20:00",
  "changedBy": "manager@hrms.com",
  "changedOn": "2025-01-17T10:30:00Z",
  "changeReason": "Corrected based on Time Doctor portal, employee worked until 8 PM"
}
```
14. TotalHours auto-recalculated: 08:30 → 10:30
15. Manager informs employee: "Corrected your attendance, you'll see 10:30 hours in payroll"
16. Payroll processes with correct hours
17. **Audit Trail Complete:** 4 audit records document entire history: Original values, Time Doctor sync changes, Manager correction

**Result:** Attendance dispute resolved with full audit trail proving employee worked 10 hours. Audit records provide evidence for payroll correction.

---

### Workflow 2: Troubleshoot Failed Scheduled Job
**Actors:** DevOps Admin

**Steps:**
1. **Alert:** Admin receives email at 3 AM: "Time Doctor Sync Job Failed"
2. Admin logs into HRMS at 9 AM
3. Admin navigates to "Dev Tools" → "Cron Job Logs"
4. Admin filters: Job Type = Time Doctor Sync, Date = Today
5. Frontend calls `POST /api/DevTool/GetCronLogs`
6. Admin sees CronLog:
```json
{
  "id": 567,
  "typeId": 1,
  "typeName": "Fetch Time Doctor Time Sheet Stats",
  "startedAt": "2025-01-17T02:00:00Z",
  "completedAt": null,
  "payload": "{\"forDate\": \"2025-01-16\"}",
  "status": "Failed"
}
```
7. Admin notes: Job started at 2 AM, never completed (CompletedAt = NULL)
8. Admin navigates to "Dev Tools" → "Application Logs"
9. Admin filters: Date = 2025-01-17 02:00 - 03:00, Log Level = Error
10. Frontend calls `POST /api/DevTool/GetLogs`
11. Admin sees error logs:
```json
{
  "logs": [
    {
      "timeStamp": "2025-01-17T02:05:32Z",
      "logLevel": "Error",
      "message": "Failed to fetch Time Doctor data for 2025-01-16",
      "exception": "System.Net.Http.HttpRequestException: The operation has timed out after 30000 milliseconds..."
    },
    {
      "timeStamp": "2025-01-17T02:05:35Z",
      "logLevel": "Error",
      "message": "Time Doctor sync failed for 2025-01-16",
      "exception": "System.AggregateException: One or more errors occurred..."
    }
  ]
}
```
12. Admin identifies root cause: Time Doctor API timeout
13. Admin checks Time Doctor status page: "Service degradation 2-3 AM UTC"
14. Admin decides to manually re-run job
15. Admin navigates to "Dev Tools" → "Run Cron Job"
16. Admin selects: Job Type = Time Doctor Sync, For Date = 2025-01-16
17. Admin clicks "Trigger Job"
18. Frontend calls `POST /api/DevTool/RunCron`
19. Backend creates new CronLog entry, triggers Quartz job
20. Job starts, fetches data successfully, completes in 15 minutes
21. Admin verifies: CompletedAt = 2025-01-17T09:45:15Z (✅ Success)
22. Admin checks attendance report: Data for 2025-01-16 now present
23. Admin documents incident: "Time Doctor API timeout at 2 AM, manually re-ran job at 9:30 AM, completed successfully"
24. **Audit Trail:** 2 CronLog entries (failed job, successful retry), 2 error logs, incident documented

**Result:** Failed job identified, root cause diagnosed (external API timeout), manually recovered, full audit trail preserved.

---

### Workflow 3: Compliance Audit - Leave Policy History
**Actors:** External Auditor, HR Admin

**Steps:**
1. **Audit Request:** External auditor requests: "Provide leave policy history for 2024, show what policy was in effect when Employee X joined in June 2024"
2. HR Admin logs into HRMS
3. Navigates to "Company Policies" → "Leave Policy"
4. Clicks "View History" button
5. Frontend calls `POST /api/CompanyPolicy/GetCompanyPolicyHistoryList`
6. Backend returns policy versions:
```json
{
  "policyHistoryList": [
    {
      "versionNumber": 3,
      "effectiveDate": "2025-01-01",
      "uploadedOn": "2024-12-15T10:00:00Z",
      "changeDescription": "Added comp-off policy, increased sick leave to 15 days"
    },
    {
      "versionNumber": 2,
      "effectiveDate": "2024-07-01",
      "uploadedOn": "2024-06-20T14:30:00Z",
      "changeDescription": "Increased casual leave from 10 to 12 days"
    },
    {
      "versionNumber": 1,
      "effectiveDate": "2024-01-01",
      "uploadedOn": "2023-12-10T09:00:00Z",
      "changeDescription": "Initial leave policy"
    }
  ]
}
```
7. HR Admin identifies: Employee X joined June 15, 2024 → Version 1 was effective (Version 2 effective from July 1, 2024)
8. HR Admin clicks "Download" on Version 1 PDF
9. HR Admin provides auditor with:
   - Leave policy Version 1 PDF (effective Jan 1 - June 30, 2024)
   - Policy history showing version 1 was active when employee joined
   - Employee join date: June 15, 2024
10. Auditor verifies: Employee's leave balance matches Version 1 policy (10 casual leaves)
11. Auditor marks compliance check: ✅ Pass
12. **Audit Trail:** CompanyPolicyHistory table documents all policy versions, change dates, uploaders, providing complete compliance evidence

**Result:** Compliance audit passed with full policy version history, demonstrating HRMS maintains accurate historical records.

---

## Integration Points

### Integration 1: All API Controllers (Serilog Middleware)
**Purpose:** Log all HTTP requests and responses automatically.

**Middleware Implementation:**
```csharp
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly Serilog.ILogger _logger;
    
    public RequestLoggingMiddleware(RequestDelegate next, Serilog.ILogger logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        var requestId = context.TraceIdentifier;
        var userId = context.User.Identity?.Name ?? "Anonymous";
        
        _logger.Information("HTTP {Method} {Path} started, RequestId: {RequestId}, User: {UserId}", 
            context.Request.Method, context.Request.Path, requestId, userId);
        
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _next(context);
            
            stopwatch.Stop();
            _logger.Information("HTTP {Method} {Path} completed in {ElapsedMs}ms, Status: {StatusCode}, RequestId: {RequestId}", 
                context.Request.Method, context.Request.Path, stopwatch.ElapsedMilliseconds, context.Response.StatusCode, requestId);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.Error(ex, "HTTP {Method} {Path} failed after {ElapsedMs}ms, RequestId: {RequestId}", 
                context.Request.Method, context.Request.Path, stopwatch.ElapsedMilliseconds, requestId);
            throw;
        }
    }
}
```

**Sample Logs:**
```
[10:30:15 INF] HTTP POST /api/Employee/AddEmployee started, RequestId: abc-123, User: hr@hrms.com
[10:30:16 INF] HTTP POST /api/Employee/AddEmployee completed in 1234ms, Status: 200, RequestId: abc-123
```

---

### Integration 2: Quartz.NET Jobs (CronLog Creation)
**Purpose:** Track all scheduled job executions automatically.

**Job Base Class:**
```csharp
public abstract class BaseJob : IJob
{
    protected readonly IDevToolService _devToolService;
    protected readonly Serilog.ILogger _logger;
    protected CronType JobType { get; set; }
    
    public async Task Execute(IJobExecutionContext context)
    {
        var requestId = context.MergedJobDataMap.GetString("RequestId") ?? Guid.NewGuid().ToString();
        var payload = GetPayloadFromContext(context);
        
        // Create CronLog entry
        var cronLogId = await _devToolService.CreateCronLog(new CronLog
        {
            TypeId = JobType,
            RequestId = requestId,
            StartedAt = DateTime.UtcNow,
            Payload = JsonConvert.SerializeObject(payload),
            CreatedBy = "System"
        });
        
        try
        {
            await ExecuteJob(context);
            
            // Update CronLog completion
            await _devToolService.UpdateCronLogCompletion(cronLogId, DateTime.UtcNow);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "{JobType} failed with RequestId: {RequestId}", JobType, requestId);
            throw;
        }
    }
    
    protected abstract Task ExecuteJob(IJobExecutionContext context);
    protected abstract object GetPayloadFromContext(IJobExecutionContext context);
}
```

---

### Integration 3: AttendanceService (Audit Trail)
**Purpose:** Log all attendance modifications automatically.

**Update Method with Audit:**
```csharp
public async Task<ApiResponseModel<CrudResult>> UpdateAttendanceAsync(long employeeId, AttendanceRequestDto attendanceRow, long? attendanceId)
{
    var existingAttendance = await _unitOfWork.AttendanceRepository.GetAttendanceByIdAsync(attendanceId.Value);
    
    // Detect changes and create audit records
    var audits = new List<AttendanceAuditDto>();
    
    if (existingAttendance.StartTime != attendanceRow.StartTime)
        audits.Add(new AttendanceAuditDto { FieldName = "StartTime", OldValue = existingAttendance.StartTime.ToString(), NewValue = attendanceRow.StartTime.ToString() });
    
    if (existingAttendance.EndTime != attendanceRow.EndTime)
        audits.Add(new AttendanceAuditDto { FieldName = "EndTime", OldValue = existingAttendance.EndTime?.ToString(), NewValue = attendanceRow.EndTime?.ToString() });
    
    // Update attendance
    await _unitOfWork.AttendanceRepository.UpdateAsync(attendanceRow);
    
    // Save audit trail
    await _unitOfWork.AttendanceRepository.InsertAuditTrailAsync(attendanceId.Value, audits, SessionUserId);
    
    _logger.Information("Attendance {AttendanceId} updated by user {UserId}, {Count} fields changed", attendanceId, SessionUserId, audits.Count);
    
    return new ApiResponseModel<CrudResult>(200, SuccessMessage.AttendanceUpdated, CrudResult.Success);
}
```

---

## Known Limitations

### 1. No Log Retention Policy
**Impact:** Logs table grows indefinitely, potential performance degradation.  
**Current Implementation:** All logs retained permanently.  
**Workaround:** Manual database cleanup (archive logs older than 90 days).  
**Future Enhancement:** Implement automatic log archival (move to cold storage after 90 days, delete after 1 year).

---

### 2. No Audit Log Encryption
**Impact:** Audit records stored in plain text, potential security risk if database compromised.  
**Current Implementation:** No encryption for audit fields.  
**Workaround:** Database-level encryption (TDE - Transparent Data Encryption).  
**Future Enhancement:** Application-level encryption for sensitive audit fields (OldValue, NewValue).

---

### 3. No Real-Time Alerts
**Impact:** Admins must manually check logs for critical errors.  
**Current Implementation:** Email alerts only for failed scheduled jobs.  
**Workaround:** Manual log monitoring in Dev Tools UI.  
**Future Enhancement:** Real-time alerts via email, Slack, Teams for critical errors (API failures, security breaches).

---

### 4. Limited DevTool Authorization
**Impact:** DevTool endpoints accessible to all authenticated users.  
**Current Implementation:** `[HasPermission]` attribute commented out in DevToolController.  
**Workaround:** Manual permission checks not enforced.  
**Future Enhancement:** Uncomment permission attributes, restrict to Super Admin only.

---

### 5. No Audit Report Export
**Impact:** Cannot export audit trail to Excel for offline analysis.  
**Current Implementation:** Audit trail only viewable in UI.  
**Workaround:** Manual SQL queries to extract audit data.  
**Future Enhancement:** Add "Export Audit Trail" button with Excel generation.

---

## Summary

**Module 12: Audit Trail & Logging** provides comprehensive audit and logging infrastructure to track all user actions, data modifications, system events, and scheduled job executions. The module ensures compliance, enables security monitoring, facilitates troubleshooting, and provides forensic analysis capabilities for the HRMS application.

### Core Functionalities Delivered:
✅ **Structured Logging:** Serilog with SQL Server and Console sinks  
✅ **Attendance Audit Trail:** Track all attendance data modifications  
✅ **Cron Job Logs:** Monitor scheduled job executions  
✅ **Policy Version History:** Track company policy changes over time  
✅ **User Activity Monitoring:** Log login, logout, data modifications  
✅ **Log Search & Filtering:** Query logs by level, message, date range  
✅ **Immutable Audit Records:** Cannot delete or modify audit logs  

### Technical Implementation Highlights:
- **Serilog:** Industry-standard structured logging framework
- **AttendanceAudit Table:** Field-level change tracking with old/new values
- **CronLog Table:** Job execution history with start/completion timestamps
- **CompanyPolicyHistory Table:** Policy version control for compliance
- **DevToolController:** Admin UI for log viewing and job monitoring
- **ILogger Injection:** Consistent logging across all services

### Integration Ecosystem:
- **All API Controllers:** Request/response logging via middleware
- **Quartz.NET Jobs:** Automatic CronLog creation for scheduled tasks
- **AttendanceService:** Audit trail for attendance modifications
- **CompanyPolicyService:** Version history tracking
- **Time Doctor Integration:** Sync job execution logs

### Business Value:
- **Compliance:** Audit trail for regulatory requirements (GDPR, SOC 2)
- **Security:** Detect unauthorized access and data tampering
- **Troubleshooting:** Identify root cause of system failures
- **Accountability:** Track who changed what and when
- **Forensics:** Investigate security incidents and data breaches

### Production Readiness:
✅ Serilog configured and operational  
✅ AttendanceAudit table tracking changes  
✅ CronLog table monitoring job executions  
✅ CompanyPolicyHistory tracking policy versions  
✅ DevTool endpoints functional  
⚠️ No log retention policy (unlimited growth)  
⚠️ No encryption for audit records  
⚠️ No real-time error alerts  
⚠️ DevTool authorization not enforced  

### Future Enhancements (Recommended):
1. **Log Retention Policy:** Archive logs after 90 days, delete after 1 year
2. **Audit Encryption:** Encrypt sensitive audit fields (OldValue, NewValue)
3. **Real-Time Alerts:** Email/Slack notifications for critical errors
4. **DevTool Authorization:** Restrict to Super Admin role
5. **Audit Report Export:** Excel export for audit trail
6. **Log Analytics Dashboard:** Visualize error trends, job success rates
7. **Log Streaming:** Real-time log streaming for monitoring tools (Grafana, Kibana)
8. **Audit Diff View:** Visual comparison of old vs. new values
9. **User Activity Report:** Per-user activity summary for security audits
10. **Log Search Optimization:** Full-text indexing for faster log queries

**End of Module 12 Documentation**

**Related Modules:**  
← [Module 11: Reporting & Analytics](./11-reporting-analytics.md)  
→ [Module Index](./README.md)
