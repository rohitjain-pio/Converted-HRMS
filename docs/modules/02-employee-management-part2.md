# Module 02: Employee Management - Part 2

## Implemented Features (Continued)

### Employee Search & Directory

64. **Employee List with Advanced Search**
    - Paginated employee directory
    - Search filters:
      - Employee name (First, Middle, Last name search)
      - Employee code
      - Email address
      - Department
      - Designation
      - Team
      - Employment status (Active, Inactive, Resigned, Terminated)
      - Joining date range
    - Sorting options: Name, Employee code, Joining date, Department
    - Page size configuration (10, 25, 50, 100 records per page)

65. **Employee Quick Search**
    - Type-ahead search by name or employee code
    - Returns top 10 matching results
    - Used in assignment dropdowns (reporting manager, leave approver, project assignment)

66. **Active Employee Filter**
    - Filter to show only active employees
    - Excludes resigned, terminated, inactive employees
    - Used for operational reports and assignments

67. **Employee Count by Status**
    - Total employees count
    - Active employees count
    - Inactive/Archived employees count
    - Displayed on HR dashboard

### Employee Profile View

68. **Complete Employee Profile Page**
    - Sections in profile view:
      - Personal Information (Name, DOB, Gender, Contact, Photo)
      - Employment Details (Code, Email, Department, Designation, Team, Manager, Joining date)
      - Address Information (Current and Permanent)
      - Bank Details
      - Identity Documents
      - Family Details
      - Nominee Information
      - Educational Qualifications
      - Certificates
      - Previous Employment History
      - Current Employer Documents
    - Tab-based or accordion UI for better organization

69. **Profile Completeness Indicator**
    - Profile completion percentage calculation
    - Sections considered:
      - Personal details (20%)
      - Employment details (15%)
      - Address (10%)
      - Bank details (10%)
      - Documents (15%)
      - Education (10%)
      - Family (10%)
      - Nominee (10%)
    - Progress bar displayed on profile page
    - Used for onboarding tracking

70. **Profile Access Permissions**
    - Employee can view own profile (full access)
    - Employee can edit own profile (based on permissions)
    - Manager can view team member profiles (read-only or limited edit)
    - HR can view all profiles (full access)
    - Admin can edit any profile
    - Permission-based field visibility (e.g., salary visible only to HR)

71. **Profile Picture Display**
    - Profile picture displayed on:
      - Dashboard header
      - Employee directory
      - Leave approval requests
      - Attendance logs
      - Project team views
    - Placeholder image if no picture uploaded
    - Image optimization for web display

### Employment Detail Updates

72. **Update Employment Details**
    - HR can update employment details:
      - Department change (transfer)
      - Designation change (promotion/demotion)
      - Team change
      - Reporting manager change
      - Branch/Location change
      - Employment status change
      - Role change (permission role)
    - Change tracked with ModifiedBy and ModifiedOn
    - (History tracking implementation unclear)

73. **Employment Status Management**
    - Status values:
      - Active: Currently employed
      - Inactive: Temporarily inactive (long leave, sabbatical)
      - Resigned: Employee resigned, serving notice
      - Terminated: Terminated by company
      - Absconded: Employee absconded
    - Status change impacts:
      - System access (Active users only can login)
      - Leave accrual (paused for Inactive)
      - Reporting (excluded from active employee reports)

74. **Archive/Unarchive Employee**
    - Archive employee (soft delete with IsDeleted flag)
    - Archived employees:
      - Not visible in active employee list
      - Cannot login to system
      - Retained in database for audit and reports
    - Unarchive employee (restore access)
    - Permission: HR.Admin only

### Department, Designation, Team Management

75. **Department Master Management**
    - Add new department (HR, IT, Finance, Sales, Operations, etc.)
    - Department fields: Name, Description, Status
    - Department head assignment (optional)
    - Archive/Unarchive department
    - Archived departments not visible for new employee assignment
    - API endpoint: GetDepartmentList

