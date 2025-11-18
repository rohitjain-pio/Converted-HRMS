# Module 8: Leave Management

## Module Overview

**Purpose:**  
Automates the complete leave lifecycle including monthly leave accrual, leave application, approval workflows, balance tracking, and leave calendar visualization. Ensures compliance with organizational leave policies through automated calculations and validations.

**Role in System:**  
Critical HR automation module that eliminates manual leave tracking, provides real-time balance visibility, enforces approval workflows, and maintains comprehensive leave history for payroll processing and compliance reporting.

## Implemented Features

### Leave Type Management

1. **Five Leave Types**
   - **Casual Leave (CL):** Short-term planned leaves
   - **Earned Leave (EL):** Annual earned leaves for longer vacations
   - **Sick Leave (SL):** Medical leaves
   - **Comp-Off:** Compensatory offs earned for working extra hours or holidays
   - **Swap Holiday:** Exchange declared holiday with working day

2. **Leave Type Configuration**
   - Each type has unique properties: Accrual rate, carry-over limit, validity period
   - Leave types stored in LeaveType master table
   - Configuration controls accrual, carryover, and expiry behavior

### Leave Balance Management

3. **Monthly Automatic Leave Accrual**
   - Scheduled job runs on 1st of each month at midnight
   - Casual Leave: Credits 0.5 days per month to all active employees
   - Earned Leave: Credits 1.5 days per month to all active employees
   - Accrual starts from employee joining date
   - Prorated accrual for mid-month joiners (implementation details not fully visible)

4. **Annual Carry-Over Processing**
   - Runs in January (configurable CarryOverMonth)
   - Casual Leave: Maximum 3 days carried over from previous year
   - Earned Leave: Maximum 15 days carried over from previous year
   - Excess unused leave forfeited
   - Carry-over limits configured in LeavesAccrualOptions

5. **Leave Balance Initialization**
   - New employee leave balances created on joining
   - Initial balance typically zero (accrual starts from first month)
   - HR can manually adjust initial balance if needed

6. **Manual Leave Balance Adjustment**
   - HR can add or deduct leave days manually
   - Used for corrections, encashment, or special cases
   - Adjustment reason tracked in AccrualUtilizedLeave table
   - Audit trail maintained for all adjustments

7. **Bulk Leave Balance Import**
   - Excel import feature for updating multiple employee balances
   - Template format with EmployeeId, LeaveType, Days
   - Validation of employee existence and leave type
   - Error report generated for invalid records

8. **Leave Balance Display**
   - Real-time balance shown per leave type
   - Available balance, utilized balance, accrued balance breakdown
   - Year-to-date utilization tracking
   - Pending leave requests reduce available balance (hold)

### Leave Application

9. **Leave Request Creation**
   - Employee selects leave type from dropdown
   - Start date and end date selection via date picker
   - Slot selection: Full Day, First Half, Second Half
   - Reason text field (mandatory for most leave types)
   - Attachment upload support (medical certificates, approval documents)
   - Multiple leaves can be applied for different date ranges

10. **Leave Days Calculation**
    - System automatically calculates number of leave days
    - Excludes weekends (Saturday, Sunday) from count
    - Excludes declared holidays from count
    - Half-day leaves counted as 0.5 days
    - Continuous leave across multiple weeks calculated correctly

11. **Leave Balance Validation**
    - Real-time balance check before application submission
    - If requested days exceed available balance: Application blocked
    - Error message: "Insufficient leave balance. Available: X days, Requested: Y days"
    - Pending leave requests temporarily hold balance (not visible to user)

12. **Leave Application Status**
    - **Pending:** Submitted but not yet reviewed by manager
    - **Approved:** Approved by reporting manager
    - **Rejected:** Rejected by manager with reason
    - **Cancelled:** Cancelled by employee (before approval or after with manager permission)

13. **Leave Attachment Handling**
    - Attachments uploaded to Azure Blob Storage
    - File size validation (max 5 MB)
    - Supported formats: PDF, JPG, PNG, DOC, DOCX
    - Attachment URL stored in database
    - Manager can view attachments during approval process

### Leave Approval Workflow

14. **Reporting Manager-Based Routing**
    - Leave request automatically routed to employee's primary reporting manager
    - Manager email from EmploymentDetail table
    - If manager not assigned: Request routed to HR or department head (fallback mechanism unclear)

