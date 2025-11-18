# Module 02: Employee Management - Part 5

## Error Handling / Edge Cases

### Employee Creation Errors:

**Duplicate Email:**
- Error scenario: HR attempts to create employee with email already in system
- System behavior: Email uniqueness check before insert
- Error message: "Email already exists. Please use a different email address."
- HTTP status: 409 Conflict
- UI behavior: Error displayed inline below email field, form submission blocked

**Duplicate Employee Code:**
- Error scenario: Custom employee code entered that already exists
- System behavior: Employee code uniqueness check
- Error message: "Employee code already exists. Please use a different code."
- HTTP status: 409 Conflict
- UI behavior: Error inline, form blocked

**Time Doctor API Failure:**
- Error scenario: Time Doctor API unavailable or returns error during employee creation
- System behavior: Continue employee creation without TimeDoctorUserId, enable manual attendance
- Fallback: Log warning, set TimeDoctorUserId as null, set IsManualAttendance = true
- Error logged: "Time Doctor API failed for email: [email]. Manual attendance enabled."
- User notification: "Unable to fetch Time Doctor ID. Manual attendance will be enabled."

**Invalid Joining Date:**
- Error scenario: Joining date is future date or more than 50 years in past
- Validation: Joining date must be <= today and >= (today - 50 years)
- Error message: "Invalid joining date. Joining date cannot be in future."
- UI behavior: Date picker restricted to valid range

**Missing Mandatory Fields:**
- Error scenario: Required fields left empty during submission
- Validation: FluentValidation checks all required fields
- Error message: Field-specific errors like "First name is required", "Email is required"
- UI behavior: All validation errors displayed below respective fields, form blocked

**Leave Balance Calculation Failure:**
- Error scenario: Error in leave balance calculation during employee creation
- System behavior: Log error, continue employee creation, leave balance set to zero
- Fallback: HR can manually adjust leave balance later via Leave Management module
- Error logged: "Leave balance calculation failed for EmployeeId: [id]"

**Email Queue Failure:**
- Error scenario: Welcome email fails to queue or send
- System behavior: Employee creation continues successfully, email failure logged
- Fallback: HR manually sends welcome email or portal link
- Error logged: "Welcome email failed for EmployeeId: [id], Email: [email]"

### Document Upload Errors:

**File Size Exceeds Limit:**
- Error scenario: Document file size > 5 MB
- Validation: Client-side and server-side file size check
- Error message: "File size exceeds maximum limit of 5 MB. Please upload a smaller file."
- HTTP status: 400 Bad Request
- UI behavior: File rejected before upload, error message displayed

**Invalid File Type:**
- Error scenario: File type not in allowed list (e.g., .exe, .mp4 uploaded)
- Validation: File extension and MIME type check
- Error message: "Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX."
- UI behavior: File rejected, error displayed

**Blob Storage Upload Failure:**
- Error scenario: Azure Blob Storage unavailable or network timeout during upload
- System behavior: Retry upload (3 attempts with exponential backoff)
- If all retries fail: Error returned to user
- Error message: "Document upload failed. Please try again later."
- HTTP status: 500 Internal Server Error
- Fallback: User can retry upload, document record not created in database until successful upload

**Duplicate Document:**
- Error scenario: User attempts to upload same document type twice (e.g., two PAN cards)
- Validation: Check for existing document with same type for employee
- System behavior (option 1): Reject upload with error "Document already exists. Please update existing document."
- System behavior (option 2): Replace existing document (implementation unclear)
- UI behavior: Show warning dialog with options: Replace, Cancel

**Document Download Failure:**
- Error scenario: Document file deleted from blob storage or SAS URL expired
- System behavior: Check blob existence before generating SAS URL
- Error message: "Document not found. Please contact HR."
- Fallback: HR re-uploads document

### Profile Update Errors:

**Concurrent Update Conflict:**
- Error scenario: Two HR users update same employee profile simultaneously
- System behavior: Last write wins (no optimistic concurrency control visible in codebase)
- Potential data loss: First user's changes overwritten by second user
- Recommendation: Implement version tracking or last-modified timestamp validation

