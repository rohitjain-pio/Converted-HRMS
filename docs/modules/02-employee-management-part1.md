# Module 02: Employee Management - Part 1

## Module Overview

**Purpose:**  
Provides comprehensive employee lifecycle management from onboarding to profile maintenance. Serves as the master data repository for all employee information including personal details, employment records, family information, educational qualifications, previous work history, nominee details, certificates, and identity documents. This module is the foundation for all HR operations as every other module depends on accurate employee data.

**Role in System:**  
Central employee data management system that maintains complete employee records throughout their tenure. Provides single source of truth for employee information used across leave management, attendance tracking, payroll integration, asset allocation, exit processing, and reporting. Ensures data consistency, completeness, and compliance with statutory requirements.

## Implemented Features

### Employee Onboarding & Creation

1. **Employee Code Generation**
   - System generates unique employee code automatically
   - Format: EMP-XXXX (e.g., EMP-0001, EMP-0156)
   - Sequential numbering based on last assigned code
   - API endpoint to fetch latest available employee code before onboarding
   - Used as primary identifier for employee throughout system

2. **Basic Employee Information Capture**
   - First name (mandatory)
   - Middle name (optional)
   - Last name (mandatory)
   - Employee code (auto-generated or manual override)
   - Gender (Male, Female, Other)
   - Date of birth
   - Blood group
   - Marital status (Single, Married, Divorced, Widowed)

3. **Employment Detail Creation**
   - Official email address (mandatory, unique across system)
   - Joining date (mandatory)
   - Department selection from master list
   - Designation selection from master list
   - Team assignment
   - Branch/Location
   - Reporting manager selection (EmployeeId reference)
   - Employment status (Permanent, Contract, Probation, Intern, Consultant)
   - Role assignment (Employee, Manager, TeamLead, HR, Admin, etc.)

4. **Time Doctor User ID Mapping**
   - During employee creation, system fetches Time Doctor User ID via API
   - Lookup by official email address
   - If Time Doctor user found: TimeDoctorUserId stored
   - If not found: Manual attendance flag enabled (IsManualAttendance = true)
   - Used for automatic attendance tracking integration

5. **Experience Information**
   - Total experience years and months
   - Relevant experience years and months
   - Used for leave entitlement calculation and role assignments

6. **Background Verification Fields**
   - Background verification status (Pending, InProgress, Completed, Failed)
   - Criminal verification status (Pending, InProgress, Completed, Failed)
   - Verification dates tracked
   - Used for compliance and onboarding clearance

7. **Opening Leave Balance Assignment**
   - System automatically calculates opening leave balance based on:
     - Joining date (mid-year join gets pro-rated leaves)
     - Gender (maternity leave applicable for female employees)
     - Leave policy configuration
   - Opening balance includes:
     - Casual Leave (CL): 0.5 per month accrual
     - Earned Leave (EL): 1.5 per month accrual
     - Sick Leave (SL): Annual allocation
   - Inserted into EmployeeLeave table at time of employee creation

8. **Welcome Email Trigger**
   - After successful employee creation, welcome email queued
   - Email contains:
     - Company greeting and welcome message
     - Official email address credentials
     - First day instructions
     - HR contact information
     - Link to employee portal
   - Sent via EmailNotificationService

9. **Attendance Configuration Initialization**
   - Attendance tracking configuration auto-created on employee creation
   - If Time Doctor ID found: Automatic attendance enabled
   - If Time Doctor ID not found: Manual attendance enabled
   - Configures default work hours, shift timings
   - Stored in AttendanceConfig table

### Personal Details Management

10. **Profile Picture Upload**
    - Upload profile picture during onboarding or anytime later
    - Supported formats: JPG, PNG (max 5 MB)
    - Image stored in Azure Blob Storage (ProfileImage container)
    - Filename and OriginalFileName stored in EmployeeData table
    - Profile picture displayed across application (dashboard, directory, approvals)

