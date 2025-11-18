# Module 04: Exit Management - Part 1
# Features Overview & Resignation Process

---

## Module Overview

The Exit Management module handles the complete employee resignation and exit process from submission through final settlement. It implements a multi-stage clearance workflow involving HR, Department/Manager, IT, and Accounts teams. The module tracks resignation status, manages notice periods based on job type, handles early release requests, coordinates clearance activities across departments, and maintains a complete audit trail of all exit-related actions.

**Key Capabilities:**
- Employee-initiated resignation submission with reason
- Automated notice period calculation based on job type (Probation/Training/Confirmed)
- Manager/HR resignation approval workflow
- Early release request and approval mechanism
- Resignation revocation (before acceptance)
- Multi-department clearance process (HR, Department, IT, Accounts)
- Exit interview tracking and documentation
- Knowledge Transfer (KT) management
- Asset return verification (linked to Asset Management module)
- Full and Final (FnF) settlement calculation
- Document uploads for each clearance stage
- Email notifications at each workflow stage
- Complete resignation history audit trail
- Last working day management

**Business Rules:**
- Notice period varies by JobType: Probation (15 days), Training (15 days), Confirmed (2 months)
- Employee can revoke resignation only before HR/Manager acceptance
- Early release requires HR approval and updates last working day
- All four clearances (HR, Department, IT, Accounts) must complete before final settlement
- Employment status changes: Active → Resigned (on acceptance) → Exited (post last working day)
- Resignation status workflow: Pending → Accepted/Cancelled/Revoked → Completed
- Only active employees can submit resignation
- Employees with pending resignation cannot submit new resignation

---

## Features List

### Resignation Submission & Tracking (Features 1-10)

**Feature 1: Employee Resignation Submission**
- Employee accesses resignation form from their profile or dedicated resignation page
- Form pre-populates employee details: Name, Department, Reporting Manager from EmploymentDetail
- Employee enters resignation reason (required, max 500 characters)
- System validates: employee must be active (EmployeeStatus != Exited/Inactive)
- System checks no existing active resignation (Status != Pending/Accepted)
- On submit, system creates Resignation record with Status = Pending
- System calculates LastWorkingDay based on JobType and current date
- JobType Probation: LastWorkingDay = CurrentDate + 15 days
- JobType Training: LastWorkingDay = CurrentDate + 15 days  
- JobType Confirmed: LastWorkingDay = CurrentDate + 2 months
- System inserts ResignationHistory record with Status = Pending
- System sends email notification to Reporting Manager and HR
- Employee receives success confirmation with resignation ID

**Feature 2: Notice Period Calculation**
- System retrieves employee JobType from EmploymentDetail table
- Probation employees: notice period = 15 days (configured in appsettings JobTypeOptions.Probation)
- Training employees: notice period = 15 days (configured in appsettings JobTypeOptions.Training)
- Confirmed employees: notice period = 2 months (configured in appsettings JobTypeOptions.Confirmed)
- LastWorkingDay calculated using UTC date + notice period
- For Probation/Training: LastWorkingDay = ResignationDate.AddDays(noticePeriod)
- For Confirmed: LastWorkingDay = ResignationDate.AddMonths(noticePeriod)
- LastWorkingDay stored as DateOnly in Resignation table
- Notice period configurable via JobTypeOptions section in appsettings.json
- Frontend displays calculated LastWorkingDay immediately after submission
- Last working day can be adjusted later by HR/Admin via Update Last Working Day feature

**Feature 3: Resignation Status Tracking**
- System maintains ResignationStatus enum with values:
  - Pending (1): Initial status after employee submission
  - Revoked (2): Employee cancelled their own resignation before acceptance
  - Accepted (3): HR/Manager approved the resignation
  - Cancelled (4): HR/Manager rejected the resignation
  - Completed (5): All clearances done, employee exited
- Each status change creates ResignationHistory record with timestamp and user
- Status transitions enforced by business logic:
  - Pending → Accepted (via HR approval)
  - Pending → Cancelled (via HR rejection)
  - Pending → Revoked (via employee revocation, only if status = Pending)
  - Accepted → Completed (automatically when all clearances complete and past last working day)