76. **Designation Master Management**
    - Add new designation (Manager, Senior Engineer, HR Executive, etc.)
    - Designation fields: Name, Level (Junior, Mid, Senior, Lead, Manager), Status
    - Archive/Unarchive designation
    - API endpoint: GetDesignationList

77. **Team Master Management**
    - Add new team within department
    - Team fields: Name, DepartmentId, TeamLeadEmployeeId, Status
    - Archive/Unarchive team
    - Team members assigned via EmploymentDetail.TeamId
    - API endpoint: GetTeamList

78. **Cascading Dropdowns**
    - Department selection → Team dropdown filtered by department
    - Used in employee creation and updates
    - Ensures data consistency

### Branch/Location Management

79. **Branch Master**
    - Branch fields: Name, Address, City, State, Country, Status
    - Used for multi-location organizations
    - API endpoint: GetBranchList
    - (Implementation details limited in codebase)

80. **Location-Based Attendance**
    - Branch information used for location-based attendance tracking
    - Shift timings may vary by branch
    - Holiday calendar may differ by location

### Reporting Manager Hierarchy

81. **Reporting Manager Assignment**
    - Reporting manager selected during employee creation
    - Stored in EmploymentDetail.ReportingManagerId
    - Manager can view team members in dashboard
    - Manager receives leave approval requests from team

82. **Manager-Employee Relationship**
    - One-to-many relationship (Manager → Multiple Employees)
    - Used for:
      - Leave approval workflow
      - Performance appraisal
      - Team-based reports
      - Manager dashboard (team leaves, attendance, tasks)

83. **Hierarchy Visualization**
    - Organization chart view (implementation unclear)
    - Shows reporting structure
    - Employee can view own reporting chain
    - HR can view complete organization hierarchy

### Official Email Management

84. **Official Email Creation**
    - Official email captured during employee creation
    - Format typically: firstname.lastname@company.com
    - Used as primary login identifier for SSO
    - Unique constraint: No duplicate emails allowed

85. **Email Validation**
    - Email format validation during creation
    - Check for duplicate email before saving
    - Error message if email already exists: "Email already exists"

86. **Email Change (Implementation Unclear)**
    - Email change may require admin approval
    - Impact on SSO login
    - Notification to old and new email addresses
    - (Implementation not clearly visible in codebase)

### Role and Permission Assignment

87. **Role Assignment**
    - Role assigned during employee creation
    - Default role: Employee (RoleId = Roles.Employee)
    - Other roles: HR, Manager, Admin, TeamLead, IT, Developer, Accounts
    - Stored in EmploymentDetail.RoleId
    - Role determines permission set for user

88. **Role-Based Access Control**
    - Each role has associated permissions (from Permission table)
    - Permissions checked via [HasPermission] attribute on API endpoints
    - UI elements visible/hidden based on permissions
    - Examples:
      - Employees can view own data
      - Managers can approve team leaves
      - HR can manage all employees
      - Admin has full system access

89. **Permission Groups**
    - Employee management permissions:
      - Employees.Read: View employee list
      - Employees.Create: Add new employee
      - Employees.Edit: Update employee details
      - Employees.Delete: Archive employee
    - Personal details permissions: PersonalDetails.Read, Create, Edit, Delete, View
    - Employment details permissions: EmploymentDetails.Read, Create, Edit, Delete
    - Similar permission groups for all sub-modules (Nominee, Education, etc.)

### Employee Data Export

90. **Export Employee List to Excel**
    - Export filtered employee list to Excel
    - Columns: Employee Code, Name, Email, Department, Designation, Joining Date, Status
    - Filter applied before export
    - Used for HR reporting, audits, compliance

91. **Export Employee Master Data**
    - Complete employee data export
    - Includes: Personal, Employment, Bank, Address details
    - Sensitive data (PAN, Aadhaar) may be masked
    - Permission: HR.Admin only
    - Used for backup, migration, external system integration

### Employee Data Validation

