# Module 04: Exit Management - Part 4
# Error Handling, Integration & Testing

---

## Error Handling & Edge Cases

### Resignation Submission Errors

**Error 1: Active Resignation Already Exists**
- **Scenario:** Employee attempts to submit resignation when one already exists with Status = Pending or Accepted
- **Detection:** IsResignationExist API returns true before form render
- **Backend Validation:** AddResignation checks for existing active resignation
- **Error Response:** 409 Conflict status code
- **Message:** "You already have an active resignation request. Cannot submit new resignation."
- **Frontend Handling:**
  - Form not rendered
  - Error message displayed with link to existing resignation: "View your existing resignation"
  - User redirected to resignation details page
- **Resolution:** Employee must wait for current resignation to be completed, cancelled, or revoked

**Error 2: Invalid Employee Status**
- **Scenario:** Exited or inactive employee attempts to submit resignation
- **Detection:** Backend checks EmploymentDetail.EmployeeStatus during AddResignation
- **Error Response:** 400 Bad Request
- **Message:** "Only active employees can submit resignation"
- **Frontend Handling:** Error toast notification, form remains accessible but submit blocked
- **Resolution:** Contact HR if employee status incorrect

**Error 3: Missing Employee Data**
- **Scenario:** Employee record incomplete (no department, no reporting manager)
- **Detection:** GetResignationForm API returns null for required fields
- **Error Response:** 200 OK but result contains nulls
- **Message:** "Your employee profile is incomplete. Please contact HR to update department and reporting manager."
- **Frontend Handling:** Form shows error panel instead of form fields
- **Resolution:** HR must complete employee profile in Employee Management module

**Error 4: Invalid Resignation Reason**
- **Scenario:** Employee submits empty reason or exceeds 500 characters
- **Detection:** Frontend Yup validation before API call
- **Error Message:** "Resignation reason is required" or "Maximum 500 characters allowed"
- **Frontend Handling:** Field error shown below text area with red border
- **Resolution:** Employee must provide valid reason text

**Error 5: Notice Period Calculation Failure**
- **Scenario:** JobTypeOptions not configured in appsettings or invalid JobType enum
- **Detection:** Backend during LastWorkingDay calculation
- **Error Response:** 500 Internal Server Error
- **Message:** "Failed to calculate notice period. Please contact administrator."
- **Logging:** Error logged with JobType value and configuration issue
- **Resolution:** Admin must configure JobTypeOptions in appsettings.json

---

### Approval/Rejection Errors

**Error 6: Resignation Not Found**
- **Scenario:** HR attempts to approve/reject non-existent resignation ID
- **Detection:** GetResignationByIdAsync returns null
- **Error Response:** 404 Not Found
- **Message:** "Resignation not found"
- **Frontend Handling:** Error toast, user redirected to list page
- **Resolution:** Resignation may have been deleted or ID incorrect

**Error 7: Invalid Status Transition**
- **Scenario:** HR attempts to accept resignation already in Accepted/Cancelled/Completed status
- **Detection:** Backend checks current ResignationStatus before update
- **Error Response:** 409 Conflict
- **Message:** "Resignation has already been processed. Current status: [Status]"
- **Frontend Handling:** Error toast, page refreshes to show current status
- **Resolution:** No action needed, resignation already processed

**Error 8: Employee Status Update Failure**
- **Scenario:** AcceptResignation succeeds but EmployeeStatus update fails
- **Detection:** EmploymentDetail update query fails (record not found or DB error)
- **Error Response:** 500 Internal Server Error
- **Message:** "Resignation accepted but employee status update failed"
- **Logging:** Critical error logged with EmployeeId and resignation ID
- **Frontend Handling:** Partial success message with warning
- **Resolution:** Admin must manually update EmployeeStatus or retry from backend

**Error 9: Missing Rejection Reason**
- **Scenario:** HR submits rejection without providing reason
- **Detection:** Frontend validation before API call, backend also validates
- **Error Response:** 400 Bad Request
- **Message:** "Rejection reason is required"
- **Frontend Handling:** Field error shown in dialog form
- **Resolution:** HR must provide rejection reason

