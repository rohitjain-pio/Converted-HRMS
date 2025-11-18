# Module 12: Grievance Management System

## Module Overview

**Purpose:**  
Provides a structured, transparent mechanism for employees to raise workplace concerns, complaints, or issues with guaranteed resolution timelines. Implements automated escalation based on Turn Around Time (TAT) expiry to ensure timely grievance resolution and prevent unresolved issues from impacting employee satisfaction.

**Role in System:**  
Critical employee relations module that maintains organizational transparency, ensures employee voice is heard, provides accountability for issue resolution, and protects the organization from potential disputes by maintaining complete audit trails of all grievances and their resolutions.

## Implemented Features

### Grievance Type Configuration

1. **Grievance Type Creation**
   - HR/Admin creates grievance types (e.g., Harassment, Payroll Issue, Leave Issue, Technical Issue, Facility Issue, Policy Clarification)
   - Each type has unique name and description
   - Type can be activated or deactivated based on relevance

2. **TAT (Turn Around Time) Definition**
   - TAT defined per grievance type in hours
   - Example: Harassment - 24 hours, Payroll Issue - 48 hours, Technical Issue - 72 hours
   - TAT starts from grievance submission timestamp
   - TAT violation triggers auto-escalation

3. **Multi-Level Escalation Configuration**
   - **Level 1 Owner:** First handler (typically team lead or supervisor)
   - **Level 2 Owner:** Second-level escalation (typically manager or department head)
   - **Level 3 Owner:** Final escalation (typically HR head or senior management)
   - Each level owner identified by EmployeeId
   - Ownership mapping stored in GrievanceOwner table

4. **Grievance Type Status Management**
   - Active types visible to employees for grievance submission
   - Inactive types hidden but historical grievances retained
   - Used for deprecating outdated grievance categories

### Grievance Submission

5. **Grievance Creation by Employee**
   - Employee selects grievance type from dropdown (only active types)
   - Subject field: Brief summary of issue (mandatory, max 200 characters)
   - Description field: Detailed issue explanation (mandatory, max 2000 characters)
   - Attachment upload: Screenshots, documents, emails as evidence (optional, max 5 MB)
   - Submission date automatically captured
   - Ticket number auto-generated (format: GR-YYYYMMDD-XXXX)

6. **Ticket Number Generation**
   - Format: GR-[Date]-[Sequential Number]
   - Example: GR-20251031-0001
   - Unique identifier for grievance tracking
   - Displayed to employee for future reference

7. **Initial Status Assignment**
   - New grievance status: Open
   - Assigned to Level 1 owner automatically based on grievance type
   - Current level set to 1
   - Current owner set to Level 1 owner from GrievanceType configuration

8. **Attachment Handling**
   - Attachments uploaded to Azure Blob Storage
   - File types allowed: PDF, JPG, PNG, DOC, DOCX
   - File size validation: Max 5 MB
   - Attachment URL stored in database
   - Owner can download attachment during review

9. **Submission Confirmation**
   - Employee receives confirmation message with ticket number
   - Submission email sent to employee with ticket details
   - Owner receives notification email about new grievance assignment

### Grievance Processing

10. **Grievance Ownership**
    - Current owner can view and act on grievance
    - Owner sees grievance in "Assigned to Me" list
    - Ownership changes during escalation
    - Previous owners can view grievance history but cannot modify

11. **Grievance Remarks/Comments**
    - Owner can add multiple remarks as investigation progresses
    - Each remark has timestamp and author (EmployeeId)
    - Remarks visible to employee for transparency
    - Internal notes feature (not visible to employee) - implementation unclear

12. **Status Update by Owner**
    - Owner can change status:
      - Open → In Progress (when investigation starts)
      - In Progress → Resolved (when issue resolved)
    - Status change tracked with timestamp
    - Status change triggers notification to employee

13. **Resolution Process**
    - Owner investigates issue
    - Owner communicates with relevant parties (offline/external to system)
    - Owner documents findings in remarks
    - Owner marks as Resolved with final resolution remark
    - Resolution date automatically captured
    - Resolution confirmation email sent to employee