**Invalid Field Values:**
- Error scenario: Employee enters invalid data (e.g., phone number with letters)
- Validation: Field-level validation on server and client
- Error message: Field-specific like "Invalid phone number format"
- UI behavior: Error displayed inline, save blocked

**Personal Email Conflict:**
- Error scenario: Employee updates personal email to email already used by another employee
- Validation: Personal email uniqueness check (optional based on business rules)
- Error message: "Personal email already in use by another employee."
- System behavior: Allow or block based on configuration

**Address Country/State/City Mismatch:**
- Error scenario: City selected doesn't belong to selected state (due to stale dropdown data)
- Validation: Server-side validation of country-state-city relationship
- Error message: "Invalid city for selected state. Please refresh and try again."
- UI behavior: Refresh dropdowns, error displayed

### Nominee Management Errors:

**Percentage Share Exceeds 100%:**
- Error scenario: Employee adds multiple nominees with total percentage > 100%
- Validation: Sum of all nominee percentages for employee
- Error message: "Total percentage share cannot exceed 100%. Current total: [X]%. Remaining: [Y]%."
- UI behavior: Save blocked, error displayed

**Percentage Share Below 100%:**
- Error scenario: Total percentage < 100% (e.g., single nominee with 80%)
- Validation: Warning (not blocking error)
- Warning message: "Total percentage share is [X]%. Remaining [Y]% is unallocated."
- UI behavior: Allow save with warning, HR can review and correct

**Minor Nominee Without Guardian:**
- Error scenario: Nominee age < 18 years, no guardian details provided
- Validation: Check DOB, require guardian if nominee is minor
- Error message: "Nominee is a minor. Please provide guardian details."
- UI behavior: Guardian fields become mandatory, save blocked until provided

**Duplicate Nominee:**
- Error scenario: Same person added as nominee twice
- Validation: Check nominee name and relationship combination
- Warning message: "A nominee with similar details already exists."
- UI behavior: Show warning, allow user to proceed or cancel

### Educational Details Errors:

**Invalid Year of Passing:**
- Error scenario: Year of passing is future year or more than 60 years ago
- Validation: Year must be between (current year - 60) and current year
- Error message: "Invalid year of passing. Must be between [min year] and [current year]."
- UI behavior: Year input restricted, error displayed if invalid value entered

**Missing Degree Certificate:**
- Error scenario: User saves educational detail without uploading certificate
- Validation: Certificate upload optional or mandatory based on configuration
- If mandatory: Error message "Degree certificate is required."
- If optional: Allow save without certificate, show warning

### Previous Employer Errors:

**End Date Before Start Date:**
- Error scenario: Employment end date earlier than start date
- Validation: End date must be after start date
- Error message: "End date cannot be before start date."
- UI behavior: Save blocked, error displayed

**Overlapping Employment Dates:**
- Error scenario: Previous employer dates overlap with another previous employer entry
- Validation: Check for date overlap across all previous employers
- Warning message: "Employment dates overlap with another employer. Please verify dates."
- UI behavior: Show warning, allow save (as part-time work or contract overlap possible)

**No Documents Uploaded:**
- Error scenario: Previous employer added without any documents
- Validation: At least one document (relieving letter or experience certificate) may be required
- If mandatory: Error message "At least one document is required."
- If optional: Allow save with warning

### Employee Search & List Errors:

**No Results Found:**
- Error scenario: Search filter returns no matching employees
- System behavior: Display empty state message
- Message: "No employees found matching your search criteria."
- UI behavior: Show empty state illustration, Clear Filters button

**Pagination Beyond Bounds:**
- Error scenario: User directly accesses page number beyond available pages (e.g., page 100 when only 10 pages exist)
- System behavior: Return to last valid page or first page
- Error message: "Requested page not found. Showing first page."

**Export Timeout:**
- Error scenario: Export large employee dataset (e.g., 10,000 employees) causes timeout
- System behavior: Implement pagination in export or background job
- If timeout: Error message "Export is taking longer than expected. Please try with fewer filters or contact support."
- Fallback: Export in batches or use background job with email notification when ready

### Permission Errors:

**Unauthorized Access:**
- Error scenario: Employee attempts to access another employee's restricted profile sections (e.g., bank details)
- Validation: Permission check on API endpoint
- Error message: "You do not have permission to access this information."
- HTTP status: 403 Forbidden
- UI behavior: Section hidden or error message displayed

