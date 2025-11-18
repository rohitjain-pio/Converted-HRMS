# HRMS Database - Stored Procedures Documentation

## Table of Contents
1. [Overview](#overview)
2. [Company Policy Management](#company-policy-management)
3. [Role & Permission Management](#role--permission-management)
4. [Employee Group Management](#employee-group-management)
5. [Employee Management](#employee-management)
6. [Education & Certification](#education--certification)
7. [Attendance Management](#attendance-management)
8. [Leave Management](#leave-management)
9. [Events & Surveys](#events--surveys)
10. [Team & Department Management](#team--department-management)
11. [Notification Management](#notification-management)
12. [Asset Management](#asset-management)
13. [Performance Management (KPI)](#performance-management-kpi)
14. [Grievance Management](#grievance-management)
15. [Exit Management](#exit-management)
16. [Logging & Monitoring](#logging--monitoring)
17. [Comp-Off & Swap Holiday](#comp-off--swap-holiday)
18. [Support & Feedback](#support--feedback)

---

## Overview

This document provides comprehensive documentation for all stored procedures in the HRMS database. Each stored procedure includes:
- **Purpose**: What the procedure does
- **Parameters**: Input/output parameters with descriptions
- **Return Values**: What data is returned
- **Business Logic**: Key logic and calculations
- **Usage Examples**: Sample execution statements
- **Dependencies**: Related tables and procedures

**Total Stored Procedures**: 36

---

## Company Policy Management

### GetCompanyPolicyDocuments
**Purpose**: Retrieves paginated and filtered list of company policy documents

**Parameters**:
```sql
@StatusId AS BIGINT              -- Filter by policy status (1=Draft, 2=Active, 3=Inactive)
@PolicyName AS VARCHAR(100)      -- Search by policy name (partial match)
@CategoryId AS BIGINT            -- Filter by document category
@SortColumnName AS VARCHAR(50)   -- Column name for sorting
@SortColumnDirection AS VARCHAR(50) -- Sort direction (ASC/DESC)
@PageNumber AS INT = 1           -- Current page number
@PageSize AS INT = 10            -- Records per page
```

**Returns**:
- Policy ID, Name, Effective Date
- Document Category details
- Version Number
- Status (text representation)
- Created/Modified metadata

**Business Logic**:
- Dynamic SQL construction for flexible filtering
- Status mapping (1→Draft, 2→Active, 3→Inactive)
- Joins CompanyPolicy with CompanyPolicyDocCategory
- Excludes soft-deleted records (IsDeleted=0)
- Default sorting by CreatedOn DESC

**Usage**:
```sql
EXEC GetCompanyPolicyDocuments 
    @StatusId = 2, 
    @PolicyName = 'Leave', 
    @CategoryId = 0,
    @SortColumnName = 'EffectiveDate',
    @SortColumnDirection = 'DESC',
    @PageNumber = 1,
    @PageSize = 20
```

**Dependencies**:
- Tables: CompanyPolicy, CompanyPolicyDocCategory

---

### GetHistoryListByPolicyId
**Purpose**: Retrieves version history of a specific company policy

**Parameters**:
```sql
@PolicyId AS BIGINT              -- Policy ID to fetch history for
@SortColumnName AS VARCHAR(50)   -- Column for sorting
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Records per page
```

**Returns**:
- Policy ID, Name, Version Number
- Description
- File names (original and stored)
- Created/Modified timestamps

**Business Logic**:
- Fetches from CompanyPolicyHistory table
- Excludes deleted records
- Default sorting by VersionNo DESC (latest versions first)

**Usage**:
```sql
EXEC GetHistoryListByPolicyId 
    @PolicyId = 5,
    @SortColumnName = 'VersionNo',
    @SortColumnDirection = 'DESC',
    @PageNumber = 1,
    @PageSize = 10
```

**Dependencies**:
- Tables: CompanyPolicyHistory

---

### GetUserCompanyPolicyTrackList
**Purpose**: Tracks which employees have viewed specific company policies

**Parameters**:
```sql
@CompanyPolicyId AS BIGINT       -- Filter by policy ID
@EmployeeName AS VARCHAR(50)     -- Search by employee name
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Track ID
- Employee full name (FirstName, MiddleName, LastName)
- Company policy name
- ViewedOn timestamp
- ModifiedOn timestamp

**Business Logic**:
- Joins UserCompanyPolicyTrack → EmployeeData → CompanyPolicy
- Partial name search across FirstName, MiddleName, LastName
- Default sorting by track ID DESC

**Usage**:
```sql
EXEC GetUserCompanyPolicyTrackList 
    @CompanyPolicyId = 10,
    @EmployeeName = 'John',
    @PageNumber = 1,
    @PageSize = 20
```

**Dependencies**:
- Tables: UserCompanyPolicyTrack, EmployeeData, CompanyPolicy

---

## Role & Permission Management

### GetRoleListWithUserCount
**Purpose**: Retrieves all active roles with count of assigned users

**Parameters**:
```sql
@RoleName AS VARCHAR(100)        -- Search by role name
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- RoleId
- RoleName
- UserCount (number of employees assigned to role)

**Business Logic**:
- LEFT JOIN to include roles with 0 users
- Counts from UserRoleMapping table
- Only includes active roles (IsActive=1) or roles with no mappings
- Groups by Role ID and Name

**Usage**:
```sql
EXEC GetRoleListWithUserCount 
    @RoleName = 'Admin',
    @SortColumnName = 'UserCount',
    @SortColumnDirection = 'DESC',
    @PageNumber = 1,
    @PageSize = 50
```

**Dependencies**:
- Tables: Role, UserRoleMapping

---

### SaveRolePermissions
**Purpose**: Saves/updates permissions for a specific role (transactional)

**Parameters**:
```sql
@RoleId AS INT                   -- Role to assign permissions
@PermissionIds AS PermissionIdTableType READONLY -- Table of permission IDs
```

**User-Defined Type**:
```sql
CREATE TYPE dbo.PermissionIdTableType AS TABLE (
    PermissionId INT
)
```

**Returns**: None (executes within transaction)

**Business Logic**:
- **Transaction-based**: Rollback on error
- Deletes all existing permissions for the role
- Inserts new permission mappings
- Sets IsActive=1, CreatedBy='admin', CreatedOn=GETUTCDATE()
- Uses table-valued parameter for bulk insert

**Usage**:
```sql
DECLARE @Permissions AS PermissionIdTableType
INSERT INTO @Permissions VALUES (1), (5), (10), (15)

EXEC SaveRolePermissions 
    @RoleId = 3,
    @PermissionIds = @Permissions
```

**Dependencies**:
- Tables: RolePermission
- User-Defined Type: PermissionIdTableType

---

## Employee Group Management

### SaveEmployeeGroup
**Purpose**: Creates or updates employee groups with member assignments

**Parameters**:
```sql
@Id BIGINT = 0                   -- Group ID (0 for new group)
@GroupName VARCHAR(100)          -- Group name
@Description TEXT                -- Group description
@Status BIT                      -- Active/Inactive status
@CreatedBy NVARCHAR(100)         -- Creator username
@employeeIds NVARCHAR(MAX)       -- JSON array of employee IDs
```

**Returns**: None (executes within transaction)

**Business Logic**:
- **Transaction-based**: Rollback on validation failure
- **Validation**: Checks if all employee IDs exist in EmployeeData
- Throws error 50001 if invalid employee IDs found
- **Update Mode** (@Id > 0):
  - Updates group details
  - Deletes existing UserGroupMapping entries
  - Re-inserts new mappings
- **Insert Mode** (@Id = 0):
  - Creates new group
  - Uses SCOPE_IDENTITY() to get new group ID
  - Inserts user mappings
- Parses JSON array using OPENJSON

**Usage**:
```sql
-- Create new group
EXEC SaveEmployeeGroup 
    @Id = 0,
    @GroupName = 'Sales Team',
    @Description = 'All sales employees',
    @Status = 1,
    @CreatedBy = 'admin@company.com',
    @employeeIds = '[101, 102, 103, 104]'

-- Update existing group
EXEC SaveEmployeeGroup 
    @Id = 5,
    @GroupName = 'Updated Sales Team',
    @Description = 'Updated description',
    @Status = 1,
    @CreatedBy = 'admin@company.com',
    @employeeIds = '[101, 105, 106]'
```

**Dependencies**:
- Tables: [Group], UserGroupMapping, EmployeeData

---

### GetEmployeeGroupList
**Purpose**: Retrieves paginated list of employee groups

**Parameters**:
```sql
@GroupName NVARCHAR(100) = NULL  -- Filter by group name
@Status BIT = NULL               -- Filter by status (Active/Inactive)
@SortColumnName NVARCHAR(50) = NULL -- Sort column
@SortDirection NVARCHAR(4) = 'ASC'  -- Sort direction
@PageNumber INT = 1              -- Page number
@PageSize INT = 10               -- Page size
```

**Returns**:
- Group ID
- Group Name
- Description
- Status (text: 'Active' or 'InActive')
- ModifiedBy
- ModifiedOn

**Business Logic**:
- Uses dynamic SQL with sp_executesql
- Default sorting by ID if no sort specified
- Status text conversion (1→'Active', 0→'InActive')
- Excludes deleted groups (IsDeleted=0)

**Usage**:
```sql
EXEC GetEmployeeGroupList 
    @GroupName = 'Sales',
    @Status = 1,
    @SortColumnName = 'GroupName',
    @SortDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 20
```

**Dependencies**:
- Tables: [Group]

---

## Employee Management

### GetEmployees
**Purpose**: Advanced employee search with multiple filters and pagination (legacy version)

**Parameters**:
```sql
@EmployeeName AS VARCHAR(100)    -- Search by name (partial match)
@EmployeeCode AS VARCHAR(MAX)    -- Comma-separated employee codes
@EmploymentStatus AS INT         -- Employment status filter
@DepartmentId AS BIGINT          -- Department filter
@DesignationId AS BIGINT         -- Designation filter
@RoleId AS BIGINT                -- Role filter
@Status AS INT                   -- Employee status filter
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@EmployeeEmail NVARCHAR(340)     -- Email filter
@BranchId INT                    -- Branch filter
@CountryId INT                   -- Country filter
@DOJRangeFrom DATE               -- Date of joining range start
@DOJRangeTo DATE                 -- Date of joining range end
@PageNumber INT = 1              -- Page number
@PageSize INT = 10               -- Page size
@TotalRecords INT OUTPUT         -- Output: total record count
```

**Returns**:
- Employee ID, Code, Full Name
- Personal details (Father Name, Gender, DOB)
- Contact info (Email, Phone, Emergency Contact)
- Address details (Current and Permanent)
- Banking details (Bank Name, Account No, PF, ESI)
- Employment details (Joining Date, Confirmation, Job Type)
- Department, Designation, Branch
- Status (text: Active, F&F Pending, On Notice, Ex Employee)

**Business Logic**:
- Complex joins across 15+ tables
- Flexible name search (supports partial matches across FirstName, MiddleName, LastName)
- Multiple comma-separated employee codes support
- Date range filtering for DOJ
- Dynamic status text conversion
- Returns @TotalRecords via OUTPUT parameter

**Usage**:
```sql
DECLARE @TotalCount INT

EXEC GetEmployees 
    @EmployeeName = 'John',
    @EmploymentStatus = 1,
    @DepartmentId = 5,
    @DOJRangeFrom = '2020-01-01',
    @DOJRangeTo = '2023-12-31',
    @PageNumber = 1,
    @PageSize = 50,
    @TotalRecords = @TotalCount OUTPUT

SELECT @TotalCount AS TotalRecords
```

**Dependencies**:
- Tables: EmployeeData, EmploymentDetail, UserRoleMapping, Role, Address, BankDetails, PermanentAddress, City, State, Country, Department, Designation

---

### GetEmployeesList
**Purpose**: Optimized employee list using view (newer version)

**Parameters**:
```sql
@EmployeeName AS VARCHAR(100)    -- Employee name search
@EmployeeCode AS VARCHAR(MAX)    -- Comma-separated codes
@EmploymentStatus AS INT = 0     -- Employment status
@DepartmentId AS BIGINT = 0      -- Department filter
@DesignationId AS BIGINT = 0     -- Designation filter
@RoleId AS BIGINT = 0            -- Role filter
@EmployeeStatus AS INT = 0       -- Employee status
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
@EmployeeEmail NVARCHAR(340)     -- Email filter
@BranchId INT                    -- Branch filter
@CountryId INT                   -- Country filter
@DOJRangeFrom DATE               -- DOJ range start
@DOJRangeTo DATE                 -- DOJ range end
```

**Returns**:
- Total count (first result set)
- Employee list with ID, Code, Name, Email
- Department, Designation, Role
- Employment and Employee Status
- Branch, Country, Phone, JoiningDate

**Business Logic**:
- Uses vw_EmployeeData view (optimized pre-joined view)
- Two result sets: count + data
- CASE-based sorting for multiple columns
- String_split for multiple employee codes
- CHARINDEX for partial name/email matching

**Usage**:
```sql
EXEC GetEmployeesList 
    @EmployeeName = 'Smith',
    @EmployeeCode = 'EMP001,EMP002',
    @DepartmentId = 3,
    @SortColumnName = 'EmployeeName',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 25
```

**Dependencies**:
- Views: vw_EmployeeData

---

## Education & Certification

### GetEducationDocuments
**Purpose**: Retrieves education qualification documents for an employee

**Parameters**:
```sql
@EmployeeId AS BIGINT            -- Employee ID
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- User qualification ID
- College/University name
- Aggregate percentage
- Start and End years
- File names (stored and original)
- Qualification ID and Name
- Degree Name

**Business Logic**:
- Joins UserQualificationInfo with Qualification master
- Filters by EmployeeId and IsDeleted=0
- Default sorting by ID DESC

**Usage**:
```sql
EXEC GetEducationDocuments 
    @EmployeeId = 101,
    @SortColumnName = 'EndYear',
    @SortColumnDirection = 'DESC',
    @PageNumber = 1,
    @PageSize = 10
```

**Dependencies**:
- Tables: UserQualificationInfo, Qualification

---

### GetEmployeeCertificatesList
**Purpose**: Retrieves certification documents for an employee

**Parameters**:
```sql
@EmployeeId AS BIGINT            -- Employee ID
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Certificate ID
- Employee ID
- Certificate Name
- File names (stored and original)
- Certificate Expiry Date

**Business Logic**:
- Filters UserCertificate by EmployeeId
- Excludes deleted records
- Default sorting by ID DESC

**Usage**:
```sql
EXEC GetEmployeeCertificatesList 
    @EmployeeId = 101,
    @SortColumnName = 'CertificateExpiry',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 10
```

**Dependencies**:
- Tables: UserCertificate

---

### GetPreviousEmployerList
**Purpose**: Retrieves previous employer details with documents and references (JSON format)

**Parameters**:
```sql
@EmployerName AS VARCHAR(100)    -- Filter by employer name
@DocumentName AS VARCHAR(100)    -- Filter by document name
@EmployeeId AS BIGINT            -- Employee ID
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Previous employer ID, Name
- Start and End dates
- Designation
- **DocumentsJson**: JSON array of documents (Id, DocumentName, FileName, FileOriginalName)
- **ProfessionalReferencesJson**: JSON array of references (Id, FullName, Designation, Email, ContactNumber)

**Business Logic**:
- Uses FOR JSON PATH to create nested JSON structures
- Joins PreviousEmployer → PreviousEmployerDocument → EmployerDocumentType
- Joins PreviousEmployer → ProfessionalReference
- Groups by employer to aggregate documents and references

**Usage**:
```sql
EXEC GetPreviousEmployerList 
    @EmployeeId = 101,
    @EmployerName = 'Tech Corp',
    @SortColumnName = 'StartDate',
    @SortColumnDirection = 'DESC',
    @PageNumber = 1,
    @PageSize = 5
```

**Sample JSON Output**:
```json
{
  "DocumentsJson": "[{\"Id\":1,\"DocumentName\":\"Experience Letter\",\"FileName\":\"exp_123.pdf\",\"FileOriginalName\":\"experience.pdf\"}]",
  "ProfessionalReferencesJson": "[{\"Id\":1,\"FullName\":\"Jane Doe\",\"Designation\":\"Manager\",\"Email\":\"jane@techcorp.com\",\"ContactNumber\":\"1234567890\"}]"
}
```

**Dependencies**:
- Tables: PreviousEmployer, PreviousEmployerDocument, EmployerDocumentType, ProfessionalReference

---

### GetNomineeList
**Purpose**: Retrieves nominee information for an employee

**Parameters**:
```sql
@EmployeeId BIGINT               -- Employee ID
@NomineeName VARCHAR(150) = NULL -- Filter by nominee name
@RelationshipId As INT           -- Filter by relationship (6=Others)
@Others VARCHAR(100) = NULL      -- Filter for custom relationship
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortDirection AS VARCHAR(50)    -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Nominee ID, Name, DOB, Age
- CareOf (guardian for minors)
- Relationship details (Name, ID, Others field)
- Percentage allocation
- IsNomineeMinor flag
- ID Proof document details
- Created/Modified metadata

**Business Logic**:
- Dynamic filtering based on RelationshipId
- Special handling for RelationshipId=6 (Others) with custom text search
- Joins UserNomineeInfo → Relationship → DocumentType
- Uses sp_executesql for parameterized dynamic SQL

**Usage**:
```sql
EXEC GetNomineeList 
    @EmployeeId = 101,
    @NomineeName = 'John',
    @RelationshipId = 2,  -- e.g., Spouse
    @SortColumnName = 'NomineeName',
    @SortDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 10
```

**Dependencies**:
- Tables: UserNomineeInfo, Relationship, DocumentType

---

## Attendance Management

### GetAttendanceConfiguration
**Purpose**: Retrieves employee attendance configuration (manual vs. automated)

**Parameters**:
```sql
@EmployeeName AS VARCHAR(100)    -- Filter by employee name
@EmployeeCode AS VARCHAR(MAX)    -- Filter by employee code
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Employee ID and Code
- Employee Full Name (concatenated)
- Designation
- Department
- Country
- TimeDoctorUserId (for time tracking integration)
- IsManualAttendance flag

**Business Logic**:
- Joins EmployeeData → EmploymentDetail → Department → Address → Country → Designation
- CONCAT for full name with optional middle name handling
- Filters by partial name or exact employee code

**Usage**:
```sql
EXEC GetAttendanceConfiguration 
    @EmployeeName = 'John',
    @EmployeeCode = 'EMP001',
    @PageNumber = 1,
    @PageSize = 50
```

**Dependencies**:
- Tables: EmployeeData, EmploymentDetail, Department, Address, Country, Designation

---

### GetAttendanceConfigList
**Purpose**: Advanced attendance configuration list with filtering and role-based access

**Parameters**:
```sql
@EmployeeName VARCHAR(250)       -- Employee name filter
@EmployeeEmail VARCHAR(250)      -- Email filter
@TimeDoctorUserId VARCHAR(250)   -- TimeDoctor user ID filter
@CountryId INT                   -- Country filter
@DepartmentId INT                -- Department filter
@BranchId INT                    -- Branch filter
@DesignationId INT               -- Designation filter
@EmployeeCode VARCHAR(50)        -- Employee code filter
@IsManualAttendance BIT          -- Manual attendance flag filter
@SortColumn VARCHAR(50)          -- Sort column
@SortDesc BIT = 0                -- Sort descending flag
@StartIndex INT                  -- Offset for pagination
@PageSize INT                    -- Page size
@DOJRangeFrom DATE               -- DOJ range start
@DOJRangeTo DATE                 -- DOJ range end
@ReportingManagerId INT = 0      -- Reporting manager filter
```

**Returns**:
- Total count (first result set)
- Employee details with attendance configuration
- Excludes Ex Employees (EmployeeStatus != 4)

**Business Logic**:
- Uses vw_EmployeeData view
- **Role-based filtering**: If RoleId=1 (SuperAdmin), shows all; otherwise filters by ReportingManagerId or ImmediateManager
- CHARINDEX for partial text matching
- Excludes ex-employees automatically

**Usage**:
```sql
EXEC GetAttendanceConfigList 
    @EmployeeName = 'Smith',
    @DepartmentId = 5,
    @IsManualAttendance = 1,
    @ReportingManagerId = 50,
    @SortColumn = 'EmployeeName',
    @SortDesc = 0,
    @StartIndex = 0,
    @PageSize = 50
```

**Dependencies**:
- Views: vw_EmployeeData
- Tables: UserRoleMapping (for role check)

---

### GetEmployeeAttendanceReport
**Purpose**: Generates attendance report with worked hours by date (JSON format)

**Parameters**:
```sql
@StartDate DATE                  -- Report start date
@EndDate DATE                    -- Report end date
@EmployeeCodes VARCHAR(MAX)      -- Comma-separated employee codes
@EmployeeName VARCHAR(250)       -- Employee name filter
@EmployeeEmail VARCHAR(250)      -- Email filter
@CountryId INT                   -- Country filter
@DepartmentId INT                -- Department filter
@BranchId INT                    -- Branch filter
@DesignationId INT               -- Designation filter
@IsManualAttendance BIT          -- Manual attendance filter
@SortColumn VARCHAR(50)          -- Sort column
@SortDesc BIT = 0                -- Sort descending
@StartIndex INT                  -- Pagination offset
@PageSize INT                    -- Page size
@DOJRangeFrom DATE               -- DOJ range start
@DOJRangeTo DATE                 -- DOJ range end
@ReportingManagerId INT          -- Manager filter
```

**Returns**:
- Total count
- Employee details
- **WorkedHoursByDateJson**: JSON object with date→hours mapping

**Business Logic**:
- Uses STRING_AGG to create JSON dictionary of dates and hours
- Subquery to Attendance table for date range
- Format: `{"2025-01-15": "8.5", "2025-01-16": "7.0"}`
- Role-based access control (RoleId=1 bypass)
- STRING_SPLIT for multiple employee codes

**Usage**:
```sql
EXEC GetEmployeeAttendanceReport 
    @StartDate = '2025-01-01',
    @EndDate = '2025-01-31',
    @EmployeeCodes = 'EMP001,EMP002',
    @DepartmentId = 3,
    @SortColumn = 'EmployeeName',
    @SortDesc = 0,
    @StartIndex = 0,
    @PageSize = 50
```

**Sample JSON Output**:
```json
{
  "WorkedHoursByDateJson": "{\"2025-01-15\": \"8.5\", \"2025-01-16\": \"7.0\", \"2025-01-17\": \"8.0\"}"
}
```

**Dependencies**:
- Views: vw_EmployeeData
- Tables: Attendance, UserRoleMapping

---

## Leave Management

### CreditMonthlyLeaveBalance
**Purpose**: Credits monthly leave accruals with carryover logic

**Parameters**:
```sql
@LeaveTypeId AS INT              -- Leave type to credit
@CreditAmount AS DECIMAL(18,2)   -- Amount to credit
@CarryOverLimit AS DECIMAL(5,2)  -- Maximum carryover allowed
@SelectedDate AS DATE            -- Date of credit
@CarryOverMonth AS INT           -- Month for carryover (1-12)
@Description VARCHAR(50)         -- Description for accrual entry
@CreatedBy NVARCHAR(120) = 'admin' -- Creator username
```

**Returns**: None (inserts accrual records)

**Business Logic**:
- **Cursor-based processing** for each employee with the leave type
- Calculates opening balance from last closing balance
- **Carryover Logic** (when month = @CarryOverMonth):
  - Caps opening balance to @CarryOverLimit
  - Updates EmployeeLeave.OpeningBalance with capped value
- **Duplicate prevention**: Checks if accrual already exists for month/year
- Calculates closing balance: `opening + credited`
- Inserts into AccrualUtilizedLeave table
- Excludes ex-employees (EmployeeStatus != 4)

**Usage**:
```sql
-- Credit 1.5 days of Casual Leave with 10-day carryover in April
EXEC CreditMonthlyLeaveBalance 
    @LeaveTypeId = 1,
    @CreditAmount = 1.5,
    @CarryOverLimit = 10.0,
    @SelectedDate = '2025-04-01',
    @CarryOverMonth = 4,
    @Description = 'Monthly Accrual - April 2025',
    @CreatedBy = 'System'
```

**Dependencies**:
- Tables: EmployeeLeave, AccrualUtilizedLeave, EmployeeData, EmploymentDetail

---

### ExpireCompOffLeave
**Purpose**: Expires comp-off leave balances older than 3 months

**Parameters**: None (automated job)

**Returns**: None (inserts expiry records)

**Business Logic**:
- **LeaveId = 10** (CompOff leave type)
- **Cursor-based processing** for each employee
- Finds last expired balance entry
- Calculates balance 3 months ago (closing balance before 3-month cutoff)
- Calculates current closing balance
- If both balances > 0:
  - Calculates difference
  - Inserts "CompOff Expired" entry
  - Debits old balance from closing
- Prevents duplicate expiration

**Usage**:
```sql
-- Typically called via scheduled job
EXEC ExpireCompOffLeave
```

**Dependencies**:
- Tables: EmployeeLeave, AccrualUtilizedLeave

---

## Events & Surveys

### GetEvents
**Purpose**: Retrieves event list with status and employee group

**Parameters**:
```sql
@EventName AS VARCHAR(100)       -- Filter by event title
@StatusId AS INT                 -- Filter by status
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Event ID
- Event Name (Title)
- Start and End dates
- Employee Group name
- Status value
- Venue
- Banner file name

**Business Logic**:
- Joins Events → [Group] → Status
- Excludes deleted events
- Default sorting by ID DESC

**Usage**:
```sql
EXEC GetEvents 
    @EventName = 'Annual',
    @StatusId = 2,  -- Active
    @SortColumnName = 'StartDate',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 20
```

**Dependencies**:
- Tables: Events, [Group], Status

---

### GetSurveyList
**Purpose**: Retrieves survey list with employee group mappings

**Parameters**:
```sql
@Title AS VARCHAR(250)           -- Filter by survey title
@StatusId AS BIGINT              -- Filter by status
@EmpGroupId AS BIGINT            -- Filter by employee group
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Survey ID
- Title
- Publish Date and Deadline
- Status ID and Status Value
- Employee Group ID and Name

**Business Logic**:
- Joins SurveyEmpGroupMapping → Surveys → [Group] → Status
- Excludes deleted surveys
- Default sorting by SurveyId DESC

**Usage**:
```sql
EXEC GetSurveyList 
    @Title = 'Employee Satisfaction',
    @StatusId = 2,
    @EmpGroupId = 5,
    @SortColumnName = 'PublishDate',
    @SortColumnDirection = 'DESC',
    @PageNumber = 1,
    @PageSize = 10
```

**Dependencies**:
- Tables: SurveyEmpGroupMapping, Surveys, [Group], Status

---

## Team & Department Management

### GetTeams
**Purpose**: Retrieves team list with status filter

**Parameters**:
```sql
@TeamName AS VARCHAR(100)        -- Filter by team name
@Status AS INT                   -- Filter by status (0=Deleted, 1=Active, NULL=All)
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Team ID
- Team Name
- Status (IsDeleted flag)

**Business Logic**:
- If @Status IS NULL: returns both active and deleted
- If @Status = 0: returns only deleted
- If @Status = 1: returns only active
- Default sorting by ID DESC

**Usage**:
```sql
-- Get all active teams
EXEC GetTeams 
    @TeamName = 'Development',
    @Status = 1,
    @SortColumnName = 'TeamName',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 100
```

**Dependencies**:
- Tables: Team

---

### GetDepartments
**Purpose**: Retrieves department list with status filter

**Parameters**:
```sql
@Department AS VARCHAR(100)      -- Filter by department name
@Status AS INT                   -- Status filter (0=Deleted, 1=Active, NULL=All)
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 100           -- Page size (default 100)
```

**Returns**:
- Department ID
- Department Name
- Status (IsDeleted flag)

**Business Logic**:
- Same status logic as GetTeams
- Default page size is 100
- Default sorting by ID DESC

**Usage**:
```sql
EXEC GetDepartments 
    @Department = 'IT',
    @Status = 1,
    @SortColumnName = 'Department',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 100
```

**Dependencies**:
- Tables: Department

---

### GetDesignation
**Purpose**: Retrieves designation list with status filter

**Parameters**:
```sql
@Designation AS VARCHAR(100)     -- Filter by designation name
@Status AS INT                   -- Status filter
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 100           -- Page size
```

**Returns**:
- Designation ID
- Designation Name
- Status (IsDeleted flag)

**Business Logic**:
- Same pattern as GetTeams and GetDepartments
- Default page size 100
- Default sorting by ID DESC

**Usage**:
```sql
EXEC GetDesignation 
    @Designation = 'Manager',
    @Status = 1,
    @SortColumnName = 'Designation',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 100
```

**Dependencies**:
- Tables: Designation

---

## Notification Management

### GetNotificationTemplates
**Purpose**: Retrieves notification/email templates with filtering

**Parameters**:
```sql
@TemplateName AS VARCHAR(250)    -- Filter by template name
@SenderName AS VARCHAR(250)      -- Filter by sender name
@SenderEmail AS VARCHAR(250)     -- Filter by sender email
@TemplateType AS INT = NULL      -- Filter by template type
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
```

**Returns**:
- Two result sets:
  1. **Total count**
  2. **Template data**: ID, Name, Subject, Content, Type, Status, Sender details, CC/BCC/To emails, timestamps

**Business Logic**:
- Executes two queries: count and data
- Supports partial matching on template name, sender name, sender email
- Exact match on template type
- Default sorting by ID DESC
- Excludes deleted templates

**Usage**:
```sql
EXEC GetNotificationTemplates 
    @TemplateName = 'Welcome',
    @TemplateType = 1,  -- e.g., Email
    @SortColumnName = 'TemplateName',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 20
```

**Dependencies**:
- Tables: NotificationTemplate

---

## Asset Management

### GetAllITAsset
**Purpose**: Retrieves IT asset inventory with allocation details

**Parameters**:
```sql
@DeviceName VARCHAR(250)         -- Filter by device name
@DeviceCode VARCHAR(50)          -- Filter by device code
@Manufacturer VARCHAR(250)       -- Filter by manufacturer
@Model VARCHAR(250)              -- Filter by model
@AssetType INT                   -- Filter by asset type
@Status INT                      -- Filter by asset status
@Branch INT                      -- Filter by branch
@EmployeeCodes VARCHAR(MAX)      -- Comma-separated employee codes
@SortColumn VARCHAR(50)          -- Sort column
@SortDesc BIT = 0                -- Sort descending
@StartIndex INT = 0              -- Pagination offset
@PageSize INT = 10               -- Page size
```

**Returns**:
- Total count (first result set)
- Asset details: ID, Name, Code, Serial Number
- Manufacturer, Model, Asset Type
- Status, Branch
- Purchase Date, Warranty Expiry
- Comments
- Allocation details: Custodian (email and full name), Allocated By
- Modified metadata

**Business Logic**:
- LEFT JOIN to EmployeeAsset with IsActive=1 filter
- Shows both allocated and unallocated assets
- STRING_SPLIT for multiple employee codes
- Default sorting by ModifiedOn DESC
- Partial matching on device name, code, manufacturer, model

**Usage**:
```sql
EXEC GetAllITAsset 
    @DeviceName = 'Laptop',
    @Manufacturer = 'Dell',
    @AssetType = 1,
    @Status = 2,  -- e.g., Allocated
    @EmployeeCodes = 'EMP001,EMP002',
    @SortColumn = 'DeviceCode',
    @SortDesc = 0,
    @StartIndex = 0,
    @PageSize = 50
```

**Dependencies**:
- Tables: ITAsset, EmployeeAsset, EmploymentDetail, EmployeeData

---

## Performance Management (KPI)

### GetKpiGoalsList
**Purpose**: Retrieves KPI goals/objectives with filtering

**Parameters**:
```sql
@Title VARCHAR(250)              -- Filter by goal title
@DepartmentId BIGINT             -- Filter by department
@CreatedBy VARCHAR(250)          -- Filter by creator
@CreatedOnFrom DATE              -- Created date range start
@CreatedOnTo DATE                -- Created date range end
@SortColumn VARCHAR(50)          -- Sort column
@SortDesc BIT = 0                -- Sort descending
@StartIndex INT                  -- Pagination offset
@PageSize INT                    -- Page size
```

**Returns**:
- Total count
- KPI Goal details: ID, Title, Description
- Department ID and Name
- Creator and creation timestamp

**Business Logic**:
- LEFT JOIN to Department
- CHARINDEX for partial text matching
- Date range filtering on CreatedOn
- Default sorting by Title ASC

**Usage**:
```sql
EXEC GetKpiGoalsList 
    @Title = 'Sales Target',
    @DepartmentId = 5,
    @CreatedOnFrom = '2025-01-01',
    @CreatedOnTo = '2025-03-31',
    @SortColumn = 'CreatedOn',
    @SortDesc = 1,
    @StartIndex = 0,
    @PageSize = 50
```

**Dependencies**:
- Tables: KPIGoals, Department

---

### GetEmployeesKPI
**Purpose**: Retrieves employee KPI plan status with role-based access

**Parameters**:
```sql
@SessionUserId BIGINT            -- Current user's employee ID
@RoleId INT                      -- Current user's role ID
@EmployeeName VARCHAR(100)       -- Filter by employee name
@EmployeeCode VARCHAR(MAX)       -- Comma-separated employee codes
@AppraisalDateFrom DATE          -- Appraisal date range start
@AppraisalDateTo DATE            -- Appraisal date range end
@ReviewDateFrom DATE             -- Review date range start
@ReviewDateTo DATE               -- Review date range end
@SortColumnName VARCHAR(50)      -- Sort column
@SortColumnDirection VARCHAR(50) -- Sort direction
@PageNumber INT = 1              -- Page number
@PageSize INT = 10               -- Page size
@StatusFilter INT                -- Status filter (1=NOT CREATED, 2=ASSIGNED, 3=SUBMITTED, 4=REVIEWED)
```

**Returns**:
- Total count
- Employee details with KPI plan status
- Status values:
  - **1**: NOT CREATED (no KPI plan)
  - **2**: ASSIGNED (KPI created but not submitted)
  - **3**: SUBMITTED (awaiting review)
  - **4**: REVIEWED (completed)

**Business Logic**:
- **CTE (EmployeeKPI)** for status calculation
- **Role-based filtering**: If RoleId=5 (Manager), filters by ReportingMangerId or ImmediateManager
- Status logic:
  - `KP.Id IS NULL` → NOT CREATED
  - `IsReviewed IS NULL` → ASSIGNED
  - `IsReviewed = 0` → SUBMITTED
  - `IsReviewed = 1` → REVIEWED
- Finds latest KPI plan using MAX(KPL.Id)
- Finds last review date from completed plans
- Alphabetical sorting on status text for consistency

**Usage**:
```sql
EXEC GetEmployeesKPI 
    @SessionUserId = 50,
    @RoleId = 5,  -- Manager
    @EmployeeName = 'Smith',
    @StatusFilter = 3,  -- Submitted
    @SortColumnName = 'employeeName',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 25
```

**Dependencies**:
- Tables: EmployeeData, EmploymentDetail, KPIPlan

---

## Grievance Management

### GetEmployeeListGrievances
**Purpose**: Retrieves grievance tickets with role-based access control

**Parameters**:
```sql
@SessionUserId INT               -- Current user ID
@RoleId INT                      -- User role (1=SuperAdmin)
@GrievanceTypeId INT             -- Filter by grievance type
@Status INT                      -- Filter by status
@TatStatus INT                   -- Filter by TAT (turnaround time) status
@CreatedOnFrom DATE              -- Created date range start
@CreatedOnTo DATE                -- Created date range end
@ResolvedDate DATE               -- Filter by resolved date
@ResolvedBy INT                  -- Filter by resolver employee ID
@CreatedBy NVARCHAR(MAX)         -- Comma-separated employee codes
@Level INT                       -- Filter by escalation level
@SortColumnName VARCHAR(50)      -- Sort column
@SortDirection VARCHAR(4) = 'DESC' -- Sort direction
@StartIndex INT = 1              -- Pagination offset
@PageSize INT = 10               -- Page size
```

**Returns**:
- Total count
- Grievance details: ID, Ticket Number
- Grievance Type
- Status, TAT Status, Level
- Creator (email), Resolver (full name)
- Created and Resolved dates

**Business Logic**:
- **Role-based access**:
  - RoleId=1 (SuperAdmin): sees all grievances
  - Others: only see grievances assigned to them (via GrievanceOwner table)
- Uses OUTER APPLY for employment details lookup
- Table variable (@CreatedByCodes) for employee code filtering
- Default sorting by CreatedOn DESC
- Joins to EmployeeData for resolver name resolution

**Usage**:
```sql
EXEC GetEmployeeListGrievances 
    @SessionUserId = 101,
    @RoleId = 2,
    @GrievanceTypeId = 5,
    @Status = 2,  -- In Progress
    @CreatedBy = 'EMP001,EMP002',
    @SortColumnName = 'CreatedOn',
    @SortDirection = 'DESC',
    @StartIndex = 1,
    @PageSize = 20
```

**Dependencies**:
- Tables: EmployeeGrievance, GrievanceType, GrievanceOwner, EmploymentDetail, EmployeeData

---

### GetEmployeeGrievances
**Purpose**: Retrieves grievances for a specific employee

**Parameters**:
```sql
@EmployeeId BIGINT               -- Employee ID
@GrievanceTypeId INT             -- Filter by type
@Status INT                      -- Filter by status
@SortColumnName VARCHAR(50)      -- Sort column
@SortDirection VARCHAR(4) = 'DESC' -- Sort direction
@StartIndex INT = 0              -- Pagination offset
@PageSize INT = 10               -- Page size
```

**Returns**:
- Total count
- Grievance details: ID, Type, Title, Description
- Ticket Number, Level, Status, TAT Status
- **ManageBy**: Comma-separated list of owner names (STRING_AGG)

**Business Logic**:
- Filters by EmployeeId
- Joins to GrievanceOwner to find assigned owners
- Uses STRING_AGG to concatenate owner names
- Default sorting by CreatedOn DESC

**Usage**:
```sql
EXEC GetEmployeeGrievances 
    @EmployeeId = 101,
    @GrievanceTypeId = NULL,
    @Status = 1,  -- Open
    @SortColumnName = 'CreatedOn',
    @SortDirection = 'DESC',
    @StartIndex = 0,
    @PageSize = 10
```

**Dependencies**:
- Tables: EmployeeGrievance, GrievanceType, GrievanceOwner, EmployeeData

---

## Exit Management

### GetExitEmployeesListWithDetail
**Purpose**: Comprehensive exit/resignation management with filtering

**Parameters**:
```sql
@ResignationId AS INT            -- Filter by resignation ID
@EmployeeName AS VARCHAR(100)    -- Employee name search
@ResignationStatus AS INT        -- Resignation status filter
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
@ReportingManagerName AS VARCHAR(100) -- Manager name filter
@EmployeeCode AS VARCHAR(MAX)    -- Comma-separated codes
@AccountsNoDue AS BIT            -- Accounts clearance filter
@JobType AS BIT                  -- Job type filter
@ITNoDue AS BIT                  -- IT clearance filter
@EmploymentStatus AS INT         -- Employment status filter
@DepartmentId AS BIGINT          -- Department filter
@RoleId AS BIGINT                -- Role filter
@KTStatus AS INT                 -- Knowledge transfer status
@LastWorkingDay AS DATE          -- Last working day filter
@ResignationDate AS DATETIME     -- Resignation date filter
@EarlyReleaseStatus AS INT       -- Early release status
@LastWorkingDayFrom DATE         -- LWD range start
@LastWorkingDayTo DATE           -- LWD range end
@BranchId INT                    -- Branch filter
@EmployeeStatus INT              -- Employee status filter
```

**Returns**:
- Total count (first result set)
- Resignation details with employee information
- Clearance status (Accounts, IT)
- Exit process status (KT, Exit Interview, F&F)
- Department, Reporting Manager
- Employment details

**Business Logic**:
- Uses vw_ResignationDetail view for resignation data
- LEFT JOIN to vw_EmployeeData for employee details
- Two result sets: count + paginated data
- CHARINDEX for partial name matching
- STRING_SPLIT for multiple employee codes
- Date range filtering on LastWorkingDay
- NULL-safe filtering (NULLIF patterns)

**Usage**:
```sql
EXEC GetExitEmployeesListWithDetail 
    @EmployeeName = 'Smith',
    @ResignationStatus = 2,
    @KTStatus = 1,
    @AccountsNoDue = 1,
    @ITNoDue = 0,
    @LastWorkingDayFrom = '2025-01-01',
    @LastWorkingDayTo = '2025-03-31',
    @SortColumnName = 'LastWorkingDay',
    @SortColumnDirection = 'ASC',
    @PageNumber = 1,
    @PageSize = 50
```

**Dependencies**:
- Views: vw_ResignationDetail, vw_EmployeeData

---

## Logging & Monitoring

### GetLogs
**Purpose**: Retrieves application logs with filtering

**Parameters**:
```sql
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
@DateFrom DATETIME               -- Log date range start
@DateTo DATETIME                 -- Log date range end
@Message VARCHAR(256)            -- Filter by message text
@Level VARCHAR(15)               -- Filter by log level (Info, Warning, Error)
@RequestId VARCHAR(256)          -- Filter by request ID
@Id BIGINT                       -- Filter by log ID
```

**Returns**:
- Total count
- Log details: ID, Message, MessageTemplate
- Log Level, Timestamp
- Exception details
- RequestId, LogEvent (JSON)

**Business Logic**:
- CHARINDEX for partial message/requestId matching
- Date range filtering on TimeStamp
- Exact match on Level and Id
- Default sorting by timestamp or ID

**Usage**:
```sql
EXEC GetLogs 
    @DateFrom = '2025-01-01',
    @DateTo = '2025-01-31',
    @Level = 'Error',
    @Message = 'Database',
    @SortColumnName = 'TimeStamp',
    @SortColumnDirection = 'DESC',
    @PageNumber = 1,
    @PageSize = 100
```

**Dependencies**:
- Tables: Logging

---

### GetCronJobLogs
**Purpose**: Retrieves scheduled job execution logs

**Parameters**:
```sql
@SortColumnName AS VARCHAR(50)   -- Sort column
@SortColumnDirection AS VARCHAR(50) -- Sort direction
@PageNumber AS INT = 1           -- Page number
@PageSize AS INT = 10            -- Page size
@DateFrom DATETIME               -- Date range start
@DateTo DATETIME                 -- Date range end
@Id BIGINT                       -- Filter by log ID
@TypeId INT                      -- Filter by job type
```

**Returns**:
- Total count
- Cron job details: ID, TypeId, RequestId
- StartedAt, CompletedAt timestamps
- Payload (job parameters)
- LogId (reference to Logging table)

**Business Logic**:
- LEFT JOIN to Logging table via RequestId
- Date range on StartedAt
- Filters by job type and ID

**Usage**:
```sql
EXEC GetCronJobLogs 
    @DateFrom = '2025-01-01',
    @DateTo = '2025-01-31',
    @TypeId = 1,  -- e.g., Leave Accrual Job
    @SortColumnName = 'StartedAt',
    @SortColumnDirection = 'DESC',
    @PageNumber = 1,
    @PageSize = 50
```

**Dependencies**:
- Tables: CronJobLog, Logging

---

## Comp-Off & Swap Holiday

### GetCompOffAndSwapHolidayDetails
**Purpose**: Retrieves comp-off and holiday swap requests with role-based filtering

**Parameters**:
```sql
@SessionUserId BIGINT            -- Current user ID
@RoleId INT                      -- User role
@EmployeeCode VARCHAR(50)        -- Comma-separated employee codes
@WorkingDate DATE                -- Filter by working date
@StatusFilter INT                -- Filter by request status
@TypeFilter INT                  -- Filter by request type (CompOff/Swap)
@SortColumn VARCHAR(50)          -- Sort column
@SortDesc BIT = 0                -- Sort descending
@StartIndex INT = 1              -- Pagination offset
@PageSize INT = 10               -- Page size
```

**Returns**:
- Total count
- Request details: ID, Type, Status
- Working Date and Leave Date (with labels)
- Reason, Reject Reason
- Number of Days
- Employee details (ID, Code, Name)
- Created metadata

**Business Logic**:
- **Role-based access**:
  - RoleId != 5: sees all requests
  - RoleId = 5 (Manager): only team members (ReportingMangerId or ImmediateManager)
- Uses STRING_SPLIT for multiple employee codes with LTRIM/RTRIM
- Default sorting by CreatedOn DESC
- Excludes deleted requests

**Usage**:
```sql
EXEC GetCompOffAndSwapHolidayDetails 
    @SessionUserId = 50,
    @RoleId = 5,
    @EmployeeCode = 'EMP001,EMP002',
    @StatusFilter = 1,  -- Pending
    @TypeFilter = 1,    -- CompOff
    @SortColumn = 'WorkingDate',
    @SortDesc = 0,
    @StartIndex = 1,
    @PageSize = 25
```

**Dependencies**:
- Tables: CompOffAndSwapHolidayDetail, EmployeeData, EmploymentDetail

---

## Support & Feedback

### GetAllFeedback
**Purpose**: Retrieves all feedback/support tickets (admin view)

**Parameters**:
```sql
@EmployeeCodes VARCHAR(500)      -- Comma-separated employee codes
@CreatedOnFrom DATE              -- Created date range start
@CreatedOnTo DATE                -- Created date range end
@FeedbackType INT                -- Filter by feedback type
@TicketStatus INT                -- Filter by ticket status
@SearchQuery VARCHAR(250)        -- Search in subject/description
@SortColumn VARCHAR(50)          -- Sort column
@SortDesc BIT = 0                -- Sort descending
@StartIndex INT                  -- Pagination offset
@PageSize INT                    -- Page size
```

**Returns**:
- Total count
- Feedback details: ID, Employee (ID, Name, Email)
- Ticket Status, Feedback Type
- Subject, Description
- Admin Comment
- Created and Modified timestamps

**Business Logic**:
- LEFT JOIN to EmployeeData for employee details
- CHARINDEX for search in Subject or Description
- Date range filtering
- STRING_SPLIT for employee codes
- Default sorting by CreatedOn DESC

**Usage**:
```sql
EXEC GetAllFeedback 
    @FeedbackType = 2,  -- Bug Report
    @TicketStatus = 1,  -- Open
    @SearchQuery = 'login issue',
    @CreatedOnFrom = '2025-01-01',
    @CreatedOnTo = '2025-01-31',
    @SortColumn = 'CreatedOn',
    @SortDesc = 1,
    @StartIndex = 0,
    @PageSize = 50
```

**Dependencies**:
- Tables: Feedback, EmployeeData

---

### GetFeedbackByEmployee
**Purpose**: Retrieves feedback tickets for a specific employee

**Parameters**:
```sql
@UserSessionId INT               -- Current user's employee ID
@EmployeeCodes VARCHAR(500)      -- Employee code filter
@CreatedOnFrom DATE              -- Created date range start
@CreatedOnTo DATE                -- Created date range end
@FeedbackType INT                -- Feedback type filter
@TicketStatus INT                -- Ticket status filter
@SearchQuery VARCHAR(250)        -- Search query
@EmployeeName VARCHAR(250)       -- Employee name filter
@SortColumn VARCHAR(50)          -- Sort column
@SortDesc BIT = 0                -- Sort descending
@StartIndex INT                  -- Pagination offset
@PageSize INT                    -- Page size
```

**Returns**:
- Total count
- Feedback details: ID, Employee ID
- Ticket Status, Feedback Type
- Subject, Description, Admin Comment
- Created and Modified timestamps

**Business Logic**:
- Filters by @UserSessionId (only user's own tickets)
- Same filtering logic as GetAllFeedback
- No employee name in result (since it's user-specific)

**Usage**:
```sql
EXEC GetFeedbackByEmployee 
    @UserSessionId = 101,
    @FeedbackType = 1,  -- Feature Request
    @TicketStatus = 2,  -- In Progress
    @SortColumn = 'CreatedOn',
    @SortDesc = 1,
    @StartIndex = 0,
    @PageSize = 20
```

**Dependencies**:
- Tables: Feedback, EmployeeData

---

## Summary Statistics

### Stored Procedure Categories
| Category | Count | Key Procedures |
|----------|-------|----------------|
| Employee Management | 4 | GetEmployees, GetEmployeesList, GetAttendanceConfiguration, GetAttendanceConfigList |
| Leave & Attendance | 3 | CreditMonthlyLeaveBalance, ExpireCompOffLeave, GetEmployeeAttendanceReport |
| Company Policy | 3 | GetCompanyPolicyDocuments, GetHistoryListByPolicyId, GetUserCompanyPolicyTrackList |
| Role & Group | 3 | GetRoleListWithUserCount, SaveRolePermissions, SaveEmployeeGroup, GetEmployeeGroupList |
| Education & Docs | 4 | GetEducationDocuments, GetEmployeeCertificatesList, GetPreviousEmployerList, GetNomineeList |
| Events & Surveys | 2 | GetEvents, GetSurveyList |
| Master Data | 3 | GetTeams, GetDepartments, GetDesignation |
| Notifications | 1 | GetNotificationTemplates |
| Asset Management | 1 | GetAllITAsset |
| Performance (KPI) | 2 | GetKpiGoalsList, GetEmployeesKPI |
| Grievances | 2 | GetEmployeeListGrievances, GetEmployeeGrievances |
| Exit Management | 1 | GetExitEmployeesListWithDetail |
| Logging | 2 | GetLogs, GetCronJobLogs |
| Comp-Off & Swap | 1 | GetCompOffAndSwapHolidayDetails |
| Support | 2 | GetAllFeedback, GetFeedbackByEmployee |
| **Total** | **36** | |

---

## Common Patterns

### Pagination Pattern
Most procedures follow this pattern:
```sql
DECLARE @StartIndex INT = (@PageNumber - 1) * @PageSize

-- Query with sorting
ORDER BY [columns]
OFFSET @StartIndex ROWS
FETCH NEXT @PageSize ROWS ONLY
```

### Dynamic SQL Pattern
Many procedures use dynamic SQL for flexible filtering:
```sql
DECLARE @Query VARCHAR(MAX) = 'SELECT ... FROM ...'
DECLARE @Conditions VARCHAR(MAX) = ''

IF (@Filter IS NOT NULL)
    SET @Conditions += ' AND Column = ' + @Filter

SET @Query += @Conditions
EXEC(@Query)
```

### Role-Based Access Control
```sql
WHERE (@RoleId = 1 OR OwnerId = @SessionUserId)
```

### Soft Delete Pattern
All list procedures filter out soft-deleted records:
```sql
WHERE IsDeleted = 0
```

### Status Mapping
Many procedures convert numeric status to text:
```sql
CASE 
    WHEN StatusId = 1 THEN 'Draft'
    WHEN StatusId = 2 THEN 'Active'
    ELSE 'Inactive'
END AS Status
```

---

## Performance Considerations

1. **Indexed Columns**: Ensure indexes on frequently filtered columns (EmployeeId, StatusId, CreatedOn)
2. **Dynamic SQL**: Use sp_executesql instead of EXEC() for parameter injection safety
3. **Pagination**: Always use OFFSET/FETCH for large result sets
4. **View Usage**: vw_EmployeeData, vw_ResignationDetail optimize complex joins
5. **JSON Aggregation**: STRING_AGG and FOR JSON PATH can be resource-intensive for large datasets

---

## Security Considerations

1. **SQL Injection**: Use parameterized queries with sp_executesql
2. **Role-Based Access**: Most procedures validate @RoleId and @SessionUserId
3. **Soft Deletes**: Never permanently delete data, use IsDeleted flag
4. **Audit Trail**: Track CreatedBy, CreatedOn, ModifiedBy, ModifiedOn in all tables

---

## Maintenance Notes

1. **Version Control**: All procedures use CREATE OR ALTER for safe deployment
2. **Error Handling**: Transaction-based procedures use TRY/CATCH with ROLLBACK
3. **Documentation**: Maintain inline comments for complex business logic
4. **Testing**: Test with various parameter combinations before deployment
5. **Monitoring**: Log execution times for performance optimization

---

**Last Updated**: January 2025  
**Database Version**: HRMS v1.0  
**Total Procedures Documented**: 36