**Error 10: Email Notification Failure**
- **Scenario:** Resignation approved but email notification fails (SMTP error)
- **Detection:** EmailNotificationService throws exception
- **Error Handling:** Exception caught, logged, but approval continues (fire-and-forget)
- **Logging:** Warning level log with email failure details
- **Message:** "Resignation approved successfully (email notification pending)"
- **Impact:** Approval saved, but employee/manager not notified via email
- **Resolution:** Admin reviews logs, manually sends notification if critical

---

### Early Release Errors

**Error 11: Early Release Date Validation**
- **Scenario:** Employee requests early release date >= current LastWorkingDay or < today
- **Detection:** Frontend validation before API call
- **Error Message:** "Early release date must be between today and current last working day"
- **Frontend Handling:** Date picker shows validation error
- **Resolution:** Employee selects valid date range

**Error 12: Early Release Already Requested**
- **Scenario:** Employee attempts to request early release when one already exists
- **Detection:** Resignation.EarlyReleaseStatus != null/pending
- **Error Response:** 409 Conflict
- **Message:** "Early release request already exists. Current status: [Status]"
- **Frontend Handling:** Button hidden or disabled, current request shown
- **Resolution:** Employee must wait for HR response on existing request

**Error 13: Early Release on Pending Resignation**
- **Scenario:** Employee attempts early release before resignation accepted
- **Detection:** Frontend checks ResignationStatus = Accepted before showing button
- **Error Message:** "Early release can only be requested after resignation acceptance"
- **Frontend Handling:** Button not displayed
- **Resolution:** Wait for resignation approval first

---

### Clearance Submission Errors

**Error 14: HR Clearance Validation Errors**
- **Invalid Advance Amount:** Amount < 0
  - Message: "Advance bonus recovery amount cannot be negative"
- **Buyout Days Exceeds EL:** NumberOfBuyOutDays > CurrentEL
  - Message: "Number of buyout days cannot exceed current EL balance"
- **Exit Interview Incomplete:** ExitInterviewStatus = true but ExitInterviewDetails empty
  - Message: "Exit interview details required when status is completed"
- **Frontend Handling:** Field-level errors with red border and message
- **Backend Handling:** Validation in service layer before save

**Error 15: Department Clearance Validation Errors**
- **KT Not Completed:** KT Status != Completed
  - Message: "Department clearance can only be submitted when KT status is Completed"
- **Missing KT Notes:** KT Notes empty or < 50 characters
  - Message: "Please provide detailed KT notes (minimum 50 characters)"
- **No KT Users:** KT Users empty string
  - Message: "At least one KT user must be selected"
- **Frontend Handling:** Submit button disabled until validations pass
- **Backend Handling:** Returns 400 Bad Request with validation errors

**Error 16: IT Clearance Validation Errors**
- **Access Not Revoked:** AccessRevoked = false
  - Message: "All system accesses must be revoked before submitting IT clearance"
- **Assets Not Returned:** AssetReturned = false
  - Message: "All assets must be returned before submitting IT clearance"
- **Missing Asset Condition:** AssetCondition null when AssetReturned = true
  - Message: "Asset condition is required"
- **Certification Not Checked:** ITClearanceCertification = false
  - Message: "IT clearance certification is required"
- **Frontend Handling:** Form validation prevents submission
- **Backend Handling:** Returns 400 Bad Request

**Error 17: Accounts Clearance Validation Errors**
- **FnF Not Completed:** FnFStatus = false/Pending
  - Message: "FnF statement must be completed before submission"
- **Missing FnF Amount:** FnFAmount null or 0
  - Message: "FnF amount is required"
- **Unreasonable Amount:** FnFAmount > (MonthlySalary × 10)
  - Message: "FnF amount seems unreasonably high. Please verify calculation."
- **No Due Certificate Not Issued:** IssueNoDueCertificate = false
  - Message: "No-due certificate must be issued"
- **Missing Attachment:** AccountAttachment null/empty
  - Message: "FnF statement attachment is required"
- **Frontend Handling:** Field validations with error messages
- **Backend Handling:** Returns 400 Bad Request with specific field errors

**Error 18: Clearance Permission Errors**
- **Scenario:** User without appropriate role attempts to submit clearance
- **Detection:** Backend permission check before save
- **Error Response:** 403 Forbidden
- **Message:** "You do not have permission to submit this clearance"
- **Frontend Handling:** Error toast, user redirected
- **Resolution:** Correct user (HR/IT/Accounts/Manager) must submit

