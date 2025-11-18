# Module 04: Exit Management - Part 3
# APIs, UI Components, Workflows & Integration

---

## Features List (Continued)

### Clearance Coordination & Completion (Features 53-58)

**Feature 53: Clearance Progress Dashboard**
- HR can view overall clearance progress for each resignation
- Resignation detail page shows clearance status grid:
  ```
  ┌─────────────────────┬──────────────┬──────────────┐
  │ Clearance Type      │ Status       │ Completed By │
  ├─────────────────────┼──────────────┼──────────────┤
  │ HR Clearance        │ ✓ Completed  │ hr@co.com    │
  │ Department Clear.   │ 🔄 In Prog.  │ -            │
  │ IT Clearance        │ ⏳ Pending   │ -            │
  │ Accounts Clearance  │ ⏳ Pending   │ -            │
  └─────────────────────┴──────────────┴──────────────┘
  ```
- Each clearance shows:
  - Completion status icon and badge
  - Completed date (if completed)
  - Completed by user (email/name)
  - "View Details" link to open respective clearance tab
- Overall progress bar: "X of 4 clearances completed"
- Color coding: Pending (orange), In Progress (blue), Completed (green)
- HR can identify bottlenecks and follow up with respective teams
- Dashboard widget: "Pending Clearances by Type" chart

**Feature 54: Clearance Reminder Notifications**
- System sends automated reminder emails for pending clearances
- **Reminder Trigger Logic:**
  - If resignation Status = Accepted
  - Days until last working day <= 7 days
  - Any clearance still pending
- **Reminder Recipients:**
  - HR Clearance pending → HR team
  - Department Clearance pending → Reporting Manager
  - IT Clearance pending → IT team
  - Accounts Clearance pending → Accounts team
- **Reminder Email Content:**
  - Subject: "Reminder: Pending Exit Clearance for [Employee Name]"
  - Body: Employee details, last working day, clearance type pending
  - Urgency level based on days remaining
  - "Complete Clearance" link to clearance form
- Reminder frequency:
  - First reminder: 7 days before last working day
  - Second reminder: 3 days before last working day
  - Final reminder: 1 day before last working day
- HR can manually trigger reminders from resignation detail page
- Clearance completion stops reminders for that clearance type

**Feature 55: All Clearances Completed Detection**
- System automatically detects when all four clearances completed
- **Completion Criteria:**
  - HRClearance record exists with all required fields
  - DepartmentClearance record exists with KTStatus = Completed
  - ITClearance record exists with ITClearanceCertification = true
  - AccountClearance record exists with IssueNoDueCertificate = true
  - Current date >= LastWorkingDay
- **Auto-Status Update:**
  - When all conditions met, system updates Resignation.ResignationStatus = Completed (5)
  - EmploymentDetail.EmployeeStatus updated to Exited
  - Employee login disabled (authentication checks EmployeeStatus)
- System sends email to employee: "Exit process completed"
- Email includes:
  - Confirmation that all clearances done
  - FnF payment expected date
  - Relieving letter issuance information
  - HR contact for questions
- System sends email to HR: "Exit process completed for [Employee Name]"
- Resignation moved to "Completed" status in list view
- HR can now generate relieving letter

**Feature 56: Partial Clearance Blocking**
- If employee's last working day reached but clearances incomplete:
  - System does NOT auto-update status to Completed
  - Resignation remains in "Accepted" status
  - Employee status remains "Resigned" (not Exited)
  - Alert shown in resignation detail page: "Last working day passed. Pending clearances: X"
- HR sees warning badge in list view for overdue clearances
- Employee cannot get relieving letter until all clearances complete
- Common reasons for delays:
  - Asset not returned (IT clearance blocked)
  - FnF dispute (Accounts clearance blocked)
  - KT incomplete (Department clearance blocked)
- HR must follow up with respective teams to unblock
- Once resolved and all clearances submitted, status auto-updates

**Feature 57: Resignation Completion Timeline**
- System tracks key dates throughout exit process:
  - **Resignation Date:** Date when employee submitted resignation
  - **Acceptance Date:** Date when HR approved resignation
  - **Last Working Day:** Employee's final day (original or early release date)
  - **Clearance Completion Dates:** Date each clearance submitted
  - **Exit Completion Date:** Date when status changed to Completed
- Timeline visualization in UI:
  ```
  Submitted      Approved       Last Day      Completed
  (DD/MM) ──────> (DD/MM) ──────> (DD/MM) ──────> (DD/MM)
     │               │               │               │
     └─ 2 months ────┴─ 1 week ──────┴─ 3 days ──────┘
  ```
- Average exit process duration: 60-70 days (for confirmed employees)
- HR can track if exit taking longer than normal
- Dashboard analytics: Average time to complete exits by department/role