11. **Profile Picture Update/Remove**
    - Update existing profile picture (replaces old file in blob storage)
    - Remove profile picture (deletes from blob, sets FileName to empty)
    - Permissions: Employee can update own picture, HR can update any employee picture

12. **Contact Information**
    - Primary phone number (mandatory)
    - Alternate phone number (optional)
    - Personal email address (optional, separate from official email)
    - Emergency contact person name (mandatory)
    - Emergency contact number (mandatory)
    - Used for urgent communication during emergencies or leave approvals

13. **Father's Name**
    - Father's name or guardian name
    - Used in official documents and statutory forms

14. **Nationality**
    - Nationality selection (default: Indian)
    - Important for visa processing, international assignments

15. **Interests/Hobbies**
    - Free text field for employee interests, hobbies
    - Used for team building, cultural activities, employee engagement

### Address Management

16. **Current Address (Communication Address)**
    - Address line 1 (mandatory)
    - Address line 2 (optional)
    - Country selection from master list
    - State selection (filtered by country)
    - City selection (filtered by state)
    - Pincode/Postal code
    - Address type: Current
    - Stored in Address table with AddressType = Current

17. **Permanent Address**
    - Same fields as current address
    - Checkbox: "Same as current address" (auto-fills if checked)
    - Address type: Permanent
    - Stored in PermanentAddress table
    - Used for official correspondence, statutory forms

18. **Country, State, City Master Data**
    - Dropdown populated from master tables (Country, State, City)
    - Cascading dropdowns: Country → State → City
    - API endpoints:
      - GetCountryList: Returns all countries
      - GetStateList: Returns states for selected country
      - GetCityList: Returns cities for selected state

### Identity Documents Management

19. **Government Document Upload**
    - Document types available:
      - Aadhaar Card
      - PAN Card
      - Passport
      - Driving License
      - Voter ID
      - Ration Card
    - Each document type configurable as:
      - ID Proof
      - Address Proof
      - Both ID and Address Proof
    - Document type master stored in DocumentType table with IdProofFor field

20. **Document Information Capture**
    - Document type selection
    - Document number (e.g., PAN: ABCDE1234F, Aadhaar: 1234 5678 9012)
    - Document expiry date (for Passport, Driving License)
    - Document file upload (PDF, JPG, PNG, max 5 MB)
    - Upload date auto-captured

21. **Document File Storage**
    - Documents uploaded to Azure Blob Storage
    - Container: UserDocumentContainer
    - Filename format: {EmployeeId}_{DocumentType}_{Timestamp}.{extension}
    - Blob URL stored in UserDocument table
    - Secure access via SAS URL generation

22. **Document List View**
    - Employee can view own documents list
    - HR can view all employee documents
    - List displays: Document type, Document number, Expiry date, Upload date
    - Download action available for each document

23. **Document Update**
    - Update document details: Document number, Expiry date
    - Re-upload document file (replaces old file)
    - Update date tracked with ModifiedBy and ModifiedOn

24. **Document Download**
    - Generate SAS URL for secure blob access
    - URL valid for limited time (e.g., 15 minutes)
    - Download via browser or API response as byte array
    - Permission check: Employee can download own, HR can download any

25. **Statutory Document Fields in Employee Master**
    - PAN Number (stored in EmployeeData table)
    - Aadhaar Number (stored in EmployeeData table)
    - Passport Number and Expiry (stored in EmployeeData table)
    - PF Number and PF Date (stored in EmployeeData table)
    - ESI Number with HasESI flag (stored in EmployeeData table)
    - UAN Number (Universal Account Number for PF)
    - Used for payroll integration and statutory compliance

### Bank Details Management

26. **Bank Account Information**
    - Bank name
    - Account holder name
    - Account number
    - IFSC code
    - Branch name
    - Bank address
    - Account type (Savings, Current)
    - Stored in BankDetails table