**Error 19: Resignation Not Accepted**
- **Scenario:** User attempts to submit clearance when resignation Status != Accepted
- **Detection:** Backend checks ResignationStatus before allowing clearance submission
- **Error Response:** 409 Conflict
- **Message:** "Clearances can only be submitted for accepted resignations"
- **Frontend Handling:** Clearance tabs hidden or disabled
- **Resolution:** Wait for resignation acceptance

---

### File Upload Errors

**Error 20: File Size Exceeded**
- **Scenario:** User uploads file > 5 MB (10 MB for department clearance)
- **Detection:** Frontend file validation before upload
- **Error Message:** "File size exceeds maximum limit (5 MB)"
- **Frontend Handling:** Upload component shows error, file not sent to API
- **Resolution:** User must compress file or upload smaller file

**Error 21: Invalid File Type**
- **Scenario:** User uploads unsupported file format (e.g., .exe, .zip for non-department clearance)
- **Detection:** Frontend file type validation
- **Error Message:** "Only PDF, DOC, DOCX, JPG, PNG files are allowed"
- **Frontend Handling:** File rejected, error shown in upload component
- **Resolution:** Convert file to supported format

**Error 22: Blob Storage Upload Failure**
- **Scenario:** File passes validation but Azure Blob upload fails (network, auth, storage full)
- **Detection:** BlobStorageClient throws exception during upload
- **Error Response:** 500 Internal Server Error
- **Message:** "File upload failed. Please try again."
- **Logging:** Error logged with blob container name and exception details
- **Frontend Handling:** Upload component shows error state, retry option
- **Resolution:** User retries upload, or admin checks Azure storage status

**Error 23: Missing Attachment URL**
- **Scenario:** Clearance submitted with attachment field but blob URL null (upload incomplete)
- **Detection:** Backend validation before save
- **Error Response:** 400 Bad Request
- **Message:** "Attachment upload incomplete. Please try again."
- **Frontend Handling:** Form submission blocked, upload component shows error
- **Resolution:** User re-uploads file and submits again

---

### Data Consistency Errors

**Error 24: Clearance Already Exists**
- **Scenario:** Clearance record already exists for resignation (unique constraint on ResignationId)
- **Detection:** Upsert operation checks for existing record
- **Behavior:** System performs UPDATE instead of INSERT (upsert logic)
- **No Error:** This is expected behavior, not an error
- **Frontend Impact:** Form pre-filled with existing data on load

**Error 25: Asset Allocation Mismatch**
- **Scenario:** IT marks AssetReturned = Yes but Asset Management shows pending assets
- **Detection:** Frontend query to Asset Management before IT clearance submission
- **Warning Message:** "Warning: Asset Management shows X pending assets. Please verify."
- **Frontend Handling:** Warning toast but submission allowed (admin override)
- **Backend Handling:** IT clearance updates asset statuses to "Returned"
- **Resolution:** IT verifies discrepancy or updates Asset Management first

**Error 26: Leave Balance Sync Issue**
- **Scenario:** HR clearance CurrentEL doesn't match Leave Management balance
- **Detection:** Manual review by HR during clearance
- **Warning:** No automated warning (potential enhancement)
- **Frontend Handling:** HR manually adjusts CurrentEL field if needed
- **Resolution:** HR verifies leave balance with Leave Management module

**Error 27: Employee No Longer Exists**
- **Scenario:** Employee record deleted while resignation in process (rare, bad practice)
- **Detection:** Foreign key constraint violations or null returns from employee queries
- **Error Response:** 500 Internal Server Error or 404 Not Found
- **Message:** "Employee record not found. Please contact administrator."
- **Logging:** Critical error logged
- **Resolution:** Admin must restore employee record or mark resignation as invalid

---

### Auto-Completion Errors

**Error 28: Completion Criteria Not Met**
- **Scenario:** System attempts auto-completion but one clearance missing
- **Detection:** Completion check queries all four clearance tables
- **Behavior:** Status remains "Accepted", completion does not occur
- **No Error Message:** Silent failure (expected behavior)
- **Frontend Impact:** Status doesn't change until all clearances complete

