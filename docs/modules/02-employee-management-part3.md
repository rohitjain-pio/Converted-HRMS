# Module 02: Employee Management - Part 3

## External Dependencies or Services

1. **Azure Blob Storage**
   - Purpose: Store all employee-related files
   - Containers:
     - ProfileImage: Employee profile pictures
     - UserDocumentContainer: Identity documents, nominee documents
     - EmployerDocumentContainer: Previous and current employer documents
     - EducationalDocumentContainer: Degree certificates, marksheets
     - CertificateContainer: Professional certificates
   - Operations: Upload file, download file via SAS URL, delete file
   - Integration via BlobStorageClient

2. **Time Doctor API**
   - Purpose: Fetch Time Doctor User ID during employee creation
   - Endpoint: GetTimeDoctorUserIdByEmail(email)
   - If employee exists in Time Doctor: Returns TimeDoctorUserId (string)
   - If not found: Returns null, manual attendance enabled
   - Integration via TimeDoctorClient
   - Used for automatic attendance tracking

3. **Email Notification Service**
   - Purpose: Send employee-related email notifications
   - Templates:
     - WelcomeEmail: Sent on employee creation with credentials and onboarding info
     - ProfileUpdateNotification: Sent on important profile changes
     - DocumentExpiryAlert: Sent when documents approaching expiry
   - Integration via EmailNotificationService (IEmailNotificationService)

4. **DownTown API Integration**
   - Purpose: Export employee data to external DownTown system
   - API endpoint: ExternalAPIController.GetEmploymentDetail(email)
   - Returns: EmploymentDetailsForDwnTwn DTO with complete employee profile
   - Data exported:
     - Personal details (Name, DOB, Contact, Address)
     - Employment details (Department, Designation, Joining date)
     - Educational details (JSON serialized list)
     - Previous employer details (JSON serialized list)
     - Profile picture URL
   - Used for timesheet and project tracking in external system

5. **Leave Accrual Service**
   - Purpose: Calculate opening leave balance for new employees
   - Called during employee creation
   - Input: Joining date, Gender
   - Output: OpeningLeaveBalanceDto (CL, EL, SL opening balances)
   - Integration via LeaveBalanceHelper.GetOpeningBalance()
   - Creates initial EmployeeLeave records

6. **Authentication Service**
   - Purpose: User account creation and role assignment
   - Links EmployeeId with authentication system
   - Sets default password (if local auth enabled)
   - Configures SSO mapping with official email
   - Integration with Azure AD for SSO

## APIs or Endpoints

### Employee Creation & Management

**POST /api/UserProfile/AddEmploymentDetail**
- **Purpose:** Create new employee with employment details
- **Request:** AddEmploymentDetailRequestDto (firstName, lastName, employeeCode, email, joiningDate, departmentId, designationId, teamId, reportingManagerId, totalExperience, relevantExperience, etc.)
- **Process:**
  - Validate email uniqueness
  - Check employee code uniqueness
  - Fetch Time Doctor User ID by email
  - Create EmployeeData record
  - Create EmploymentDetail record
  - Set default role (Employee)
  - Calculate opening leave balance based on joining date and gender
  - Insert opening leave balance into EmployeeLeave
  - Create attendance configuration (manual or automatic based on TimeDoctorUserId)
  - Queue welcome email
- **Response:** Success/Failure with message
- **Auth Required:** Yes
- **Permissions:** EmploymentDetails.Create

**POST /api/UserProfile/UpdateEmploymentDetail**
- **Purpose:** Update employee employment details
- **Request:** EmploymentRequestDto (id, email, departmentId, designationId, teamId, reportingManagerId, employmentStatus, etc.)
- **Process:**
  - Validate employee exists
  - Update EmploymentDetail record
  - Track ModifiedBy and ModifiedOn
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** EmploymentDetails.Edit

**GET /api/UserProfile/GetEmplyementDetailById/{id}**
- **Purpose:** Fetch employment details for specific employee
- **Response:** EmploymentResponseDto with employment, personal, address, bank details
- **Auth Required:** Yes
- **Permissions:** EmploymentDetails.Read

**POST /api/UserProfile/ArchiveUnarchiveEmploymentDetails**
- **Purpose:** Archive or unarchive employee (soft delete)
- **Request:** EmployeeArchiveRequestDto (id, isArchived: true/false)
- **Process:** Set IsDeleted flag on EmploymentDetail
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** EmploymentDetails.Delete

**GET /api/UserProfile/GetEmployeeTimedoctorUserId?email={email}**
- **Purpose:** Fetch Time Doctor User ID for employee email
- **Response:** TimeDoctorUserId (string) or null
- **Auth Required:** Yes
- **Permissions:** EmploymentDetails.Create

