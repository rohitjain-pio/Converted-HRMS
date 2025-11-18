# Module 11: Reporting & Analytics

## Module Overview

**Module Name:** Reporting & Analytics  
**Module ID:** 11  
**Purpose:** Comprehensive reporting system to generate, view, and export attendance reports, employee reports, and analytics data for HR, management, and administrative decision-making. Provides filterable, sortable, and exportable data views with date range selection and Excel export capabilities.

**Technology Stack:**
- Backend: ASP.NET Core 8.0 Web API
- Database: SQL Server with stored procedures for optimized report queries
- Frontend: React with MaterialReactTable (MRT) for data display
- Export: EPPlus/ClosedXML for Excel generation
- ORM: Dapper for database operations

**Key Capabilities:**
- Employee attendance reports with date range filters
- Paginated, sortable, filterable report tables
- Excel export for all reports (offline analysis and payroll processing)
- Department, branch, designation, employee-level filtering
- Date range reports (max 90 days to prevent performance issues)
- Manager-level filtering (managers see only their team reports)
- Real-time data aggregation with stored procedures

---

## Architecture Overview

### Components

**1. AttendanceController (Reports)**
- **Location:** `HRMS.API/Controllers/AttendanceController.cs`
- **Purpose:** API endpoints for attendance report generation
- **Methods:**
  - `GetEmployeeReport()`: Paginated attendance report with filters
  - `ExportEmployeeReportExcel()`: Export report to Excel

**2. AttendanceService (Report Logic)**
- **Location:** `HRMS.Application/Services/AttendanceService.cs`
- **Purpose:** Business logic for report generation and validation
- **Methods:**
  - `GetEmployeeReport()`: Validate filters, call repository, return report
  - `GetAttendanceReportInExcel()`: Fetch all records (no pagination), generate Excel

**3. AttendanceRepository (Report Queries)**
- **Location:** `HRMS.Infrastructure/Repositories/AttendanceRepository.cs`
- **Purpose:** Database operations for reports using stored procedures
- **Methods:**
  - `GetEmployeeReport()`: Call `GetEmployeeAttendanceReport` stored procedure
  - `GenerateAttendanceReportExcelFile()`: Create Excel file from data

**4. DevToolController (Logs & System Reports)**
- **Location:** `HRMS.API/Controllers/DevToolController.cs`
- **Purpose:** Developer/admin tools for system monitoring and logs
- **Methods:**
  - `GetLogs()`: Application logs with pagination and filters
  - `GetCronLogs()`: Scheduled job execution logs
  - `GetCrons()`: List of all available scheduled jobs
  - `RunCron()`: Manually trigger scheduled jobs

**5. Grievance Admin Report**
- **Location:** `Frontend/source/src/pages/Grievances/GrievanceAdminReport/index.tsx`
- **Purpose:** Grievance report with employee filtering and export
- **Features:** Export to Excel, employee multi-select, date filters

---

## Database Schema