15. **Leave Approval**
    - Manager reviews leave request with details: Employee, dates, type, reason, attachment
    - Manager can view team leave calendar to check overlaps
    - Manager clicks Approve button
    - Approval date recorded
    - Optional comments/approval notes
    - Leave balance deducted from available and added to utilized
    - Employee receives approval email notification

16. **Leave Rejection**
    - Manager can reject leave request
    - Rejection reason mandatory (text field)
    - Rejection date recorded
    - Balance hold released
    - Employee receives rejection email with reason

17. **Manager Dashboard for Leave Approval**
    - Pending leave requests count badge on dashboard
    - List view of pending requests with filters (employee, date, type)
    - Bulk approval capability (implementation details unclear)
    - Team leave calendar view for planning

### Leave Calendar

18. **Monthly Calendar View**
    - Calendar displays all leaves for selected month
    - Color-coded by leave type (CL, EL, SL, Comp-Off, Swap Holiday)
    - Employee can see only own leaves
    - Manager can see team leaves
    - HR can see all leaves or department-wise

19. **Leave Overlap Detection**
    - Calendar highlights overlapping leaves in team (visual indication)
    - Manager alerted if too many team members on leave on same date
    - Threshold configuration not visible in codebase

20. **Calendar Filters**
    - Filter by employee (for managers/HR)
    - Filter by department
    - Filter by leave type
    - Filter by leave status (Approved, Pending, Rejected)
    - Date range selection

### Leave Reports & History

21. **Employee Leave History**
    - List of all leave applications with status
    - Filter by date range, leave type, status
    - Sort by application date, leave start date
    - Export to Excel for personal records

22. **Leave Utilization Tracking**
    - AccrualUtilizedLeave table maintains complete audit trail
    - Tracks accruals (monthly credits, carry-overs)
    - Tracks utilizations (approved leaves)
    - Tracks adjustments (manual additions/deductions)
    - Each entry with date, type, days, remarks

23. **Leave Summary Report**
    - Total leave balance by type
    - Year-to-date utilization by type
    - Pending leave requests
    - Carry-over from previous year
    - Available balance for planning

### Comp-Off Management

24. **Comp-Off Request Submission**
    - Employee submits comp-off request for extra worked hours or working on holiday
    - Worked date selection
    - Hours worked entry (for overtime) or reason (for holiday work)
    - Manager approval details (who approved the extra work)
    - Attachment support (email approvals, timesheet proof)

25. **Comp-Off Approval Workflow**
    - Comp-off request routed to reporting manager
    - Manager verifies actual extra work performed
    - On approval: Comp-off days credited to employee leave balance
    - Comp-off balance shown separately in EmployeeLeave table
    - Employee can use comp-off like regular leave

26. **Comp-Off Validity & Expiry**
    - Comp-off leaves have validity period (typically 90 days from earning date)
    - Scheduled job runs every 2 minutes to check expiry
    - If comp-off expires without utilization: Automatically deducted from balance
    - Expiry notification email sent to employee
    - Expired comp-off tracked in AccrualUtilizedLeave for audit

### Swap Holiday Management

27. **Swap Holiday Request**
    - Employee requests to swap declared holiday with another working day
    - Selects holiday date to work and working date to take off
    - Reason for swap (project deadline, personal commitment)
    - Manager approval required

28. **Swap Holiday Approval**
    - Manager reviews swap request
    - Verifies business justification
    - Approves or rejects with reason
    - On approval: Holiday marked as working day, chosen day marked as off
    - Attendance system updated to reflect swap

### Email Notifications

29. **Leave Application Notification**
    - Email sent to reporting manager on leave submission
    - Email contains employee name, leave type, dates, reason
    - Link to approve/reject (if web-based approval implemented)

30. **Leave Approval Notification**
    - Email sent to employee on leave approval
    - Email contains approved dates, leave type
    - Updated balance information

31. **Leave Rejection Notification**
    - Email sent to employee on leave rejection
    - Email contains rejection reason
    - Encouragement to reapply if circumstances change

32. **Comp-Off Expiry Notification**
    - Email sent to employee before comp-off expiry (advance warning not visible)
    - Email sent on actual expiry with days forfeited

## Data Models / Entities Used