### Auto-Escalation Mechanism

14. **TAT Monitoring Job**
    - Scheduled job runs every 10 minutes
    - Checks all Open and In Progress grievances
    - Calculates elapsed time since submission or last escalation
    - Compares elapsed time with TAT threshold for current level

15. **Level 1 to Level 2 Escalation**
    - If grievance at Level 1 and elapsed time > Level 1 TAT:
      - Grievance status changed to Escalated
      - Current level changed to 2
      - Current owner changed to Level 2 owner
      - Escalation timestamp recorded
      - Escalation remark auto-generated: "Auto-escalated to Level 2 due to TAT expiry"
      - Notification email sent to Level 2 owner
      - Notification email sent to employee about escalation

16. **Level 2 to Level 3 Escalation**
    - If grievance at Level 2 and elapsed time > Level 2 TAT:
      - Grievance status changed to Escalated
      - Current level changed to 3
      - Current owner changed to Level 3 owner
      - Escalation timestamp recorded
      - Escalation remark auto-generated: "Auto-escalated to Level 3 due to TAT expiry"
      - Notification email sent to Level 3 owner
      - Notification email sent to employee and previous owners

17. **Level 3 Handling (Final Escalation)**
    - No further escalation beyond Level 3
    - Level 3 owner expected to resolve regardless of TAT
    - TAT expiry at Level 3 triggers alert to senior management (implementation unclear)
    - Critical grievance flag or priority mechanism (not visible in codebase)

### Grievance Tracking & Viewing

18. **Employee Grievance List**
    - Employee can view all own grievances
    - List displays: Ticket number, Type, Subject, Status, Submission date, Current owner
    - Filter by grievance type
    - Filter by status (Open, In Progress, Resolved, Escalated, Closed)
    - Filter by date range
    - Sort by submission date, status

19. **Owner Grievance List**
    - Owner views grievances assigned to them (current owner)
    - Same columns as employee list plus employee name
    - Filter by grievance type, status, date range
    - Pending grievances highlighted (overdue TAT)

20. **Admin Grievance List**
    - HR/Admin can view all grievances across organization
    - Additional filters: Employee name, Department, Owner
    - Used for monitoring, reporting, and audit
    - Permission: Grievance.ViewAll

21. **Grievance Detail View**
    - Complete grievance information:
      - Ticket number, Type, Status, Current level, Current owner
      - Subject, Description, Attachment (download link)
      - Employee details (Name, Email, Department)
      - Submission date, Resolution date
      - Complete remark history with timestamps and authors
      - Escalation history with levels and timestamps
    - Owner can add remarks and update status
    - Employee can view only (read-only mode)

22. **Grievance View Permission Check**
    - Employee can view only own grievances
    - Owner can view grievances assigned to them
    - HR/Admin can view all grievances
    - Permission validation on detail view API endpoint

### Grievance Resolution & Closure

23. **Resolution Remarks**
    - Owner adds final resolution remark explaining how issue was resolved
    - Resolution remark mandatory before marking Resolved
    - Resolution remark example: "Issue investigated. Found error in payroll calculation. Corrected salary credit. Excess amount paid to employee."

24. **Grievance Resolved Status**
    - Owner marks grievance as Resolved
    - Resolution date automatically set to current timestamp
    - Resolved grievances removed from owner's pending list
    - Resolved grievances remain visible in employee's grievance history

25. **Resolution Email Notification**
    - Email sent to employee on resolution
    - Email contains:
      - Ticket number
      - Resolution date
      - Final resolution remarks
      - Acknowledgment request (optional)
    - Employee can provide feedback on resolution (mechanism unclear)

26. **Grievance Closure**
    - Closed status indicates grievance fully completed and archived
    - Closure may happen automatically after resolution (cooling period unclear)
    - Manual closure by HR/Admin if needed
    - Closed grievances in read-only archive

### Grievance Reporting

27. **Excel Export of Grievance Report**
    - Export all grievances or filtered subset to Excel
    - Columns: Ticket Number, Employee, Type, Subject, Status, Submission Date, Resolution Date, TAT Status, Current Owner
    - Filter parameters applied to export
    - Used for management reporting and analysis