### 1. Stored Procedure: GetEmployeeAttendanceReport
```sql
CREATE OR ALTER PROCEDURE [dbo].[GetEmployeeAttendanceReport]
    @EmployeeCodes NVARCHAR(MAX) = NULL,
    @EmployeeName NVARCHAR(200) = NULL,
    @EmployeeEmail NVARCHAR(200) = NULL,
    @CountryId INT = NULL,
    @DepartmentId INT = NULL,
    @BranchId INT = NULL,
    @DesignationId INT = NULL,
    @SortColumn NVARCHAR(50) = 'EmployeeName',
    @SortDesc BIT = 0,
    @StartIndex INT = 0,
    @PageSize INT = 10,
    @IsManualAttendance BIT = NULL,
    @StartDate DATE,
    @EndDate DATE,
    @DOJRangeFrom DATE = NULL,
    @DOJRangeTo DATE = NULL,
    @ReportingManagerId INT = NULL
AS
BEGIN
    -- Build dynamic date columns for selected range
    DECLARE @DateColumns NVARCHAR(MAX) = '';
    DECLARE @CurrentDate DATE = @StartDate;
    
    WHILE @CurrentDate <= @EndDate
    BEGIN
        SET @DateColumns = @DateColumns + 
            QUOTENAME(CONVERT(VARCHAR(10), @CurrentDate, 120)) + ' = 
            ISNULL((SELECT FORMAT(DATEADD(MINUTE, TotalHours, 0), ''HH:mm'') 
                    FROM Attendance 
                    WHERE EmployeeId = ED.EmployeeId 
                      AND [Date] = ''' + CONVERT(VARCHAR(10), @CurrentDate, 120) + '''), ''00:00''),';
        SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
    END;
    
    -- Remove trailing comma
    IF LEN(@DateColumns) > 0
        SET @DateColumns = LEFT(@DateColumns, LEN(@DateColumns) - 1);
    
    -- Dynamic SQL for report with date columns
    DECLARE @SQL NVARCHAR(MAX) = '
    ;WITH EmployeeList AS (
        SELECT 
            ED.EmployeeId,
            E.EmployeeCode,
            CONCAT(E.FirstName, '' '', E.MiddleName, '' '', E.LastName) AS EmployeeName,
            D.Name AS Department,
            BR.Name AS Branch
        FROM EmploymentDetail ED
        INNER JOIN EmployeeData E ON ED.EmployeeId = E.Id
        LEFT JOIN Department D ON ED.DepartmentId = D.Id
        LEFT JOIN Branch BR ON ED.BranchId = BR.Id
        WHERE E.IsDeleted = 0';
    
    -- Apply filters
    IF @EmployeeCodes IS NOT NULL
        SET @SQL = @SQL + ' AND E.EmployeeCode IN (SELECT value FROM STRING_SPLIT(@EmployeeCodes, '',''))';
    IF @EmployeeName IS NOT NULL
        SET @SQL = @SQL + ' AND (E.FirstName + '' '' + E.LastName) LIKE ''%'' + @EmployeeName + ''%''';
    IF @DepartmentId IS NOT NULL
        SET @SQL = @SQL + ' AND ED.DepartmentId = @DepartmentId';
    IF @BranchId IS NOT NULL
        SET @SQL = @SQL + ' AND ED.BranchId = @BranchId';
    IF @ReportingManagerId IS NOT NULL
        SET @SQL = @SQL + ' AND (ED.ReportingMangerId = @ReportingManagerId OR ED.ImmediateManager = @ReportingManagerId)';
    
    -- Add dynamic date columns
    SET @SQL = @SQL + '
    ),
    EmployeeAttendance AS (
        SELECT 
            EL.EmployeeCode,
            EL.EmployeeName,
            EL.Department,
            EL.Branch,
            ' + @DateColumns + ',
            (SELECT SUM(TotalHours) FROM Attendance WHERE EmployeeId = EL.EmployeeId AND [Date] BETWEEN @StartDate AND @EndDate) AS TotalHour
        FROM EmployeeList EL
    )
    SELECT COUNT(*) OVER() AS TotalRecords, *
    FROM EmployeeAttendance
    ORDER BY ' + @SortColumn + CASE WHEN @SortDesc = 1 THEN ' DESC' ELSE ' ASC' END + '
    OFFSET @StartIndex ROWS FETCH NEXT @PageSize ROWS ONLY';
    
    -- Execute dynamic SQL
    EXEC sp_executesql @SQL, 
        N'@EmployeeCodes NVARCHAR(MAX), @EmployeeName NVARCHAR(200), @DepartmentId INT, @BranchId INT, @StartDate DATE, @EndDate DATE, @ReportingManagerId INT, @StartIndex INT, @PageSize INT',
        @EmployeeCodes, @EmployeeName, @DepartmentId, @BranchId, @StartDate, @EndDate, @ReportingManagerId, @StartIndex, @PageSize;
END;
```

**Purpose:** Generate employee attendance report with dynamic date columns.  
**Dynamic Columns:** One column per day in selected date range (e.g., 2025-01-01, 2025-01-02, ...).  
**Output:** Each row represents an employee, columns show hours worked on each date.

---

### 2. Stored Procedure: GetLogs
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
           Id, TimeStamp, Level AS LogLevel, Message, Exception
    FROM Logs
    WHERE (@LogLevel IS NULL OR Level = @LogLevel)
      AND (@Message IS NULL OR Message LIKE '%' + @Message + '%')
      AND (@Exception IS NULL OR Exception LIKE '%' + @Exception + '%')
      AND (@StartDate IS NULL OR TimeStamp >= @StartDate)
      AND (@EndDate IS NULL OR TimeStamp <= @EndDate)
    ORDER BY 
        CASE WHEN @SortColumn = 'TimeStamp' AND @SortDesc = 0 THEN TimeStamp END ASC,
        CASE WHEN @SortColumn = 'TimeStamp' AND @SortDesc = 1 THEN TimeStamp END DESC
    OFFSET @StartIndex ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