**Role Mismatch:**
- Error scenario: Employee with "Employee" role attempts to archive another employee
- Validation: Permission check via [HasPermission] attribute
- Error message: "You do not have permission to perform this action."
- HTTP status: 403 Forbidden
- UI behavior: Archive button hidden for users without permission

### Archival Errors:

**Cannot Archive Self:**
- Error scenario: HR admin attempts to archive own account
- Validation: Check if target employee ID matches logged-in user ID
- Error message: "You cannot archive your own account. Please contact another administrator."
- UI behavior: Archive button disabled for own profile

**Employee with Pending Approvals:**
- Error scenario: Archiving employee who has pending leave approvals assigned to them
- System behavior: Transfer pending approvals to alternate approver or manager's manager
- Warning message: "Employee has pending approvals. These will be transferred to [alternate approver]."
- UI behavior: Show warning dialog with approval count, require confirmation

**Accidental Archival:**
- Error scenario: HR accidentally archives wrong employee
- Fallback: Unarchive functionality available
- Process: HR navigates to archived employees list, clicks Unarchive, employee restored
- System behavior: Clear IsDeleted flag, restore system access

### Master Data Errors:

**Cannot Delete Department with Employees:**
- Error scenario: HR attempts to delete department that has active employees assigned
- Validation: Check employee count in department before delete
- Error message: "Cannot delete department. [X] active employees are assigned to this department."
- UI behavior: Delete blocked, suggest archiving instead of deleting

**Cannot Delete Reporting Manager:**
- Error scenario: HR attempts to archive employee who is reporting manager for other employees
- Validation: Check if employee is reporting manager for others
- Warning message: "Employee is reporting manager for [X] employees. Please reassign before archiving."
- UI behavior: Show list of reportees, require reassignment before archival

### Integration Errors:

**Time Doctor Sync Failure:**
- Error scenario: Time Doctor UserId exists in HRMS but user deleted from Time Doctor
- System behavior: Attendance sync job detects missing user, logs error
- Fallback: Switch employee to manual attendance, notify HR
- Error logged: "Time Doctor user not found for EmployeeId: [id]. Switched to manual attendance."

**DownTown API Export Failure:**
- Error scenario: DownTown API calls GetEmploymentDetail but employee data incomplete
- System behavior: Return partial data with error indicators
- Error message: "Employee data incomplete. Some fields may be missing."
- Fallback: Return available data, flag missing fields

## Integration Points with Other Modules

### Integration with Authentication & Authorization:
- Employee official email used as SSO login identifier
- EmployeeId linked with authentication system user account
- Role assignment determines permission set
- Active employee status required for system login
- Archived employees cannot login

### Integration with Leave Management:
- Opening leave balance created during employee onboarding
- Joining date used for leave accrual calculation
- Gender determines maternity leave eligibility
- Reporting manager used as default leave approver
- Department determines leave policy applicability

### Integration with Attendance Management:
- Time Doctor User ID used for automatic attendance tracking
- IsManualAttendance flag determines attendance input mode
- EmployeeId linked with Attendance records
- Attendance configuration initialized on employee creation

### Integration with Exit Management:
- Employee exit process updates employment status
- Archival triggered after exit completion
- Final settlement requires bank details from employee master
- Relieving letter uses employment details (designation, joining date, department)

### Integration with Asset Management:
- EmployeeId linked with AssetAllocation records
- Asset assignment requires active employee status
- Asset return process during exit checks employee's allocated assets
- Department and designation determine asset eligibility

### Integration with Grievance Management:
- EmployeeId used to submit and track grievances
- Employee details displayed in grievance records
- Reporting manager may be involved in grievance resolution
- Department head may be escalation point for grievances

### Integration with Dashboard & Reports:
- Employee data used for dashboard widgets:
  - Total employees count
  - Department-wise employee distribution
  - Joining trends (month-wise new joiners)
  - Profile completeness statistics
- Reports:
  - Employee master report
  - Department-wise headcount
  - New joiners report
  - Archived employees report
  - Document expiry report