**POST /api/UserProfile/GetEmployees**
- **Purpose:** Search and list employees with filters
- **Request:** SearchRequestDto<EmployeeSearchRequestDto> (filters: name, code, email, department, designation, status, joiningDateFrom, joiningDateTo; pagination: startIndex, pageSize; sorting: sortColumnName, sortDirection)
- **Response:** EmployeeListSearchResponseDto with paginated list and total records
- **Auth Required:** Yes
- **Permissions:** Employees.Read

### Personal Details Management

**GET /api/UserProfile/GetPersonalDetailsById/{id}**
- **Purpose:** Fetch personal details for employee
- **Response:** PersonalDetailsResponseDto (name, DOB, gender, contact, address, etc.)
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Read

**POST /api/UserProfile/AddPersonalDetail**
- **Purpose:** Add personal details for employee
- **Request:** PersonalDetailsRequestDto (employeeId, fatherName, DOB, gender, phone, emergencyContact, addresses, etc.)
- **Process:**
  - Validate employee ID exists
  - Check personal email uniqueness (optional)
  - Create/Update EmployeeData record
  - Create Address records (current and permanent)
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Create

**POST /api/UserProfile/UpdatePersonalDetail**
- **Purpose:** Update personal details
- **Request:** PersonalDetailsRequestDto
- **Process:** Update EmployeeData and Address records
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Edit

**GET /api/UserProfile/GetPersonalProfileByIdAsync/{id}**
- **Purpose:** Fetch complete personal profile with all sections
- **Response:** PersonalDetailsResponseDto with related data (documents, family, etc.)
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Read

### Profile Picture Management

**POST /api/UserProfile/UploadUserProfileImage**
- **Purpose:** Upload employee profile picture
- **Request:** UploadFileRequest (employeeId, file: IFormFile)
- **Process:**
  - Validate file size (max 5 MB) and type (JPG, PNG)
  - Upload to Azure Blob Storage (ProfileImage container)
  - Update EmployeeData.FileName and FileOriginalName
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Edit

**POST /api/UserProfile/UpdateProfilePicture**
- **Purpose:** Update existing profile picture
- **Request:** UploadFileRequest
- **Process:** Delete old file from blob, upload new file, update database
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Edit

**GET /api/UserProfile/RemoveProfilePicture/{id}**
- **Purpose:** Remove profile picture
- **Process:** Delete file from blob storage, set FileName to empty in database
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Delete

### Document Management

**GET /api/UserProfile/GetUserDocumentList/{employeeId}**
- **Purpose:** Fetch list of documents for employee
- **Response:** List<UserDocumentResponseDto>
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Read

**GET /api/UserProfile/GetUserDocumentById/{id}**
- **Purpose:** Fetch specific document details
- **Response:** UserDocumentResponseDto
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.View

**POST /api/UserProfile/UploadUserDocument**
- **Purpose:** Upload identity document
- **Request:** UserDocumentRequestDto (employeeId, documentTypeId, documentNumber, documentExpiry, file)
- **Process:**
  - Validate file size and type
  - Upload to Azure Blob Storage (UserDocumentContainer)
  - Create UserDocument record with filename
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Create

**POST /api/UserProfile/UpdateUploadUserDocument**
- **Purpose:** Update document details or re-upload file
- **Request:** UserDocumentRequestDto
- **Process:** Update UserDocument record, replace file if new file provided
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Edit

**GET /api/UserProfile/GetUserDocumentUrl?containerType={containerType}&filename={filename}**
- **Purpose:** Get secure SAS URL for document download
- **Response:** SAS URL (valid for limited time)
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.View

### Nominee Management

**POST /api/UserProfile/AddNominee**
- **Purpose:** Add nominee for employee
- **Request:** NomineeRequestDto (employeeId, nomineeName, relationshipId, DOB, contact, address, percentageShare, nomineeType, file)
- **Process:**
  - Validate percentage share (total should be 100%)
  - Upload nominee document to blob storage
  - Create UserNomineeInfo record
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** NomineeDetails.Create

**PUT /api/UserProfile/UpdateNominee**
- **Purpose:** Update nominee details
- **Request:** NomineeRequestDto
- **Process:** Update UserNomineeInfo, replace document if new file provided
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** NomineeDetails.Edit

**DELETE /api/UserProfile/DeleteNominee/{id}**
- **Purpose:** Delete nominee (soft delete)
- **Process:** Set IsDeleted flag on UserNomineeInfo
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** NomineeDetails.Delete

**POST /api/UserProfile/GetNomineeList**
- **Purpose:** Get paginated list of nominees
- **Request:** SearchRequestDto<NomineeSearchRequestDto> (employeeId filter)
- **Response:** NomineeSearchResponseDto with paginated list
- **Auth Required:** Yes
- **Permissions:** NomineeDetails.Read