**Feature 58: Clearance Dependencies & Order**
- Clearances can be completed in any order (no strict dependency)
- **Best Practice Order:**
  1. Department Clearance first (KT takes time during notice period)
  2. HR Clearance second (exit interview mid-notice period)
  3. IT Clearance towards end (assets returned last week)
  4. Accounts Clearance last (FnF calculated after all other clearances)
- **Practical Dependencies:**
  - Accounts clearance depends on HR clearance (for recovery amounts)
  - Accounts clearance depends on IT clearance (for asset damage costs)
  - IT clearance depends on Asset Management (assets must be returned first)
- System does not enforce order, but UI shows recommended sequence
- Clearance tabs numbered: 1. HR, 2. Department, 3. IT, 4. Accounts
- Manager can start KT immediately after resignation acceptance
- HR can conduct exit interview anytime during notice period
- IT clearance typically on/after last working day
- Accounts clearance within 7 days after last working day

---

## API Endpoints

### Employee Resignation APIs

**1. POST /api/ExitEmployee/AddResignation**
- **Purpose:** Employee submits resignation
- **Request Body (ResignationRequestDto):**
  ```json
  {
    "employeeId": 1025,
    "departmentId": 5,
    "reportingManagerId": 1010,
    "jobType": 2,
    "reason": "Pursuing higher education opportunities abroad"
  }
  ```
- **Response (ApiResponseModel<CrudResult>):**
  ```json
  {
    "statusCode": 200,
    "message": "Resignation submitted successfully",
    "result": 1
  }
  ```
- **Business Logic:**
  - Validates no active resignation exists
  - Calculates LastWorkingDay based on JobType
  - Creates Resignation record with Status = Pending
  - Inserts ResignationHistory
  - Sends email to manager and HR
- **Error Responses:**
  - 409 Conflict: Active resignation already exists
  - 400 Bad Request: Invalid employee data

**2. GET /api/ExitEmployee/GetResignationForm/{id}**
- **Purpose:** Get employee details for resignation form pre-population
- **Path Parameter:** id (employeeId)
- **Response (ApiResponseModel<ResignationResponseDto>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "id": 1025,
      "employeeName": "John Doe",
      "department": "Engineering",
      "reportingManagerName": "Jane Smith",
      "departmentId": 5,
      "reportingManagerId": 1010,
      "jobType": 2,
      "status": 0
    }
  }
  ```
- **Error Response:** 404 Not Found if employee doesn't exist

**3. GET /api/ExitEmployee/GetResignationDetails/{id}**
- **Purpose:** Get employee's resignation details with status
- **Path Parameter:** id (employeeId)
- **Response (ApiResponseModel<ResignationExistResponseDto>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "id": 45,
      "employeeId": 1025,
      "reason": "Better opportunity",
      "status": 3,
      "earlyReleaseDate": "2025-11-15",
      "earlyReleaseStatus": 2,
      "rejectResignationReason": null,
      "rejectEarlyReleaseReason": null,
      "resignationDate": "2025-10-01",
      "lastWorkingDay": "2025-12-01"
    }
  }
  ```

**4. POST /api/ExitEmployee/RevokeResignation/{resignationId}**
- **Purpose:** Employee revokes their pending resignation
- **Path Parameter:** resignationId
- **Response (ApiResponseModel<CrudResult>):**
  ```json
  {
    "statusCode": 200,
    "message": "Resignation revoked successfully",
    "result": 1
  }
  ```
- **Business Logic:**
  - Validates resignation Status = Pending
  - Updates Status to Revoked
  - Sends notification to manager/HR
- **Error Responses:**
  - 404 Not Found: Resignation not found
  - 409 Conflict: Resignation already accepted/cannot revoke

**5. POST /api/ExitEmployee/RequestEarlyRelease**
- **Purpose:** Employee requests early release date
- **Request Body (EarlyReleaseRequestDto):**
  ```json
  {
    "resignationId": 45,
    "earlyReleaseDate": "2025-11-15",
    "reason": "New job starts on 20th November"
  }
  ```
- **Response (ApiResponseModel<CrudResult>):**
  ```json
  {
    "statusCode": 200,
    "message": "Early release request submitted successfully",
    "result": 1
  }
  ```
- **Business Logic:**
  - Updates EarlyReleaseDate and EarlyReleaseStatus = Pending
  - Inserts ResignationHistory
  - Sends email to HR/manager