```

**Purpose:** Retrieve application logs with filters (log level, message, exception, date range).  
**Use Case:** Debug production issues, monitor errors, track API calls.

---

### 3. CronLog Table
```sql
CREATE TABLE CronLog (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    TypeId INT NOT NULL, -- CronType enum (1 = TimeDoctorSync, 2 = LeaveAccrual)
    RequestId NVARCHAR(100) NULL, -- HTTP request ID for traceability
    StartedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CompletedAt DATETIME NULL, -- NULL if job still running or failed
    Payload NVARCHAR(MAX) NULL, -- JSON with job parameters
    CreatedBy NVARCHAR(100) NOT NULL,
    CreatedOn DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ModifiedBy NVARCHAR(100) NULL,
    ModifiedOn DATETIME NULL
)
```

**Purpose:** Track scheduled job executions (Time Doctor sync, leave accrual, grievance updates).  
**Key Fields:**
- **TypeId:** Identifies job type (1 = Fetch Time Doctor Time Sheet Stats, 2 = Accrual Leaves)
- **StartedAt:** Job start timestamp
- **CompletedAt:** Job completion timestamp (NULL if failed/running)
- **Payload:** JSON with job parameters (e.g., `{"forDate": "2025-01-15"}`)

---

## Features List

### Feature 1: Employee Attendance Report
**Description:** HR/Manager generates paginated attendance report for employees with filters (employee, department, branch, date range).

**Business Rules:**
- Date range required (defaults: last 7 days if not provided)
- Maximum 90-day range allowed (prevents performance issues)
- Managers see only their team members (filtered by `ReportingManagerId`)
- Super Admin sees all employees
- Pagination required (default 10 records per page)
- Sortable columns: EmployeeCode, EmployeeName, Department, TotalHour
- Dynamic date columns: One column per day in selected range

**User Interactions:**
1. HR user navigates to "Reports" → "Employee Attendance Report"
2. Sees filter panel:
   ```
   Employee: [Multi-select employee search]
   Department: [Dropdown: All, Engineering, HR, Sales]
   Branch: [Dropdown: All, India, USA]
   Date From: [Date picker: 2025-01-01]
   Date To: [Date picker: 2025-01-07]
   ```
3. HR selects filters:
   - Department: Engineering
   - Date range: Jan 01 - Jan 07, 2025 (7 days)
4. HR clicks "Search"
5. Frontend calls `POST /api/Attendance/GetEmployeeReport`:
```json
{
  "startIndex": 0,
  "pageSize": 10,
  "sortColumnName": "EmployeeName",
  "sortDirection": "asc",
  "filters": {
    "employeeCode": null,
    "employeeName": null,
    "departmentId": 1,
    "branchId": null,
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-07"
  }
}
```
6. Backend validates date range (max 90 days)
7. Backend calls `GetEmployeeAttendanceReport` stored procedure
8. Stored procedure generates dynamic SQL with 7 date columns
9. Backend returns report:
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 45,
    "employeeReports": [
      {
        "employeeCode": 1001,
        "employeeName": "John Doe",
        "department": "Engineering",
        "branch": "India",
        "workedHoursByDate": {
          "2025-01-01": "08:30",
          "2025-01-02": "09:15",
          "2025-01-03": "08:00",
          "2025-01-04": "00:00",
          "2025-01-05": "00:00",
          "2025-01-06": "09:45",
          "2025-01-07": "08:00"
        },
        "totalHour": "43:30"
      },
      ...
    ]
  }
}
```
10. Frontend displays MaterialReactTable with columns:
    - Employee Code
    - Employee Name
    - Department
    - Branch
    - 2025-01-01 (08:30)
    - 2025-01-02 (09:15)
    - 2025-01-03 (08:00)
    - 2025-01-04 (00:00 - Absent)
    - 2025-01-05 (00:00 - Absent)
    - 2025-01-06 (09:45)
    - 2025-01-07 (08:00)
    - Total Hours (43:30)
11. HR scrolls horizontally to view all date columns
12. HR clicks "Next Page" → Frontend fetches next 10 records

**Key Data Flow:**
- Frontend → API → Service (validation) → Repository (stored procedure) → Service (format data) → Frontend (display)

---

### Feature 2: Excel Export of Attendance Report
**Description:** Export attendance report to Excel file for offline analysis, payroll processing, or sharing with management.

**Business Rules:**
- Export all records matching filters (no pagination limit)
- Excel file includes all columns from report view
- File name format: `EmployeeReport_YYYYMMDD_HHMMSS.xlsx`
- Each date gets its own column in Excel
- Total hours column at the end
- Headers formatted with bold text and background color
- Absent days (00:00) highlighted in red

**User Interactions:**
1. HR applies filters on attendance report page
2. HR clicks "Export to Excel" button (FileDownloadIcon)
3. Frontend calls `POST /api/Attendance/ExportEmployeeReportExcel`:
```json
{
  "startIndex": 0,
  "pageSize": 0,
  "filters": {
    "departmentId": 1,
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-07"
  }
}
```
4. Backend sets `pageSize = int.MaxValue` to fetch all records
5. Backend calls `GetEmployeeReport()` service method
6. Service returns all matching records (no pagination)
7. Backend calls `GenerateAttendanceReportExcelFile()` repository method
8. Repository creates Excel file using EPPlus:
```csharp
using (var package = new ExcelPackage())
{
    var worksheet = package.Workbook.Worksheets.Add("Attendance Report");
    
    // Headers
    int col = 1;
    worksheet.Cells[1, col++].Value = "Employee Code";
    worksheet.Cells[1, col++].Value = "Employee Name";
    worksheet.Cells[1, col++].Value = "Department";
    worksheet.Cells[1, col++].Value = "Branch";
    
    // Dynamic date columns
    for (var date = fromDate; date <= toDate; date = date.AddDays(1))
    {
        worksheet.Cells[1, col++].Value = date.ToString("yyyy-MM-dd");
    }
    worksheet.Cells[1, col++].Value = "Total Hours";
    
    // Header formatting
    worksheet.Cells[1, 1, 1, col - 1].Style.Font.Bold = true;
    worksheet.Cells[1, 1, 1, col - 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
    worksheet.Cells[1, 1, 1, col - 1].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
    
    // Data rows
    int row = 2;
    foreach (var employee in employees)
    {
        col = 1;
        worksheet.Cells[row, col++].Value = employee.EmployeeCode;
        worksheet.Cells[row, col++].Value = employee.EmployeeName;
        worksheet.Cells[row, col++].Value = employee.Department;
        worksheet.Cells[row, col++].Value = employee.Branch;
        
        // Date columns
        for (var date = fromDate; date <= toDate; date = date.AddDays(1))
        {
            var hours = employee.WorkedHoursByDate[date.ToString("yyyy-MM-dd")] ?? "00:00";
            worksheet.Cells[row, col].Value = hours;
            
            // Highlight absent days in red
            if (hours == "00:00")
            {
                worksheet.Cells[row, col].Style.Font.Color.SetColor(Color.Red);
            }
            col++;
        }
        worksheet.Cells[row, col++].Value = employee.TotalHour;
        row++;
    }
    
    // Auto-fit columns
    worksheet.Cells.AutoFitColumns();
    
    return package.GetAsByteArray();
}
```
9. Backend returns Excel file as byte array
10. Frontend receives blob response
11. Frontend creates download link:
```typescript
const blobUrl = URL.createObjectURL(response.data);
const link = document.createElement("a");
link.href = blobUrl;
link.setAttribute("download", "EmployeeMasterFile.xlsx");
document.body.appendChild(link);
link.click();
URL.revokeObjectURL(blobUrl);
```
12. Browser downloads file: `EmployeeReport_20250115_143022.xlsx`
13. HR opens Excel file offline, sees formatted report with 45 employees