- Status displayed with color coding in UI:
  - Pending: Orange
  - Accepted: Green
  - Cancelled: Red
  - Revoked: Gray
  - Completed: Blue
- ResignationStatus reflected in employee profile, exit list, and dashboard widgets

**Feature 4: Resignation Reason Documentation**
- Employee must provide resignation reason (mandatory field)
- Reason field: text area, max 500 characters
- Common reasons tracked for analytics: Better Opportunity, Personal Reasons, Relocation, Health Issues, Higher Education, Career Change
- Reason stored in Resignation.Reason field
- HR can view resignation reason in exit details page
- Reason displayed in resignation approval form for manager/HR review
- Resignation reason included in email notifications to approvers
- Reason text truncated in list views (first 50 chars with ellipsis)
- Full reason viewable via tooltip or modal on list page
- Reason field not editable after submission

**Feature 5: Resignation Form Pre-population**
- When employee accesses resignation form, system calls GetResignationForm API
- API retrieves employee data from EmploymentDetail, EmployeeData, Department tables
- Pre-populated fields (read-only on form):
  - Employee Name: from EmployeeData.FirstName + LastName
  - Department: from Department.DepartmentName (via DepartmentId)
  - Reporting Manager: from EmployeeData where EmployeeId = ReportingManagerId
  - Employee Code: from EmployeeData.EmployeeCode
  - Job Type: from EmploymentDetail.JobType (used for notice calculation)
- Employee only enters: Resignation Reason
- Pre-population ensures data consistency and reduces user errors
- If employee data incomplete (no department/reporting manager), form shows validation error

**Feature 6: Resignation Confirmation Dialog**
- After successful submission, system displays confirmation dialog with:
  - Resignation Date: current date in DD/MM/YYYY format
  - Calculated Last Working Day: based on notice period
  - Resignation ID/Reference number
  - Message: "Your resignation has been submitted successfully. It is now pending approval from your manager."
  - Notice period explanation: "As per your job type (Probation/Training/Confirmed), your notice period is X days/months."
- Dialog includes "Go to Exit Details" button navigating to resignation status page
- Dialog includes "Close" button returning to employee profile/dashboard
- Email confirmation also sent to employee's official email
- Confirmation page shows next steps: "Your manager will review and approve/reject your resignation"

**Feature 7: Active Resignation Check**
- Before allowing new resignation submission, system validates no active resignation exists
- API: IsResignationExist/{EmployeeId} returns existing resignation status
- If existing resignation with Status = Pending or Accepted, system prevents new submission
- Error message: "You already have an active resignation request. Cannot submit new resignation."
- If previous resignation Status = Cancelled or Revoked, employee can submit new resignation
- If previous resignation Status = Completed, employee can submit new resignation (rehire scenario)
- Frontend calls IsResignationExist API on resignation form load
- If active resignation exists, form not rendered; instead shows message with link to existing resignation details
- Check prevents duplicate resignations and maintains data integrity

**Feature 8: Resignation List View (Employee)**
- Employee can view their own resignation history from profile → Exit Details tab
- API: GetResignationDetails/{EmployeeId} retrieves resignation record
- Display includes:
  - Resignation Date
  - Last Working Day
  - Resignation Status with status badge
  - Reason (expandable)
  - Early Release Request status (if requested)
  - Early Release Date (if requested)
  - Rejection reasons (if rejected)
- If status = Pending, show "Revoke Resignation" button
- If status = Accepted and no early release requested, show "Request Early Release" button
- Timeline/stepper shows progress: Submitted → Under Review → Approved → Clearance → Completed
- Empty state message if no resignation: "You have not submitted any resignation request"