**6. GET /api/ExitEmployee/IsResignationExist/{EmployeeId}**
- **Purpose:** Check if employee has active resignation
- **Path Parameter:** EmployeeId
- **Response (ApiResponseModel<IsResignationExistResponseDTO>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "isResignationExist": true,
      "resignationStatus": 1
    }
  }
  ```

---

### Admin/HR Resignation Management APIs

**7. POST /api/AdminExitEmployee/GetResignationList**
- **Purpose:** Get paginated list of resignations with filters
- **Request Body (SearchRequestDto<ResignationSearchRequestDto>):**
  ```json
  {
    "startIndex": 0,
    "pageSize": 25,
    "sortColumnName": "ResignationDate",
    "sortDirection": "desc",
    "filters": {
      "employeeCode": "",
      "employeeName": "",
      "resignationStatus": null,
      "lastWorkingDayFrom": null,
      "lastWorkingDayTo": null,
      "resignationDate": null,
      "branchId": null,
      "departmentId": null,
      "employeeStatus": null,
      "itNoDue": null,
      "accountsNoDue": null
    }
  }
  ```
- **Response (ApiResponseModel<ExitEmployeeListResponseDTO>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "totalRecords": 150,
      "exitEmployeeList": [
        {
          "resignationId": 45,
          "employeeCode": "EMP1025",
          "employeeName": "John Doe",
          "departmentName": "Engineering",
          "resignationDate": "2025-10-01",
          "lastWorkingDay": "2025-12-01",
          "earlyReleaseRequest": true,
          "earlyReleaseDate": "2025-11-15",
          "earlyReleaseApprove": true,
          "resignationStatus": 3,
          "employeeStatus": 2,
          "employmentStatus": 1,
          "ktStatus": 3,
          "exitInterviewStatus": true,
          "itNoDue": true,
          "accountsNoDue": false,
          "reportingManagerName": "Jane Smith",
          "branchId": 1
        }
      ]
    }
  }
  ```
- **Stored Procedure:** [dbo].[GetExitEmployeesListWithDetail]

**8. GET /api/AdminExitEmployee/GetResignationById/{id}**
- **Purpose:** Get detailed resignation information for admin view
- **Path Parameter:** id (resignationId)
- **Response (ApiResponseModel<AdminExitEmployeeResponseDto>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "resignationId": 45,
      "employeeCode": "EMP1025",
      "employeeName": "John Doe",
      "fnFStatus": true,
      "departmentName": "Engineering",
      "resignationDate": "2025-10-01",
      "lastWorkingDay": "2025-12-01",
      "earlyReleaseDate": "2025-11-15",
      "resignationStatus": 3,
      "employeeStatus": 2,
      "employmentStatus": 1,
      "ktStatus": 3,
      "exitInterviewStatus": true,
      "earlyReleaseStatus": 2,
      "itNoDue": true,
      "jobType": 2,
      "accountsNoDue": true,
      "reportingManagerName": "Jane Smith",
      "rejectEarlyReleaseReason": null,
      "rejectResignationReason": null,
      "reason": "Better opportunity",
      "branchId": 1
    }
  }
  ```

**9. POST /api/AdminExitEmployee/AcceptResignation/{id}**
- **Purpose:** HR/Manager accepts resignation
- **Path Parameter:** id (resignationId)
- **Response (ApiResponseModel<String>):**
  ```json
  {
    "statusCode": 200,
    "message": "Resignation accepted successfully",
    "result": "Success"
  }
  ```
- **Business Logic:**
  - Updates ResignationStatus = Accepted
  - Updates EmployeeStatus = Resigned
  - Inserts ResignationHistory
  - Sends approval email to employee

**10. POST /api/AdminExitEmployee/AcceptEarlyRelease**
- **Purpose:** HR approves early release request
- **Request Body (AcceptEarlyReleaseRequestDto):**
  ```json
  {
    "resignationId": 45,
    "releaseDate": "2025-11-15"
  }
  ```
- **Response (ApiResponseModel<String>):**
  ```json
  {
    "statusCode": 200,
    "message": "Early release accepted successfully",
    "result": "Success"
  }
  ```
- **Business Logic:**
  - Updates EarlyReleaseStatus = Accepted
  - Updates LastWorkingDay = releaseDate
  - Inserts ResignationHistory
  - Sends approval email

**11. POST /api/AdminExitEmployee/AdminRejection**
- **Purpose:** HR rejects resignation or early release
- **Request Body (AdminRejectionRequestDto):**
  ```json
  {
    "resignationId": 45,
    "rejectionType": "resignation",
    "rejectionReason": "Cannot accept due to project deadlines"
  }
  ```
- **Response (ApiResponseModel<String>):**
  ```json
  {
    "statusCode": 200,
    "message": "Resignation rejected successfully",
    "result": "Success"
  }
  ```
- **Business Logic:**
  - If rejectionType = "resignation": Updates ResignationStatus = Cancelled
  - If rejectionType = "earlyrelease": Updates EarlyReleaseStatus = Rejected
  - Stores rejection reason
  - Inserts ResignationHistory
  - Sends rejection email with reason

**12. PATCH /api/AdminExitEmployee/UpdateLastWorkingDay**
- **Purpose:** HR updates last working day
- **Request Body (UpdateLastWorkingDayRequestDto):**
  ```json
  {
    "resignationId": 45,
    "lastWorkingDay": "2025-11-30"
  }
  ```
- **Response (ApiResponseModel<String>):**
  ```json
  {
    "statusCode": 200,
    "message": "Last working day updated successfully",
    "result": "Success"
  }
  ```

---

### Clearance APIs

**13. GET /api/AdminExitEmployee/GetHRClearanceByResignationId/{resignationId}**
- **Purpose:** Get HR clearance details
- **Path Parameter:** resignationId
- **Response (ApiResponseModel<HRClearanceResponseDto>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "resignationId": 45,
      "advanceBonusRecoveryAmount": 10000.00,
      "serviceAgreementDetails": "Training bond completed",
      "currentEL": 12.5,
      "numberOfBuyOutDays": 10,
      "exitInterviewStatus": true,
      "exitInterviewDetails": "Employee satisfied overall, leaving for career growth",
      "attachment": "https://blob.url/exit-docs/hr-clearance-45.pdf",
      "fileOriginalName": "hr_clearance.pdf"
    }
  }
  ```