28. **TAT Violation Tracking**
    - Report identifies grievances with TAT violations
    - Helps monitor owner performance
    - Used for process improvement and training needs identification

29. **Grievance Trends Analysis (Implied)**
    - Grievance count by type over time
    - Average resolution time by type
    - Escalation rate by type
    - Owner performance metrics
    - (Implementation details not visible, report generation unclear)

### Grievance Type Management APIs

30. **Get All Grievance Types**
    - Fetch list of all active grievance types for submission dropdown
    - Public API for all authenticated users

31. **Get Grievance Type by ID**
    - Fetch detailed configuration of specific grievance type
    - Used by admin for editing

32. **Add Grievance Type**
    - Create new grievance type with TAT and owners
    - HR/Admin permission required

33. **Update Grievance Type**
    - Modify existing grievance type configuration
    - Change TAT or owner assignments
    - Changes affect only future grievances, not existing ones

34. **Delete Grievance Type**
    - Soft delete grievance type (mark as inactive)
    - Historical grievances remain intact
    - Type no longer visible for new submissions

## Data Models / Entities Used

### Primary Entities:
- **GrievanceType**: Grievance category definition
  - Fields: GrievanceTypeId, Name, Description, TAT (hours), Status (Active/Inactive)
- **GrievanceOwner**: Multi-level owner configuration per type
  - Fields: GrievanceTypeId, Level1OwnerEmployeeId, Level2OwnerEmployeeId, Level3OwnerEmployeeId
- **EmployeeGrievance**: Individual grievance record
  - Fields: GrievanceId, TicketNumber, EmployeeId, GrievanceTypeId, Subject, Description, AttachmentURL, Status (Open/InProgress/Resolved/Escalated/Closed), CurrentLevel (1/2/3), CurrentOwnerEmployeeId, SubmissionDate, ResolutionDate, CreatedDate
- **GrievanceRemarks**: Remarks/comments on grievance
  - Fields: RemarkId, GrievanceId, RemarkText, RemarkByEmployeeId, RemarkDate, IsInternal (true if internal note, false if visible to employee)

### Related Entities:
- **EmployeeData**: Employee master for grievance submitter and owner details
- **EmploymentDetail**: Department, designation for filtering and reporting
- **NotificationTemplate**: Email templates for grievance notifications

### DTOs:
- **GrievanceTypeDto**: Grievance type with configuration
- **SubmitGrievanceRequestDto**: Grievance submission request (GrievanceTypeId, Subject, Description, Attachment)
- **EmployeeGrievanceResponseDto**: Grievance details for display (includes employee and owner names, type name, all remarks)
- **GrievanceRemarkRequestDto**: Add remark request (GrievanceId, RemarkText)
- **GrievanceFilterDto**: Filter parameters (GrievanceTypeId, Status, DateFrom, DateTo, EmployeeId, OwnerId)
- **GrievanceReportDto**: Report row format for Excel export

## External Dependencies or Services

1. **Azure Blob Storage**
   - Purpose: Store grievance attachments (screenshots, documents)
   - Upload via BlobStorageClient
   - Generate SAS URL for secure attachment download

2. **Email Notification Service**
   - Purpose: Send grievance-related email notifications
   - Templates: GrievanceSubmitted, GrievanceAssigned, GrievanceEscalated, GrievanceResolved
   - Integration via EmailNotificationService

3. **Quartz.NET Scheduled Job**
   - GrievanceLevelUpdateJob: Runs every 10 minutes to check TAT and escalate
   - Cron schedule: 0 0/10 * * * ? (every 10 minutes)

## APIs or Endpoints

### GET /api/Grievance/GetAllGrievancesList
- **Purpose:** Fetch all grievance types for admin management
- **Response:** Array of GrievanceType with configuration
- **Auth Required:** Yes
- **Permissions:** Grievance.Admin

### GET /api/Grievance/GetAllGrievanceTypeList
- **Purpose:** Fetch active grievance types for employee submission dropdown
- **Response:** Array of active GrievanceType (Id, Name, Description)
- **Auth Required:** Yes
- **Permissions:** Grievance.Submit