**Feature 9: Resignation Revocation by Employee**
- Employee can revoke their resignation only if Status = Pending (not yet approved)
- "Revoke Resignation" button visible on exit details page when Status = Pending
- On click, confirmation dialog: "Are you sure you want to revoke your resignation? This action cannot be undone."
- On confirmation, API: RevokeResignation/{ResignationId} called
- System updates Resignation.ResignationStatus = Revoked
- System updates Resignation.ModifiedBy = current user email
- System updates Resignation.ModifiedOn = UTC timestamp
- No ResignationHistory record created for revocation (status update only)
- System sends email notification to Reporting Manager and HR about revocation
- After revocation, employee can submit new resignation if needed
- If resignation already Accepted/Cancelled, revoke button hidden; message: "Cannot revoke resignation after approval decision"

**Feature 10: Resignation Data Model**
- **Resignation Table:** Stores core resignation information
  - Id: Primary key (int, identity)
  - EmployeeId: Foreign key to EmployeeData (bigint)
  - DepartmentId: Foreign key to Department (bigint)
  - Reason: Resignation reason text (nvarchar(max))
  - RejectResignationReason: Reason if HR rejected (nvarchar(max), nullable)
  - RejectEarlyReleaseReason: Reason if early release rejected (nvarchar(max), nullable)
  - LastWorkingDay: Calculated last working day (DateOnly)
  - ReportingManagerId: Manager who needs to approve (bigint)
  - JobType: Employee job type at resignation time (enum: Probation=1, Confirmed=2, Training=3)
  - IsActive: Active flag (bit, default 1)
  - ResignationStatus: Current status (enum: Pending=1, Revoked=2, Accepted=3, Cancelled=4, Completed=5)
  - EarlyReleaseStatus: Early release request status (enum: Pending=1, Accepted=2, Rejected=3)
  - CreatedBy: User who created (nvarchar(256))
  - CreatedOn: Creation timestamp (datetime2)
  - ModifiedBy: Last modifier (nvarchar(256), nullable)
  - ModifiedOn: Last modified timestamp (datetime2, nullable)

---

### Manager/HR Approval Workflow (Features 11-20)

**Feature 11: Resignation Approval Queue (HR/Manager View)**
- HR and Managers access "Employee Exit" page listing all resignation requests
- API: GetResignationList with pagination, sorting, filtering
- List displays for each resignation:
  - Employee Code
  - Employee Name
  - Department Name
  - Resignation Date
  - Last Working Day
  - Resignation Status (badge with color)
  - Early Release Request (Yes/No indicator)
  - Early Release Date (if applicable)
  - KT Status (Pending/In Progress/Completed badge)
  - Exit Interview Status (Completed/Not Completed badge)
  - IT No Due Status (Completed/Pending badge)
  - Accounts No Due Status (Completed/Pending badge)
  - Reporting Manager Name
  - Branch/Location
- Filters available:
  - Employee Code (text search)
  - Employee Name (text search)
  - Resignation Status (dropdown: Pending/Accepted/Cancelled/Completed)
  - Resignation Date (date range picker)
  - Last Working Day (date range picker)
  - Department (dropdown)
  - Branch (dropdown)
  - Employee Status (Active/Resigned/Exited)
  - IT No Due (Completed/Pending)
  - Accounts No Due (Completed/Pending)
- Sorting on all columns
- Pagination: 10/25/50/100 rows per page
- Click on row opens detailed resignation view

**Feature 12: Resignation Detail View (Admin)**
- HR/Admin clicks resignation row to view detailed exit information
- API: GetResignationById/{resignationId} retrieves complete details
- Page layout: Two sections - Employee Info (left) + Clearance Tabs (right)
- **Employee Information Panel:**
  - Employee Code, Name, Photo
  - Department, Designation
  - Reporting Manager
  - Resignation Date, Last Working Day
  - Job Type (Probation/Training/Confirmed)
  - Resignation Status with badge
  - Resignation Reason (expandable text)
  - Early Release Request details (if applicable)
    - Requested Date
    - Early Release Status (Pending/Accepted/Rejected)
    - Rejection Reason (if rejected)
  - Rejection Reason (if resignation rejected)
- **Action Buttons (based on status):**
  - If Status = Pending: "Accept Resignation" and "Reject Resignation" buttons
  - If Early Release Status = Pending: "Accept Early Release" and "Reject Early Release" buttons
  - "Update Last Working Day" button (available if Status = Accepted)