### Primary Entities:
- **LeaveType**: Master table with leave type definitions (CL, EL, SL, Comp-Off, Swap Holiday)
- **EmployeeLeave**: Employee-level leave balance per leave type (EmployeeId, LeaveTypeId, TotalBalance, AvailableBalance, UtilizedBalance, CarryOverBalance)
- **AppliedLeave**: Leave application records (EmployeeId, LeaveTypeId, StartDate, EndDate, Slot, Reason, AttachmentURL, Status, ApproverComments, ApprovedDate, RejectedDate, RejectionReason)
- **AccrualUtilizedLeave**: Audit trail for all balance changes (EmployeeId, LeaveTypeId, TransactionType, Days, Date, Remarks)
- **CompOffAndSwapHolidayDetail**: Comp-off and swap holiday requests (EmployeeId, Type, WorkedDate, RequestedOffDate, Hours, Reason, Status, ApprovalDate)

### Related Entities:
- **EmployeeData**: Employee master for balance ownership
- **EmploymentDetail**: Reporting manager for approval routing
- **NotificationTemplate**: Email templates for leave notifications

### DTOs:
- **LeaveBalanceDto**: Employee leave balance response (LeaveType, Total, Available, Utilized)
- **AppliedLeaveRequestDto**: Leave application request (LeaveTypeId, StartDate, EndDate, Slot, Reason, Attachment)
- **AppliedLeaveResponseDto**: Leave application details with status and approver info
- **LeaveApprovalRequestDto**: Approval/rejection request (LeaveId, Status, Comments)
- **LeaveCalendarDto**: Calendar view data (Date, EmployeeName, LeaveType, Status)
- **CompOffRequestDto**: Comp-off request data
- **SwapHolidayRequestDto**: Swap holiday request data

## External Dependencies or Services

1. **Azure Blob Storage**
   - Purpose: Store leave attachment documents (medical certificates, approvals)
   - Upload via BlobStorageClient
   - Generate SAS URL for secure download

2. **Email Service**
   - Purpose: Send leave notification emails
   - Integration via EmailNotificationService
   - Templates: LeaveApplied, LeaveApproved, LeaveRejected, CompOffExpiry

3. **Quartz.NET Scheduled Jobs**
   - MonthlyCreditLeaveBalanceJob: Runs 1st of month at midnight for accrual
   - CompOffExpireJob: Runs every 2 minutes to check and expire comp-offs

## APIs or Endpoints

### GET /api/LeaveManagement/GetEmployeeLeaveById/{employeeId}
- **Purpose:** Fetch employee leave balances for all leave types
- **Response:** Array of leave types with total, available, utilized balances
- **Auth Required:** Yes
- **Permissions:** Leave.View (or Employee.ViewOwn for own leaves)

### POST /api/LeaveManagement/UpdateLeaves
- **Purpose:** Manually adjust employee leave balance (HR function)
- **Request:** EmployeeId, LeaveTypeId, Days to add/deduct, Reason
- **Process:** Update EmployeeLeave balance, create AccrualUtilizedLeave audit record
- **Auth Required:** Yes
- **Permissions:** Leave.Adjust

### POST /api/LeaveManagement/GetAccrualsUtilized/{employeeId}
- **Purpose:** Fetch leave accrual and utilization history for audit
- **Response:** Array of AccrualUtilizedLeave records with date, type, days, remarks
- **Auth Required:** Yes
- **Permissions:** Leave.ViewHistory

### POST /api/LeaveManagement/GetCalendarLeaves
- **Purpose:** Fetch leaves for calendar view with filters
- **Request:** EmployeeId (optional), DepartmentId (optional), Month, Year, Status filter
- **Response:** Array of leave records formatted for calendar display
- **Auth Required:** Yes
- **Permissions:** Leave.ViewCalendar

### GET /api/LeaveManagement/GetEmployeeLeaveTypes
- **Purpose:** Fetch all active leave types for dropdown
- **Response:** Array of leave types (Id, Name, Description)
- **Auth Required:** Yes
- **Permissions:** Leave.Apply

### POST /api/LeaveManagement/GetAppliedLeaves
- **Purpose:** Fetch leave applications with filters and pagination
- **Request:** EmployeeId (optional), Status, DateRange, PageIndex, PageSize
- **Response:** Paginated list of AppliedLeave records with employee and approver details
- **Auth Required:** Yes
- **Permissions:** Leave.View (HR/Manager) or Leave.ViewOwn (Employee)