**Excel Output Example:**
| Employee Code | Employee Name | Department | 2025-01-01 | 2025-01-02 | Total Hours |
|---------------|---------------|------------|------------|------------|-------------|
| 1001          | John Doe      | Engineering| 08:30      | 09:15      | 43:30       |
| 1002          | Jane Smith    | HR         | **00:00** (red) | 08:00      | 40:00       |

---

### Feature 3: Application Logs Report
**Description:** Developer/Admin tool to view application logs with filters (log level, message, exception, date range) for debugging and monitoring.

**Business Rules:**
- Log levels: Verbose, Debug, Information, Warning, Error, Fatal
- Pagination required (default 10 logs per page)
- Default sort: TimeStamp DESC (most recent first)
- Search by message keyword (partial match)
- Filter by exception text
- Date range filter

**User Interactions:**
1. Admin navigates to "Dev Tools" → "Application Logs"
2. Sees filter panel:
   ```
   Log Level: [Dropdown: All, Error, Warning, Info]
   Message: [Text input: search logs]
   Date From: [Date picker]
   Date To: [Date picker]
   ```
3. Admin selects filters:
   - Log Level: Error
   - Date From: 2025-01-01
   - Date To: 2025-01-07
4. Admin clicks "Search"
5. Frontend calls `POST /api/DevTool/GetLogs`:
```json
{
  "startIndex": 0,
  "pageSize": 10,
  "sortColumnName": "TimeStamp",
  "sortDirection": "desc",
  "filters": {
    "logLevel": "Error",
    "message": null,
    "exception": null,
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-01-07T23:59:59"
  }
}
```
6. Backend calls `GetLogs` stored procedure
7. Backend returns logs:
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 23,
    "logs": [
      {
        "id": 5678,
        "timeStamp": "2025-01-05T14:32:15.123Z",
        "logLevel": "Error",
        "message": "Failed to sync Time Doctor data for employee 1001",
        "exception": "System.Net.Http.HttpRequestException: Connection timeout..."
      },
      ...
    ]
  }
}
```
8. Frontend displays MaterialReactTable with columns:
   - Timestamp
   - Log Level (color-coded: Error = Red, Warning = Orange, Info = Blue)
   - Message
   - Exception (expandable)
9. Admin clicks on log row to view full exception stack trace

**Use Cases:**
- Debug production errors
- Monitor API response times
- Track failed scheduled jobs
- Investigate user-reported issues

---

### Feature 4: Cron Job Logs Report
**Description:** View scheduled job execution history with status, start time, completion time, and payload for troubleshooting automated tasks.

**Business Rules:**
- Job types: Fetch Time Doctor Time Sheet Stats, Accrual Leaves, Grievance Level Update, Comp-Off Expiry
- Pagination required (default 10 logs per page)
- Default sort: StartedAt DESC (most recent first)
- Filter by job type
- Filter by date range
- Show job status: Completed (CompletedAt not NULL), Running (CompletedAt NULL), Failed (Exception in logs)

**User Interactions:**
1. Admin navigates to "Dev Tools" → "Cron Job Logs"
2. Sees filter panel:
   ```
   Job Type: [Dropdown: All, Time Doctor Sync, Leave Accrual]
   Date From: [Date picker]
   Date To: [Date picker]
   ```
3. Admin selects:
   - Job Type: Time Doctor Sync
   - Date From: 2025-01-01
4. Admin clicks "Search"
5. Frontend calls `POST /api/DevTool/GetCronLogs`:
```json
{
  "startIndex": 0,
  "pageSize": 10,
  "sortColumnName": "StartedAt",
  "sortDirection": "desc",
  "filters": {
    "typeId": 1,
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-01-07T23:59:59"
  }
}
```
6. Backend calls `GetCronLogs` stored procedure
7. Backend returns logs:
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 7,
    "cronLogsList": [
      {
        "id": 123,
        "typeId": 1,
        "typeName": "Fetch Time Doctor Time Sheet Stats",
        "requestId": "1234567890",
        "startedAt": "2025-01-07T02:00:00Z",
        "completedAt": "2025-01-07T02:15:32Z",
        "payload": "{\"forDate\": \"2025-01-06\"}"
      },
      {
        "id": 122,
        "typeId": 1,
        "typeName": "Fetch Time Doctor Time Sheet Stats",
        "requestId": "1234567889",
        "startedAt": "2025-01-06T02:00:00Z",
        "completedAt": null,
        "payload": "{\"forDate\": \"2025-01-05\"}"
      }
    ]
  }
}
```
8. Frontend displays MaterialReactTable with columns:
   - Job ID
   - Job Type
   - Started At
   - Completed At
   - Duration (Completed - Started)
   - Status (✅ Completed, ⏳ Running, ❌ Failed)
   - Payload (expandable JSON)
