# Module 02: Employee Management - Part 4

## UI Components / Screens

### Employee Onboarding Form (Add Employee)
- **Location:** `/employees/add-employee`
- **Components:**
  - Multi-step wizard or single-page form
  - Step 1: Basic Information
    - First name, Middle name, Last name
    - Employee code (auto-fetched from API, editable)
    - Gender radio buttons
    - Date of birth date picker
    - Blood group dropdown
    - Marital status dropdown
  - Step 2: Employment Details
    - Official email (with validation)
    - Joining date date picker
    - Department dropdown
    - Designation dropdown
    - Team dropdown (filtered by department)
    - Reporting manager searchable dropdown
    - Branch/Location dropdown
    - Employment status dropdown
    - Role dropdown
    - Time Doctor user ID (auto-fetched display-only field)
  - Step 3: Experience
    - Total experience (years and months number inputs)
    - Relevant experience (years and months)
  - Step 4: Background Verification
    - Background verification status dropdown
    - Criminal verification status dropdown
    - LinkedIn profile URL
  - Submit button
- **Validation:**
  - Real-time field validation
  - Email uniqueness check on blur
  - Employee code uniqueness check
  - Required field indicators (*)
  - Date validations (joining date cannot be future)
- **Behavior:**
  - Fetch latest employee code on page load
  - Fetch Time Doctor ID when email entered
  - If Time Doctor ID not found: Show warning message "Time Doctor user not found. Manual attendance will be enabled."
  - On successful submit: Redirect to employee list with success toast
  - On error: Display validation errors inline

### Employee List/Directory Page
- **Location:** `/employees/employee-list`
- **Components:**
  - Search and filter panel:
    - Search box (name, email, employee code)
    - Department multi-select dropdown
    - Designation multi-select dropdown
    - Team multi-select dropdown
    - Employment status checkbox group (Active, Inactive, Resigned, etc.)
    - Joining date range picker (from-to)
    - Search button, Clear filters button
  - Data table:
    - Columns: Profile Picture, Employee Code, Name, Email, Department, Designation, Team, Joining Date, Status, Actions
    - Sortable columns (click column header)
    - Row actions: View Profile, Edit, Archive
    - Pagination controls (Previous, 1, 2, 3, Next)
    - Page size dropdown (10, 25, 50, 100 per page)
    - Total records count display
  - Toolbar:
    - Add Employee button
    - Export to Excel button
    - Refresh button
  - Status badges:
    - Active: Green badge
    - Inactive: Gray badge
    - Resigned: Orange badge
    - Terminated: Red badge
- **Behavior:**
  - Default view: Active employees only
  - Click employee name/code: Navigate to employee profile
  - Click Edit: Navigate to edit employment details page
  - Click Archive: Confirmation dialog, then archive employee
  - Export: Download filtered employee list as Excel file
  - Pagination: Load data via API on page change
  - Search: Debounced search (300ms delay)

### Employee Profile Page
- **Location:** `/employees/profile/{employeeId}`
- **Components:**
  - Profile header section:
    - Large profile picture (with edit icon on hover for own profile)
    - Employee name and employee code
    - Department and designation badges
    - Email and phone icons with details
    - Profile completeness progress bar
    - Edit Profile button (if permissions allow)
  - Tab navigation:
    - Personal Details tab
    - Employment Details tab
    - Documents tab
    - Family & Nominees tab
    - Education & Certificates tab
    - Previous Employment tab
  - Personal Details tab:
    - Personal information card:
      - Father's name, DOB, Gender, Blood group, Marital status
      - Phone, Alternate phone, Personal email
      - Emergency contact person and number
      - Nationality, Interests
      - Edit button (if editable)
    - Address information card:
      - Current address details
      - Permanent address details
      - "Same as current address" indicator
      - Edit button
    - Bank details card (visible to HR/Admin only):
      - Bank name, Account number (partially masked for non-HR)
      - IFSC code, Branch name
      - Edit button
    - Statutory information card (visible to HR only):
      - PAN, Aadhaar, Passport details
      - PF, ESI, UAN numbers
      - Edit button
  - Employment Details tab:
    - Employment card:
      - Employee code, Official email
      - Joining date, Employment status
      - Department, Designation, Team
      - Reporting manager name (clickable link to manager profile)
      - Branch/Location
      - Role
      - Time Doctor User ID
      - Edit button (HR only)
    - Experience card:
      - Total experience, Relevant experience
      - Edit button
    - Background verification card:
      - Verification statuses
      - Verification dates
      - Edit button (HR only)
  - Documents tab:
    - Document type filter dropdown
    - Data table with columns: Document Type, Document Number, Expiry Date, Upload Date, Actions
    - Add Document button
    - Row actions: View/Download, Edit, Delete
    - Expiry indicator (red badge if document expired)
  - Family & Nominees tab:
    - Family Details section:
      - Family members list
      - Add Family Member button
      - Each row: Name, Relationship, DOB, Dependent status, Actions (Edit, Delete)
    - Nominee Details section:
      - Nominees list
      - Add Nominee button
      - Each row: Nominee name, Relationship, Percentage share, Document, Actions (Edit, Delete)
  - Education & Certificates tab:
    - Educational Qualifications section:
      - Education list
      - Add Qualification button
      - Each row: Qualification, Specialization, University, Year, Marks, Certificate, Actions
    - Certificates section:
      - Certificates list
      - Add Certificate button
      - Each row: Certificate name, Expiry date, Document, Actions
  - Previous Employment tab:
    - Previous employers list
    - Add Previous Employer button
    - Each employer card:
      - Company name, Designation
      - Duration (start date - end date)
      - Reason for leaving
      - Manager details
      - Documents list with download links
      - Professional references list
      - Edit, Delete buttons