### GET /api/LeaveManagement/GetEmployeeLeaveBalanceById/{employeeId}
- **Purpose:** Fetch detailed leave balance for specific employee
- **Response:** Leave balance breakdown by type with accrual details
- **Auth Required:** Yes
- **Permissions:** Leave.ViewBalance

### POST /api/LeaveManagement/ApproveOrRejectLeave
- **Purpose:** Approve or reject leave application (Manager/HR function)
- **Request:** LeaveId, Status (Approved/Rejected), Comments
- **Process:**
  - Update AppliedLeave status and approval details
  - If approved: Deduct from available balance, add to utilized
  - If rejected: Release balance hold
  - Send notification email to employee
- **Auth Required:** Yes
- **Permissions:** Leave.Approve

### POST /api/LeaveManagement/ImportLeaveExcel
- **Purpose:** Bulk import leave balances via Excel file
- **Request:** Excel file (multipart form data)
- **Process:**
  - Parse Excel rows (EmployeeId, LeaveTypeId, Days)
  - Validate employee and leave type existence
  - Update EmployeeLeave balances
  - Return success/error report
- **Auth Required:** Yes
- **Permissions:** Leave.Import

### POST /api/LeaveManagement/GetEmployeeLeaveRequest
- **Purpose:** Fetch leave requests for manager approval (assigned to me)
- **Request:** ManagerId (from token), Status, DateRange
- **Response:** Array of pending leave requests for manager's team
- **Auth Required:** Yes
- **Permissions:** Leave.ApproveTeam

### POST /api/LeaveManagement/TriggerCronForLeaveBalance
- **Purpose:** Manually trigger leave accrual job (Dev/Admin function)
- **Process:** Execute MonthlyCreditLeaveBalanceJob immediately
- **Response:** Job execution status
- **Auth Required:** Yes
- **Permissions:** System.TriggerJobs

### POST /api/LeaveManagement/GetCompOffAndSwapHolidayDetails
- **Purpose:** Fetch comp-off and swap holiday requests
- **Request:** EmployeeId (optional), Status, DateRange
- **Response:** Array of CompOffAndSwapHolidayDetail records
- **Auth Required:** Yes
- **Permissions:** Leave.ViewCompOff

### POST /api/LeaveManagement/ApproveOrRejectCompOffSwapHoliday
- **Purpose:** Approve or reject comp-off or swap holiday request
- **Request:** RequestId, Status (Approved/Rejected), Comments
- **Process:**
  - Update CompOffAndSwapHolidayDetail status
  - If comp-off approved: Credit days to EmployeeLeave
  - If swap holiday approved: Update attendance calendar
  - Send notification to employee
- **Auth Required:** Yes
- **Permissions:** Leave.ApproveCompOff

## UI Components / Screens

### Leave Application Form
- **Components:**
  - Leave type dropdown (CL, EL, SL, Comp-Off, Swap Holiday)
  - Start date picker
  - End date picker
  - Slot radio buttons (Full Day, First Half, Second Half)
  - Reason text area
  - Attachment upload button
  - Available balance display (real-time)
  - Calculated leave days display
  - Submit button
- **Validation:**
  - Dates cannot be in past (except sick leave)
  - End date must be >= start date
  - Reason mandatory (minimum characters)
  - Balance validation before submission
- **Behavior:**
  - On leave type change: Update available balance display
  - On date change: Calculate leave days and validate balance
  - On submit: Upload attachment to blob, create leave request, show success message

### Leave Balance Dashboard
- **Components:**
  - Cards for each leave type showing:
    - Leave type icon and name
    - Total balance
    - Available balance (highlighted)
    - Utilized balance (year-to-date)
    - Carry-over balance (if applicable)
  - Apply Leave button
  - Leave history link
- **Behavior:**
  - Real-time balance updates from API
  - Visual indicators for low balance (color change)
  - Hover tooltip with balance breakdown

### Manager Leave Approval Page
- **Components:**
  - Data table with columns:
    - Employee Name
    - Leave Type
    - Start Date - End Date
    - Days
    - Reason
    - Status (Pending badge)
    - Actions (Approve/Reject buttons)
  - Filters: Employee, Department, Leave Type, Date Range
  - Team leave calendar view toggle
  - Bulk approval checkbox selection