9. Admin sees Job ID 122 is still running (CompletedAt = null)
10. Admin clicks "View Payload" to see job parameters: `{"forDate": "2025-01-05"}`

**Use Cases:**
- Troubleshoot failed scheduled jobs
- Monitor job execution times
- Verify Time Doctor sync completed
- Check leave accrual job ran correctly

---

### Feature 5: Manual Cron Job Trigger
**Description:** Admin can manually trigger scheduled jobs with custom parameters for testing or recovering from failures.

**Business Rules:**
- Only Super Admin can trigger jobs
- Required parameters:
  - **Time Doctor Sync:** `forDate` (string, format: YYYY-MM-DD)
  - **Leave Accrual:** `forMonth` (int, 1-12), `forYear` (int, e.g., 2025)
- Job runs asynchronously (does not block API response)
- Job logs created automatically with `RequestId` for traceability
- Cannot trigger same job twice simultaneously

**User Interactions:**
1. Admin navigates to "Dev Tools" → "Run Cron Job"
2. Sees job selection form:
   ```
   Job Type: [Dropdown: Time Doctor Sync, Leave Accrual]
   ```
3. Admin selects "Time Doctor Sync"
4. Form shows parameter inputs:
   ```
   For Date: [Date picker: 2025-01-10]
   ```
5. Admin enters date: 2025-01-10
6. Admin clicks "Trigger Job"
7. Frontend calls `POST /api/DevTool/RunCron`:
```json
{
  "type": 1,
  "data": {
    "forDate": "2025-01-10"
  }
}
```
8. Backend validates parameters
9. Backend checks if job already running (query CronLog for StartedAt not NULL and CompletedAt NULL)
10. Backend creates Quartz job data map:
```csharp
var dataMap = new JobDataMap {
    { "fetchForDate", "2025-01-10" },
    { "RequestId", HttpContext.TraceIdentifier }
};
```
11. Backend triggers job:
```csharp
await scheduler.TriggerJob(new JobKey("FetchTimeDoctorTimeSheetJob"), dataMap);
```
12. Backend returns success response:
```json
{
  "statusCode": 200,
  "message": "Job triggered successfully",
  "result": "Job will run in background. Check Cron Logs for execution status."
}
```
13. Frontend shows success toast: "Time Doctor Sync job triggered for 2025-01-10"
14. Admin navigates to "Cron Job Logs" to monitor job progress
15. Job appears in logs with Status = Running
16. After 15 minutes, job completes, Status changes to Completed

**Use Cases:**
- Recover from failed nightly Time Doctor sync
- Manually run leave accrual for specific month
- Test scheduled job logic before production deployment
- Backfill missing attendance data

---

### Feature 6: Grievance Admin Report
**Description:** HR Admin report for grievances with employee filtering and Excel export for tracking grievance trends and resolution metrics.

**Business Rules:**
- Filter by employee (multi-select)
- Filter by grievance status, category, priority
- Export to Excel with applied filters
- Pagination and sorting supported

**User Interactions:**
1. HR navigates to "Grievances" → "Admin Report"
2. Selects employees from multi-select dropdown
3. Applies filters: Status = Open, Priority = High
4. Clicks "Search" → Report displays grievances
5. Clicks "Export" → Excel downloaded: `GrievanceMasterFile.xlsx`

---

## API Endpoints

### 1. POST /api/Attendance/GetEmployeeReport
**Purpose:** Fetch paginated employee attendance report with filters.

**Request:**
```json
{
  "startIndex": 0,
  "pageSize": 10,
  "sortColumnName": "EmployeeName",
  "sortDirection": "asc",
  "filters": {
    "employeeCode": "1001",
    "employeeName": "John",
    "departmentId": 1,
    "branchId": 2,
    "designationId": null,
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-07",
    "isManualAttendance": null,
    "dojFrom": null,
    "dojTo": null
  }
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 45,
    "employeeReports": [
      {
        "employeeCode": 1001,
        "employeeName": "John Doe",
        "department": "Engineering",
        "branch": "India",
        "workedHoursByDate": {
          "2025-01-01": "08:30",
          "2025-01-02": "09:15"
        },
        "totalHour": "43:30"
      }
    ]
  }
}
```

**Authorization:** `[HasPermission(Permissions.ReadAttendanceEmployeeReport)]`

---

### 2. POST /api/Attendance/ExportEmployeeReportExcel
**Purpose:** Export attendance report to Excel file.

**Request:** Same as `GetEmployeeReport` (filters applied).

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File name: `EmployeeReport_20250115_143022.xlsx`
- Binary Excel file (byte array)

**Authorization:** `[HasPermission(Permissions.ReadAttendanceEmployeeReport)]`

---

### 3. POST /api/DevTool/GetLogs
**Purpose:** Fetch paginated application logs with filters.

**Request:**
```json
{
  "startIndex": 0,
  "pageSize": 10,
  "sortColumnName": "TimeStamp",
  "sortDirection": "desc",
  "filters": {
    "logLevel": "Error",
    "message": "timeout",
    "exception": null,
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-01-07T23:59:59"
  }
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 23,
    "logs": [
      {
        "id": 5678,
        "timeStamp": "2025-01-05T14:32:15.123Z",
        "logLevel": "Error",
        "message": "Failed to sync Time Doctor data",
        "exception": "System.Net.Http.HttpRequestException: Connection timeout..."
      }
    ]
  }
}
```

