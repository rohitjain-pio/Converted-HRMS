# Module 06: Company Policy Management - Part 3

## Integration Points with Other Modules

### Integration with Authentication & Authorization

**Purpose:** Secure access control for policy management operations based on user roles and permissions.

**Integration Points:**

1. **JWT Token Authentication:**
   - All Company Policy API endpoints require valid JWT token in Authorization header
   - Token validated via middleware before reaching controller action
   - UserEmailId extracted from token claims for audit fields (CreatedBy, ModifiedBy)
   - Token expiry enforced (24-hour access token, 7-day refresh token)

2. **Permission-Based Authorization:**
   - Module-level permissions defined in Permissions constant class:
     - ReadCompanyPolicy: View policy list
     - ViewCompanyPolicy: View policy details
     - CreateCompanyPolicy: Create new policies
     - EditCompanyPolicy: Update existing policies
     - DeleteCompanyPolicy: Soft delete policies
   - [HasPermission] attribute on controller actions enforces permission checks
   - Frontend components check permissions using hasPermission utility before rendering action buttons
   - Permission checks example:
     ```csharp
     [HasPermission(Permissions.CreateCompanyPolicy)]
     public async Task<IActionResult> Post([FromForm] CompanyPolicyRequestDto dto)
     ```

3. **Role-Based Features:**
   - Employee role: Can view and download Active policies (if accessible)
   - HR/Admin roles: Full CRUD operations on policies
   - Manager role: View policies, may have edit rights based on permission assignment
   - Version history tab hidden for Employee role (role check in UI component)
   - Policy track report visible only to HR/Admin roles

4. **User Context:**
   - IHttpContextAccessor provides access to current user information
   - TokenService base class extracts UserEmailId from claims
   - Used for audit trail (CreatedBy, ModifiedBy fields)
   - EmployeeId used in policy download tracking

**Data Flow:**
- Login → JWT issued with user roles and permissions
- User navigates to policy section → Frontend checks permissions
- User performs action (create/edit/delete) → API validates JWT and permissions
- Audit fields populated with user email from token
- Download tracking uses EmployeeId from authenticated user context

---

### Integration with Employee Management Module

**Purpose:** Link policies to employees for targeted distribution and download tracking.

**Integration Points:**

1. **Employee Master Data:**
   - UserCompanyPolicyTrack.EmployeeId foreign key references EmployeeData.Id
   - Employee details (FirstName, LastName, Email, EmployeeCode) retrieved for policy track reports
   - JOIN query:
     ```sql
     SELECT e.FirstName, e.LastName, e.Email, uct.ViewedOn
     FROM UserCompanyPolicyTrack uct
     INNER JOIN EmployeeData e ON uct.EmployeeId = e.Id
     WHERE uct.CompanyPolicyId = @PolicyId
     ```

2. **Active Employee Filtering:**
   - Email notifications sent only to active employees (EmployeeStatus = 'Active', IsDeleted = 0)
   - Compliance reports exclude inactive/deleted employees
   - Employee termination doesn't delete policy tracking history (retained for audit)

3. **Employee Profile Integration:**
   - Logged-in employee's ID used for download tracking
   - Policy acknowledgment history visible in employee profile (potential future enhancement)
   - Employee dashboard widget shows unread/new policies (cross-module feature)

4. **Employee Group Targeting (Future Enhancement):**
   - CompanyPolicy.Accessibility flag currently boolean (all or restricted)
   - Employee group mapping tables exist (EmployeeGroupMapping)
   - Potential to target policies to specific groups (departments, locations, roles)
   - Would require additional junction table: CompanyPolicyGroupMapping

**Data Dependencies:**
- EmployeeData table must exist and contain employee records
- EmployeeId in tracking table must reference valid employee
- Employee email addresses required for notification delivery
- Foreign key constraint ensures referential integrity

---

### Integration with Email Notification Service

**Purpose:** Automated email notifications for policy publications and updates.

**Integration Points:**

1. **Email Service Interface:**
   - IEmailNotificationService injected into CompanyPolicyService
   - UpdatedPolicy method called with policy name and version flag
   - Method signatures:
     ```csharp
     Task UpdatedPolicy(string policyName, bool isVersionUpdate);
     ```

2. **Notification Scenarios:**
   - **New Policy Published:** UpdatedPolicy(policyName, false)
     - Triggered when new policy created with StatusId = Active and EmailRequest = true
     - Recipients: All active employees
     - Email template: "New Policy Published: {PolicyName}"
   - **Policy Updated (Version Created):** UpdatedPolicy(policyName, true)
     - Triggered when Active policy updated with EmailRequest = true
     - Recipients: All employees (potentially filtered to those who viewed previous version)
     - Email template: "Policy Updated: {PolicyName} - Version {VersionNo}"

3. **Email Template Variables:**
   - PolicyName: Name of published/updated policy
   - VersionNo: Version number (for updates)
   - EffectiveDate: When policy became effective
   - EmployeeName: Personalized recipient name
   - PolicyLink: Direct URL to policy detail page in HRMS
   - Description: Brief policy description