### Integration with Notification System:
- Welcome email sent on employee creation
- Profile update notifications
- Document expiry alerts (if implemented)
- Department transfer notifications
- Reporting manager change notifications

### Integration with KPI Management:
- Employee department and designation determine KPI template
- Reporting manager assigned as KPI reviewer
- KPI targets set based on role and experience

### Integration with Projects & Tasks:
- Employee available for project assignment if status is Active
- Department and skills determine project suitability
- Task assignment based on employee availability

### Integration with Payroll (External):
- Employee master data exported for payroll processing
- Bank details used for salary credit
- PAN, Aadhaar, PF, ESI details for statutory compliance
- Joining date determines salary pro-ration
- Employment status determines payroll eligibility

### Integration with DownTown Timesheet System:
- Employee data exported to DownTown via API
- EmploymentDetailsForDwnTwn DTO includes personal, employment, education, previous employer data
- Profile picture URL shared for display in external system
- Used for timesheet tracking and project billing

## Dependencies / Reused Components

### Backend Dependencies:
- **BlobStorageClient**: Upload, download, delete employee documents and profile pictures
- **TimeDoctorClient**: Fetch Time Doctor User ID by email during employee creation
- **EmailNotificationService**: Send welcome email, profile update notifications
- **AutoMapper**: Map between entity objects and DTOs (EmployeeData ↔ PersonalDetailsRequestDto, EmploymentDetail ↔ EmploymentRequestDto, etc.)
- **Dapper**: Execute stored procedures for employee queries (GetEmployeeList, GetEmploymentDetailById, etc.)
- **FluentValidation**: Validate employee creation and update requests (AddEmploymentRequestValidation, PersonalDetailRequestValidation, etc.)
- **LeaveBalanceHelper**: Calculate opening leave balance for new employees

### Frontend Dependencies:
- **React Hook Form**: Form management for employee creation, personal details, document upload forms
- **Material-UI (MUI)**: UI components (TextField, Select, DatePicker, DataGrid, Modal, Tabs, etc.)
- **SWR**: Data fetching and caching for employee lists, profile data, master data
- **Axios**: HTTP client for API calls
- **React Router**: Navigation between employee list, profile, edit pages
- **React Toastify**: Success and error toast notifications
- **Moment.js / date-fns**: Date formatting and manipulation
- **React Dropzone**: Drag-drop file upload for documents and profile pictures

### Shared Utilities:
- **FileValidator**: Validate file size, type, extension for document uploads
- **EmployeeCodeGenerator**: Generate sequential employee codes
- **AddressFormatter**: Format address for display (concatenate address lines, city, state, country)
- **PermissionChecker**: Check user permissions for view/edit employee profile sections
- **DateHelper**: Calculate duration between dates (for previous employer), validate date ranges
- **ExcelExporter**: Export employee list to Excel
- **PhoneNumberValidator**: Validate phone number format
- **EmailValidator**: Validate email format, check domain

### Configuration:
- **AppConfig**:
  - MaxFileSize: 5 MB
  - AllowedFileTypes: ["pdf", "jpg", "png", "doc", "docx"]
  - BlobContainers: ProfileImage, UserDocumentContainer, EmployerDocumentContainer
- **LeavesAccrualOptions**: Leave accrual configuration for opening balance calculation
- **PermissionConfig**: Employee management permission definitions

### Master Data Dependencies:
- Country, State, City tables for address dropdowns
- Department, Designation, Team tables for employment details
- DocumentType table for document upload options
- Qualification, University tables for educational details
- Relationship table for family and nominee information
- EmployerDocumentType table for previous and current employer documents
- Role, Permission tables for access control

## Testing Artifacts

Testing artifacts not explicitly found in codebase. Recommended tests:

### Unit Tests:

**EmploymentDetailService Tests:**
- Test AddEmploymentDetail with valid data
- Test AddEmploymentDetail with duplicate email (expect error)
- Test AddEmploymentDetail with duplicate employee code (expect error)
- Test AddEmploymentDetail with invalid joining date (expect error)
- Test opening leave balance calculation for different joining dates
- Test Time Doctor integration success and failure scenarios
- Test UpdateEmploymentDetail with valid data
- Test ArchiveUnarchiveEmploymentDetails