**14. POST /api/AdminExitEmployee/UpsertHRClearance**
- **Purpose:** Create or update HR clearance
- **Request Body (HRClearanceRequestDto):**
  ```json
  {
    "employeeId": 1005,
    "resignationId": 45,
    "advanceBonusRecoveryAmount": 10000.00,
    "serviceAgreementDetails": "Training bond completed, no recovery",
    "currentEL": 12.5,
    "numberOfBuyOutDays": 10,
    "exitInterviewStatus": true,
    "exitInterviewDetails": "Exit interview completed on DD/MM/YYYY",
    "attachment": "base64_encoded_file_or_blob_url"
  }
  ```
- **Response (ApiResponseModel<CrudResult>):**
  ```json
  {
    "statusCode": 200,
    "message": "HR clearance saved successfully",
    "result": 1
  }
  ```

**15. GET /api/AdminExitEmployee/GetDepartmentClearanceDetailByResignationId/{resignationId}**
- **Purpose:** Get department clearance details
- **Response (ApiResponseModel<DepartmentClearanceResponseDto>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "resignationId": 45,
      "ktStatus": 3,
      "ktNotes": "KT completed with John and Sarah. All project documentation handed over.",
      "ktUsers": "1030,1045",
      "attachment": "https://blob.url/kt-docs.pdf",
      "fileOriginalName": "kt_completion.pdf"
    }
  }
  ```

**16. POST /api/AdminExitEmployee/UpsertDepartmentClearance**
- **Purpose:** Create or update department clearance
- **Request Body (DepartmentClearanceRequestDto):**
  ```json
  {
    "employeeId": 1010,
    "resignationId": 45,
    "ktStatus": 3,
    "ktNotes": "KT sessions completed over 3 weeks",
    "ktUsers": "1030,1045",
    "attachment": "blob_url"
  }
  ```
- **Response (ApiResponseModel<CrudResult>):**
  ```json
  {
    "statusCode": 200,
    "message": "Department clearance saved successfully",
    "result": 1
  }
  ```

**17. GET /api/AdminExitEmployee/GetITClearanceDetailByResignationId/{resignationId}**
- **Purpose:** Get IT clearance details
- **Response (ApiResponseModel<ITClearanceResponseDTO>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "resignationId": 45,
      "accessRevoked": true,
      "assetReturned": true,
      "assetCondition": "Good",
      "note": "All assets returned in good condition. Access revoked on last working day.",
      "attachmentUrl": "https://blob.url/it-clearance.pdf",
      "fileOriginalName": "asset_return_form.pdf",
      "itClearanceCertification": true
    }
  }
  ```

**18. POST /api/AdminExitEmployee/AddUpdateITClearance**
- **Purpose:** Create or update IT clearance
- **Request Body (ITClearanceRequestDTO):**
  ```json
  {
    "employeeId": 1008,
    "resignationId": 45,
    "accessRevoked": true,
    "assetReturned": true,
    "assetCondition": "Good",
    "note": "Laptop, monitor returned. AD access disabled.",
    "attachmentUrl": "blob_url",
    "itClearanceCertification": true
  }
  ```
- **Response (ApiResponseModel<CrudResult>):**
  ```json
  {
    "statusCode": 200,
    "message": "IT clearance saved successfully",
    "result": 1
  }
  ```