**Error 29: Last Working Day Not Reached**
- **Scenario:** All clearances complete but CurrentDate < LastWorkingDay
- **Detection:** Date comparison in completion check
- **Behavior:** Status remains "Accepted", waits for last working day
- **No Error:** Expected behavior, completion deferred
- **Frontend Impact:** Status shows "Accepted" with all clearances ✓ but not "Completed"

**Error 30: Employee Status Update Conflict**
- **Scenario:** Auto-completion updates ResignationStatus but EmployeeStatus update fails
- **Detection:** Transaction rollback or partial update
- **Error Handling:** System logs error, retries status update
- **Logging:** Critical error with resignation ID
- **Resolution:** Admin manually updates EmployeeStatus or triggers retry

---

## Integration Points

### Integration 1: Employee Management Module
- **Data Retrieved:**
  - Employee master data: EmployeeId, EmployeeCode, FirstName, LastName
  - Employment details: DepartmentId, ReportingManagerId, DesignationId, JobType, EmployeeStatus
  - Profile photo URL for display in resignation detail page
- **Data Updated:**
  - EmployeeStatus changed from Active (1) to Resigned (2) when resignation accepted
  - EmployeeStatus changed from Resigned to Exited (4) when exit process completed
  - Exited status disables employee login and system access
- **APIs Used:**
  - GetEmployeeDetailsForResignationAsync: Retrieves employee data for form pre-population
  - EmploymentDetail table updated directly via SQL
- **Dependency:**
  - Resignation cannot be submitted if employee record incomplete (no department/manager)
  - Employee profile completeness checked before resignation form access

### Integration 2: Leave Management Module
- **Data Retrieved:**
  - Current leave balances: EL (Earned Leave), CL (Casual Leave), SL (Sick Leave)
  - EL balance pre-filled in HR clearance form CurrentEL field
  - Accrued leave days used for FnF leave encashment calculation
- **Data Updated:**
  - Leave accrual stopped when EmployeeStatus = Resigned
  - Leave balance frozen at resignation acceptance date
  - Unused leave converted to cash in FnF settlement
- **APIs Used:**
  - GetLeaveBalanceByEmployeeId (external call from HR clearance form)
  - Leave balance displayed in HR clearance for reference
- **Calculation:**
  - Leave encashment = (CurrentEL or NumberOfBuyOutDays, whichever lower) × DailyRate
  - DailyRate = MonthlySalary / 30
  - Buyout days capped per company policy (typically max 30 days)

### Integration 3: Asset Management Module
- **Data Retrieved:**
  - All assets allocated to resigning employee: AssetType, AssetName, SerialNumber, AllocationDate
  - Asset allocation status: Allocated/Returned/Damaged/Lost
  - Outstanding assets count shown in IT clearance form
- **Data Updated:**
  - AssetAllocation.Status updated to "Returned" when IT clearance submitted
  - AssetAllocation.ReturnDate = IT clearance submission date
  - AssetAllocation.ReturnCondition = AssetCondition from IT clearance form
  - Asset availability updated for reallocation to other employees
- **APIs Used:**
  - GetAssetsByEmployeeId: Lists all allocated assets
  - UpdateAssetStatus: Marks assets as returned (called by IT clearance submission)
- **Validation:**
  - IT clearance cannot be submitted if pending assets exist (soft validation, warning shown)
  - Asset return logged in Asset Management before IT clearance submission (best practice)
- **Condition Tracking:**
  - Good condition: Asset ready for reallocation
  - Fair condition: Asset usable, minor wear noted
  - Damaged: Asset needs repair, cost deducted from FnF
  - Lost: Asset value deducted from FnF

### Integration 4: Authentication & Authorization
- **Permissions:**
  - CreatePersonalDetails: Required to submit resignation
  - ViewPersonalDetails: Required to view own resignation details
  - EditPersonalDetails: Required for employee to revoke resignation
  - HR Role: Required to approve/reject resignations, submit HR clearance
  - Manager Role: Required to approve team member resignations, submit department clearance
  - IT Role: Required to submit IT clearance
  - Accounts Role: Required to submit accounts clearance
- **Token Validation:**
  - JWT token validated on all API calls
  - UserEmailId extracted from token for CreatedBy/ModifiedBy audit fields
  - Token expiry (24 hours) checked, refresh token used if expired