- **Behavior:**
  - Profile picture hover: Show "Change Picture" option
  - Tab switching: Load tab content via API (lazy loading)
  - Edit buttons: Navigate to respective edit forms or open inline edit mode
  - Download documents: Generate SAS URL and open in new tab
  - Add actions: Open modal forms
  - Delete actions: Confirmation dialog before delete
  - Profile completeness: Update dynamically as sections completed

### Personal Details Form (Add/Edit)
- **Location:** Modal or `/employees/personal-details/{employeeId}`
- **Components:**
  - Personal information section:
    - Father's name, DOB, Gender, Blood group, Marital status
    - Phone, Alternate phone, Personal email
    - Emergency contact person, Emergency contact number
    - Nationality, Interests
  - Current address section:
    - Address line 1, Address line 2
    - Country, State, City cascading dropdowns
    - Pincode
  - Permanent address section:
    - Checkbox: "Same as current address"
    - Address fields (disabled if checkbox checked)
  - Statutory details section (visible to HR only):
    - PAN, Aadhaar, Passport number and expiry
    - PF number and date, ESI number, UAN
  - Save button, Cancel button
- **Validation:**
  - Phone number format validation
  - Email format validation
  - DOB: Age must be >= 18 years
  - PAN format: ABCDE1234F
  - Aadhaar format: 12 digits
- **Behavior:**
  - "Same as current address" checkbox: Auto-fill permanent address fields
  - Country dropdown change: Reload state dropdown
  - State dropdown change: Reload city dropdown
  - Save: Validate and submit, show success toast, refresh profile

### Document Upload Form
- **Location:** Modal popup
- **Components:**
  - Document type dropdown
  - Document number text input
  - Document expiry date picker (if applicable for selected type)
  - File upload drag-drop area or browse button
  - File preview (if image) or filename display
  - Upload button, Cancel button
- **Validation:**
  - File size: Max 5 MB
  - File type: PDF, JPG, PNG only
  - Document number format validation (if type-specific)
  - Expiry date cannot be past (for new documents)
- **Behavior:**
  - Drag-drop or click to browse
  - File selected: Show filename and size
  - Upload progress bar during upload
  - Success: Close modal, refresh documents list, show toast
  - Error: Display error message inline

### Nominee Form (Add/Edit)
- **Location:** Modal popup
- **Components:**
  - Nominee name text input
  - Relationship dropdown
  - Date of birth date picker
  - Contact number text input
  - Address text area
  - Percentage share number input (with % symbol)
  - Nominee type checkboxes (Insurance, PF, Gratuity)
  - Identity proof file upload
  - Save button, Cancel button
- **Validation:**
  - Required fields: Name, Relationship, DOB, Contact
  - Percentage share: 0-100
  - Total percentage validation: Sum of all nominees = 100% (checked on save)
  - File size and type validation
- **Behavior:**
  - On add: Check current total percentage, calculate remaining
  - On save: Validate total percentage across all nominees
  - If total > 100%: Error message "Total percentage share exceeds 100%"
  - If total < 100%: Warning message "Total percentage share is less than 100%. Remaining: X%"

### Educational Details Form
- **Location:** Modal popup
- **Components:**
  - Qualification type dropdown
  - Specialization/Field of study text input
  - University searchable dropdown (with "Add new" option)
  - Year of passing number input
  - Marks/Percentage/CGPA text input
  - Degree certificate file upload
  - Save button, Cancel button