- **Clearance Tabs (visible if Status = Accepted):**
  - HR Clearance Tab
  - Department Clearance Tab
  - IT Clearance Tab
  - Accounts Clearance Tab
- Each tab shows completion status indicator (✓ Complete / ⏳ Pending)

**Feature 13: Accept Resignation (HR/Manager)**
- HR/Manager clicks "Accept Resignation" button on resignation detail page
- Confirmation dialog: "Are you sure you want to accept this resignation? Employee status will be changed to Resigned."
- On confirm, API: AcceptResignation/{resignationId} called
- System validates resignation exists and Status = Pending
- System updates Resignation.ResignationStatus = Accepted
- System updates EmploymentDetail.EmployeeStatus = Resigned for this employee
- System inserts ResignationHistory record:
  - ResignationId: current resignation ID
  - ResignationStatus: Accepted
  - CreatedBy: approver email
  - CreatedOn: UTC timestamp
- System sends email to employee: "Your resignation has been approved"
- Email includes: Resignation Date, Last Working Day, Next Steps (clearance process)
- System sends email to HR team: "Resignation approved for [Employee Name]"
- Success message: "Resignation accepted successfully"
- Page refreshes showing updated status and clearance tabs now visible
- "Accept" button disappears; clearance tabs become active

**Feature 14: Reject Resignation (HR/Manager)**
- HR/Manager clicks "Reject Resignation" button
- Dialog opens with form: "Rejection Reason" text area (required, max 500 chars)
- On submit, API: AdminRejection with RejectionType = "resignation"
- Request payload:
  - ResignationId: current resignation ID
  - RejectionType: "resignation"
  - RejectionReason: text from form
- System validates resignation exists and Status = Pending
- System updates Resignation.ResignationStatus = Cancelled
- System updates Resignation.RejectResignationReason = provided reason
- System inserts ResignationHistory record with Status = Cancelled
- System sends email to employee with rejection reason
- Email subject: "Resignation Request Rejected"
- Email body includes rejection reason and HR contact for discussion
- System sends email to HR team about rejection
- Success message: "Resignation rejected successfully"
- Employee can view rejection reason in their exit details page
- Employee EmployeeStatus remains Active (unchanged)
- Employee can submit new resignation if needed

**Feature 15: Early Release Request (Employee)**
- After resignation accepted, employee can request early release (shorter notice period)
- "Request Early Release" button visible on exit details page when Status = Accepted and no existing early release request
- Click opens dialog with form:
  - Current Last Working Day: displayed (read-only)
  - Requested Early Release Date: date picker (must be >= today and < current LastWorkingDay)
  - Reason: text area (optional)
- Form validation: Early release date must be before current last working day
- On submit, API: RequestEarlyRelease
- Request payload:
  - ResignationId: current resignation ID
  - EarlyReleaseDate: selected date
  - Reason: optional reason text
- System updates Resignation.EarlyReleaseDate = requested date
- System updates Resignation.EarlyReleaseStatus = Pending
- System inserts ResignationHistory record with EarlyReleaseStatus = Pending
- System sends email to HR/Manager: "Early release requested by [Employee Name]"
- Email includes current last working day, requested date, and reason
- Success message: "Early release request submitted successfully"
- Button changes to "Early Release Pending" (disabled)
- HR/Manager sees early release indicator in resignation list

**Feature 16: Accept Early Release (HR)**
- HR views resignation detail with pending early release request
- Early Release Request section shows:
  - Current Last Working Day
  - Requested Early Release Date
  - Request Reason
  - Early Release Status: Pending
- "Accept Early Release" button visible
- On click, confirmation dialog with date picker pre-filled with requested date
- HR can adjust the early release date if needed (must be between today and current LastWorkingDay)
- On confirm, API: AcceptEarlyRelease
- Request payload:
  - ResignationId: resignation ID
  - ReleaseDate: approved early release date