- **Behavior:**
  - Click employee name: View employee leave history
  - Click Approve: Prompt for comments, approve leave
  - Click Reject: Prompt for rejection reason, reject leave
  - Bulk approve: Select multiple, approve all with same comments

### Leave Calendar View
- **Components:**
  - Monthly calendar grid
  - Color-coded leave indicators:
    - Casual Leave: Blue
    - Earned Leave: Green
    - Sick Leave: Red
    - Comp-Off: Orange
    - Swap Holiday: Purple
  - Legend for leave types
  - Month/Year navigation
  - Employee filter (for managers/HR)
  - Department filter (for HR)
- **Behavior:**
  - Hover on date: Tooltip with leave details (employee, type, status)
  - Click on date: View all leaves on that date
  - Multi-day leaves span across dates
  - Weekend dates grayed out

### Leave History Page
- **Components:**
  - Data table with columns:
    - Application Date
    - Leave Type
    - Start Date - End Date
    - Days
    - Status (Approved/Rejected/Pending badge)
    - Approver Name
    - Approved/Rejected Date
    - Comments
  - Filters: Leave Type, Status, Date Range
  - Search by reason
  - Export to Excel button
- **Behavior:**
  - Click row: View detailed leave application with attachment
  - Download attachment (if present)
  - Status badge color-coded (Green: Approved, Red: Rejected, Yellow: Pending)

### Comp-Off Request Form
- **Components:**
  - Worked date picker
  - Hours worked number input
  - Reason for extra work text area
  - Manager approval details (optional)
  - Attachment upload (email approvals, timesheet)
  - Submit button
- **Validation:**
  - Worked date cannot be in future
  - Hours must be > 0
  - Reason mandatory
- **Behavior:**
  - Calculate comp-off days based on hours (e.g., 8 hours = 1 day)
  - Submit request to manager
  - Show validity expiry date after approval

## Workflow or Process Description

### Monthly Leave Accrual Workflow:
1. Cron trigger: 1st of month at 00:00
2. MonthlyCreditLeaveBalanceJob starts execution
3. Fetch all active employees from EmployeeData (IsActive=true, ExitDate=null)
4. For each employee:
   a. Fetch EmployeeLeave records
   b. Check if CL record exists, if not create with balance=0
   c. Check if EL record exists, if not create with balance=0
   d. Credit CL: AvailableBalance += 0.5, TotalBalance += 0.5
   e. Credit EL: AvailableBalance += 1.5, TotalBalance += 1.5
   f. Create AccrualUtilizedLeave records (Type: Accrual, Days: 0.5 for CL, 1.5 for EL, Remarks: "Monthly accrual for [Month]")
5. If current month is January (CarryOverMonth):
   a. For each employee with previous year balance:
      i. Calculate unused CL from previous year
      ii. If unused CL > 3 days: Carry over 3 days, forfeit excess
      iii. If unused CL <= 3 days: Carry over all
      iv. Calculate unused EL from previous year
      v. If unused EL > 15 days: Carry over 15 days, forfeit excess
      vi. If unused EL <= 15 days: Carry over all
      vii. Update CarryOverBalance field
      viii. Create AccrualUtilizedLeave records (Type: CarryOver, Days: carried days, Remarks: "Annual carry-over from [Previous Year]")
      ix. Create AccrualUtilizedLeave records for forfeited leaves (Type: Forfeiture, Days: negative, Remarks: "Forfeited unused leave")
6. Log execution summary (employees processed, total CL credited, total EL credited, carry-over processed)
7. Job completes