92. **Mandatory Field Validation**
    - Server-side validation via FluentValidation
    - Required fields:
      - First Name, Last Name
      - Employee Code
      - Email
      - Joining Date
      - Department, Designation
      - Phone Number
    - Validation errors returned to UI with specific messages

93. **Email Format Validation**
    - Valid email format check
    - Domain validation (optional, for official email)
    - Duplicate email check

94. **Date Validation**
    - Joining date cannot be future date
    - DOB: Minimum age 18 years
    - Document expiry date cannot be past date
    - Employment end date must be after start date (previous employer)

95. **File Upload Validation**
    - File size limit: 5 MB
    - Allowed file types: PDF, JPG, PNG, DOC, DOCX
    - File name sanitization
    - Virus scan (if configured)
    - Validation errors: "File size exceeds limit", "Invalid file type"

96. **Phone Number Validation**
    - Format validation (10 digits for Indian numbers)
    - Special characters allowed: +, -, (, ), space
    - Duplicate phone check (optional)

97. **Unique Constraint Validation**
    - Employee Code must be unique
    - Official Email must be unique
    - PAN Number should be unique (if provided)
    - Aadhaar Number should be unique (if provided)
    - Validation error: "Employee with this email/code already exists"

## Data Models / Entities Used

### Primary Entities:

- **EmployeeData**: Employee master data
  - Fields: Id, FirstName, MiddleName, LastName, FatherName, Gender, DOB, Phone, AlternatePhone, EmergencyContactPerson, EmergencyContactNo, PersonalEmail, Nationality, MaritalStatus, Interest, PANNumber, PFNumber, AdharNumber, ESINo, HasESI, HasPF, UANNo, PassportExpiry, PassportNo, PFDate, EmployeeCode, BloodGroup, FileName (profile picture), FileOriginalName, Status, EmployeeStatus, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **EmploymentDetail**: Employment information
  - Fields: Id, EmployeeId, Email, JoiningDate, BranchId, EmploymentStatus, DepartmentId, DesignationId, TeamId, TeamName, ReportingManagerId, LinkedInUrl, BackgroundVerificationStatus, CriminalVerification, TotalExperienceYear, TotalExperienceMonth, RelevantExperienceYear, RelevantExperienceMonth, EmployeeStatus (Active/Inactive), RoleId, TimeDoctorUserId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **Address**: Current address
  - Fields: Id, EmployeeId, AddressLine1, AddressLine2, CountryId, StateId, CityId, Pincode, AddressType, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **PermanentAddress**: Permanent address
  - Fields: Same as Address

- **BankDetails**: Bank account information
  - Fields: Id, EmployeeId, BankName, AccountHolderName, AccountNumber, IFSCCode, BranchName, BankAddress, AccountType, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **UserDocument**: Identity documents
  - Fields: Id, EmployeeId, DocumentTypeId, DocumentNumber, DocumentExpiry, FileName, OriginalFileName, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **UserNomineeInfo**: Nominee details
  - Fields: Id, EmployeeId, NomineeName, RelationshipId, DOB, ContactNumber, Address, PercentageShare, NomineeType, FileName (identity document), OriginalFileName, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **UserQualificationInfo**: Educational qualifications
  - Fields: Id, EmployeeId, QualificationId, Specialization, UniversityId, YearOfPassing, Marks, FileName (degree certificate), OriginalFileName, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **UserCertificate**: Professional certificates
  - Fields: Id, EmployeeId, CertificateName, CertificateExpiry, FileName, OriginalFileName, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **PreviousEmployer**: Previous employment details
  - Fields: Id, EmployeeId, CompanyName, Designation, StartDate, EndDate, Duration, ReasonForLeaving, ManagerName, ManagerContact, CompanyAddress, HRContact, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **PreviousEmployerDocument**: Previous employer documents
  - Fields: Id, PreviousEmployerId, DocumentTypeId, FileName, OriginalFileName, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **ProfessionalReference**: Previous employer references
  - Fields: Id, PreviousEmployerId, ReferenceName, Designation, CompanyName, ContactNumber, EmailAddress, Relationship, VerificationStatus, VerificationDate, Notes, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **CurrentEmployerDocument**: Current employer documents
  - Fields: Id, EmployeeId, DocumentTypeId, FileName, OriginalFileName, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