- **Access Control:**
  - Employee can only view/revoke own resignation
  - Manager can approve resignations of direct reports only (checked via ReportingManagerId)
  - HR/Admin can view/manage all resignations
  - Clearance forms restricted by role
- **Post-Exit Access:**
  - Exited employees cannot login (EmployeeStatus check in authentication)
  - Exited employee tokens invalidated on next refresh attempt

### Integration 5: Email Notification Service
- **SMTP Configuration:**
  - Office 365 SMTP server configured in appsettings
  - From email: noreply@company.com or hr@company.com
  - Credentials stored securely in appsettings or Azure Key Vault
- **Email Templates:**
  - Templates stored in NotificationTemplate table
  - Placeholders: {EmployeeName}, {ResignationDate}, {LastWorkingDay}, {Reason}, {RejectionReason}
  - Templates editable via admin panel (separate feature)
- **Notification Events:**
  - Resignation submitted → Manager, HR
  - Resignation approved → Employee, HR
  - Resignation rejected → Employee
  - Resignation revoked → Manager, HR
  - Early release requested → Manager, HR
  - Early release approved → Employee
  - Early release rejected → Employee
  - Clearance completed (each type) → HR, Employee
  - Exit completed → Employee, HR
  - Clearance reminder → Respective team (HR/IT/Accounts/Manager)
- **Methods:**
  - ResignationSubmitted(employeeId)
  - AddResignationApprovedEmailAsync(resignationId)
  - ResignationRejected(resignationId)
  - EarlyReleaseRequested(resignationId)
  - EarlyReleaseApproved(resignationId, isApproved)
- **Failure Handling:**
  - Email failures logged but don't block resignation workflow
  - Fire-and-forget pattern: async, no wait for email send
  - Retry mechanism for transient failures (3 retries)

### Integration 6: Azure Blob Storage
- **Container:**
  - ExitDocumentsContainer: Stores all exit-related documents
  - Separate containers possible: HRClearanceContainer, ITClearanceContainer, etc.
- **Upload Process:**
  - Frontend converts file to base64 or FormData
  - API receives file, uploads to blob storage via BlobStorageClient
  - BlobStorageClient.UploadFileAsync returns blob URL
  - Blob URL stored in clearance table Attachment field
- **Access Control:**
  - Blob SAS token generated for secure download
  - Expiry time: 1 hour for download links
  - Public access disabled, authenticated users only
- **File Metadata:**
  - Original filename stored separately (FileOriginalName field)
  - Content type preserved (application/pdf, image/jpeg, etc.)
  - Upload timestamp tracked via CreatedOn
- **Download:**
  - "View Document" button generates temporary download link
  - Opens in new tab for preview (PDF) or triggers download (DOC)

### Integration 7: Dashboard & Reports Module
- **Dashboard Widgets:**
  - Pending Resignations Count: Count of resignations with Status = Pending
  - Accepted Resignations Count: Status = Accepted
  - Employees Exiting This Month: LastWorkingDay in current month
  - Pending Clearances Count: Accepted resignations with incomplete clearances
  - Clearances by Type: Chart showing HR/Dept/IT/Accounts clearance completion rates
- **Reports:**
  - Monthly Exit Report: All resignations by month with exit reasons
  - Department-wise Attrition: Resignations grouped by department
  - Average Exit Duration: Time from submission to completion
  - Exit Interview Insights: Common themes from exit interviews
  - FnF Settlement Report: Total FnF amounts paid by period
- **Data Queries:**
  - Dashboard queries Resignation table with status filters
  - Real-time counts updated on resignation status changes
  - Reports pull from Resignation, Clearance tables with JOINs

### Integration 8: Notification Module
- **In-App Notifications:**
  - Employee receives notification: "Your resignation has been approved"
  - Manager receives notification: "[Employee Name] has submitted resignation"
  - HR receives notification: "IT clearance completed for [Employee Name]"
- **Notification Bell:**
  - Badge count shows unread notifications
  - Click opens notification panel with list
  - Clicking notification navigates to resignation detail page
- **Notification Storage:**
  - Notifications table stores in-app notifications
  - Linked to ResignationId for context
  - Read/unread status tracked

### Integration 9: Payroll Module (External)
- **FnF Payment Data:**
  - After accounts clearance, FnF amount exported to payroll system
  - Export format: CSV or API integration
  - Data: EmployeeId, EmployeeCode, FnFAmount, BankAccountNumber, PaymentDate