### Leave Application & Approval Workflow:
1. Employee logs into HRMS
2. Navigates to Leave Management → Apply Leave
3. Selects leave type (e.g., Casual Leave)
4. System displays current balance: Available: 2.5 days, Utilized: 1.0 day, Total: 3.5 days
5. Employee selects start date: June 15, 2025
6. Employee selects end date: June 16, 2025
7. Employee selects slot: Full Day
8. System calculates leave days: 2 days (excludes weekend if any)
9. System validates balance: 2.5 available >= 2 requested → Valid
10. Employee enters reason: "Personal work"
11. Employee uploads medical certificate (if sick leave)
12. Employee clicks Submit
13. Frontend uploads attachment to Azure Blob, receives filename
14. Frontend sends leave application request to backend with attachment filename
15. Backend creates AppliedLeave record (Status: Pending)
16. Backend creates temporary balance hold (logic unclear, may just be status check)
17. Backend fetches employee's reporting manager from EmploymentDetail
18. Backend queues email notification to manager via EmailNotificationService
19. Backend returns success response
20. Frontend displays success message: "Leave application submitted successfully. Manager will be notified."
21. SendEmailNotificationJob picks up queued email
22. Manager receives email: "New leave request from [Employee Name] for [Leave Type] from [Start Date] to [End Date]"
23. Manager logs into HRMS
24. Manager navigates to Leave Management → Pending Approvals
25. Manager sees pending leave request in table
26. Manager clicks View to see details (employee, dates, reason, attachment)
27. Manager checks team calendar for overlaps
28. Manager decides to approve
29. Manager clicks Approve button
30. Manager enters approval comments: "Approved for personal work"
31. Manager clicks Confirm
32. Frontend sends approval request to backend
33. Backend updates AppliedLeave record (Status: Approved, ApproverComments, ApprovedDate)
34. Backend updates EmployeeLeave: AvailableBalance -= 2.0, UtilizedBalance += 2.0
35. Backend creates AccrualUtilizedLeave record (Type: Utilization, Days: -2.0, Remarks: "Leave approved for June 15-16")
36. Backend queues approval email notification to employee
37. Backend returns success response
38. Frontend displays success message to manager: "Leave approved successfully"
39. SendEmailNotificationJob sends email to employee
40. Employee receives email: "Your leave request for [Leave Type] from [Start Date] to [End Date] has been approved by [Manager Name]"
41. Employee checks leave balance: Available: 0.5 days (2.5 - 2.0), Utilized: 3.0 days (1.0 + 2.0)

### Comp-Off Expiry Workflow:
1. Cron trigger: Every 2 minutes
2. CompOffExpireJob starts execution
3. Fetch all active comp-off leaves (EmployeeLeave where LeaveType=CompOff, AvailableBalance > 0)
4. For each comp-off balance:
   a. Fetch CompOffAndSwapHolidayDetail records for this employee (Type: CompOff, Status: Approved)
   b. For each comp-off earning:
      i. Calculate validity expiry date = Earning date + Validity period (typically 90 days)
      ii. If current date > expiry date and comp-off not utilized:
         - Fetch EmployeeLeave for CompOff type
         - Deduct expired days from AvailableBalance
         - Update EmployeeLeave record
         - Create AccrualUtilizedLeave record (Type: Expiry, Days: negative, Remarks: "Comp-off expired - earned on [Date]")
         - Mark CompOffAndSwapHolidayDetail as expired
         - Queue expiry notification email to employee
5. Log execution summary (comp-offs checked, expired count, total days forfeited)
6. Job completes
7. SendEmailNotificationJob sends expiry emails
8. Employee receives email: "Your comp-off of [Days] days earned on [Date] has expired as per policy. Please utilize comp-offs within validity period."

## Error Handling / Edge Cases

### Insufficient Leave Balance:
- Leave application with days > available balance rejected during submission
- Error message: "Insufficient leave balance. You have X days available but requesting Y days."
- Frontend displays error toast, prevents submission

### Leave Application for Past Dates:
- Standard leave types cannot be applied for past dates
- Sick leave allows past dates (with medical certificate)
- Validation error: "Cannot apply leave for past dates. Please contact HR for backdated leave requests."

### Overlapping Leave Applications:
- Employee applies leave for dates that overlap with existing pending/approved leave
- Backend checks for overlaps in AppliedLeave table
- Error: "Leave request overlaps with existing leave application from [Date] to [Date]"

### Manager Not Assigned:
- Employee with no reporting manager applies leave
- System falls back to HR department or designated approver (implementation unclear)
- Possible error: "Reporting manager not assigned. Please contact HR."

### Comp-Off Expiry Edge Cases:
- Comp-off earned on last day of validity period
- Comp-off partially utilized before expiry (only unutilized portion expires)
- Multiple comp-offs with different expiry dates (each tracked individually)

### Carry-Over Calculation Edge Cases:
- Employee joins mid-year (carry-over based on prorated balance unclear)
- Employee on long leave during carry-over month (carry-over still processed)
- Leave balance becomes negative due to early leave credit (resolved in accrual month)