**Authorization:** `[HasPermission(Permissions.ReadLogs)]` (currently commented out)

---

### 4. POST /api/DevTool/GetCronLogs
**Purpose:** Fetch paginated cron job execution logs.

**Request:**
```json
{
  "startIndex": 0,
  "pageSize": 10,
  "sortColumnName": "StartedAt",
  "sortDirection": "desc",
  "filters": {
    "typeId": 1,
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-01-07T23:59:59"
  }
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 7,
    "cronLogsList": [
      {
        "id": 123,
        "typeId": 1,
        "typeName": "Fetch Time Doctor Time Sheet Stats",
        "startedAt": "2025-01-07T02:00:00Z",
        "completedAt": "2025-01-07T02:15:32Z",
        "payload": "{\"forDate\": \"2025-01-06\"}"
      }
    ]
  }
}
```

**Authorization:** None (commented out, should add `[HasPermission(Permissions.ReadLogs)]`)

---

### 5. POST /api/DevTool/RunCron
**Purpose:** Manually trigger scheduled job with custom parameters.

**Request (Time Doctor Sync):**
```json
{
  "type": 1,
  "data": {
    "forDate": "2025-01-10"
  }
}
```

**Request (Leave Accrual):**
```json
{
  "type": 2,
  "data": {
    "forMonth": 1,
    "forYear": 2025
  }
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Job triggered successfully",
  "result": "Job will run in background"
}
```

**Error Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "forDate is required",
  "result": null
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Job not found",
  "result": null
}
```

**Authorization:** None (should add `[HasPermission(Permissions.TriggerJob)]`)

---

## Workflows

### Workflow 1: Generate Monthly Attendance Report for Payroll
**Actors:** HR Admin

**Steps:**
1. **Goal:** Generate attendance report for all employees in January 2025 for payroll processing
2. HR logs into HRMS
3. Navigates to "Reports" → "Employee Attendance Report"
4. Sets filters:
   - Date From: 2025-01-01
   - Date To: 2025-01-31 (31 days, within 90-day limit)
   - Department: All
   - Branch: All
5. Clicks "Search"
6. Frontend calls `POST /api/Attendance/GetEmployeeReport`
7. Backend validates date range (31 days ≤ 90 days ✓)
8. Backend calls `GetEmployeeAttendanceReport` stored procedure
9. Stored procedure builds dynamic SQL with 31 date columns
10. Query executes:
    - Joins EmployeeData, EmploymentDetail, Department, Branch
    - Subquery for each date: `SUM(TotalHours) WHERE Date = '2025-01-01'`
    - Aggregates total hours per employee
11. Result: 150 employees with attendance for each day
12. Backend formats data:
```json
{
  "totalRecords": 150,
  "employeeReports": [
    {
      "employeeCode": 1001,
      "employeeName": "John Doe",
      "workedHoursByDate": {
        "2025-01-01": "08:30",
        "2025-01-02": "09:00",
        ...
        "2025-01-31": "08:15"
      },
      "totalHour": "180:45"
    }
  ]
}
```
13. Frontend displays MaterialReactTable with:
    - 10 rows per page (pagination)
    - 35 columns (Employee Code, Name, Department, Branch, 31 date columns, Total Hours)
    - Horizontal scroll for date columns
14. HR scrolls through pages to review data
15. HR finds employee 1023 with Total Hours = "120:00" (much lower than expected)
16. HR investigates: Employee was on leave for 10 days
17. HR clicks "Export to Excel" button
18. Frontend calls `POST /api/Attendance/ExportEmployeeReportExcel`
19. Backend fetches ALL 150 employees (no pagination)
20. Backend generates Excel file:
    - Headers: Employee Code, Name, Department, 31 date columns, Total Hours
    - Absent days (00:00) highlighted in red
    - Total hours column formatted as `HH:mm`
21. Frontend downloads file: `EmployeeReport_20250131_170000.xlsx`
22. HR opens Excel, shares with payroll team
23. Payroll team calculates salaries based on total hours worked

**Result:** Monthly attendance report generated successfully, exported to Excel, used for payroll processing.

---

### Workflow 2: Troubleshoot Failed Time Doctor Sync Job
**Actors:** DevOps Admin

**Steps:**
1. **Issue:** Time Doctor sync job failed last night, attendance data missing for 2025-01-15
2. Admin receives alert email: "Time Doctor Sync Job Failed"
3. Admin logs into HRMS
4. Navigates to "Dev Tools" → "Cron Job Logs"
5. Sets filters:
   - Job Type: Time Doctor Sync
   - Date From: 2025-01-15
   - Date To: 2025-01-15
6. Clicks "Search"
7. Frontend calls `POST /api/DevTool/GetCronLogs`
8. Backend returns logs:
```json
{
  "cronLogsList": [
    {
      "id": 345,
      "typeName": "Fetch Time Doctor Time Sheet Stats",
      "startedAt": "2025-01-15T02:00:00Z",
      "completedAt": null,
      "payload": "{\"forDate\": \"2025-01-14\"}"
    }
  ]
}
```
9. Admin sees `CompletedAt = null` → Job never completed (likely timed out or crashed)
10. Admin clicks "View Payload" → Sees job was fetching data for 2025-01-14
11. Admin navigates to "Dev Tools" → "Application Logs"
12. Sets filters:
    - Log Level: Error
    - Date From: 2025-01-15 02:00:00
    - Date To: 2025-01-15 03:00:00
13. Frontend calls `POST /api/DevTool/GetLogs`
14. Backend returns error logs:
```json
{
  "logs": [
    {
      "timeStamp": "2025-01-15T02:05:32Z",
      "logLevel": "Error",
      "message": "Failed to fetch Time Doctor data for 2025-01-14",
      "exception": "System.Net.Http.HttpRequestException: The operation has timed out..."
    }
  ]
}
```
15. Admin identifies issue: Time Doctor API timeout
16. Admin decides to manually re-run job
17. Admin navigates to "Dev Tools" → "Run Cron Job"
18. Selects:
    - Job Type: Time Doctor Sync
    - For Date: 2025-01-14
19. Clicks "Trigger Job"
20. Frontend calls `POST /api/DevTool/RunCron`:
```json
{
  "type": 1,
  "data": { "forDate": "2025-01-14" }
}
```
21. Backend validates job not already running
22. Backend triggers Quartz job with `RequestId = "abc123"`
23. Backend returns success: "Job triggered successfully"
24. Admin waits 10 minutes
25. Admin refreshes "Cron Job Logs" page
26. Sees new log entry:
```json
{
  "id": 346,
  "startedAt": "2025-01-15T10:30:00Z",
  "completedAt": "2025-01-15T10:45:15Z",
  "payload": "{\"forDate\": \"2025-01-14\"}"
}
```
27. Job completed successfully
28. Admin navigates to "Reports" → "Employee Attendance Report"
29. Sets Date From = 2025-01-14, Date To = 2025-01-14
30. Verifies attendance data now present for all employees
31. Admin documents issue: "Time Doctor API timeout during nightly sync, manually re-ran job successfully"

**Result:** Failed sync job identified, manually re-triggered, attendance data recovered.

---

## Integration Points

### Integration 1: MaterialReactTable (Frontend)
**Purpose:** Display reports with sorting, pagination, filtering, and column visibility controls.

**Usage:**
```tsx
<MaterialDataTable
  columns={[
    { accessorKey: 'employeeCode', header: 'Emp Code' },
    { accessorKey: 'employeeName', header: 'Name' },
    { accessorKey: '2025-01-01', header: '2025-01-01' },
    { accessorKey: 'totalHour', header: 'Total Hours' }
  ]}
  data={rows}
  pagination={pagination}
  sorting={sorting}
  totalRecords={totalRecords}
  onPaginationChange={setPagination}
  onSortingChange={setSorting}