- System updates Resignation.EarlyReleaseStatus = Accepted
- System updates Resignation.LastWorkingDay = approved early release date
- System inserts ResignationHistory with EarlyReleaseStatus = Accepted
- System sends email to employee: "Early release request approved"
- Email includes new last working day
- Success message: "Early release approved successfully"
- Page refreshes showing updated last working day
- Early release status badge shows "Accepted" (green)

**Feature 17: Reject Early Release (HR)**
- HR clicks "Reject Early Release" button
- Dialog opens: "Rejection Reason" text area (required)
- On submit, API: AdminRejection with RejectionType = "earlyrelease"
- Request payload:
  - ResignationId: resignation ID
  - RejectionType: "earlyrelease"
  - RejectionReason: reason text
- System updates Resignation.EarlyReleaseStatus = Rejected
- System updates Resignation.RejectEarlyReleaseReason = provided reason
- System inserts ResignationHistory with EarlyReleaseStatus = Rejected
- System sends email to employee with rejection reason
- Email explains why early release cannot be approved
- Original LastWorkingDay remains unchanged
- Success message: "Early release request rejected"
- Employee can view rejection reason in exit details
- Employee cannot request early release again (one attempt only)

**Feature 18: Update Last Working Day (HR)**
- HR can adjust last working day even after resignation accepted
- "Update Last Working Day" button visible on resignation detail page (Status = Accepted)
- Click opens dialog with date picker
- Current last working day displayed (read-only)
- New last working day: date picker (must be >= resignation date)
- On submit, API: UpdateLastWorkingDay
- Request payload:
  - ResignationId: resignation ID
  - LastWorkingDay: new date
- System updates Resignation.LastWorkingDay = new date
- No resignation history record created (direct update)
- System sends email to employee about last working day change
- Email includes old and new last working days with explanation
- Success message: "Last working day updated successfully"
- Updated date reflected across all views
- Clearance timeline adjusted based on new last working day

**Feature 19: Resignation History Audit Trail**
- **ResignationHistory Table:** Tracks all status changes
  - Id: Primary key (bigint, identity)
  - ResignationId: Foreign key to Resignation (int)
  - ResignationStatus: Status at this point (enum)
  - EarlyReleaseStatus: Early release status (enum)
  - CreatedOn: Timestamp of change (datetime2)
  - CreatedBy: User who made change (nvarchar(256))
- Each approval/rejection/revocation creates history record
- System captures:
  - Resignation submitted → ResignationHistory with Status = Pending
  - Resignation accepted → ResignationHistory with Status = Accepted
  - Resignation rejected → ResignationHistory with Status = Cancelled
  - Resignation revoked → Resignation.Status updated (no history for revoke)
  - Early release requested → ResignationHistory with EarlyReleaseStatus = Pending
  - Early release accepted → ResignationHistory with EarlyReleaseStatus = Accepted
  - Early release rejected → ResignationHistory with EarlyReleaseStatus = Rejected
- History viewable in admin panel showing timeline of all changes
- Each entry shows: Date, Action, Performed By
- Immutable audit log for compliance and tracking

**Feature 20: Email Notifications for Resignation Workflow**
- System sends automated emails at each workflow stage using EmailNotificationService
- **Resignation Submitted:**
  - To: Reporting Manager, HR Team
  - Subject: "Resignation Submitted - [Employee Name]"
  - Body: Employee details, resignation date, last working day, reason
  - Includes "View Details" link to resignation page
- **Resignation Approved:**
  - To: Employee, HR Team
  - Subject: "Resignation Approved - [Employee Name]"
  - Body: Approval confirmation, last working day, clearance process steps
  - Includes list of clearances needed (HR, Department, IT, Accounts)
- **Resignation Rejected:**
  - To: Employee
  - Subject: "Resignation Request Rejected"
  - Body: Rejection reason, HR contact information
- **Resignation Revoked:**
  - To: Reporting Manager, HR Team
  - Subject: "Resignation Revoked - [Employee Name]"
  - Body: Revocation notification, employee remains active
- **Early Release Requested:**
  - To: Reporting Manager, HR Team
  - Subject: "Early Release Requested - [Employee Name]"
  - Body: Current last working day, requested date, reason