### Concurrent Leave Approval/Rejection:
- Manager approves leave, simultaneously HR rejects the same leave
- Last write wins (timestamp-based), creates inconsistency
- Mitigation: Optimistic concurrency control needed (not visible in codebase)

### Leave Application During Notice Period:
- Employee with resignation accepted applies leave
- Validation: Leave cannot extend beyond last working date
- Error: "Leave request extends beyond your last working date ([Date]). Please adjust dates."

### Excel Import Errors:
- Invalid EmployeeId in import file: Row skipped, error report generated
- Invalid LeaveTypeId: Row skipped with error
- Negative leave days: Validation error
- Missing required columns: Import rejected with column validation error

## Integration Points with Other Modules

### Integration with Employee Management:
- EmployeeData provides employee list for leave balance creation
- Active employee status determines eligibility for leave accrual
- Employee exit date restricts leave applications

### Integration with Employment Details:
- Reporting manager from EmploymentDetail used for leave approval routing
- Department and team information for calendar filtering
- Joining date for prorated accrual calculations

### Integration with Notification System:
- Leave application triggers email to manager
- Leave approval triggers email to employee
- Leave rejection triggers email to employee
- Comp-off expiry triggers email to employee

### Integration with Attendance Management:
- Approved leaves marked in attendance calendar
- Attendance system shows leave days instead of absent
- Integration ensures payroll accuracy

### Integration with Exit Management:
- Resignation clearance includes leave balance encashment calculation
- HR clearance captures EL buyout days and amount
- Final settlement considers unutilized leave balance

### Integration with Dashboard:
- Leave balance widget on employee dashboard
- Pending leave approvals count on manager dashboard
- Team leave calendar on manager dashboard

### Integration with Payroll (Implied, not visible in codebase):
- Leave utilization data fed to payroll for salary calculation
- Unpaid leaves deducted from salary
- Leave encashment amount added to final settlement

## Dependencies / Reused Components

### Backend Dependencies:
- **BlobStorageClient**: Upload and retrieve leave attachments
- **EmailNotificationService**: Send leave-related email notifications
- **Quartz.NET**: Schedule monthly accrual and comp-off expiry jobs
- **Dapper**: Execute stored procedures for leave queries
- **AutoMapper**: Map between leave entities and DTOs

### Frontend Dependencies:
- **Material-UI Date Pickers**: Date selection for leave application
- **React Big Calendar**: Leave calendar visualization
- **React Hook Form**: Leave application form management
- **SWR**: Fetch and cache leave balance data
- **Axios**: API calls for leave CRUD operations

### Shared Utilities:
- **DateHelper**: Calculate leave days excluding weekends/holidays
- **FileValidator**: Validate attachment file size and type
- **ExcelReader**: Parse Excel file for bulk import

### Configuration:
- **LeavesAccrualOptions**: Monthly credit amounts and carry-over limits
- **JobTypeDurations**: Probation, Training, Confirmed durations (may affect leave eligibility)
- **SystemEmailConfig**: Email templates for leave notifications

## Testing Artifacts

Testing artifacts not found in codebase. Recommended tests:

### Unit Tests:
- Leave days calculation with various date ranges, weekends, holidays
- Leave balance validation logic (sufficient/insufficient)
- Carry-over calculation with edge cases (exactly limit, over limit, under limit)
- Comp-off expiry date calculation
- Leave accrual for mid-month joiners

### Integration Tests:
- Leave application end-to-end (submit → route to manager → approve → balance update)
- Leave rejection flow with balance hold release
- Monthly accrual job execution with database updates
- Comp-off expiry job execution
- Excel import with valid and invalid data

### Performance Tests:
- Monthly accrual job with 10,000 employees
- Leave calendar query with 1 year data for 500 employees
- Concurrent leave approvals by multiple managers

---

**Module Dependencies:**
- **Depends On:** Authentication, Employee Management, Employment Details, Notification System
- **Used By:** Attendance Management, Exit Management, Dashboard, Payroll (external)

**Compliance Considerations:**
- Leave accrual rates and carry-over limits must comply with labor laws
- Audit trail (AccrualUtilizedLeave) supports compliance reporting
- Sick leave may require medical certificate validation
- Leave policy documentation should be referenced in company policies module