**UserProfileService Tests:**
- Test AddPersonalDetail with valid data
- Test AddPersonalDetail with duplicate personal email (if applicable)
- Test UpdatePersonalDetail
- Test UploadUserProfileImage with valid file
- Test UploadUserProfileImage with oversized file (expect error)
- Test UploadUserProfileImage with invalid file type (expect error)
- Test UploadUserDocument with valid data
- Test GetPersonalDetailsById

**NomineeService Tests:**
- Test AddNominee with valid data
- Test AddNominee with total percentage exceeding 100% (expect error)
- Test UpdateNominee
- Test DeleteNominee (soft delete)
- Test GetNomineeList with pagination

**EducationalDetailService Tests:**
- Test AddEducationalDetails with valid data
- Test EditEducationalDetails
- Test DeleteEducationalDetails
- Test GetEducationalDocuments with filters

**PreviousEmployerService Tests:**
- Test AddPreviousEmployer with valid data
- Test AddPreviousEmployer with end date before start date (expect error)
- Test UpdatePreviousEmployer
- Test DeletePreviousEmployer
- Test UploadPreviousEmployerDocument

### Integration Tests:

**Employee Creation End-to-End:**
- Create employee with all details
- Verify EmployeeData and EmploymentDetail records created
- Verify opening leave balance inserted
- Verify attendance configuration created
- Verify welcome email queued
- Verify Time Doctor integration

**Employee Profile Update End-to-End:**
- Update personal details
- Verify database record updated
- Verify ModifiedBy and ModifiedOn tracked
- Verify response includes updated data

**Document Upload End-to-End:**
- Upload document with valid file
- Verify file uploaded to Azure Blob Storage
- Verify UserDocument record created with filename
- Verify document appears in GetUserDocumentList
- Download document using SAS URL
- Verify file content matches uploaded file

**Employee Search and Filter:**
- Search employees by name
- Search employees by email
- Filter by department
- Filter by joining date range
- Test pagination
- Verify result counts and data correctness

**Employee Archive and Unarchive:**
- Archive active employee
- Verify IsDeleted flag set
- Verify employee not in active list
- Unarchive employee
- Verify employee back in active list

### Performance Tests:

**Employee List with Large Dataset:**
- Load employee list with 10,000 employees
- Apply various filters
- Measure query execution time (target: < 2 seconds)
- Test pagination performance

**Document Upload:**
- Upload multiple documents simultaneously
- Measure upload time for 5 MB file (target: < 10 seconds)
- Test concurrent uploads by multiple users

**Employee Search:**
- Type-ahead search with 10,000 employees
- Measure response time (target: < 500ms)

### Security Tests:

**Permission Validation:**
- Attempt to view another employee's bank details without permission (expect 403)
- Attempt to archive employee without Employees.Delete permission (expect 403)
- Attempt to upload document for another employee without permission (expect 403)

**Data Isolation:**
- Verify employee can only view own profile by default
- Verify manager can view only own team members
- Verify HR can view all employees
- Verify archived employees not visible to non-HR users

**File Upload Security:**
- Attempt to upload malicious file (.exe with .jpg extension)
- Verify server-side MIME type validation
- Attempt to upload oversized file
- Verify file size validation

**SQL Injection:**
- Test employee search with SQL injection patterns
- Verify parameterized queries prevent injection

---

**Module Dependencies:**
- **Depends On:** Authentication & Authorization module (for user creation and permission checks)
- **Used By:** All modules (Leave, Attendance, Exit, Asset, Grievance, KPI, Projects, Dashboard, Reports)

**Critical Success Factors:**
- Accurate employee master data maintained
- Complete profile information for all employees
- Document expiry tracking for compliance
- Integration with Time Doctor for attendance
- Seamless onboarding experience
- Data security and privacy maintained
- Audit trail for all changes

**Known Limitations:**
- No change history tracking visible (ModifiedBy/ModifiedOn captured but history not retained)
- No approval workflow for sensitive field updates (bank details, contact info)
- Profile picture size optimization not visible (may need resizing for performance)
- No bulk employee upload feature visible (one-by-one creation only)
- Country/State/City master data may be incomplete or outdated
- No employee data merge functionality for duplicate entries