- **Early Release Approved:**
  - To: Employee
  - Subject: "Early Release Approved - [Employee Name]"
  - Body: New last working day, clearance timeline updated
- **Early Release Rejected:**
  - To: Employee
  - Subject: "Early Release Request Rejected"
  - Body: Rejection reason, original last working day retained
- All emails sent via Office 365 SMTP configured in appsettings
- Email templates stored in database (NotificationTemplate table)
- Emails sent asynchronously (fire and forget pattern)

---

### HR Clearance Process (Features 21-27)

**Feature 21: HR Clearance Form Access**
- After resignation accepted, HR Clearance tab becomes available on exit details page
- Permission required: HR role or admin role to edit HR clearance
- Tab shows "HR Clearance" with completion indicator:
  - ⏳ Pending (orange) if not submitted
  - ✓ Completed (green) if submitted
- Click tab opens HR clearance form
- If already completed, form displays in read-only mode with saved data
- "Edit" button available for HR to modify completed clearance
- API: GetHRClearanceByResignationId/{resignationId} retrieves existing clearance data

**Feature 22: HR Clearance - Advance/Bonus Recovery**
- **Field:** Advance Bonus Recovery Amount
- Type: Decimal number input (₹)
- Purpose: Track advance salary or bonus that needs recovery from FnF settlement
- Common scenarios:
  - Signing bonus with service agreement clause
  - Advance salary during emergency
  - Training cost recovery if leaving before bond period
- Field accepts positive decimal values up to 2 decimal places
- Default value: 0.00 if no recovery needed
- Amount stored in HRClearance.AdvanceBonusRecoveryAmount
- This amount deducted from final settlement calculation
- Validation: must be >= 0
- HR can add notes in Service Agreement Details field explaining recovery reason

**Feature 23: HR Clearance - Service Agreement Details**
- **Field:** Service Agreement Details
- Type: Multi-line text area (max 600 characters)
- Purpose: Document service agreement status, bond details, recovery calculations
- HR documents:
  - Service agreement type (training bond, retention agreement)
  - Bond duration and completion status
  - Penalty clauses applicable
  - Recovery amount calculation breakdown
  - Any waivers or exceptions approved
- Examples:
  - "Employee completed 18 months of 24-month training bond. Recovery amount: ₹50,000 (6 months proportional cost)"
  - "No service agreement. No recovery applicable."
  - "Signed 2-year retention agreement on promotion. Completed full term. No penalty."
- Field optional if no service agreement exists
- Text stored in HRClearance.ServiceAgreementDetails
- Viewable by accounts team for FnF calculation

**Feature 24: HR Clearance - Leave Buyout Calculation**
- **Field 1:** Current EL (Earned Leave balance)
  - Type: Decimal number (days)
  - Auto-populated from Leave Management module (current unused leave balance)
  - Editable by HR if manual adjustment needed
  - Represents total accrued leave days employee hasn't taken
- **Field 2:** Number of Buyout Days
  - Type: Integer
  - HR specifies how many leave days will be paid in FnF settlement
  - Typically equals Current EL unless company policy limits buyout days
  - Common scenarios:
    - Full buyout: Number of Buyout Days = Current EL
    - Partial buyout: Company policy may cap at 30 days max
    - Pro-rata buyout: Based on notice period served
- Buyout amount calculation: (NumberOfBuyoutDays × DailyRate)
- DailyRate typically = MonthlySalary / 30
- Actual amount calculation happens in Accounts clearance
- Values stored in HRClearance.CurrentEL and HRClearance.NumberOfBuyOutDays
- Validation: NumberOfBuyOutDays <= CurrentEL

**Feature 25: HR Clearance - Exit Interview**
- **Field 1:** Exit Interview Status
  - Type: Boolean dropdown (Yes/No or Completed/Not Completed)
  - Indicates whether exit interview conducted
  - Default: false (not completed)
  - HR marks true after conducting exit interview