### GET /api/Grievance/GetGrievanceTypeById/{grievanceTypeId}
- **Purpose:** Fetch grievance type details for editing
- **Response:** GrievanceTypeDto with TAT and owners
- **Auth Required:** Yes
- **Permissions:** Grievance.Admin

### POST /api/Grievance/GetEmployeeGrievancesById/{EmployeeId}
- **Purpose:** Fetch all grievances submitted by specific employee
- **Request:** EmployeeId, Filter parameters (Type, Status, DateRange)
- **Response:** Array of EmployeeGrievanceResponseDto
- **Auth Required:** Yes
- **Permissions:** Grievance.ViewOwn (for own) or Grievance.ViewAll (for others)

### POST /api/Grievance/SubmitGrievance
- **Purpose:** Submit new grievance
- **Request:** SubmitGrievanceRequestDto with attachment (multipart form data)
- **Process:**
  - Upload attachment to Azure Blob
  - Generate ticket number
  - Fetch Level 1 owner from GrievanceType
  - Create EmployeeGrievance record
  - Queue notification emails
- **Response:** Ticket number and submission confirmation
- **Auth Required:** Yes
- **Permissions:** Grievance.Submit

### POST /api/Grievance/DeleteGrievance/{grievanceTypeId}
- **Purpose:** Delete (deactivate) grievance type
- **Process:** Soft delete (mark as inactive)
- **Auth Required:** Yes
- **Permissions:** Grievance.Admin

### POST /api/Grievance/AddGrievance
- **Purpose:** Create new grievance type (admin function)
- **Request:** GrievanceTypeDto with TAT and owner configuration
- **Process:** Insert GrievanceType and GrievanceOwner records
- **Auth Required:** Yes
- **Permissions:** Grievance.Admin

### POST /api/Grievance/UpdateGrievance
- **Purpose:** Update existing grievance type configuration
- **Request:** GrievanceTypeDto with modified TAT or owners
- **Process:** Update GrievanceType and GrievanceOwner records
- **Auth Required:** Yes
- **Permissions:** Grievance.Admin

### GET /api/Grievance/GetEmployeeGrievancesDetail/{TicketId}
- **Purpose:** Fetch complete grievance details
- **Response:** EmployeeGrievanceResponseDto with all remarks and history
- **Auth Required:** Yes
- **Permissions:** Grievance.View (with ownership/submitter check)

### POST /api/Grievance/GetAllEmployeeGrievances
- **Purpose:** Fetch all grievances with filters (admin/owner view)
- **Request:** GrievanceFilterDto (Employee, Type, Status, Owner, DateRange)
- **Response:** Paginated array of EmployeeGrievanceResponseDto
- **Auth Required:** Yes
- **Permissions:** Grievance.ViewAll (admin) or Grievance.ViewAssigned (owner)

### GET /api/Grievance/GrievanceResolvedEmail/{ticketNo}
- **Purpose:** Trigger resolution email to employee
- **Process:** Fetch grievance details, queue resolution email
- **Auth Required:** Yes
- **Permissions:** Grievance.Resolve

### GET /api/Grievance/GetEmployeeGrievanceRemarksDetail/{ticketId}
- **Purpose:** Fetch all remarks for grievance
- **Response:** Array of GrievanceRemarks with author details and timestamps
- **Auth Required:** Yes
- **Permissions:** Grievance.View

### POST /api/Grievance/UpdateEmployeeGrievanceRemarks
- **Purpose:** Add remark to grievance
- **Request:** GrievanceRemarkRequestDto (GrievanceId, RemarkText)
- **Process:**
  - Validate user is current owner or admin
  - Create GrievanceRemarks record
  - Optionally update status if resolution remark
- **Auth Required:** Yes
- **Permissions:** Grievance.AddRemark

### GET /api/Grievance/UpdateRemarksAllowed
- **Purpose:** Check if current user can add remarks to grievance
- **Response:** Boolean (true if user is current owner or admin)
- **Auth Required:** Yes
- **Permissions:** Grievance.View