**GET /api/UserProfile/GetNomineeById/{id}**
- **Purpose:** Fetch nominee details by ID
- **Response:** NomineeResponseDto
- **Auth Required:** Yes
- **Permissions:** NomineeDetails.View

**GET /api/UserProfile/DownloadNomineeDocument?fileName={fileName}**
- **Purpose:** Download nominee identity document
- **Response:** File byte array or SAS URL
- **Auth Required:** Yes
- **Permissions:** NomineeDetails.View

### Educational Details Management

**POST /api/UserProfile/AddEducationalDetails**
- **Purpose:** Add educational qualification
- **Request:** UserQualificationInfoRequestDto (employeeId, qualificationId, specialization, universityId, yearOfPassing, marks, file)
- **Process:**
  - Upload degree certificate to blob storage
  - Create UserQualificationInfo record
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** EducationalDetails.Create

**PUT /api/UserProfile/EditEducationalDetails**
- **Purpose:** Update educational qualification
- **Request:** UserQualificationInfoRequestDto
- **Process:** Update UserQualificationInfo, replace document if new file
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** EducationalDetails.Edit

**GET /api/UserProfile/GetEducationalDetailsById/{id}**
- **Purpose:** Fetch educational detail by ID
- **Response:** EduDocResponseDto
- **Auth Required:** Yes
- **Permissions:** EducationalDetails.View

**DELETE /api/UserProfile/DeleteEducationalDetails/{id}**
- **Purpose:** Delete educational qualification (soft delete)
- **Process:** Set IsDeleted flag
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** EducationalDetails.Delete

**POST /api/UserProfile/GetEducationalDocuments**
- **Purpose:** Get paginated list of educational qualifications
- **Request:** SearchRequestDto<EduDocSearchRequestDto> (employeeId filter)
- **Response:** EduDocSearchResponseDto with paginated list
- **Auth Required:** Yes
- **Permissions:** EducationalDetails.Read

### Certificate Management

**POST /api/Certificate/UploadEmployeeCertificate**
- **Purpose:** Upload professional certificate
- **Request:** UserCertificateRequestDto (employeeId, certificateName, certificateExpiry, file)
- **Process:**
  - Upload certificate file to blob storage
  - Create UserCertificate record
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** Certificates.Create

**POST /api/Certificate/UpdateUploadEmployeeCertificate**
- **Purpose:** Update certificate details or re-upload
- **Request:** UserCertificateRequestDto
- **Process:** Update UserCertificate, replace file if provided
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** Certificates.Edit

**POST /api/Certificate/ArchiveUnarchiveUserCertificates**
- **Purpose:** Archive/unarchive certificate
- **Request:** EmployeeArchiveRequestDto (id, isArchived)
- **Process:** Set IsDeleted flag
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** Certificates.Delete

**POST /api/Certificate/GetEmployeeCerificateList**
- **Purpose:** Get paginated certificate list
- **Request:** SearchRequestDto<UserCertificateSearchRequestDto> (employeeId filter)
- **Response:** UserCertificateSearchResponseDto with paginated list
- **Auth Required:** Yes
- **Permissions:** Certificates.Read

**GET /api/Certificate/GetUserCertificateById/{id}**
- **Purpose:** Fetch certificate details
- **Response:** UserCertificateResponseDto
- **Auth Required:** Yes
- **Permissions:** Certificates.View

### Previous Employer Management

**POST /api/UserProfile/AddPreviousEmployer**
- **Purpose:** Add previous employment record
- **Request:** PreviousEmployerRequestDto (employeeId, companyName, designation, startDate, endDate, reasonForLeaving, managerDetails, etc.)
- **Process:** Create PreviousEmployer record
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PreviousEmployer.Create

**PUT /api/UserProfile/UpdatePreviousEmployer**
- **Purpose:** Update previous employer details
- **Request:** PreviousEmployerRequestDto
- **Process:** Update PreviousEmployer record
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PreviousEmployer.Edit

**DELETE /api/UserProfile/DeletePreviousEmployer/{id}**
- **Purpose:** Delete previous employer (soft delete)
- **Process:** Set IsDeleted flag on PreviousEmployer
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PreviousEmployer.Delete

**POST /api/UserProfile/GetPreviousEmployerList**
- **Purpose:** Get paginated list of previous employers
- **Request:** SearchRequestDto<PreviousEmployerSearchRequestDto> (employeeId filter)
- **Response:** PreviousEmployerSearchResponseDto with paginated list
- **Auth Required:** Yes
- **Permissions:** PreviousEmployer.Read