- **Field 2:** Exit Interview Details
  - Type: Multi-line text area (max 600 characters)
  - HR documents interview findings:
    - Key reasons for leaving (beyond resignation reason)
    - Feedback on team, manager, company culture
    - Improvement suggestions from employee
    - Rehire eligibility assessment
    - Employee satisfaction rating
- Exit interview typically conducted by HR during notice period
- Interview helps gather employee feedback for retention improvement
- Details confidential, viewable only by HR and senior management
- Exit interview required for clearance completion (company policy)
- Values stored in HRClearance.ExitInterviewStatus and HRClearance.ExitInterviewDetails

**Feature 26: HR Clearance - Document Upload**
- **Field:** HR Clearance Attachment
- Type: File upload component
- Accepted formats: PDF, DOC, DOCX, JPG, PNG (max 5 MB)
- HR uploads supporting documents:
  - Signed service agreement copy
  - Exit interview notes/form
  - No-objection certificate
  - Any settlement calculation sheets
  - Email approvals for waivers
- Single file upload (if multiple docs, upload as ZIP or merge PDF)
- File uploaded to Azure Blob Storage container: "ExitDocumentsContainer"
- File URL stored in HRClearance.Attachment
- Original filename stored in HRClearance.FileOriginalName
- "View Document" button appears after upload to preview/download
- Existing attachment can be replaced by uploading new file
- Document viewable by all clearance teams for reference

**Feature 27: HR Clearance Submission**
- After filling all fields, HR clicks "Submit" button
- Form validation checks:
  - Advance Bonus Recovery Amount >= 0
  - Number of Buyout Days <= Current EL
  - Exit Interview Status selected
  - If Exit Interview Status = true, Exit Interview Details required
- API: UpsertHRClearance (insert or update based on existing record)
- Request payload:
  - EmployeeId: current user ID (HR person)
  - ResignationId: resignation ID
  - AdvanceBonusRecoveryAmount: decimal value
  - ServiceAgreementDetails: text
  - CurrentEL: decimal value
  - NumberOfBuyOutDays: integer
  - ExitInterviewStatus: boolean
  - ExitInterviewDetails: text
  - Attachment: file base64 or blob URL
- If new clearance: system inserts into HRClearance table with CreatedBy, CreatedOn
- If updating existing: system updates fields with ModifiedBy, ModifiedOn
- Success message: "HR clearance saved successfully"
- Tab indicator changes to ✓ Completed (green)
- Form switches to read-only mode with "Edit" button
- Clearance completion tracked in resignation list view
- If all four clearances completed + past last working day → resignation status auto-updates to Completed

---

## Data Models

### Resignation Entity
```
Resignation
├── Id: int (PK, Identity)
├── EmployeeId: bigint (FK → EmployeeData)
├── DepartmentId: bigint (FK → Department)
├── Reason: nvarchar(max) - resignation reason
├── RejectResignationReason: nvarchar(max) - rejection reason if cancelled
├── RejectEarlyReleaseReason: nvarchar(max) - early release rejection reason
├── LastWorkingDay: DateOnly - calculated/updated last working day
├── ReportingManagerId: bigint (FK → EmployeeData)
├── JobType: int (enum: Probation=1, Confirmed=2, Training=3)
├── IsActive: bit (default 1)
├── ResignationStatus: int (enum: Pending=1, Revoked=2, Accepted=3, Cancelled=4, Completed=5)
├── EarlyReleaseStatus: int (enum: Pending=1, Accepted=2, Rejected=3)
├── CreatedBy: nvarchar(256)
├── CreatedOn: datetime2
├── ModifiedBy: nvarchar(256)
└── ModifiedOn: datetime2
```

### ResignationHistory Entity
```
ResignationHistory
├── Id: bigint (PK, Identity)
├── ResignationId: int (FK → Resignation)
├── ResignationStatus: int (enum)
├── EarlyReleaseStatus: int (enum)
├── CreatedOn: datetime2
└── CreatedBy: nvarchar(256)
```