- **FamilyDetail**: Family information (implementation inferred)
  - Fields: Id, EmployeeId, FamilyMemberName, RelationshipId, DOB, IsDependent, Occupation, ContactNumber, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IsDeleted

### Master Data Entities:

- **Country**: Country master
  - Fields: Id, Name, Code, Status

- **State**: State master
  - Fields: Id, CountryId, Name, Code, Status

- **City**: City master
  - Fields: Id, StateId, Name, Status

- **Department**: Department master
  - Fields: Id, Name, Description, DepartmentHeadId, Status, IsDeleted

- **Designation**: Designation master
  - Fields: Id, Name, Level, Status, IsDeleted

- **Team**: Team master
  - Fields: Id, DepartmentId, Name, TeamLeadId, Status, IsDeleted

- **DocumentType**: Document type master
  - Fields: Id, Name, IdProofFor (1: ID Proof, 2: Address Proof, 3: Both), Status

- **Qualification**: Qualification master
  - Fields: Id, Name, Status

- **University**: University master
  - Fields: Id, Name, Location, Status

- **Relationship**: Relationship master
  - Fields: Id, Name (Father, Mother, Spouse, Son, Daughter, etc.), Status

- **EmployerDocumentType**: Employer document type master
  - Fields: Id, Name, DocumentFor (1: Previous Employer, 2: Current Employer), Status

- **Role**: User roles
  - Fields: Id, RoleName, Description

- **Permission**: Permission master
  - Fields: Id, PermissionName, Module, Description

### Related Entities:

- **EmployeeLeave**: Leave balance (created at employee onboarding)
- **AttendanceConfig**: Attendance configuration (auto-created)
- **AppliedLeave**: Leave history
- **Attendance**: Attendance records

### DTOs:

- **AddEmploymentDetailRequestDto**: New employee creation request
- **EmploymentRequestDto**: Employment detail update request
- **EmploymentResponseDto**: Employment detail response with all related data
- **PersonalDetailsRequestDto**: Personal details add/update request
- **PersonalDetailsResponseDto**: Personal details with address, bank, documents
- **UserDocumentRequestDto**: Document upload request
- **UserDocumentResponseDto**: Document details response
- **NomineeRequestDto**: Nominee add/update request
- **NomineeResponseDto**: Nominee details response
- **NomineeSearchResponseDto**: Paginated nominee list
- **UserQualificationInfoRequestDto**: Educational detail request
- **EduDocResponseDto**: Educational detail response
- **EduDocSearchResponseDto**: Paginated education list
- **UserCertificateRequestDto**: Certificate upload request
- **UserCertificateResponseDto**: Certificate details
- **UserCertificateSearchResponseDto**: Paginated certificate list
- **PreviousEmployerRequestDto**: Previous employer add/update request
- **PreviousEmployerResponseDto**: Previous employer details with documents and references
- **PreviousEmployerSearchResponseDto**: Paginated previous employer list
- **PreviousEmployerDocRequestDto**: Previous employer document upload request
- **CurrentEmployerDocRequestDto**: Current employer document upload request
- **EmployeeSearchRequestDto**: Employee search filter criteria
- **EmployeeListSearchResponseDto**: Paginated employee list with search results
- **EmployeeArchiveRequestDto**: Archive employee request
- **DepartmentResponseDto**: Department details
- **DesignationResponseDto**: Designation details
- **TeamResponseDto**: Team details
- **CountryResponseDto**, **StateResponseDto**, **CityResponseDto**: Location master data
- **QualificationResponseDto**: Qualification master
- **UniversityResponseDto**: University master
- **RelationshipResponseDto**: Relationship master
- **EmployerDocumentTypeResponseDto**: Employer document type master
- **EmploymentDetailsForDwnTwn**: Employment details for DownTown API export (includes personal, employment, education, previous employer data in JSON format)