- **Payment Processing:**
  - Payroll system processes FnF payment
  - Payment confirmation fed back to HRMS (manual or automated)
  - Payment status updated in accounts tracking (external to HRMS)
- **Tax Calculation:**
  - Leave encashment TDS calculated in payroll
  - Gratuity TDS calculated if applicable
  - Form 16 part generated post-payment

---

## Testing Scenarios

### Unit Testing

**Test 1: Notice Period Calculation - Probation**
- **Input:** ResignationDate = 2025-10-01, JobType = Probation (1)
- **Expected:** LastWorkingDay = 2025-10-16 (15 days added)
- **Method:** ExitEmployeeService.AddResignation
- **Assertion:** Assert.AreEqual(expectedDate, resignation.LastWorkingDay)

**Test 2: Notice Period Calculation - Confirmed**
- **Input:** ResignationDate = 2025-10-01, JobType = Confirmed (2)
- **Expected:** LastWorkingDay = 2025-12-01 (2 months added)
- **Method:** ExitEmployeeService.AddResignation
- **Assertion:** Assert.AreEqual(expectedDate, resignation.LastWorkingDay)

**Test 3: Active Resignation Check**
- **Setup:** Create resignation with Status = Pending for EmployeeId = 1025
- **Input:** AddResignation called with EmployeeId = 1025
- **Expected:** 409 Conflict response
- **Assertion:** Assert.ThrowsAsync<ConflictException>

**Test 4: Resignation Status Update**
- **Setup:** Create resignation with Status = Pending
- **Input:** AdminAcceptResignation(resignationId)
- **Expected:** ResignationStatus = Accepted, EmployeeStatus = Resigned
- **Assertion:** Assert.AreEqual(ResignationStatus.Accepted, resignation.ResignationStatus)

**Test 5: HR Clearance Validation - Buyout Days**
- **Input:** CurrentEL = 10, NumberOfBuyOutDays = 15
- **Expected:** Validation error
- **Method:** HRClearanceValidator.Validate
- **Assertion:** Assert.False(validationResult.IsValid)

**Test 6: IT Clearance - Asset Status Update**
- **Setup:** Asset allocated to EmployeeId = 1025
- **Input:** IT clearance submitted with AssetReturned = true
- **Expected:** AssetAllocation.Status = "Returned"
- **Assertion:** Assert.AreEqual("Returned", assetStatus)

---

### Integration Testing

**Test 7: Complete Resignation Flow**
- **Steps:**
  1. Employee submits resignation (AddResignation API)
  2. Verify resignation created with Status = Pending
  3. HR accepts resignation (AcceptResignation API)
  4. Verify ResignationStatus = Accepted, EmployeeStatus = Resigned
  5. HR submits HR clearance (UpsertHRClearance API)
  6. Manager submits department clearance (UpsertDepartmentClearance API)
  7. IT submits IT clearance (AddUpdateITClearance API)
  8. Accounts submits accounts clearance (AddUpdateAccountClearance API)
  9. Verify all clearances exist in respective tables
  10. Advance date to LastWorkingDay + 1
  11. Verify ResignationStatus = Completed, EmployeeStatus = Exited
- **Expected:** End-to-end flow completes successfully

**Test 8: Early Release Approval**
- **Steps:**
  1. Submit resignation, get acceptance
  2. Employee requests early release (RequestEarlyRelease API)
  3. Verify EarlyReleaseStatus = Pending
  4. HR accepts early release (AcceptEarlyRelease API)
  5. Verify EarlyReleaseStatus = Accepted, LastWorkingDay updated
- **Expected:** Last working day changes to early release date

**Test 9: Resignation Rejection**
- **Steps:**
  1. Submit resignation
  2. HR rejects resignation with reason (AdminRejection API)
  3. Verify ResignationStatus = Cancelled, rejection reason stored
  4. Verify employee can submit new resignation
- **Expected:** Resignation rejected, employee status unchanged

**Test 10: Clearance Order Independence**
- **Steps:**
  1. Accept resignation
  2. Submit clearances in reverse order: Accounts → IT → Dept → HR
  3. Verify all clearances accepted
  4. Verify completion triggered only after all four done
- **Expected:** Order doesn't matter, completion still works

---

### UI Testing