- **Validation:**
  - Required fields: Qualification, Specialization, University, Year
  - Year: Cannot be future year
  - File validation
- **Behavior:**
  - University dropdown: Type-ahead search
  - If university not found: Option to add new university
  - Multiple documents: Upload button to add more certificates

### Certificate Upload Form
- **Location:** Modal popup
- **Components:**
  - Certificate name text input
  - Certificate expiry date picker (optional)
  - Certificate file upload
  - Save button, Cancel button
- **Validation:**
  - Certificate name required
  - File validation
- **Behavior:**
  - Expiry date optional (for non-expiring certificates)
  - File preview if PDF

### Previous Employer Form
- **Location:** Modal or separate page
- **Components:**
  - Company name text input
  - Designation text input
  - Employment start date date picker
  - Employment end date date picker
  - Duration display (auto-calculated from dates)
  - Reason for leaving dropdown or text area
  - Manager name, Manager contact
  - Company address text area
  - HR contact details
  - Professional references section:
    - Add Reference button
    - Reference list (Name, Designation, Contact, Email, Actions)
  - Documents section:
    - Document type dropdown
    - File upload
    - Documents list
  - Save button, Cancel button
- **Validation:**
  - Required fields: Company name, Designation, Start date, End date
  - End date must be after start date
  - Duration auto-calculated and validated
- **Behavior:**
  - Date change: Recalculate duration
  - Add reference: Inline form to add reference details
  - Add document: File upload section
  - Multiple documents supported

### Employment Details Edit Form
- **Location:** `/employees/edit-employment/{employeeId}` or inline edit
- **Components:**
  - Similar to Add Employee form but for editing existing employee
  - Department, Designation, Team, Reporting Manager dropdowns
  - Employment status dropdown
  - Role dropdown
  - Time Doctor User ID display-only
  - Update button, Cancel button
- **Validation:**
  - Same as add employee form
- **Behavior:**
  - Load existing values on form open
  - On update: Validate and save, show success message

### Employee Archive Confirmation Dialog
- **Components:**
  - Warning icon
  - Message: "Are you sure you want to archive [Employee Name]? This will disable their system access."
  - Confirm button (red), Cancel button
- **Behavior:**
  - Confirm: Archive employee via API, refresh employee list, show success toast
  - Cancel: Close dialog

### Excel Export Configuration (if applicable)
- **Location:** Modal or inline on employee list page
- **Components:**
  - Column selection checkboxes (select which columns to export)
  - Export format radio buttons (XLSX, CSV)
  - Export button, Cancel button
- **Behavior:**
  - Select all/deselect all option
  - Export: Generate file with selected columns and applied filters, download automatically

### Profile Picture Crop/Editor (if implemented)
- **Location:** Modal after image selection
- **Components:**
  - Image preview with crop area
  - Crop tools (zoom in/out, rotate)
  - Aspect ratio options (Square, Original)
  - Save button, Cancel button
- **Behavior:**
  - User can adjust crop area
  - Save: Upload cropped image

## Workflow or Process Description

### Employee Onboarding Workflow:

1. **HR Initiation:**
   - HR receives new joiner details from recruitment team
   - HR logs into HRMS
   - Navigates to Employees → Add Employee

2. **Employee Code Assignment:**
   - System auto-fetches latest employee code (e.g., EMP-0156)
   - HR can override if needed (e.g., for lateral entry with specific code)

3. **Basic Information Entry:**
   - HR enters employee name, DOB, gender, blood group, marital status
   - Enters contact details

4. **Employment Details Entry:**
   - HR enters official email address (e.g., john.doe@company.com)
   - System checks email uniqueness
   - Selects joining date
   - Selects department, designation, team from dropdowns
   - Assigns reporting manager
   - Selects employment status (Permanent, Contract, Probation)
   - Assigns role (default: Employee)

5. **Time Doctor Integration:**
   - When email entered, system calls Time Doctor API
   - If user exists in Time Doctor: TimeDoctorUserId retrieved and stored
   - If not exists: Manual attendance flag enabled, message displayed

6. **Experience Entry:**
   - HR enters total and relevant experience
   - Used for leave calculation and role assignment

7. **Background Verification:**
   - HR enters verification statuses
   - Marks as Pending initially, updated later as verification progresses