27. **Bank Details Update**
    - Employee can add/update bank details
    - HR approval may be required (configuration dependent)
    - Used for salary credit, reimbursement processing
    - Validation: Account number format, IFSC code format

28. **Multiple Bank Accounts (Implementation Unclear)**
    - Primary account designation for salary credit
    - Secondary accounts for reimbursements
    - (Implementation details not clear from codebase)

### Family Information Management

29. **Family Member Addition**
    - Family member name
    - Relationship selection (Father, Mother, Spouse, Son, Daughter, Brother, Sister)
    - Date of birth
    - Dependent status (Yes/No)
    - Occupation (optional)
    - Contact number (optional)
    - Stored in FamilyDetail table (implementation inferred, table not confirmed)

30. **Dependent Details for Insurance**
    - Family members marked as dependents
    - Used for health insurance coverage nomination
    - Age calculation for premium determination
    - Dependent list exported for insurance enrollment

31. **Relationship Master**
    - Relationship types stored in Relationship master table
    - API endpoint: GetRelationshipList
    - Used in family details and nominee information

### Nominee Information Management

32. **Nominee Addition**
    - Nominee name (mandatory)
    - Relationship to employee (from Relationship master)
    - Date of birth
    - Contact number
    - Address (optional)
    - Percentage share (if multiple nominees, total must be 100%)
    - Nominee type: Insurance, PF, Gratuity, or All
    - Stored in UserNomineeInfo table

33. **Nominee Document Upload**
    - Identity proof of nominee (Aadhaar, PAN, etc.)
    - File upload similar to employee documents
    - Stored in Azure Blob (UserDocumentContainer)
    - Document filename stored in UserNomineeInfo table

34. **Multiple Nominees**
    - Employee can add multiple nominees
    - Percentage share allocation across nominees
    - Validation: Total percentage = 100%
    - Used for insurance claims, PF settlement

35. **Nominee List View**
    - Paginated list of nominees for employee
    - Filter by employee ID
    - Search by nominee name or relationship
    - Sort by creation date

36. **Nominee Update**
    - Modify nominee details: Name, relationship, DOB, contact, address, percentage
    - Re-upload nominee document
    - Update tracked with ModifiedBy and ModifiedOn

37. **Nominee Delete**
    - Soft delete nominee (IsDeleted flag)
    - Nominee record retained for audit
    - Removed from active nominee list

38. **Nominee Document Download**
    - Download nominee identity proof document
    - SAS URL generation for secure access
    - Permission: Employee for own nominees, HR for all

### Educational Qualifications Management

39. **Educational Detail Addition**
    - Qualification type selection (from Qualification master)
      - Options: 10th, 12th, Diploma, Bachelor's, Master's, Doctorate, Certification
    - Field of study/Specialization
    - University/Institute name (from University master or free text)
    - Year of passing
    - Marks/Percentage/CGPA
    - Document upload (degree certificate, marksheet)
    - Stored in UserQualificationInfo table

40. **Qualification Master**
    - Qualification types in Qualification table
    - API endpoint: GetQualificationList
    - Used for dropdown population

41. **University Master**
    - University names in University table
    - API endpoint: GetUniversitiesList
    - Searchable dropdown with autocomplete
    - Option to add new university if not in list

42. **Educational Document Upload**
    - Degree certificate, marksheets uploaded
    - Stored in Azure Blob Storage
    - Filename stored in UserQualificationInfo table
    - Multiple documents can be uploaded per qualification

43. **Educational Details List**
    - Paginated list of qualifications for employee
    - Displays: Qualification type, Specialization, University, Year, Marks
    - Sort by year of passing (latest first)

44. **Educational Detail Update**
    - Modify qualification details
    - Re-upload documents
    - Update tracked with ModifiedBy and ModifiedOn

45. **Educational Detail Delete**
    - Soft delete qualification record
    - Document retained in blob storage for audit

### Professional Certificates Management