**Test 11: Resignation Form Pre-population**
- **Steps:**
  1. Navigate to resignation form
  2. Verify employee name, department, manager pre-filled
  3. Verify fields read-only
  4. Verify reason field editable
- **Expected:** Form correctly pre-populated from API

**Test 12: Clearance Tab Visibility**
- **Steps:**
  1. Open resignation detail with Status = Pending
  2. Verify clearance tabs hidden or disabled
  3. Accept resignation
  4. Verify clearance tabs now visible and clickable
- **Expected:** Tabs visible only after acceptance

**Test 13: Clearance Completion Indicators**
- **Steps:**
  1. Open resignation detail with accepted status
  2. Verify all clearance tabs show "Pending" (orange)
  3. Submit HR clearance
  4. Verify HR tab shows "Completed" (green)
  5. Submit remaining clearances
  6. Verify all tabs show "Completed"
- **Expected:** Completion indicators update correctly

**Test 14: File Upload Validation**
- **Steps:**
  1. Open HR clearance form
  2. Attempt upload of 10 MB file
  3. Verify error: "File size exceeds limit"
  4. Attempt upload of .exe file
  5. Verify error: "Invalid file type"
  6. Upload valid PDF < 5 MB
  7. Verify upload success, "View Document" button appears
- **Expected:** File validations work correctly

---

### Performance Testing

**Test 15: Resignation List Load Time**
- **Setup:** 1000+ resignation records in database
- **Action:** Load resignation list page with filters
- **Expected:** Page load < 2 seconds
- **Metric:** API response time < 500ms for paginated data

**Test 16: Concurrent Clearance Submissions**
- **Setup:** 4 users submit different clearances for same resignation simultaneously
- **Action:** HR, Manager, IT, Accounts all click Submit within 1 second
- **Expected:** All clearances saved successfully, no conflicts
- **Metric:** No deadlocks, all 4 transactions commit

**Test 17: Email Notification Volume**
- **Setup:** 50 resignations approved simultaneously (bulk action)
- **Action:** System sends approval emails to 50 employees + managers + HR
- **Expected:** All emails queued and sent within 5 minutes
- **Metric:** SMTP queue doesn't overflow, no email failures

---

### Security Testing

**Test 18: Authorization Check - Clearance Access**
- **Setup:** Employee without HR role attempts to access HR clearance form
- **Action:** Call UpsertHRClearance API with employee token
- **Expected:** 403 Forbidden response
- **Assertion:** Permission check enforced

**Test 19: Authorization Check - View Other Employee Resignation**
- **Setup:** Employee A attempts to view Employee B's resignation details
- **Action:** Call GetResignationDetails with Employee B's ID and Employee A's token
- **Expected:** 403 Forbidden or data filtered
- **Assertion:** Employee can only view own resignation

**Test 20: SQL Injection Prevention**
- **Setup:** Malicious input in resignation reason field
- **Action:** Submit resignation with reason containing SQL: "'; DROP TABLE Resignation;--"
- **Expected:** Resignation saved with literal text, no SQL execution
- **Assertion:** Parameterized queries prevent injection

---

## Dependencies

### Backend Dependencies
- **.NET 8 SDK:** Core framework
- **Dapper:** Micro-ORM for database queries
- **Microsoft.Data.SqlClient:** SQL Server connectivity
- **AutoMapper:** DTO mapping between layers
- **FluentValidation:** Input validation (if implemented)
- **Azure.Storage.Blobs:** Azure Blob Storage client
- **Microsoft.Extensions.Configuration:** Configuration management
- **System.Net.Mail / MailKit:** Email sending

### Frontend Dependencies
- **React 18.3.1:** UI framework
- **TypeScript:** Type safety
- **Material-UI v6.5.0:** UI components
- **React Hook Form:** Form handling
- **Yup:** Validation schema
- **Axios:** HTTP client
- **SWR:** Data fetching and caching
- **Zustand:** State management (user store)
- **React Router:** Navigation
- **Moment.js:** Date manipulation
- **React Toastify:** Toast notifications

### External Services
- **Azure Blob Storage:** Document storage
- **Office 365 SMTP:** Email service
- **SQL Server LocalDB:** Database (development)
- **SQL Server (Azure):** Database (production)