/>
```

**Features Used:**
- Server-side pagination (send `startIndex`, `pageSize` to API)
- Server-side sorting (send `sortColumnName`, `sortDirection` to API)
- Column visibility toggle (hide/show Branch, Department columns)
- Export button in toolbar

---

### Integration 2: EPPlus / ClosedXML (Excel Generation)
**Purpose:** Generate Excel files from report data with formatting.

**Implementation:**
```csharp
using OfficeOpenXml;

public async Task<byte[]> GenerateAttendanceReportExcelFile(List<EmployeeReportDto> employees, DateTime fromDate, DateTime toDate)
{
    using (var package = new ExcelPackage())
    {
        var worksheet = package.Workbook.Worksheets.Add("Attendance Report");
        
        // Add headers and data
        // Format cells
        // Auto-fit columns
        
        return package.GetAsByteArray();
    }
}
```

---

### Integration 3: Serilog (Logging)
**Purpose:** Structured logging for all API requests, errors, and job executions.

**Configuration:**
```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.MSSqlServer(connectionString, "Logs", autoCreateSqlTable: true)
    .WriteTo.Console()
    .CreateLogger();
```

**Logs Table Schema:**
| Column    | Type           | Description                   |
|-----------|----------------|-------------------------------|
| Id        | BIGINT         | Primary key                   |
| TimeStamp | DATETIME       | Log timestamp                 |
| Level     | NVARCHAR(50)   | Error, Warning, Info, Debug   |
| Message   | NVARCHAR(MAX)  | Log message                   |
| Exception | NVARCHAR(MAX)  | Exception stack trace         |

---

### Integration 4: Quartz.NET (Scheduled Jobs)
**Purpose:** Scheduled job execution for Time Doctor sync, leave accrual, grievance updates.

**Job Registration:**
```csharp
services.AddQuartz(q =>
{
    q.AddJob<FetchTimeDoctorTimeSheetJob>(opts => opts
        .WithIdentity("FetchTimeDoctorTimeSheetJob")
        .StoreDurably());
    
    q.AddTrigger(opts => opts
        .ForJob("FetchTimeDoctorTimeSheetJob")
        .WithCronSchedule("0 0 2 * * ?") // Daily at 2 AM
        .WithIdentity("TimeDoctorSyncTrigger"));
});
```

**Job Execution:**
```csharp
public class FetchTimeDoctorTimeSheetJob : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        var forDate = context.MergedJobDataMap.GetString("fetchForDate");
        var requestId = context.MergedJobDataMap.GetString("RequestId");
        
        // Create CronLog entry
        var cronLog = new CronLog {
            TypeId = CronType.FetchTimeDoctorTimeSheetStats,
            RequestId = requestId,
            StartedAt = DateTime.UtcNow,
            Payload = JsonConvert.SerializeObject(new { forDate })
        };
        var cronLogId = await _devToolService.CreateCronLog(cronLog);
        
        // Fetch data from Time Doctor API
        // Update Attendance table
        
        // Update CronLog completion
        await _devToolService.UpdateCronLogCompletion(cronLogId, DateTime.UtcNow);
    }
}
```

---

## Known Limitations

### 1. 90-Day Report Limit
**Impact:** Cannot generate reports exceeding 90-day range.  
**Reason:** Performance concerns with dynamic SQL column generation.  
**Workaround:** Export reports in 90-day chunks, merge in Excel.  
**Future Enhancement:** Optimize stored procedure with indexed views.

---

### 2. No Real-Time Report Refresh
**Impact:** Reports show data at time of generation, not real-time.  
**Current Implementation:** User must manually refresh page to see latest data.  
**Workaround:** Click "Search" button to refresh report.  
**Future Enhancement:** Add auto-refresh option (every 30 seconds) with websockets.

---

### 3. No Scheduled Report Emails
**Impact:** Cannot schedule automatic email delivery of reports (e.g., weekly attendance summary).  
**Current Implementation:** Users must manually generate and download reports.  
**Workaround:** Use manual export, email attachment.  
**Future Enhancement:** Add scheduled report generation with email delivery (daily/weekly/monthly).

---

### 4. No Report Caching
**Impact:** Slow report generation for large datasets (500+ employees, 90-day range).  
**Current Implementation:** Every report request executes full stored procedure.  
**Workaround:** Export to Excel, analyze offline.  
**Future Enhancement:** Implement Redis caching for frequently accessed reports (cache for 15 minutes).

---

### 5. Limited DevTool Authorization
**Impact:** DevTool endpoints have commented-out permissions, anyone authenticated can access.  
**Current Implementation:** `//[HasPermission(Permissions.ReadLogs)]` commented out.  
**Workaround:** Manual permission check in code.  
**Future Enhancement:** Uncomment permission attributes, restrict to Super Admin only.