### HRClearance Entity
```
HRClearance
├── Id: int (PK, Identity)
├── ResignationId: int (FK → Resignation, unique)
├── AdvanceBonusRecoveryAmount: decimal(18,2) - amount to recover
├── ServiceAgreementDetails: nvarchar(max) - bond/agreement notes
├── CurrentEL: decimal(18,2) - earned leave balance in days
├── NumberOfBuyOutDays: int - days to pay in FnF
├── ExitInterviewStatus: bit - interview conducted flag
├── ExitInterviewDetails: nvarchar(max) - interview notes
├── Attachment: nvarchar(max) - blob storage URL
├── FileOriginalName: nvarchar(max) - original filename
├── CreatedBy: nvarchar(256)
├── CreatedOn: datetime2
├── ModifiedBy: nvarchar(256)
└── ModifiedOn: datetime2
```

---

## Configuration & Enums

### ResignationStatus Enum
```
Pending = 1      // Initial state after employee submission
Revoked = 2      // Employee cancelled before approval
Accepted = 3     // HR/Manager approved
Cancelled = 4    // HR/Manager rejected
Completed = 5    // All clearances done, employee exited
```

### EarlyReleaseStatus Enum
```
Pending = 1      // Early release requested, awaiting approval
Accepted = 2     // HR approved early release
Rejected = 3     // HR rejected early release
```

### JobType Enum
```
Probation = 1    // Probation period (15 days notice)
Confirmed = 2    // Confirmed employee (2 months notice)
Training = 3     // Training period (15 days notice)
```

### JobTypeOptions Configuration (appsettings.json)
```json
"JobTypeOptions": {
  "Probation": 15,      // Notice period in days
  "Training": 15,       // Notice period in days
  "Confirmed": 2        // Notice period in months
}
```

### Employment Status Integration
- When resignation accepted: EmploymentDetail.EmployeeStatus = Resigned (enum value)
- After last working day: EmploymentDetail.EmployeeStatus = Exited
- Exited employees cannot login (authentication blocks inactive users)
- Resigned employees have restricted permissions (no leave application, no asset requests)

---

## External Dependencies

### Employee Management Module
- Retrieves employee details: Name, Code, Department, Designation
- Gets reporting manager information for approval workflow
- Updates EmployeeStatus to Resigned/Exited based on resignation status
- Links to employee profile for full context

### Leave Management Module
- Retrieves current leave balances (EL, CL, SL) for buyout calculation
- Earned Leave balance fed into HR clearance form
- Leave accrual stops after resignation acceptance
- Unused leave days calculated for FnF settlement

### Asset Management Module
- IT clearance verifies all assets returned before completion
- AssetReturned flag in ITClearance linked to asset return confirmations
- Asset condition documented during return process
- Outstanding assets block IT clearance completion

### Authentication & Authorization
- Permission: CreatePersonalDetails (to submit resignation)
- Permission: ViewPersonalDetails (to view own resignation)
- Permission: HR role (to approve resignations, fill clearances)
- Permission: Manager role (to approve team member resignations)
- Permission: IT role (to complete IT clearance)
- Permission: Accounts role (to complete accounts clearance)
- JWT token validates user permissions for each action

### Email Notification Service
- Sends emails at every resignation workflow stage
- Uses Office 365 SMTP (configured in appsettings)
- Email templates stored in NotificationTemplate table
- Methods:
  - ResignationSubmitted(employeeId)
  - AddResignationApprovedEmailAsync(resignationId)
  - ResignationRejected(resignationId)
  - EarlyReleaseRequested(resignationId)
  - EarlyReleaseApproved(resignationId, isApproved)

### Azure Blob Storage
- Stores clearance documents uploaded by HR/IT/Accounts/Department teams
- Container: "ExitDocumentsContainer" or role-specific containers
- File upload via BlobStorageClient service
- Returns blob URL stored in clearance tables (Attachment fields)
- Supports file preview and download from UI

---

## End of Part 1

**Part 1 Summary:** This document covered resignation submission, notice period calculation, approval workflow, early release process, and HR clearance features (27 features total). 

**Next:** Part 2 will cover Department Clearance (KT process), IT Clearance (asset return, access revocation), Accounts Clearance (FnF settlement), and clearance coordination.