### Database Objects
- **Tables:** Resignation, ResignationHistory, HRClearance, DepartmentClearance, ITClearance, AccountClearance, EmployeeData, EmploymentDetail, Department, AssetAllocation, NotificationTemplate
- **Stored Procedures:** [dbo].[GetExitEmployeesListWithDetail]
- **Indexes:** IX_Resignation_EmployeeId, IX_Resignation_Status, IX_HRClearance_ResignationId, IX_DepartmentClearance_ResignationId, IX_ITClearance_ResignationId, IX_AccountClearance_ResignationId
- **Constraints:** 
  - FK_Resignation_EmployeeId (Foreign Key)
  - FK_Resignation_DepartmentId (Foreign Key)
  - FK_Resignation_ReportingManagerId (Foreign Key)
  - UK_HRClearance_ResignationId (Unique Key)
  - UK_DepartmentClearance_ResignationId (Unique Key)
  - UK_ITClearance_ResignationId (Unique Key)
  - UK_AccountClearance_ResignationId (Unique Key)

---

## Feature Count Summary

**Part 1: Resignation & Approval (Features 1-27)**
- Resignation Submission & Tracking: 10 features
- Manager/HR Approval Workflow: 10 features
- HR Clearance Process: 7 features

**Part 2: Department, IT & Accounts Clearance (Features 28-52)**
- Department Clearance Process: 8 features
- IT Clearance Process: 9 features
- Accounts Clearance Process: 8 features

**Part 3: Coordination & APIs (Features 53-58)**
- Clearance Coordination & Completion: 6 features
- 20 API Endpoints
- 9 UI Components/Screens
- 3 Major Workflows

**Part 4: Error Handling & Integration**
- 30 Error Scenarios Documented
- 9 Integration Points
- 20 Test Scenarios
- Complete Dependency List

**Total Features: 58 features across Exit Management module**

---

## Limitations & Known Issues

**Limitation 1: Single Resignation Per Employee**
- System allows only one active resignation at a time
- If resignation rejected/revoked, employee must wait for status change before resubmitting
- No queue of multiple resignations

**Limitation 2: No Partial Clearance Save**
- Clearance forms must be fully completed before submission
- No "Save Draft" functionality for partially filled clearances
- Workaround: Use browser back button, form data retained in session

**Limitation 3: No Clearance Dependency Enforcement**
- System doesn't enforce clearance order (e.g., HR before Accounts)
- All clearances independent, can be submitted in any sequence
- Recommendation documented but not enforced

**Limitation 4: No Relieving Letter Generation**
- Module tracks exit process but doesn't generate relieving letter document
- HR must manually create relieving letter (external to HRMS)
- Potential enhancement: Template-based document generation

**Limitation 5: No Exit Interview Form Template**
- Exit interview details entered as free text
- No structured questionnaire or rating fields
- Potential enhancement: Customizable exit interview form with analytics

**Limitation 6: No Bulk Actions**
- HR cannot bulk approve multiple resignations
- HR cannot bulk send clearance reminders
- Each resignation must be processed individually

**Limitation 7: No Clearance Delegation**
- Clearance submitter is the logged-in user
- No ability to delegate clearance to another team member
- If HR person on leave, another HR must login to submit

**Limitation 8: Limited FnF Calculation**
- FnF amount manually entered by Accounts team
- No automated calculation engine within HRMS
- Integration with Payroll module manual (CSV export)

**Limitation 9: No Rehire Tracking**
- If exited employee rehired, new employee record created
- No link between original and rehire records
- Exit interview rehire eligibility not tracked systematically

**Limitation 10: No Exit Analytics Dashboard**
- Basic resignation list and count widgets available
- No advanced analytics: attrition trends, exit reason analysis, department comparison
- Reporting limited, requires external BI tools

---

## End of Module 04 Documentation

**Module 04: Exit Management - Complete**

This comprehensive documentation covers all aspects of the Exit Management module across 4 parts:
- **Part 1:** Resignation submission, approval workflow, HR clearance (27 features)
- **Part 2:** Department, IT, and Accounts clearance processes (25 features)
- **Part 3:** APIs, UI components, workflows (6 features + technical details)
- **Part 4:** Error handling, integration, testing, dependencies (30 errors + 9 integrations)

**Total:** 58 features fully documented with no code, ready for rebuild in new tech stack.