**19. GET /api/AdminExitEmployee/GetAccountClearance/{resignationId}**
- **Purpose:** Get accounts clearance details
- **Response (ApiResponseModel<AccountClearanceResponseDTO>):**
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "result": {
      "resignationId": 45,
      "fnFStatus": true,
      "fnFAmount": 125000.50,
      "issueNoDueCertificate": true,
      "note": "FnF calculated: Pro-rata salary + leave encashment - recoveries",
      "accountAttachment": "https://blob.url/fnf-statement.pdf",
      "fileOriginalName": "fnf_calculation.pdf"
    }
  }
  ```

**20. POST /api/AdminExitEmployee/AddUpdateAccountClearance**
- **Purpose:** Create or update accounts clearance
- **Request Body (AccountClearanceRequestDto):**
  ```json
  {
    "employeeId": 1007,
    "resignationId": 45,
    "fnFStatus": true,
    "fnFAmount": 125000.50,
    "issueNoDueCertificate": true,
    "note": "FnF breakdown: Salary ₹100K + Leave ₹30K - Recovery ₹5K",
    "accountAttachment": "blob_url"
  }
  ```
- **Response (ApiResponseModel<CrudResult>):**
  ```json
  {
    "statusCode": 200,
    "message": "Accounts clearance saved successfully",
    "result": 1
  }
  ```

---

## UI Components & Screens

### 1. Resignation Form (Employee)
- **Location:** `/resignation/submit` or from employee profile
- **Components:**
  - PageHeader: "Submit Resignation"
  - BreadCrumbs: Home > Profile > Resignation
  - Form (Paper container with padding):
    - Employee Name (read-only, pre-filled)
    - Department (read-only, pre-filled)
    - Reporting Manager (read-only, pre-filled)
    - Resignation Reason (multi-line text area, required, max 500 chars)
    - Character counter: "X / 500 characters"
  - Action Buttons:
    - Submit (primary button, validates form)
    - Reset (secondary button, clears reason field)
- **Behavior:**
  - On mount, calls GetResignationForm API to pre-fill data
  - Calls IsResignationExist API to check active resignation
  - If active resignation exists, shows error message instead of form
  - On submit, validates reason not empty
  - Calls AddResignation API
  - On success, shows confirmation dialog with resignation date and last working day
  - Dialog has "Go to Exit Details" and "Close" buttons
- **Validation:**
  - Reason required
  - Reason max 500 characters
  - No active resignation check

### 2. Exit Details Page (Employee View)
- **Location:** `/resignation/details` or Profile > Exit tab
- **Components:**
  - PageHeader: "My Resignation Details"
  - Status Timeline Stepper:
    - Step 1: Submitted (with date)
    - Step 2: Under Review
    - Step 3: Approved (with date)
    - Step 4: Clearance In Progress
    - Step 5: Completed
  - Resignation Info Card (Paper):
    - Resignation Date
    - Last Working Day
    - Status Badge (colored based on status)
    - Reason (expandable)
  - Early Release Section (if applicable):
    - Early Release Requested Date
    - Early Release Status Badge
    - Rejection Reason (if rejected)
  - Action Buttons (conditional):
    - "Revoke Resignation" (visible if Status = Pending)
    - "Request Early Release" (visible if Status = Accepted and no early release yet)
  - Rejection Reason Card (if Status = Cancelled)
- **Behavior:**
  - Calls GetResignationDetails API on mount
  - Shows timeline based on resignation status
  - Revoke button opens confirmation dialog
  - Early Release button opens dialog with date picker and reason field
  - All data read-only except action buttons

### 3. Employee Exit List Page (HR/Admin)
- **Location:** `/exit-employee/list`
- **Components:**
  - PageHeader: "Employee Exit"
  - BreadCrumbs: Home > Exit Management
  - Top Toolbar:
    - Employee multi-select autocomplete (search by code/name)
    - Filter button (toggles filter panel)
    - Clear filters button (if active filters)
  - Filter Panel (collapsible):
    - Employee Code (text input)
    - Employee Name (text input)
    - Resignation Status (dropdown)
    - Resignation Date (date picker)
    - Last Working Day (date range)
    - Department (dropdown)
    - Branch (dropdown)
    - Employee Status (dropdown)
    - IT No Due (dropdown: All/Completed/Pending)
    - Accounts No Due (dropdown: All/Completed/Pending)
    - Search button (applies filters)
    - Reset button (clears all filters)
  - MaterialDataTable:
    - Columns: Employee Code, Name, Department, Resignation Date, Last Working Day, Status, Early Release, KT Status, Exit Interview, IT No Due, Accounts No Due, Manager, Branch
    - Row click opens resignation detail page
    - Pagination: 10/25/50/100 rows
    - Sorting on all columns
    - Column visibility toggle
- **Behavior:**
  - Calls GetResignationList API with pagination, sorting, filters
  - Updates table on pagination/sort/filter changes
  - Status badges with color coding
  - Boolean fields show ✓ or ✗ icons
  - Row hover shows pointer cursor

### 4. Resignation Detail Page (HR/Admin)
- **Location:** `/exit-employee/:resignationId`
- **Layout:** Two-column layout
  - **Left Column (30%):** Employee Information Panel
  - **Right Column (70%):** Tabbed Clearance Forms
- **Left Panel Components:**
  - Employee Photo (circular avatar)
  - Employee Code, Name
  - Department, Designation
  - Reporting Manager
  - Resignation Date, Last Working Day
  - Job Type badge
  - Resignation Status badge
  - Reason (expandable with "View" icon)
  - Early Release section (if requested):
    - Requested Date
    - Status badge
    - Rejection reason (if rejected)
  - Action Buttons (conditional):
    - "Accept Resignation" (if Status = Pending)
    - "Reject Resignation" (if Status = Pending)
    - "Accept Early Release" (if early release pending)
    - "Reject Early Release" (if early release pending)
    - "Update Last Working Day" (if Status = Accepted)
- **Right Panel - Clearance Tabs:**
  - Tab 1: HR Clearance (with completion indicator)
  - Tab 2: Department Clearance (with completion indicator)
  - Tab 3: IT Clearance (with completion indicator)
  - Tab 4: Accounts Clearance (with completion indicator)
- **Behavior:**
  - Calls GetResignationById API on mount
  - Action button clicks open dialogs with forms
  - Tab clicks load respective clearance forms
  - Real-time updates after any clearance submission

### 5. HR Clearance Form
- **Location:** Exit Detail Page > HR Clearance Tab
- **Components (FormInputGroup layout):**
  - Row 1:
    - Advance Bonus Recovery (number input, decimal)
    - Current EL (number input, decimal)
    - Number of Buyout Days (number input, integer)
  - Row 2:
    - Service Agreement Details (text area, 600 chars)
  - Row 3:
    - Exit Interview Status (dropdown: Yes/No)
    - Exit Interview Details (text area, 600 chars, required if status = Yes)
  - Row 4:
    - File Upload (HR Clearance Attachment)
    - View Document button (if attachment exists)
  - Action Buttons:
    - Submit (saves clearance)
    - Reset (clears form)
- **Behavior:**
  - Calls GetHRClearanceByResignationId on mount
  - If clearance exists, pre-fills form and shows in read-only mode
  - Edit button unlocks form for modification
  - Submit validates fields and calls UpsertHRClearance API
  - Shows success toast and refreshes tab indicator

### 6. Department Clearance Form
- **Components:**
  - KT Status (dropdown: Pending/In Progress/Completed)
  - KT Notes (text area, 1000 chars, required)
  - KT Users (multi-select autocomplete, searches employees)
  - File Upload (Department Clearance Attachment)
  - View Document button (if exists)
  - Submit and Reset buttons
- **Behavior:**
  - Similar to HR clearance form
  - Cannot submit unless KT Status = Completed
  - Validates at least one KT user selected

### 7. IT Clearance Form
- **Components:**
  - Access Revoked (dropdown: Yes/No)
  - Asset Returned (dropdown: Yes/No)
  - Asset Condition (dropdown: Good/Fair/Damaged/Lost)
  - Note (text area, 500 chars)
  - IT Clearance Certification (checkbox, required)
  - File Upload (IT Clearance Attachment)
  - Submit and Reset buttons
- **Behavior:**
  - Cannot submit unless Access Revoked = Yes and Asset Returned = Yes
  - Certification checkbox required
  - Asset condition required if Asset Returned = Yes

### 8. Accounts Clearance Form
- **Components:**
  - FnF Status (dropdown: Pending/Completed)
  - FnF Amount (number input, decimal, required)
  - Issue No Due Certificate (dropdown: Yes/No)
  - Note (text area, 500 chars)
  - File Upload (Account Attachment, required)
  - Submit and Reset buttons
- **Behavior:**
  - Cannot submit unless FnF Status = Completed and Issue No Due = Yes
  - FnF Amount validation: must be reasonable amount
  - Attachment mandatory

### 9. Action Dialogs

**Accept Resignation Dialog:**
- Title: "Accept Resignation"
- Content: "Are you sure you want to accept this resignation? Employee status will be changed to Resigned."
- Buttons: Cancel, Confirm

**Reject Resignation/Early Release Dialog:**
- Title: "Reject Resignation" or "Reject Early Release"
- Content: Form with Rejection Reason text area (required, max 500 chars)
- Buttons: Cancel, Reject

**Accept Early Release Dialog:**
- Title: "Accept Early Release"
- Content: Release Date picker (pre-filled with requested date, editable)
- Buttons: Cancel, Accept

**Update Last Working Day Dialog:**
- Title: "Update Last Working Day"
- Content: 
  - Current Last Working Day (read-only)
  - New Last Working Day (date picker)
- Buttons: Cancel, Update

**Early Release Request Dialog (Employee):**
- Title: "Request Early Release"
- Content:
  - Current Last Working Day (read-only)
  - Requested Early Release Date (date picker)
  - Reason (text area, optional)
- Validation: Date must be before current last working day
- Buttons: Cancel, Submit

---

## Workflows

### Workflow 1: Employee Resignation Submission

1. **Employee Accesses Form:**
   - Employee navigates to Profile > Exit tab or direct URL
   - System calls IsResignationExist API
   - If active resignation exists, shows error and link to existing resignation
   - If no active resignation, renders resignation form

2. **Form Pre-population:**
   - System calls GetResignationForm API with employeeId
   - Backend retrieves employee data from EmploymentDetail, EmployeeData, Department
   - Returns: Name, Department, Reporting Manager, Job Type
   - Frontend pre-fills read-only fields

3. **Employee Fills Reason:**
   - Employee enters resignation reason in text area
   - Character counter shows remaining characters (500 max)
   - Submit button enabled when reason not empty

4. **Submission:**
   - Employee clicks Submit
   - Frontend validates: reason required, max 500 chars
   - Calls AddResignation API with payload
   - Backend validates: no active resignation, employee active
   - Backend calculates LastWorkingDay based on JobType
   - Backend creates Resignation record (Status = Pending)
   - Backend inserts ResignationHistory record
   - Backend sends email to Reporting Manager and HR team

5. **Confirmation:**
   - API returns success
   - Frontend shows confirmation dialog with:
     - Resignation Date (today)
     - Calculated Last Working Day
     - Notice period explanation
     - Next steps message
   - Employee clicks "Go to Exit Details" or "Close"

6. **Post-Submission:**
   - Employee can view resignation status in Profile > Exit tab
   - "Revoke Resignation" button visible
   - Status shows "Pending" with orange badge
   - Manager/HR receive email notification

**Timeline:** 2-5 minutes

---

### Workflow 2: HR Resignation Approval

1. **HR Receives Notification:**
   - Email notification: "Resignation Submitted - [Employee Name]"
   - Email contains: Employee details, resignation date, reason, "View Details" link
   - HR clicks link or navigates to Employee Exit list page

2. **HR Reviews Resignation:**
   - HR accesses Employee Exit list page
   - Filters to show Status = Pending
   - Clicks on resignation row to open detail page
   - Detail page shows employee info and resignation details
   - HR reviews:
     - Employee profile
     - Resignation reason
     - Current projects/responsibilities
     - Notice period (last working day)

3. **HR Decision:**
   
   **Option A: Accept Resignation**
   - HR clicks "Accept Resignation" button
   - Confirmation dialog appears
   - HR confirms acceptance
   - System calls AcceptResignation API
   - Backend updates ResignationStatus = Accepted
   - Backend updates EmployeeStatus = Resigned
   - Backend inserts ResignationHistory
   - Backend sends approval email to employee
   - Frontend shows success message
   - Clearance tabs become visible
   - Status changes to "Accepted" (green)
   
   **Option B: Reject Resignation**
   - HR clicks "Reject Resignation" button
   - Dialog opens with Rejection Reason form
   - HR enters reason (required, max 500 chars)
   - HR clicks Reject
   - System calls AdminRejection API
   - Backend updates ResignationStatus = Cancelled
   - Backend stores rejection reason
   - Backend sends rejection email to employee
   - Frontend shows success message
   - Employee receives email with reason
   - Employee can submit new resignation if needed

4. **Post-Approval Actions:**
   - If accepted:
     - HR initiates exit checklist
     - Schedules exit interview
     - Notifies IT, Accounts, Department teams
     - Clearance process begins
   - If rejected:
     - HR discusses with employee (if needed)
     - Employee remains in Active status

**Timeline:** 1-3 business days after submission

---

### Workflow 3: Multi-Department Clearance Process

1. **Clearance Initiation:**
   - Resignation Status = Accepted
   - Four clearance tabs visible: HR, Department, IT, Accounts
   - All tabs show "Pending" status (orange)

2. **HR Clearance (Week 1-2 of Notice Period):**
   - HR schedules exit interview with employee
   - HR conducts exit interview (30-60 min discussion)
   - HR documents interview feedback
   - HR checks service agreement/bond status
   - HR calculates advance/bonus recovery (if applicable)
   - HR retrieves leave balance from Leave Management
   - HR determines buyout days
   - HR opens HR Clearance tab
   - HR fills form:
     - Advance Bonus Recovery Amount: ₹10,000
     - Service Agreement Details: "Training bond completed"
     - Current EL: 12.5 days
     - Number of Buyout Days: 10 days
     - Exit Interview Status: Yes
     - Exit Interview Details: "Employee satisfied, leaving for growth"
   - HR uploads exit interview notes (PDF)
   - HR clicks Submit
   - System validates and saves HR clearance
   - HR Clearance tab indicator changes to "Completed" (green)
   - Email sent to employee and admin

3. **Department Clearance (Throughout Notice Period):**
   - Manager initiates KT planning immediately after acceptance
   - Manager identifies KT recipients (replacement or team members)
   - Manager schedules KT sessions (typically 3-5 sessions over 2-4 weeks)
   - KT Session 1: Project overview, architecture
   - KT Session 2: Codebase walkthrough, documentation
   - KT Session 3: Process handover, client communication
   - KT Session 4-5: Q&A, troubleshooting
   - Manager documents KT progress
   - After final session:
     - Manager opens Department Clearance tab
     - Manager updates KT Status to "Completed"
     - Manager enters detailed KT Notes (what was transferred)
     - Manager selects KT Users from dropdown (IDs of recipients)
     - Manager uploads KT completion checklist (PDF)
     - Manager clicks Submit
   - System validates: KT Status = Completed, notes present, users selected
   - System saves department clearance
   - Department Clearance tab indicator changes to "Completed" (green)
   - Email sent to HR and employee

4. **IT Clearance (Last Week of Notice Period):**
   - Last week, employee returns physical assets to IT
   - IT receives: Laptop, monitor, keyboard, mouse, charger, ID card
   - IT inspects asset condition
   - IT tests laptop functionality
   - IT logs asset return in Asset Management module
   - On last working day:
     - IT disables employee AD account
     - IT revokes VPN access
     - IT removes GitHub/cloud access
     - IT archives email mailbox
   - IT opens IT Clearance tab
   - IT fills form:
     - Access Revoked: Yes
     - Asset Returned: Yes
     - Asset Condition: Good
     - Note: "All assets returned in good condition. AD disabled on last day."
     - IT Clearance Certification: ✓ checked
   - IT uploads asset return form (signed by employee)
   - IT clicks Submit
   - System validates all required fields
   - System saves IT clearance
   - System updates asset statuses to "Returned"
   - IT Clearance tab indicator changes to "Completed" (green)
   - Email sent to HR

5. **Accounts Clearance (Week After Last Working Day):**
   - After last working day, Accounts calculates FnF
   - Accounts reviews HR clearance (for recovery amounts)
   - Accounts reviews IT clearance (for asset damage costs)
   - Accounts calculates:
     - Pro-rata salary: (50,000 / 30) × 15 days = ₹25,000
     - Leave encashment: 10 days × ₹1,667 = ₹16,670
     - Total dues: ₹41,670
     - Minus recovery: -₹10,000
     - Net FnF: ₹31,670
   - Accounts prepares FnF statement (Excel sheet)
   - Accounts gets Finance Manager approval
   - Accounts opens Accounts Clearance tab
   - Accounts fills form:
     - FnF Status: Completed
     - FnF Amount: 31670.00
     - Issue No Due Certificate: Yes
     - Note: "FnF breakdown: Salary ₹25K + Leave ₹16.67K - Recovery ₹10K"
   - Accounts uploads FnF statement (PDF)
   - Accounts clicks Submit
   - System validates fields and attachment
   - System saves accounts clearance
   - Accounts Clearance tab indicator changes to "Completed" (green)
   - Email sent to HR and employee

6. **Auto-Completion:**
   - System checks: All 4 clearances completed + CurrentDate >= LastWorkingDay
   - System auto-updates ResignationStatus = Completed
   - System updates EmployeeStatus = Exited
   - Employee login disabled
   - Email sent to employee: "Exit process completed"
   - Email sent to HR: "Exit completed for [Employee Name]"

7. **FnF Payment:**
   - Accounts processes bank transfer (within 7 days)
   - Employee receives FnF amount in salary account
   - HR generates relieving letter
   - HR emails relieving letter to employee

**Total Timeline:** 60-70 days (2-month notice + 1-week clearance/payment)

---

## End of Part 3

**Part 3 Summary:** This document covered clearance coordination features (6 features), 20 API endpoints, 9 UI components/screens, and 3 complete workflows.

**Next:** Part 4 will cover error handling, edge cases, integration points, testing scenarios, and dependencies.