### POST /api/Grievance/ExportGrievanceReport
- **Purpose:** Export grievances to Excel with filters
- **Request:** GrievanceFilterDto
- **Process:**
  - Fetch filtered grievances
  - Generate Excel file with all columns
  - Return file for download
- **Auth Required:** Yes
- **Permissions:** Grievance.Export

### GET /api/Grievance/GrievanceViewAllowed/{grievanceId}
- **Purpose:** Check if current user can view specific grievance
- **Response:** Boolean (true if user is submitter, owner, or admin)
- **Auth Required:** Yes
- **Permissions:** Grievance.View

## UI Components / Screens

### Grievance Submission Form
- **Components:**
  - Grievance type dropdown (populated from active types)
  - Subject text input (max 200 characters)
  - Description text area (max 2000 characters, rich text optional)
  - Attachment upload button (drag-drop support)
  - Submit button
- **Validation:**
  - Type selection mandatory
  - Subject and description mandatory
  - Attachment size validation (max 5 MB)
  - Attachment type validation
- **Behavior:**
  - On submit: Upload attachment to blob, create grievance, show ticket number
  - Display estimated resolution time based on TAT
  - Confirmation message: "Your grievance has been submitted. Ticket number: GR-20251031-0001. You will be notified of resolution."

### My Grievances Page
- **Components:**
  - Data table with columns:
    - Ticket Number
    - Type
    - Subject
    - Status (badge with color coding)
    - Submission Date
    - Current Owner Name
    - Resolution Date (if resolved)
    - Actions (View Details button)
  - Filters:
    - Grievance type dropdown
    - Status dropdown (All, Open, In Progress, Escalated, Resolved, Closed)
    - Date range picker
  - Search by ticket number or subject
  - Pagination
- **Behavior:**
  - Status badges color-coded: Open (Yellow), In Progress (Blue), Escalated (Orange), Resolved (Green), Closed (Gray)
  - Click ticket number or View Details: Navigate to grievance detail page
  - Overdue grievances (TAT expired) highlighted in red

### Grievance Detail Page
- **Components:**
  - Grievance header:
    - Ticket number (large, prominent)
    - Type badge
    - Status badge
    - Current level and owner
  - Grievance details section:
    - Subject (bold)
    - Description (formatted text)
    - Attachment (download link if present)
    - Submission date, Resolution date
  - Remarks timeline:
    - Each remark with timestamp, author name, avatar
    - Chronological order (latest first or oldest first toggle)
    - Escalation remarks highlighted differently
  - Add Remark section (for owner):
    - Remark text area
    - Add Remark button
  - Update Status section (for owner):
    - Status dropdown (In Progress, Resolved)
    - Update button
  - Close button to go back to list
- **Behavior:**
  - If user is submitter: Read-only view, no add remark or update status
  - If user is current owner: Can add remarks and update status
  - If user is admin: Can add remarks, update status, reassign owner (if implemented)
  - Download attachment: Generate SAS URL and redirect
  - Real-time status updates (polling or WebSocket if implemented)

### Owner Grievance Dashboard
- **Components:**
  - Pending grievances count badge (overdue highlighted)
  - Data table similar to employee view plus:
    - Employee Name column
    - Department column
    - TAT status indicator (On Time, Approaching, Overdue)
  - Bulk action capability (mark multiple as In Progress)
  - Quick filters: Overdue Only, My Level Only
- **Behavior:**
  - Overdue grievances at top of list
  - Click grievance: Navigate to detail page with owner actions enabled
  - Notifications on new assignment or escalation to user

### Admin Grievance Management Page
- **Components:**
  - Comprehensive data table with all columns
  - Filters: Employee, Department, Type, Status, Owner, Date Range
  - Export to Excel button
  - Grievance type management section:
    - List of grievance types
    - Add Type button
    - Edit Type button (per row)
    - Delete Type button (per row)
  - Analytics widgets:
    - Total grievances (current month)
    - Resolved count and percentage
    - Escalation rate
    - Average resolution time