**GET /api/UserProfile/GetPreviousEmployerById/{id}**
- **Purpose:** Fetch previous employer details with documents and references
- **Response:** PreviousEmployerResponseDto
- **Auth Required:** Yes
- **Permissions:** ProfessionalReference.View

**POST /api/UserProfile/UploadEmployerDocument**
- **Purpose:** Upload document for previous employer
- **Request:** PreviousEmployerDocRequestDto (previousEmployerId, documentTypeId, file)
- **Process:**
  - Upload file to blob storage (EmployerDocumentContainer)
  - Create PreviousEmployerDocument record
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PreviousEmployer.Create

**DELETE /api/UserProfile/DeletePreviousEmployerDocument/{id}**
- **Purpose:** Delete previous employer document
- **Process:** Set IsDeleted flag on PreviousEmployerDocument
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** PreviousEmployer.Delete

### Current Employer Documents

**POST /api/UserProfile/UploadCurrentEmployerDocument**
- **Purpose:** Upload document from current employer (appointment letter, increment letter, etc.)
- **Request:** CurrentEmployerDocRequestDto (employeeId, documentTypeId, file)
- **Process:**
  - Upload file to blob storage
  - Create CurrentEmployerDocument record
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** EmploymentDetails.Create

### Master Data APIs

**GET /api/UserProfile/GetCountryList**
- **Purpose:** Fetch list of countries
- **Response:** List<CountryResponseDto>
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Read

**GET /api/UserProfile/GetStateList/{countryId}**
- **Purpose:** Fetch states for selected country
- **Response:** List<StateResponseDto>
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Read

**GET /api/UserProfile/GetCityList/{stateId}**
- **Purpose:** Fetch cities for selected state
- **Response:** List<CityResponseDto>
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Read

**GET /api/UserProfile/GovtDocumentList/{idProofFor}**
- **Purpose:** Fetch government document types
- **Parameters:** idProofFor (1: ID Proof, 2: Address Proof, 3: Both)
- **Response:** List<GovtDocumentResponseDto>
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Read

**GET /api/UserProfile/GetDepartmentList**
- **Purpose:** Fetch all departments
- **Response:** List<DepartmentResponseDto>
- **Auth Required:** Yes
- **Permissions:** Employees.Read

**GET /api/UserProfile/GetTeamList**
- **Purpose:** Fetch all teams
- **Response:** List<TeamResponseDto>
- **Auth Required:** Yes
- **Permissions:** Employees.Read

**GET /api/UserProfile/GetQualificationList**
- **Purpose:** Fetch qualification types
- **Response:** List<QualificationResponseDto>
- **Auth Required:** Yes
- **Permissions:** EducationalDetails.Read

**GET /api/UserProfile/GetUniversitiesList**
- **Purpose:** Fetch university list
- **Response:** List<UniversityResponseDto>
- **Auth Required:** Yes
- **Permissions:** PersonalDetails.Read

**GET /api/UserProfile/GetRelationshipList**
- **Purpose:** Fetch relationship types for family/nominee
- **Response:** List<RelationshipResponseDto>
- **Auth Required:** Yes
- **Permissions:** NomineeDetails.Read

**GET /api/UserProfile/GetEmployerDocumentTypeList/{documentFor}**
- **Purpose:** Fetch employer document types
- **Parameters:** documentFor (1: Previous Employer, 2: Current Employer)
- **Response:** List<EmployerDocumentTypeResponseDto>
- **Auth Required:** Yes
- **Permissions:** EmploymentDetails.Read

### External API

**GET /api/ExternalAPI/GetEmploymentDetail?email={email}**
- **Purpose:** Export employee data to external DownTown system
- **Response:** EmploymentDetailsForDwnTwn (complete employee profile with JSON serialized education and previous employer data)
- **Auth Required:** No (or API Key authentication)
- **Permissions:** Public API for integration

### Department, Designation, Team Management

**POST /api/Department/ArchiveUnarchiveDepartment**
- **Purpose:** Archive or unarchive department
- **Request:** DepartmentArchiveRequestDto (id, isArchived)
- **Process:** Set IsDeleted flag on Department
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** Department.Admin

**POST /api/Team/ArchiveUnarchiveTeam**
- **Purpose:** Archive or unarchive team
- **Request:** ArchiveTeamRequestDto (id, isArchived)
- **Process:** Set IsDeleted flag on Team
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** Team.Admin

**POST /api/Designation/ArchiveUnarchiveDesignation**
- **Purpose:** Archive or unarchive designation
- **Request:** DesignationArchiveRequestDto (id, isArchived)
- **Process:** Set IsDeleted flag on Designation
- **Response:** Success/Failure
- **Auth Required:** Yes
- **Permissions:** Designation.Admin