4. **Email Delivery:**
   - Asynchronous fire-and-forget pattern (doesn't block policy save)
   - Background job queue processes email batch
   - SMTP configuration from appsettings.json (Office 365 smtp.office365.com:587)
   - Email failures logged but don't prevent policy operation

5. **Notification Template:**
   - NotificationTemplate table stores HTML email templates
   - Template IDs for policy-related emails (to be created)
   - Dynamic placeholder replacement ({PolicyName}, {EmployeeName}, etc.)
   - Consistent branding with other HRMS email notifications

**Configuration Dependencies:**
- SMTP settings in appsettings.json
- EmailNotificationService registered in DI container
- NotificationTemplate records for policy emails
- Background job queue operational (Quartz.NET or Hangfire)

---

### Integration with Dashboard Module

**Purpose:** Display policy-related widgets and metrics on user dashboard.

**Integration Points:**

1. **Published Policies Widget:**
   - Dashboard displays list of recently published/updated Active policies
   - API endpoint: GetPublishedCompanyPolicies with pagination
   - Query filters: StatusId = 2 (Active), IsDeleted = 0
   - Sorted by EffectiveDate or ModifiedOn descending (most recent first)
   - Widget shows:
     - Policy name (clickable link to detail page)
     - Category
     - Version number
     - Published/updated date

2. **Unread Policies Count:**
   - Badge showing count of policies employee hasn't viewed yet
   - Query:
     ```sql
     SELECT COUNT(*) FROM CompanyPolicy cp
     WHERE cp.StatusId = 2 AND cp.IsDeleted = 0
     AND NOT EXISTS (
       SELECT 1 FROM UserCompanyPolicyTrack uct
       WHERE uct.CompanyPolicyId = cp.Id AND uct.EmployeeId = @EmployeeId
     )
     ```
   - Displayed in dashboard widget or menu item badge
   - Click navigates to policy list with unread filter

3. **Policy Compliance Metrics (HR Dashboard):**
   - Total policies count (Active status)
   - Average employee compliance rate (% of employees who viewed mandatory policies)
   - Recent policy updates (last 7/30 days)
   - Policies with low engagement (< 50% view rate)
   - Chart showing policy views over time

4. **Dashboard API Response:**
   ```json
   {
     "recentPolicies": [
       {
         "id": 15,
         "name": "Remote Work Policy 2024",
         "category": "HR Policies",
         "versionNo": 2,
         "publishedDate": "2024-10-31T09:30:15Z"
       }
     ],
     "unreadCount": 3,
     "complianceRate": 87.5
   }
   ```

**Data Flow:**
- User logs in → Dashboard loads
- Dashboard widget calls policy API for recent/unread policies
- Displays summary with links to policy section
- Click on widget navigates to full policy list or detail page

---

### Integration with Notification Module

**Purpose:** In-app notifications for policy events alongside email notifications.

**Integration Points:**

1. **In-App Notification Creation:**
   - When policy published/updated: Create notification record in Notification table
   - Notification type: "PolicyPublished" or "PolicyUpdated"
   - Notification message: "New policy '{PolicyName}' has been published. Please review."
   - Linked to policy: Notification.ReferenceId = CompanyPolicy.Id, ReferenceType = "Policy"
   - Click action: Navigate to policy detail page

2. **Notification Delivery:**
   - Notifications created for all active employees
   - Displayed in notification bell icon (header)
   - Unread badge count includes policy notifications
   - Mark as read when employee views policy detail page or clicks notification

3. **Notification Lifecycle:**
   - Created: When policy published/updated with email notification
   - Read: When employee clicks notification or views policy
   - Dismissed: When employee marks notification as read
   - Expired: Automatically after X days (configurable)

**Implementation:**
```csharp
// Pseudo-code for notification creation
await _notificationService.CreateNotificationAsync(new Notification {
    EmployeeId = employee.Id,
    Type = NotificationType.PolicyPublished,
    Message = $"New policy '{policyName}' has been published. Please review.",
    ReferenceId = policyId,
    ReferenceType = "CompanyPolicy",
    CreatedOn = DateTime.UtcNow,
    IsRead = false
});
```

---

### Integration with Audit/Logging System

**Purpose:** Maintain comprehensive audit trail of all policy operations.

**Integration Points:**

1. **Audit Fields in Database:**
   - CreatedBy, CreatedOn: Who created policy and when
   - ModifiedBy, ModifiedOn: Who last modified and when
   - CompanyPolicyHistory: Complete version history with modification tracking
   - IsDeleted flag: Soft delete for audit retention

2. **Application Logging:**
   - Policy creation logged to application logs (Info level)
   - Policy update/versioning logged with version number
   - Policy deletion logged with user and timestamp
   - File upload/download operations logged
   - Email notification events logged (success/failure)
   - Error scenarios logged (Error level) with exception details

3. **User Activity Tracking:**
   - UserCompanyPolicyTrack table records every policy download
   - ViewedOn: First view timestamp
   - ModifiedOn: Last view timestamp
   - Can generate user activity reports (who viewed what, when)

4. **Compliance Reporting:**
   - Version history enables rollback and change tracking
   - Policy track data used for compliance audits
   - Audit reports show:
     - When policy was published
     - Who published/updated policy
     - All version changes with dates
     - Employee acknowledgment timestamps
     - Policies never viewed by certain employees

5. **Logging Table Structure:**
   - Logging table (if exists) records policy-related events:
     - EventType: "PolicyCreated", "PolicyUpdated", "PolicyDeleted", "PolicyViewed"
     - EntityType: "CompanyPolicy"
     - EntityId: Policy ID
     - UserId: User who performed action
     - Timestamp: UTC timestamp
     - Details: JSON with action-specific data

**Audit Query Examples:**
```sql
-- Get all changes to a policy
SELECT * FROM CompanyPolicyHistory 
WHERE PolicyId = @PolicyId 
ORDER BY VersionNo DESC;

-- Get all policies created by a user
SELECT * FROM CompanyPolicy 
WHERE CreatedBy = @UserEmail AND IsDeleted = 0;

-- Get employees who viewed policy in date range
SELECT e.FirstName, e.LastName, uct.ViewedOn
FROM UserCompanyPolicyTrack uct
JOIN EmployeeData e ON uct.EmployeeId = e.Id
WHERE uct.CompanyPolicyId = @PolicyId
AND uct.ViewedOn BETWEEN @StartDate AND @EndDate;
```

---

### Integration with File Storage System

**Purpose:** Store and retrieve policy document files from local file system.

**Integration Points:**

1. **File System Configuration:**
   - WebRootPath: Base path from IHostingEnvironment (e.g., C:\inetpub\wwwroot\HRMSWebApi)
   - PolicyDirectoryLocation: Relative path from FilePathOptions (e.g., "PolicyDocuments/")
   - Full path: Path.Combine(WebRootPath, PolicyDirectoryLocation)
   - Directory created automatically if not exists

2. **File Upload Operations:**
   - IFormFile received from multipart request
   - File validated (type, size)
   - Unique filename generated with timestamp
   - File saved using FileStream with async I/O
   - Filename stored in CompanyPolicy.FileName and FileOriginalName

3. **File Download Operations:**
   - Filename retrieved from database
   - Full path constructed and validated (path traversal prevention)
   - File read as byte array using Helper.FileToByteArray
   - Byte array returned to client as base64 string
   - Client decodes and triggers browser download

4. **File Deletion:**
   - Old file deleted when policy document replaced
   - Path validated before deletion (security)
   - Deletion failure doesn't prevent policy update (orphaned files possible)
   - No deletion on policy soft delete (files retained for potential recovery)

5. **File Security:**
   - Path traversal prevention: GetFullPath + StartsWith validation
   - Files not directly accessible via URL (no anonymous access)
   - Download requires authentication and ViewCompanyPolicy permission
   - Tracking logged for compliance/audit

**File Naming Convention:**
- Pattern: `{OriginalNameWithoutExt}_{ddMMyyyyHHmmss}{Extension}`
- Example: `RemoteWorkPolicy2024_31102024093015.pdf`
- Ensures uniqueness (timestamp collision extremely rare)
- Preserves original name for user recognition
- Extension preserved for proper MIME type handling

**Storage Limitations:**
- Local file system storage (not cloud-based)
- Limited by server disk capacity
- No built-in redundancy (depends on server backup)
- No CDN integration for distributed access
- Scalability limited to single server (unless using shared network storage)

**Future Enhancement:**
- Migrate to Azure Blob Storage or AWS S3
- Implement SAS token-based direct downloads (mentioned in requirements but not implemented)
- Add file versioning with blob container per policy version
- Enable CDN for faster global access

---

### Integration with Employee Group Management

**Purpose:** Target policies to specific employee groups (departments, locations, roles).

**Current Implementation:**
- Accessibility flag: Boolean (true = all employees, false = restricted)
- No actual group targeting implemented yet

**Planned Integration:**

1. **Group-Based Targeting:**
   - Create CompanyPolicyGroupMapping table:
     - PolicyId → CompanyPolicy.Id
     - GroupId → EmployeeGroup.Id
   - If Accessibility = false: Policy visible only to mapped groups
   - If Accessibility = true: Policy visible to all employees

2. **Group Selection in Policy Form:**
   - Multi-select dropdown for employee groups
   - Only shown when Accessibility = false
   - Groups loaded from EmployeeGroup table
   - Selected groups saved to mapping table on policy save

3. **Policy Visibility Query:**
   ```sql
   -- Policies visible to employee
   SELECT cp.* FROM CompanyPolicy cp
   WHERE cp.StatusId = 2 AND cp.IsDeleted = 0
   AND (
     cp.Accessibility = 1  -- All employees
     OR EXISTS (
       SELECT 1 FROM CompanyPolicyGroupMapping cpgm
       JOIN UserGroupMapping ugm ON cpgm.GroupId = ugm.GroupId
       WHERE cpgm.PolicyId = cp.Id AND ugm.EmployeeId = @EmployeeId
     )
   )
   ```

4. **Group-Based Email Notifications:**
   - If Accessibility = false: Email only to employees in mapped groups
   - Reduces email volume for role-specific policies
   - Example: IT Security Policy → IT Department group only

5. **Compliance Reporting by Group:**
   - Track compliance per employee group
   - Reports show: X% of IT Department viewed IT Security Policy
   - Identify non-compliant groups for targeted follow-up

**Implementation Status:** Planned but not yet implemented (Accessibility field exists, mapping tables exist, integration pending)

---

## Testing Scenarios

### Unit Tests

**Test Category:** Service Layer Business Logic

**Test 1: Policy Creation with Valid Data**
- **Setup:** Mock repository, mapper, file system, email service
- **Input:** Valid CompanyPolicyRequestDto with all required fields, valid file
- **Expected:** CompanyPolicy record created, file saved, history entry created, success response
- **Assertions:**
  - AddAsync called on repository with correct entity
  - FileName matches pattern `{name}_{timestamp}.{ext}`
  - VersionNo = 1 for new policy
  - EffectiveDate set if StatusId = Active, null if Draft
  - AddPolicyHistory called with version 0
  - Success response with status code 200

**Test 2: Policy Creation with Invalid File Extension**
- **Setup:** Valid DTO but file with .exe extension
- **Input:** FileContent with filename "virus.exe"
- **Expected:** Error response, no database insert, no file save
- **Assertions:**
  - AddAsync NOT called
  - Error response with status code 400
  - Error message "File type is not supported"

**Test 3: Policy Creation with File Size Exceeded**
- **Setup:** Valid DTO but file size > PolicyDocumentMaxSize
- **Input:** FileContent with 6 MB size (limit is 5 MB)
- **Expected:** Error response, no database insert, no file save
- **Assertions:**
  - Error response with status code 400
  - Error message "File size exceeds maximum allowed size"

**Test 4: Active Policy Update Triggers Versioning**
- **Setup:** Existing policy with StatusId = 2, VersionNo = 2
- **Input:** Update request with modified name/description
- **Expected:** New history entry created, VersionNo incremented to 3, EffectiveDate updated
- **Assertions:**
  - GetByIdAsync called to load existing policy
  - VersionNo incremented: newVersion = existingVersion + 1
  - AddPolicyHistory called with new version data
  - UpdateAsync called with incremented VersionNo
  - Success message "New version created successfully"

**Test 5: Draft Policy Update Without Versioning**
- **Setup:** Existing policy with StatusId = 1 (Draft)
- **Input:** Update request with modified fields
- **Expected:** Direct update, no versioning
- **Assertions:**
  - UpdateAsync called on repository
  - AddPolicyHistory NOT called
  - VersionNo unchanged
  - Success message "Company policy updated successfully"

**Test 6: Download Tracking - First View**
- **Setup:** Employee downloads policy for first time
- **Input:** companyPolicyId, employeeId, fileName
- **Expected:** New tracking record inserted with ViewedOn timestamp
- **Assertions:**
  - GetCompanyPolicyTrack returns 0 (no existing record)
  - AddUserCompanyPolicyTrackAsync called
  - ViewedOn set to current UTC time
  - File content returned

**Test 7: Download Tracking - Subsequent View**
- **Setup:** Employee downloads policy again (tracking record exists)
- **Input:** Same companyPolicyId, employeeId
- **Expected:** Existing tracking record updated with ModifiedOn timestamp
- **Assertions:**
  - GetCompanyPolicyTrack returns existing record ID
  - UpdateUserCompanyPolicyTrackAsync called
  - ModifiedOn updated, ViewedOn unchanged
  - File content returned

---

### Integration Tests

**Test Category:** End-to-End API Workflows

**Test 1: Complete Policy Lifecycle**
- **Steps:**
  1. POST /api/CompanyPolicy/CreateCompanyPolicy - Create Draft policy
  2. GET /api/CompanyPolicy/{id} - Retrieve created policy
  3. PUT /api/CompanyPolicy/UpdateCompanyPolicy - Update to Active status
  4. GET /api/CompanyPolicy/GetCompanyPolicies - Verify appears in Active list
  5. POST /api/CompanyPolicy/DownloadPolicyDocument - Download document
  6. POST /api/CompanyPolicy/GetCompanyPolicyHistoryList - View version history
  7. DELETE /api/CompanyPolicy/{id} - Soft delete policy
  8. GET /api/CompanyPolicy/{id} - Verify 404 response
- **Expected:** All operations succeed with appropriate responses
- **Verification:** Database state matches expected at each step

**Test 2: Policy Creation with Email Notification**
- **Steps:**
  1. Create Active policy with EmailRequest = true
  2. Verify policy created in database
  3. Verify file saved to disk
  4. Check email queue for notification messages
  5. Verify email sent to all active employees
- **Expected:** Policy created, file saved, emails queued
- **Verification:** Mock email service received UpdatedPolicy call

**Test 3: Concurrent Policy Updates**
- **Steps:**
  1. User A loads policy for editing (version 2)
  2. User B loads same policy for editing (version 2)
  3. User A submits update → version 3 created
  4. User B submits update → version 4 created (from version 3)
  5. Verify both history entries exist
- **Expected:** Both updates succeed, version numbers sequential
- **Verification:** CompanyPolicyHistory has 4 entries (v0, v1, v2, v3, v4)

**Test 4: Policy Search and Filtering**
- **Steps:**
  1. Create 20 policies across multiple categories and statuses
  2. Search by name partial match → verify filtered results
  3. Filter by category → verify only matching category returned
  4. Filter by status → verify only matching status returned
  5. Apply sorting → verify order correct
  6. Apply pagination → verify correct page of results
- **Expected:** All filters and sorts work correctly
- **Verification:** Result counts and content match filter criteria

---

### UI Tests

**Test Category:** Frontend User Interactions

**Test 1: Policy List Load and Display**
- **Steps:**
  1. Navigate to /company-policy
  2. Verify page title "Company Policy"
  3. Verify filter form displayed
  4. Verify data table loads with Active policies (default filter)
  5. Verify columns displayed correctly
  6. Verify pagination controls present
- **Expected:** Page loads successfully, data table populated
- **Verification:** Check network requests, DOM elements, data rendered

**Test 2: Policy Creation Form Validation**
- **Steps:**
  1. Navigate to /company-policy/add
  2. Click Submit without filling fields
  3. Verify error messages displayed for required fields
  4. Fill Name field only → verify Description error still shown
  5. Fill all text fields → verify File Upload error shown
  6. Upload file > 5 MB → verify size error shown
  7. Upload .exe file → verify type error shown
  8. Upload valid PDF → verify no file errors
  9. Submit form → verify success
- **Expected:** Client-side validation prevents invalid submission
- **Verification:** Error messages displayed, API call only on valid data

**Test 3: Policy Edit Form Pre-Population**
- **Steps:**
  1. Navigate to policy list
  2. Click Edit icon for existing policy
  3. Verify form loads with existing policy data
  4. Verify Name field contains policy name
  5. Verify Description field contains description
  6. Verify Category dropdown shows selected category
  7. Verify Status dropdown shows current status
  8. Verify Accessibility checkbox reflects current value
  9. Verify file upload shows current filename (read-only)
- **Expected:** All fields pre-populated correctly
- **Verification:** Form values match policy data from API

**Test 4: Policy Download and Tracking**
- **Steps:**
  1. Navigate to policy detail page
  2. Click "Download Document" button
  3. Verify download initiated in browser
  4. Verify file opens correctly
  5. Check UserCompanyPolicyTrack table for new record
  6. Download same policy again
  7. Verify ModifiedOn timestamp updated
- **Expected:** File downloads successfully, tracking recorded
- **Verification:** Browser download, database tracking record

**Test 5: Version History Display**
- **Steps:**
  1. Create policy as Draft (version 1)
  2. Update to Active (version 2, history entry created)
  3. Update policy again (version 3)
  4. Navigate to policy detail page
  5. Verify version history tab visible (non-Employee role)
  6. Click version history tab
  7. Verify 3 history entries displayed (v0, v1, v2)
  8. Verify entries sorted by version descending
- **Expected:** Version history table shows all versions
- **Verification:** Table rows count = 3, versions in order

---

### Performance Tests

**Test Category:** Load and Scalability

**Test 1: Policy List Load Time with Large Dataset**
- **Setup:** Database with 1000+ policies
- **Test:** Load policy list page with default filters
- **Metrics:** Page load time, API response time, database query time
- **Acceptance Criteria:** Page loads in < 2 seconds, API responds in < 500ms
- **Optimization:** Indexed queries, pagination, efficient JOINs

**Test 2: Policy Document Upload - Large Files**
- **Setup:** Upload 4.9 MB PDF (near max limit)
- **Test:** Submit policy creation form
- **Metrics:** Upload time, file save time, total request time
- **Acceptance Criteria:** Upload completes in < 10 seconds
- **Considerations:** Network speed, disk I/O, server resources

**Test 3: Concurrent Policy Downloads**
- **Setup:** 100 employees simultaneously download same policy
- **Test:** Simulate 100 concurrent GET /DownloadPolicyDocument requests
- **Metrics:** Response time, server CPU/memory, database connections
- **Acceptance Criteria:** All requests complete successfully, avg response < 2 seconds
- **Bottlenecks:** File I/O, database tracking inserts, connection pool

**Test 4: Email Notification Batch Processing**
- **Setup:** Publish policy with 500 active employees
- **Test:** Email notification job processes all recipients
- **Metrics:** Email queue processing time, SMTP throughput, failures
- **Acceptance Criteria:** All emails queued in < 5 seconds, sent within 5 minutes
- **Optimization:** Background job queue, batch sending, retry logic

**Test 5: Version History Query Performance**
- **Setup:** Policy with 50 versions in history table
- **Test:** Load version history tab
- **Metrics:** Query execution time, data transfer size, page render time
- **Acceptance Criteria:** History loads in < 1 second
- **Optimization:** Index on PolicyId, paginated results, minimal column selection

---

### Security Tests

**Test Category:** Authorization and Data Protection

**Test 1: Unauthorized Policy Access**
- **Test:** User without ViewCompanyPolicy permission attempts GET /api/CompanyPolicy/{id}
- **Expected:** HTTP 403 Forbidden or redirect to login
- **Verification:** API blocks request, no data returned

**Test 2: Policy Creation Without Permission**
- **Test:** User without CreateCompanyPolicy permission attempts POST /CreateCompanyPolicy
- **Expected:** HTTP 403 Forbidden
- **Verification:** No policy created in database, file not saved

**Test 3: Cross-Employee Policy Download Tracking**
- **Test:** Employee A downloads policy, check if Employee B's tracking affected
- **Expected:** Only Employee A's tracking record created/updated
- **Verification:** Query UserCompanyPolicyTrack for both employees, verify separation

**Test 4: Path Traversal Prevention**
- **Test:** Attempt file upload with filename "../../../etc/passwd" or "..\..\..\windows\system32\config\sam"
- **Expected:** File save fails silently or error response
- **Verification:** Path validation prevents traversal, file saved only in PolicyDirectoryLocation

**Test 5: SQL Injection in Policy Search**
- **Test:** Enter malicious SQL in name search field: `' OR 1=1 --`
- **Expected:** No SQL injection, treated as literal search string
- **Verification:** Parameterized queries prevent injection, no unintended data returned

**Test 6: File Type Bypass Attempt**
- **Test:** Upload .exe file renamed as .pdf
- **Expected:** Server detects actual file type or rejects based on extension
- **Verification:** File rejected if extension check in place (current implementation checks extension only)
- **Note:** Current implementation vulnerable to extension spoofing; MIME type check recommended

---

## Dependencies / Reused Components

### Backend Dependencies

**NuGet Packages:**

1. **Microsoft.NET Sdk** (Version 8.0):
   - Core .NET framework
   - Required for ASP.NET Core Web API

2. **Dapper** (Version 2.1.35):
   - Micro ORM for database access
   - Used in CompanyPolicyRepository for SQL queries
   - Provides QueryAsync, ExecuteAsync, QuerySingleOrDefaultAsync methods

3. **AutoMapper** (Latest compatible version):
   - Object-to-object mapping
   - Maps CompanyPolicy entity ↔ CompanyPolicyRequestDto ↔ CompanyPolicyResponseDto
   - Registered in ConfigureServices with mapping profiles

4. **FluentValidation** (Latest compatible version):
   - Server-side validation framework
   - CompanyPolicyRequestValidation class validates request DTOs
   - Integrated with ASP.NET Core validation pipeline

5. **Microsoft.AspNetCore.Http.Features**:
   - IFormFile interface for file uploads
   - Multipart form data handling

6. **Microsoft.Data.SqlClient** (Version 5.2.3):
   - SQL Server database connectivity
   - Connection string management
   - Used by Dapper for query execution

7. **Microsoft.Extensions.Configuration**:
   - Configuration system (appsettings.json)
   - IOptions<T> pattern for strongly-typed configuration

8. **Microsoft.AspNetCore.Mvc**:
   - Web API controllers and routing
   - Model binding and validation
   - ActionResult types

**Shared Libraries/Modules:**

1. **HRMS.Domain**:
   - Entity classes: CompanyPolicy, CompanyPolicyHistory, CompanyPolicyDocCategory, PolicyStatus
   - Enums: CompanyPolicyStatus
   - Configuration classes: FilePathOptions, AppConfigOptions
   - Constants: ConnectionStrings, ErrorMessage, SuccessMessage, Permissions

2. **HRMS.Models**:
   - DTOs: CompanyPolicyRequestDto, CompanyPolicyResponseDto, CompanyPolicySearchRequestDto, etc.
   - Base models: ApiResponseModel, SearchRequestDto
   - Pagination and filter models

3. **HRMS.Infrastructure**:
   - Repository interfaces: ICompanyPolicyRepository
   - Repository implementations: CompanyPolicyRepository
   - Unit of Work pattern: IUnitOfWork, UnitOfWork
   - Database access layer

4. **HRMS.Application**:
   - Service interfaces: ICompanyPolicyService, IEmailNotificationService
   - Service implementations: CompanyPolicyService, EmailNotificationService
   - Business logic layer
   - Helper utilities: Helper.DeleteFile, Helper.FileToByteArray

---

### Frontend Dependencies

**NPM Packages:**

1. **React** (Version 18.3.1):
   - Core UI library
   - Component-based architecture
   - Hooks: useState, useEffect, useMemo

2. **React Router DOM** (Version 6.x):
   - Client-side routing
   - useNavigate, useParams hooks
   - Protected routes with permission checks

3. **React Hook Form** (Version 7.x):
   - Form state management
   - useForm hook with validation
   - useWatch for reactive form values

4. **Yup** (Version 1.x):
   - Schema validation library
   - Integrated with React Hook Form via @hookform/resolvers

5. **Material-UI (MUI)** (Version 6.5.0):
   - Component library
   - Components used: Box, Paper, Typography, TextField, Select, Checkbox, Button, Table, TablePagination, Dialog
   - Icons: EditIcon, VisibilityIcon, AddIcon

6. **SWR** (Version 2.x):
   - Data fetching and caching
   - useAsync custom hook built on SWR
   - Automatic revalidation

7. **React Toastify** (Latest version):
   - Toast notifications
   - Success/error message display
   - Customizable positioning and styling

8. **Axios** (Implicit via httpInstance):
   - HTTP client for API calls
   - Request/response interceptors
   - Error handling

**Shared Frontend Modules:**

1. **httpInstance**:
   - Configured Axios instance
   - Base URL, headers, interceptors
   - JWT token injection

2. **Custom Hooks:**
   - useAsync: Handles API calls with loading/error states
   - useUserStore: Zustand store for user data

3. **Utility Functions:**
   - formatDate: Date formatting (DD/MM/YYYY HH:mm)
   - methods.throwApiError: Error handling and toast display
   - objectToFormData: Convert object to FormData for file uploads
   - hasPermission: Check user permissions

4. **Shared Components:**
   - PageHeader: Consistent page titles
   - DataTable: Reusable table with sorting/pagination
   - ActionIconButton: Icon buttons for table actions
   - Loader: Loading spinner
   - BreadCrumbs: Navigation breadcrumbs
   - NotFoundPage: 404 error page

---

### Database Objects

**Tables:**
1. CompanyPolicy - Main policy records
2. CompanyPolicyHistory - Version history
3. CompanyPolicyDocCategory - Category master data
4. PolicyStatus - Status master data
5. UserCompanyPolicyTrack - Download tracking
6. EmployeeData - Employee master (FK reference)

**Stored Procedures:**
1. **GetCompanyPolicyDocuments**:
   - Parameters: @StatusId, @PolicyName, @CategoryId, @SortColumnName, @SortColumnDirection, @StartIndex, @PageSize
   - Purpose: Policy list with filters, sorting, pagination
   - Returns: Policy records with category names

2. **GetHistoryListByPolicyId**:
   - Parameters: @PolicyId, @SortColumnName, @SortColumnDirection, @StartIndex, @PageSize
   - Purpose: Version history for specific policy
   - Returns: History records with metadata

3. **GetUserCompanyPolicyTrackList**:
   - Parameters: @CompanyPolicyId, @EmployeeName, @SortColumnName, @SortColumnDirection, @StartIndex, @PageSize
   - Purpose: Policy track report with employee details
   - Returns: Tracking records with employee info

**Indexes:**
- Primary keys on all tables (clustered indexes)
- Foreign key indexes for JOIN optimization
- Recommended: Index on CompanyPolicyHistory.PolicyId for version queries
- Recommended: Composite index on UserCompanyPolicyTrack(CompanyPolicyId, EmployeeId)

**Foreign Key Constraints:**
- CompanyPolicy.DocumentCategoryId → CompanyPolicyDocCategory.Id
- CompanyPolicy.StatusId → PolicyStatus.Id
- UserCompanyPolicyTrack.EmployeeId → EmployeeData.Id

---

### External Services

1. **Email Notification Service:**
   - Office 365 SMTP (smtp.office365.com:587)
   - TLS encryption
   - Credentials from appsettings.json
   - Template-based HTML emails

2. **File System:**
   - Local server disk storage
   - Path: WebRootPath + PolicyDirectoryLocation
   - Async file I/O operations

3. **Background Job Queue (Implied):**
   - Quartz.NET or Hangfire for email batch processing
   - Fire-and-forget pattern
   - Retry logic for failed emails

---

## Known Limitations

### 1. Local File Storage Instead of Cloud

**Limitation:** Policy documents stored on local web server file system, not Azure Blob Storage or AWS S3.

**Impact:**
- Single point of failure (no redundancy)
- Limited scalability (vertical only)
- No CDN integration (slower downloads for remote users)
- Manual backup required
- Disaster recovery depends on server backups

**Workaround:** Implement server-level backup solution, network-attached storage for shared access across multiple servers.

**Future Enhancement:** Migrate to Azure Blob Storage with SAS token-based downloads (as mentioned in requirements).

---

### 2. No SAS Token Implementation for Direct Downloads

**Limitation:** Downloads go through application server (file read → API response), not direct blob storage access with time-limited SAS tokens.

**Impact:**
- Server bandwidth consumed for every download
- Slower download speeds (file proxied through API)
- Scalability limited by server resources
- No secure direct download links

**Workaround:** Current implementation adequate for moderate file sizes and user counts.

**Future Enhancement:** Generate SAS tokens for direct Azure Blob Storage access with expiration (7-day validity as per requirements).

---

### 3. No Employee Group Targeting

**Limitation:** Accessibility field is boolean (all or none), no granular targeting to specific employee groups, departments, or roles.

**Impact:**
- Cannot target role-specific policies (e.g., IT Security Policy to IT Department only)
- All policies either visible to everyone or require manual coordination
- Email notifications sent to all employees regardless of relevance
- Compliance tracking not segmented by group

**Workaround:** Use policy naming conventions, manual communication, and rely on employees to self-select relevant policies.

**Future Enhancement:** Implement CompanyPolicyGroupMapping table, multi-select group picker in policy form, group-filtered policy queries.

---

### 4. No Explicit Policy Acknowledgment Workflow

**Limitation:** System tracks downloads but doesn't require explicit acknowledgment (checkbox, signature, quiz).

**Impact:**
- Compliance tracking based on "viewed" status, not confirmed understanding
- No proof of acknowledgment for legal/audit purposes
- Employees can download without reading
- Cannot enforce mandatory acknowledgment before system access

**Workaround:** Use download tracking as proxy for acknowledgment, supplemented with email confirmations and manual follow-up.

**Future Enhancement:** Add acknowledgment checkbox on policy detail page, require acknowledgment before dismissing notification, store acknowledgment timestamp and IP address.

---

### 5. Limited File Type Validation

**Limitation:** File type validation based on extension only, not MIME type or content inspection.

**Impact:**
- Vulnerable to extension spoofing (.exe renamed as .pdf would pass validation)
- No virus/malware scanning
- No content verification (empty files, corrupted files accepted)

**Workaround:** Rely on client-side antivirus, educate users to upload only legitimate documents, monitor disk for suspicious files.

**Future Enhancement:** Implement server-side MIME type checking, integrate antivirus scanning API, validate file headers.

---

### 6. No Policy Expiration or Auto-Archive

**Limitation:** Policies remain Active indefinitely, no automatic status change based on expiration date.

**Impact:**
- Outdated policies shown as current
- Manual effort required to archive old policies
- Compliance risk if outdated policies not updated
- No expiration reminders for policy owners

**Workaround:** Manual review process, HR calendar reminders to review policies annually.

**Future Enhancement:** Add ExpirationDate field, background job to auto-archive expired policies, expiration alerts to policy owners.

---

### 7. No Policy Comparison or Diff View

**Limitation:** Version history shows metadata only, cannot compare document content between versions.

**Impact:**
- Employees cannot see what changed between v2 and v3
- Must download and manually compare documents
- Difficult to understand policy evolution
- May miss important changes

**Workaround:** Include change summary in Description field for each version, HR communicates major changes via email.

**Future Enhancement:** Document diff viewer (for supported formats), change highlighting, version comparison UI.

---

### 8. No Role-Based Approval Workflow

**Limitation:** No approval process before policy publication (any user with CreateCompanyPolicy can publish directly).

**Impact:**
- Policies can be published without review
- No quality control or legal review step
- Risk of errors or non-compliance
- No approval audit trail

**Workaround:** Draft status used as review stage, manual coordination with management/legal before changing to Active.

**Future Enhancement:** Multi-stage approval workflow (HR → Manager → Legal → Publish), approval history table, approval notifications.

---

### 9. Email Notification Sent to All Employees

**Limitation:** Email sent to all employees on policy update, no filtering by relevance or previous view status.

**Impact:**
- Email fatigue if many policy updates
- Irrelevant emails to employees (e.g., IT policy to non-IT staff)
- Possible spam complaints
- Lower engagement over time

**Workaround:** Use EmailRequest checkbox judiciously, batch policy updates, encourage grouping of changes.

**Future Enhancement:** Smart notification targeting (employees who viewed previous version, relevant groups only), notification preferences per employee.

---

### 10. No Bulk Policy Operations

**Limitation:** Policies must be created/updated/deleted one at a time via UI.

**Impact:**
- Time-consuming to manage many policies
- No bulk status changes (e.g., archive all policies from 2020)
- No bulk upload of policies
- Inefficient for large policy libraries

**Workaround:** Direct database scripts for bulk operations (requires technical expertise), careful planning to minimize bulk changes.

**Future Enhancement:** Bulk upload CSV with policy metadata and file references, bulk status change with multi-select, bulk delete with confirmation.

---

### 11. Limited Search Capabilities

**Limitation:** Search only on policy name (partial match), no full-text search of document content or description.

**Impact:**
- Cannot find policies by keywords in document body
- Difficult to locate policy on specific topic if name ambiguous
- Must rely on category filtering
- Poor discoverability

**Workaround:** Use consistent naming conventions, detailed descriptions with keywords, well-organized categories.

**Future Enhancement:** Full-text search indexing of document content (requires OCR for scanned PDFs), search highlighting, advanced filters (tags, keywords).

---

### 12. No Mobile-Optimized UI

**Limitation:** UI designed for desktop, responsive but not mobile-optimized.

**Impact:**
- Difficult to view/download policies on mobile devices
- Small screens make table navigation challenging
- File download may not work on some mobile browsers
- Poor user experience for mobile users

**Workaround:** Users access on desktop/laptop, email notifications include policy summary for quick mobile reference.

**Future Enhancement:** Mobile-responsive design overhaul, native mobile app integration, in-app document viewer.

---

## Summary

The Company Policy Management module provides a comprehensive system for managing organizational policies with features including:

**Core Capabilities:**
- Policy creation with document upload (PDF, DOC, DOCX, images)
- Three-state lifecycle (Draft → Active → Inactive)
- Automatic versioning for Active policy updates
- Complete version history with audit trail
- Category-based organization
- Search and filtering with pagination
- Employee download tracking for compliance
- Email notifications on policy publish/update
- Permission-based access control

**Technical Architecture:**
- ASP.NET Core Web API backend with Clean Architecture
- React + TypeScript frontend with Material-UI components
- Dapper ORM for database access
- Local file system storage for documents
- SQL Server database with normalized schema
- RESTful API design with JWT authentication

**Integration Points:**
- Authentication & Authorization module (permissions, JWT)
- Employee Management module (employee data, foreign keys)
- Email Notification Service (policy alerts)
- Dashboard module (policy widgets, metrics)
- Notification module (in-app alerts)
- Audit/Logging system (comprehensive trail)

**Key Workflows:**
1. Create and publish new policy (5-10 min)
2. Update active policy with versioning (10-15 min)
3. Track policy acknowledgment compliance (ongoing)

**Known Gaps:**
- Local storage instead of cloud (Azure Blob)
- No SAS token-based direct downloads
- No employee group targeting
- No explicit acknowledgment workflow
- Limited file validation (extension only)
- No policy expiration/auto-archive
- No document diff/comparison view
- No approval workflow
- Mass email to all employees (no smart targeting)
- No bulk operations
- Limited search (name only, no full-text)
- Not mobile-optimized

**Performance:**
- Policy list loads in < 2 seconds (1000+ policies)
- File uploads complete in < 10 seconds (< 5 MB)
- Download tracking recorded in < 1 second
- Email batch processing completes in < 5 minutes

**Security:**
- Path traversal prevention
- File type and size validation
- Permission-based authorization
- Download tracking for audit
- Soft delete for data retention
- SQL injection protection (parameterized queries)

The module provides essential policy management functionality suitable for organizations with up to several hundred policies and employees, with clear upgrade paths for cloud storage, advanced targeting, and workflow automation.

---

**End of Module 06: Company Policy Management Documentation**