- **Behavior:**
  - View all grievances across organization
  - Add/Edit/Delete grievance types opens modal with form
  - Configure TAT and owners for each type
  - Export generates Excel with all filtered grievances

### Grievance Type Configuration Modal
- **Components:**
  - Type name text input
  - Description text area
  - TAT (hours) number input
  - Level 1 Owner employee dropdown
  - Level 2 Owner employee dropdown
  - Level 3 Owner employee dropdown
  - Status toggle (Active/Inactive)
  - Save button
- **Validation:**
  - Name mandatory and unique
  - TAT must be > 0
  - All three owners mandatory
  - Owners cannot be same person
- **Behavior:**
  - Employee dropdown populated from EmployeeData (active only)
  - Owner validation: Must have Grievance.HandleOwn permission
  - On save: Create/update grievance type and owner configuration

## Workflow or Process Description

### Grievance Submission to Resolution Workflow:

1. **Employee Submission:**
   - Employee experiences issue (e.g., payroll error: salary not credited)
   - Employee logs into HRMS
   - Navigates to Grievances → Submit New Grievance
   - Selects grievance type: "Payroll Issue"
   - Enters subject: "Salary not credited for October 2025"
   - Enters description: "My salary for October 2025 has not been credited to my bank account. Payment date was October 31st. Other colleagues received their salaries. Please investigate urgently."
   - Uploads bank statement screenshot as attachment
   - Clicks Submit

2. **System Processing:**
   - Frontend uploads attachment to Azure Blob Storage, receives filename
   - Frontend sends grievance data to backend API
   - Backend generates ticket number: GR-20251031-0001
   - Backend fetches grievance type configuration for "Payroll Issue"
   - Finds TAT: 48 hours, Level 1 Owner: HR Coordinator (EmployeeId: 205)
   - Creates EmployeeGrievance record:
     - Ticket: GR-20251031-0001
     - Status: Open
     - CurrentLevel: 1
     - CurrentOwner: 205
     - SubmissionDate: 2025-10-31 10:00:00
   - Queues two emails:
     - Confirmation email to employee with ticket number
     - Assignment email to HR Coordinator
   - Returns ticket number to employee

3. **Owner Notification:**
   - HR Coordinator receives email: "New Grievance Assigned - GR-20251031-0001"
   - Email contains ticket number, type, subject, employee name, link to view
   - HR Coordinator logs into HRMS
   - Sees notification badge on Grievances menu (1 pending)
   - Navigates to Grievances → Assigned to Me
   - Sees grievance in pending list with status Open

4. **Owner Investigation:**
   - HR Coordinator clicks ticket number GR-20251031-0001
   - Views grievance detail page with all information
   - Downloads bank statement attachment
   - Adds remark: "Grievance received. Investigating with accounts team."
   - Changes status from Open to In Progress
   - Employee receives notification: "Your grievance GR-20251031-0001 is now being investigated."
   - HR Coordinator contacts Accounts team (offline)
   - Accounts team checks payroll run logs
   - Finds employee was accidentally marked as on leave, salary processing skipped

5. **TAT Monitoring (Scenario A - On Time Resolution):**
   - HR Coordinator resolves issue within 36 hours (before 48-hour TAT)
   - HR Coordinator adds resolution remark: "Issue identified. Employee was incorrectly marked as on leave in payroll system. Payroll team has corrected the error and processed salary. Amount will be credited by November 2nd. Apologies for the inconvenience."
   - Changes status to Resolved
   - Resolution date: 2025-11-01 22:00:00 (36 hours from submission)
   - System queues resolution email to employee
   - Employee receives email with resolution details
   - Employee logs in, views resolution remark, satisfied with outcome
   - Grievance remains in employee's history as Resolved