---

## Summary

**Module 11: Reporting & Analytics** provides comprehensive reporting capabilities for HRMS data with paginated, filterable, sortable views and Excel export functionality. The module serves HR, management, and developers with attendance reports, application logs, and scheduled job monitoring. Built on MaterialReactTable for rich UI interactions and stored procedures for optimized queries, the module delivers production-ready reporting infrastructure.

### Core Functionalities Delivered:
✅ **Employee Attendance Reports:** Date range, department, branch filtering  
✅ **Excel Export:** Offline analysis and payroll processing  
✅ **Application Logs:** Error monitoring and debugging  
✅ **Cron Job Logs:** Scheduled job execution tracking  
✅ **Manual Job Trigger:** Recover from failed scheduled jobs  
✅ **Grievance Reports:** Admin view with employee filtering  
✅ **Pagination & Sorting:** Server-side data handling  

### Technical Implementation Highlights:
- **Stored Procedures:** Dynamic SQL for date-range reports with column generation
- **MaterialReactTable:** Rich UI with sorting, pagination, column visibility
- **EPPlus:** Excel generation with formatting and conditional styling
- **Serilog:** Structured logging to SQL Server
- **Quartz.NET:** Scheduled job execution and monitoring
- **CronLog:** Job execution audit trail

### Integration Ecosystem:
- **Attendance Module:** Primary data source for attendance reports
- **Employee Module:** Employee master data for report filtering
- **Time Doctor Module:** External API data for attendance sync
- **DevTools:** Logging and job monitoring infrastructure

### Business Value:
- **HR Efficiency:** Generate monthly payroll reports in seconds
- **Compliance:** Audit trail for attendance data and job executions
- **Troubleshooting:** Identify and resolve sync failures quickly
- **Data Export:** Offline analysis with Excel export
- **Performance:** Optimized queries handle 500+ employees efficiently

### Production Readiness:
✅ Attendance reports functional with filters  
✅ Excel export working  
✅ Application logs accessible  
✅ Cron job logs tracking scheduled tasks  
✅ Manual job trigger operational  
⚠️ No report caching (performance impact on large datasets)  
⚠️ DevTool endpoints lack authorization checks  
⚠️ No scheduled email reports  

### Future Enhancements (Recommended):
1. **Report Caching:** Redis for frequently accessed reports (15-minute TTL)
2. **Scheduled Emails:** Daily/weekly/monthly report delivery
3. **Real-Time Refresh:** WebSocket for live report updates
4. **Report Templates:** Pre-configured reports (e.g., "Last 7 Days Attendance")
5. **Dashboard Analytics:** Charts for attendance trends, absent days, peak hours
6. **Custom Report Builder:** Drag-and-drop interface for custom reports
7. **Report History:** Save and reuse report configurations
8. **PDF Export:** Generate PDF reports with charts and summaries
9. **DevTool Authorization:** Restrict log access to Super Admin

**End of Module 11 Documentation**

**Related Modules:**  
← [Module 10: Role & Permission Management](./10-role-permission-management.md)  
→ [Module 12: Audit Trail & Logging](./12-audit-trail-logging.md)