8. **Submit and Auto-Processing:**
   - HR clicks Submit button
   - System validates all inputs
   - Creates EmployeeData record with basic info
   - Creates EmploymentDetail record with employment info
   - Fetches gender for leave calculation
   - Calculates opening leave balance based on joining date and gender:
     - If joined Jan 1: Full year leaves (6 CL, 18 EL)
     - If joined mid-year: Pro-rated (e.g., joined July 1: 3 CL, 9 EL)
   - Inserts opening leave balance into EmployeeLeave table
   - Creates attendance configuration:
     - If TimeDoctorUserId found: Automatic attendance enabled
     - Else: Manual attendance enabled
   - Queues welcome email with employee portal link and credentials
   - Returns success message with employee ID

9. **Post-Creation HR Actions:**
   - HR shares employee ID and portal link with new joiner
   - New joiner logs in using SSO (official email)
   - HR guides new joiner to complete profile

10. **Employee Self-Service Profile Completion:**
    - New joiner logs into portal
    - Sees profile completeness indicator at 30%
    - Completes personal details: Father's name, emergency contact, addresses
    - Uploads profile picture
    - Uploads identity documents: Aadhaar, PAN, Passport
    - Enters bank details for salary credit
    - Adds family details for insurance enrollment
    - Adds nominee details for PF/insurance
    - Uploads educational certificates
    - Uploads professional certificates (if any)
    - Enters previous employment history
    - Profile completeness reaches 100%

11. **HR Verification:**
    - HR reviews completed profile
    - Verifies documents uploaded
    - Initiates background verification with previous employers
    - Updates verification status as verification progresses
    - Once all verifications cleared: Confirms employee in system

12. **Onboarding Complete:**
    - Employee marked as fully onboarded
    - Can now access all system features (leave, attendance, assets, etc.)
    - Appears in all active employee lists and reports

### Employee Profile Update Workflow:

1. **Employee Initiates Update:**
   - Employee logs into portal
   - Navigates to My Profile
   - Clicks Edit button on section to update (e.g., Address)

2. **Edit Mode:**
   - Form fields become editable
   - Employee modifies address details
   - Clicks Save

3. **Validation and Save:**
   - System validates inputs
   - Updates Address table
   - Tracks ModifiedBy (EmployeeId) and ModifiedOn (current timestamp)
   - Shows success message

4. **HR Approval (if configured for sensitive fields):**
   - For fields like bank details, phone number: HR approval may be required
   - Change request created and queued for HR approval
   - HR receives notification
   - HR reviews change request
   - HR approves or rejects
   - On approval: Change applied, employee notified
   - On rejection: Employee notified with reason

5. **Change Audit:**
   - All changes logged for audit
   - Change history visible to HR (implementation unclear)

### Department/Designation/Team Transfer Workflow:

1. **HR Initiates Transfer:**
   - Manager or HR decides to transfer employee to different department/team
   - HR navigates to employee profile
   - Clicks Edit Employment Details

2. **Update Department/Designation:**
   - HR selects new department from dropdown
   - Team dropdown reloads with teams in new department
   - HR selects new team
   - HR selects new designation (if promotion/demotion)
   - HR selects new reporting manager

3. **Submit Changes:**
   - HR saves changes
   - System updates EmploymentDetail record
   - (Optional: Transfer effective date may be specified)

4. **Impact on Other Modules:**
   - Leave approver changes to new reporting manager
   - Employee appears in new manager's team list
   - Department-wise reports updated
   - Attendance shift may change based on new department/branch

5. **Notification:**
   - Employee notified of transfer via email
   - New reporting manager notified
   - Old reporting manager notified (pending leaves transferred)

### Employee Exit/Archive Workflow:

1. **Resignation Submitted:**
   - Employee submits resignation (via Exit Management module)
   - Employment status changed to "Resigned"
   - Notice period calculated

2. **Exit Process Completion:**
   - Employee completes exit formalities (via Exit Management module)
   - Final settlement processed
   - Relieving letter issued

3. **Employee Archival:**
   - On last working day, HR archives employee
   - HR navigates to employee profile
   - Clicks Archive button
   - Confirmation dialog: "Are you sure you want to archive? System access will be disabled."
   - HR confirms

4. **Archival Processing:**
   - System sets IsDeleted flag on EmploymentDetail
   - Employee status changed to "Inactive" or "Exited"
   - Employee cannot login to system
   - Employee removed from active employee lists
   - Reporting structure updated (pending approvals transferred to alternate approver)

5. **Data Retention:**
   - All employee data retained in database
   - Visible in HR reports with "Include Archived" filter
   - Used for F&F settlement, experience letters, historical reporting