6. **TAT Monitoring (Scenario B - Escalation):**
   - If HR Coordinator does not resolve within 48 hours:
   - GrievanceLevelUpdateJob runs at 2025-11-02 10:00:00 (10 AM, next scheduled run after 48 hours)
   - Job calculates elapsed time: 2025-11-02 10:00 - 2025-10-31 10:00 = 48 hours
   - Job finds TAT (48 hours) expired for Level 1
   - Job escalates grievance:
     - Status changed to Escalated
     - CurrentLevel changed to 2
     - CurrentOwner changed to Level 2 Owner: HR Manager (EmployeeId: 201)
     - Escalation timestamp: 2025-11-02 10:00:00
     - Auto-generated remark: "Auto-escalated to Level 2 due to TAT expiry. Previous owner: HR Coordinator."
   - System queues escalation emails:
     - Email to HR Manager: "Grievance Escalated to You - GR-20251031-0001"
     - Email to Employee: "Your grievance GR-20251031-0001 has been escalated to higher level for urgent resolution."
     - Email to HR Coordinator: "Grievance GR-20251031-0001 escalated from you due to TAT expiry."
   - HR Manager receives email and notification
   - HR Manager logs in, sees escalated grievance in pending list
   - HR Manager investigates with urgency, resolves within Level 2 TAT
   - If Level 2 TAT also expires: Further escalated to Level 3 Owner (CHRO)

7. **Post-Resolution:**
   - Grievance marked as Resolved, no further escalation
   - Grievance remains visible in employee's history
   - Used for HR analytics: Payroll Issue type had resolution rate, average resolution time calculated
   - If multiple payroll grievances: HR identifies systemic issue, initiates process improvement

### Grievance Type Configuration Workflow:

1. HR Admin identifies new grievance category needed: "Remote Work Request"
2. HR Admin logs into HRMS
3. Navigates to Grievances → Manage Types
4. Clicks Add New Type button
5. Modal opens with configuration form
6. HR Admin fills:
   - Name: "Remote Work Request"
   - Description: "Requests for remote work approval or extension"
   - TAT: 24 hours
   - Level 1 Owner: Team Lead (selects from employee dropdown)
   - Level 2 Owner: Department Manager
   - Level 3 Owner: HR Head
   - Status: Active
7. Clicks Save
8. System creates GrievanceType and GrievanceOwner records
9. "Remote Work Request" now visible to employees in submission dropdown
10. Employees can submit grievances of this type
11. If policy changes, HR Admin can edit type: Change TAT to 48 hours or reassign owners

## Error Handling / Edge Cases

### Grievance Submission Errors:
- Attachment size exceeds 5 MB: Error message: "Attachment too large. Maximum size: 5 MB."
- Unsupported attachment format: Error: "Invalid file type. Supported: PDF, JPG, PNG, DOC, DOCX."
- Subject or description empty: Validation error displayed inline
- Grievance type not selected: Validation error: "Please select a grievance type."

### Owner Not Found:
- Grievance type has Level 1 Owner with EmployeeId that no longer exists (employee exited)
- System assigns to fallback owner (HR department head or admin)
- Error logged: "Level 1 Owner not found for Grievance Type X. Assigned to default owner."

### Multiple Simultaneous Escalations:
- Job runs and finds multiple grievances with TAT expired
- All escalations processed in single job run
- Batch email notifications sent
- If Level 2 Owner has 50 escalated grievances: Owner receives consolidated email (implementation unclear)

### Grievance View Permission Violation:
- User attempts to view grievance not submitted by them and not assigned to them
- API returns 403 Forbidden
- Error message: "You do not have permission to view this grievance."
- Potential security audit log entry

### Remark Addition by Non-Owner:
- Employee attempts to add remark on own grievance (not allowed, only owners can add remarks)
- API validates current owner
- Error: "Only assigned owner can add remarks. You can only view your grievance status."

### Status Update to Resolved Without Remarks:
- Owner attempts to mark as Resolved without adding resolution remark
- Validation error: "Please add resolution remark before marking as resolved."
- Ensures documented resolution for audit trail

### Escalation to Non-Existent Level:
- Level 3 grievance with TAT expired
- No Level 4 exists
- Job does not escalate further
- Alerts sent to senior management (implementation details unclear)
- Manual intervention required

### Grievance Type Deletion with Active Grievances:
- HR Admin attempts to delete grievance type that has active grievances
- System performs soft delete (mark as inactive)
- Active grievances remain intact and processable
- Type no longer visible for new submissions
- Historical reporting includes deleted types