46. **Certificate Upload**
    - Certificate name/title (e.g., "AWS Certified Solutions Architect", "PMP Certification")
    - Certificate expiry date (if applicable)
    - Certificate file upload (PDF, JPG, PNG)
    - Stored in UserCertificate table
    - Document stored in Azure Blob Storage

47. **Certificate List View**
    - Paginated list of certificates for employee
    - Displays: Certificate name, Expiry date, Upload date
    - Filter by employee ID
    - Sort by expiry date or upload date

48. **Certificate Update**
    - Modify certificate name or expiry date
    - Re-upload certificate file
    - Update tracked with ModifiedBy and ModifiedOn

49. **Certificate Delete/Archive**
    - Archive certificate (soft delete with IsDeleted flag)
    - Archived certificates hidden from active list
    - Retained for audit and history

50. **Certificate Expiry Tracking**
    - Certificates with expiry dates tracked
    - (Potential for expiry alert implementation, not visible in codebase)
    - Used for skill validation and compliance

### Previous Employer Information Management

51. **Previous Employer Addition**
    - Company name (mandatory)
    - Designation/Job title
    - Employment start date (joining date)
    - Employment end date (relieving date)
    - Duration calculation (years, months)
    - Reason for leaving
    - Manager/Supervisor name
    - Manager contact number
    - Company address
    - HR contact details
    - Stored in PreviousEmployer table

52. **Previous Employer Document Upload**
    - Document types:
      - Offer Letter
      - Appointment Letter
      - Relieving Letter
      - Experience Certificate
      - Last 3 months salary slips
      - Form 16 (tax documents)
    - Document type from EmployerDocumentType master
    - Multiple documents per previous employer
    - Stored in PreviousEmployerDocument table
    - Files in Azure Blob Storage

53. **Employer Document Type Master**
    - EmployerDocumentType table with DocumentFor field
    - DocumentFor values:
      - 1: Previous Employer
      - 2: Current Employer
    - API endpoint: GetEmployerDocumentTypeList(documentFor)

54. **Previous Employer List View**
    - Paginated list of previous employers for employee
    - Displays: Company name, Designation, Duration, Reason for leaving
    - Sort by employment end date (latest first)
    - Document count indicator per employer

55. **Previous Employer Update**
    - Modify employer details
    - Add/remove documents
    - Update tracked with ModifiedBy and ModifiedOn

56. **Previous Employer Delete**
    - Soft delete previous employer record
    - Associated documents retained for audit
    - Removed from active list

57. **Previous Employer Document Delete**
    - Delete specific document from previous employer
    - Soft delete with IsDeleted flag
    - File retained in blob storage

### Professional Reference Management

58. **Professional Reference Addition**
    - Reference associated with previous employer (PreviousEmployerId foreign key)
    - Reference person name
    - Designation/Position
    - Company name (defaults to previous employer company)
    - Contact number (mandatory)
    - Email address (mandatory)
    - Relationship with reference (Manager, Colleague, HR, Client)
    - Stored in ProfessionalReference table

59. **Multiple References**
    - Multiple references can be added per previous employer
    - Typically 2-3 references per employer
    - Used for background verification process

60. **Reference Verification Status**
    - Verification status field (Pending, InProgress, Completed, NotResponding)
    - Verification date
    - Verification notes/comments
    - Used by HR during background verification

### Current Employer Document Management

61. **Current Employer Document Upload**
    - Document types for current employer (from EmployerDocumentType where DocumentFor = 2):
      - Appointment Letter
      - Increment Letter
      - Promotion Letter
      - Confirmation Letter (post-probation)
      - Transfer Letter
      - Appraisal Letter
      - Salary Revision Letter
    - Document file upload to Azure Blob Storage
    - Stored in CurrentEmployerDocument table

62. **Current Document List View**
    - List of documents for employee from current organization
    - Displays: Document type, Upload date, Uploaded by
    - Download action available

63. **Current Document Delete**
    - Soft delete with IsDeleted flag
    - Document retained in blob storage for audit