### Concurrent Remark Addition:
- Two owners (during escalation handover period) add remarks simultaneously
- Both remarks saved with timestamps
- No data loss, chronological order maintained
- Ownership validation prevents non-owners from adding remarks

## Integration Points with Other Modules

### Integration with Employee Management:
- EmployeeData provides employee details for grievance submitters
- Employee name, email, department displayed in grievance
- Active employee validation for grievance submission

### Integration with Employment Details:
- Department information used for grievance filtering and reporting
- Reporting manager may be involved in grievance resolution (depending on type)
- Employee hierarchy considered for ownership assignment

### Integration with Authentication & Authorization:
- Permission checks for Grievance.Submit, Grievance.View, Grievance.AddRemark, Grievance.Admin
- Employee ID from JWT token identifies grievance submitter
- Owner access validated based on current owner assignment

### Integration with Notification System:
- Email notifications sent on:
  - Grievance submission (to employee and owner)
  - Escalation (to new owner, employee, previous owner)
  - Resolution (to employee)
- Email templates: GrievanceSubmitted, GrievanceAssigned, GrievanceEscalated, GrievanceResolved

### Integration with Dashboard:
- Pending grievances count displayed on owner dashboard
- Overdue grievances highlighted on manager dashboard
- Widget showing recent grievances or high-priority issues

### Integration with Employee Relations (Implied):
- Grievance trends used for identifying systemic issues
- HR intervention triggered for harassment or serious grievances
- Legal compliance maintained through audit trail

## Dependencies / Reused Components

### Backend Dependencies:
- **BlobStorageClient**: Upload and retrieve grievance attachments
- **EmailNotificationService**: Send grievance-related email notifications
- **Quartz.NET**: Schedule GrievanceLevelUpdateJob for TAT monitoring
- **Dapper**: Execute stored procedures for grievance queries
- **AutoMapper**: Map between grievance entities and DTOs

### Frontend Dependencies:
- **Material-UI**: Grievance form components and data tables
- **React Hook Form**: Grievance submission form management
- **SWR**: Fetch and cache grievance list and details
- **Axios**: API calls for grievance CRUD operations
- **React Toastify**: Notifications for grievance actions

### Shared Utilities:
- **FileValidator**: Validate grievance attachment size and type
- **TicketNumberGenerator**: Generate unique grievance ticket numbers
- **DateHelper**: Calculate elapsed time for TAT monitoring
- **ExcelExporter**: Export grievances to Excel format

### Configuration:
- **Grievance:GrievanceLevelUpdateJob:CronSchedule**: Job run frequency (every 10 minutes)
- **AppConfig**: File size limits for attachments
- **SystemEmailConfig**: Email templates for grievance notifications

## Testing Artifacts

Testing artifacts not found in codebase. Recommended tests:

### Unit Tests:
- Ticket number generation uniqueness
- TAT calculation with various submission dates
- Escalation level determination logic
- Permission validation for view and modify operations
- Remark author validation

### Integration Tests:
- Grievance submission end-to-end with attachment upload
- Escalation workflow: Level 1 → Level 2 → Level 3
- Grievance resolution with email notification
- Owner change during escalation with access validation
- Excel export with various filter combinations

### Performance Tests:
- GrievanceLevelUpdateJob with 1000 active grievances
- Concurrent grievance submissions by 100 employees
- Grievance list query with large dataset (10,000+ grievances)

### Security Tests:
- Attempt to view other employee's grievance without permission
- Attempt to add remark to grievance not assigned to user
- Attempt to modify grievance type in use
- SQL injection in grievance subject/description fields

---

**Module Dependencies:**
- **Depends On:** Authentication, Employee Management, Notification System
- **Used By:** Dashboard, HR Analytics (external)

**Compliance Considerations:**
- Complete audit trail for all grievances and actions
- TAT-based escalation ensures timely resolution
- Transparency through remark visibility to employees
- Confidentiality for sensitive grievances (harassment) may require special handling
- Grievance data retention policy should align with organizational compliance requirements
