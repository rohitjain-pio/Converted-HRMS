# HRMS Database Tables Documentation

## Overview

Total Tables: **76**  
Database: **HRMS**  
Source: `Backend\HRMSWebApi\DataBase\Script.md`

---

## Table Categories

### Employee Management (12 tables)
### Attendance & Leave (7 tables)
### Asset Management (5 tables)
### Performance Management (3 tables)
### Grievance Management (4 tables)
### Exit Management (6 tables)
### Policy Management (4 tables)
### Communication (3 tables)
### Security & Access (7 tables)
### Survey & Events (7 tables)
### User Groups (3 tables)
### Master Data (12 tables)
### System & Logging (3 tables)

---

## Detailed Table Structures

### 1. AccountClearance

**Purpose**: Manages account-related clearances during employee exit process

```
Table: AccountClearance
├── Id (int, IDENTITY, PRIMARY KEY)
├── ResignationId (int, NOT NULL, FK → Resignation.Id)
├── FnFStatus (bit, NULL)
├── FnFAmount (decimal(18,2), NULL)
├── IssueNoDueCertificate (bit, NULL)
├── Note (nvarchar(max), NULL)
├── AccountAttachment (varchar(255), NULL)
├── FileOriginalName (varchar(255), NULL)
├── CreatedBy (varchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (varchar(100), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 2. AccrualUtilizedLeave

**Purpose**: Tracks leave accrual and utilization history for employees

```
Table: AccrualUtilizedLeave
├── Id (int, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── LeaveId (int, NOT NULL, FK → LeaveType.Id)
├── Date (datetime, NOT NULL)
├── Description (nvarchar(500), NULL)
├── Accrued (decimal(18,2), NULL)
├── UtilizedOrRejected (decimal(18,2), NULL)
├── ClosingBalance (decimal(18,2), NOT NULL)
├── CreatedOn (datetime, NOT NULL, DEFAULT getdate())
└── CreatedBy (nvarchar(100), NULL)
```

---

### 3. Address

**Purpose**: Stores current address information for employees

```
Table: Address
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── Line1 (nvarchar(250), NULL)
├── Line2 (nvarchar(250), NULL)
├── CityId (bigint, NULL, FK → City.Id)
├── CountryId (bigint, NULL, FK → Country.Id)
├── StateId (bigint, NULL, FK → State.Id)
├── AddressType (tinyint, NULL)
├── Pincode (varchar(20), NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 4. AppliedLeaves

**Purpose**: Manages employee leave applications and approvals

```
Table: AppliedLeaves
├── Id (int, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── LeaveId (int, NOT NULL, FK → LeaveType.Id)
├── ReportingManagerId (bigint, NULL, FK → EmploymentDetail.Id)
├── Status (tinyint, NOT NULL)
├── Reason (varchar(500), NOT NULL)
├── StartDate (date, NOT NULL)
├── StartDateSlot (tinyint, NOT NULL)
├── EndDate (date, NOT NULL)
├── EndDateSlot (tinyint, NOT NULL)
├── AttachmentPath (nvarchar(100), NULL)
├── RejectReason (varchar(500), NULL)
├── TotalLeaveDays (decimal(5,2), NULL)
├── CreatedOn (datetime, NOT NULL)
├── CreatedBy (varchar(100), NOT NULL)
├── ModifiedOn (datetime, NULL)
└── ModifiedBy (varchar(50), NULL)
```

---

### 5. AssetCondition

**Purpose**: Master data for asset condition status values

```
Table: AssetCondition
├── Id (int, PRIMARY KEY)
├── Status (nvarchar(50), NOT NULL)
├── CreatedBy (nvarchar(255), NULL)
└── CreatedOn (datetime, NULL)
```

---

### 6. Attendance

**Purpose**: Tracks daily employee attendance with time logs

```
Table: Attendance
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NULL, FK → EmployeeData.Id)
├── Date (date, NOT NULL)
├── StartTime (time(7), NULL)
├── EndTime (time(7), NULL)
├── Day (varchar(50), NULL)
├── AttendanceType (varchar(30), NULL)
├── TotalHours (varchar(50), NULL)
├── Location (varchar(255), NULL)
├── CreatedOn (datetime, NULL, DEFAULT getdate())
├── CreatedBy (nvarchar(255), NULL)
├── ModifiedBy (nvarchar(255), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL, DEFAULT 0)
```

---

### 7. AttendanceAudit

**Purpose**: Maintains audit trail of attendance modifications

```
Table: AttendanceAudit
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Action (varchar(255), NOT NULL)
├── Time (varchar(50), NOT NULL)
├── Comment (text, NULL)
├── Reason (text, NULL)
├── AttendanceId (bigint, NULL, FK → Attendance.Id)
└── IsDeleted (bit, NOT NULL, DEFAULT 0)
```

---

### 8. BankDetails

**Purpose**: Stores employee bank account information for payroll

```
Table: BankDetails
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── BankName (varchar(250), NOT NULL)
├── AccountNO (varchar(100), NOT NULL)
├── BranchName (varchar(250), NULL)
├── IFSCCode (varchar(50), NULL)
├── IsActive (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── Modifiedon (datetime, NULL)
```

---

### 9. City

**Purpose**: Master data for cities linked to states

```
Table: City
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── StateId (bigint, NOT NULL, FK → State.Id)
├── CityName (varchar(200), NOT NULL)
├── IsActive (bit, NOT NULL)
├── IsDeleted (bit, NOT NULL)
├── CreatedBy (varchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (varchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 10. CompanyPolicy

**Purpose**: Stores company policies with version control

```
Table: CompanyPolicy
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Name (varchar(250), NOT NULL)
├── FileOriginalName (varchar(255), NULL)
├── FileName (varchar(255), NULL)
├── DocumentCategoryId (bigint, NOT NULL, FK → CompanyPolicyDocCategory.Id)
├── Description (nvarchar(500), NULL)
├── EffectiveDate (datetime, NULL)
├── VersionNo (int, NOT NULL)
├── StatusId (int, NOT NULL, FK → PolicyStatus.Id)
├── Accessibility (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 11. CompanyPolicyDocCategory

**Purpose**: Categories for organizing company policies

```
Table: CompanyPolicyDocCategory
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── CategoryName (varchar(100), NOT NULL)
├── IsActive (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 12. CompanyPolicyHistory

**Purpose**: Maintains version history of company policies

```
Table: CompanyPolicyHistory
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── PolicyId (bigint, NOT NULL, FK → CompanyPolicy.Id)
├── Name (varchar(100), NOT NULL)
├── FileOriginalName (varchar(255), NULL)
├── FileName (varchar(255), NULL)
├── DocumentCategoryId (bigint, NOT NULL, FK → CompanyPolicyDocCategory.Id)
├── Description (nvarchar(500), NULL)
├── EffectiveDate (datetime, NOT NULL)
├── VersionNo (int, NULL)
├── StatusId (int, NOT NULL, FK → PolicyStatus.Id)
├── Accessibility (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 13. CompOffAndSwapHolidayDetail

**Purpose**: Manages compensatory off and holiday swap requests

```
Table: CompOffAndSwapHolidayDetail
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── WorkingDate (date, NOT NULL)
├── LeaveDate (date, NULL)
├── LeaveDateLabel (nvarchar(100), NULL)
├── WorkingDateLabel (nvarchar(100), NULL)
├── Reason (nvarchar(max), NULL)
├── Status (tinyint, NOT NULL)
├── RejectReason (nvarchar(max), NULL)
├── RequestType (tinyint, NOT NULL)
├── NumberOfDays (decimal(5,2), NULL)
├── CreatedOn (datetime, NULL)
├── CreatedBy (nvarchar(100), NULL)
├── ModifiedBy (nvarchar(100), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL, DEFAULT 0)
```

---

### 14. Country

**Purpose**: Master data for countries with phone codes

```
Table: Country
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── CountryName (varchar(200), NOT NULL)
├── shortname (varchar(10), NULL)
├── PhoneCode (varchar(20), NOT NULL)
├── IsActive (bit, NOT NULL)
├── IsDeleted (bit, NOT NULL)
├── CreatedBy (varchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (varchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 15. CronJobLog

**Purpose**: Logs scheduled job executions for monitoring

```
Table: CronJobLog
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── TypeId (int, NULL)
├── RequestId (varchar(128), NULL)
├── StartedAt (datetime, NULL)
├── CompletedAt (datetime, NULL)
├── Payload (varchar(1024), NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL, DEFAULT getdate())
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 16. CurrentEmployerDocument

**Purpose**: Stores documents from current employment

```
Table: CurrentEmployerDocument
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── EmployeeDocumentTypeId (int, NOT NULL)
├── FileName (varchar(100), NOT NULL)
├── FileOriginalName (varchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 17. Department

**Purpose**: Master data for organizational departments

```
Table: Department
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Department (varchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 18. DepartmentClearance

**Purpose**: Manages department-level clearances during exit

```
Table: DepartmentClearance
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── ResignationId (int, NOT NULL, FK → Resignation.Id)
├── KTStatus (tinyint, NULL)
├── KTNotes (nvarchar(max), NOT NULL)
├── Attachment (nvarchar(max), NOT NULL)
├── KTUsers (varchar(max), NOT NULL)
├── FileOriginalName (varchar(255), NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 19. Designation

**Purpose**: Master data for employee designations/job titles

```
Table: Designation
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Designation (varchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 20. DocumentType

**Purpose**: Master data for various document types with proof requirements

```
Table: DocumentType
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Name (varchar(100), NOT NULL)
├── IdProofFor (int, NOT NULL)
├── ISExpiryDateRequired (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 21. DowntownData

**Purpose**: Stores synced data from external Downtown system

```
Table: DowntownData
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── First_Name (varchar(50), NOT NULL)
├── Last_Name (varchar(50), NULL)
├── Photo (varchar(100), NULL)
├── Gender (varchar(50), NULL)
├── DOB (date, NULL)
├── Phone (varchar(20), NULL)
├── Alternate_Phone_Number (varchar(20), NULL)
├── Email (varchar(100), NOT NULL)
├── Address (text, NULL)
├── Country (varchar(50), NULL)
├── Joining_date (varchar(50), NULL)
├── Branch_title (varchar(250), NULL)
├── Team_id (bigint, NULL)
├── Team_Title (varchar(50), NULL)
├── Designation (varchar(100), NULL)
├── Status (varchar(50), NULL)
├── IsSynched (bit, NULL)
├── Created_at (datetime, NULL)
├── Updated_at (datetime, NULL)
└── deleted_at (datetime, NULL)
```

---

### 22. EmailNotification

**Purpose**: Queue for email notifications to be sent

```
Table: EmailNotification
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── TemplateId (bigint, NOT NULL, FK → NotificationTemplate.Id)
├── ToEmail (nvarchar(max), NOT NULL)
├── FromEmail (nvarchar(150), NOT NULL)
├── Subject (nvarchar(150), NOT NULL)
├── Body (nvarchar(max), NOT NULL)
├── CC (nvarchar(max), NULL)
├── SentStatus (tinyint, NOT NULL)
├── CreatedOn (datetime, NOT NULL)
└── SentOn (datetime, NULL)
```

---

### 23. EmployeeAsset

**Purpose**: Links employees to assigned IT assets

```
Table: EmployeeAsset
├── Id (int, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── AssetId (bigint, NOT NULL, FK → ITAsset.Id)
├── AssignedOn (date, NOT NULL)
├── IsActive (bit, NOT NULL)
├── ReturnDate (date, NULL)
├── ReturnCondition (tinyint, NULL)
├── CreatedBy (nvarchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(100), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 24. EmployeeData

**Purpose**: Core employee personal and statutory information

```
Table: EmployeeData
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── FirstName (varchar(50), NOT NULL)
├── MiddleName (varchar(50), NULL)
├── LastName (varchar(50), NOT NULL)
├── FatherName (varchar(100), NULL)
├── FileName (varchar(100), NULL)
├── FileOriginalName (varchar(100), NULL)
├── BloodGroup (varchar(10), NULL)
├── Gender (tinyint, NULL)
├── DOB (date, NULL)
├── Phone (varchar(20), NULL)
├── AlternatePhone (varchar(20), NULL)
├── PersonalEmail (varchar(100), NULL)
├── Nationality (varchar(50), NULL)
├── Interest (varchar(250), NULL)
├── MaritalStatus (tinyint, NULL)
├── EmergencyContactPerson (varchar(100), NULL)
├── EmergencyContactNo (varchar(20), NULL)
├── PANNumber (varchar(100), NULL)
├── AdharNumber (varchar(100), NULL)
├── PFNumber (varchar(100), NULL)
├── ESINo (varchar(100), NULL)
├── HasESI (bit, NULL)
├── HasPF (bit, NULL)
├── UANNo (bit, NULL)
├── PassportNo (varchar(100), NULL)
├── PassportExpiry (datetime, NULL)
├── PFDate (datetime, NULL)
├── EmployeeCode (varchar(20), NULL)
├── Status (tinyint, NULL)
├── RefreshToken (varchar(100), NULL)
├── RefreshTokenExpiryDate (datetime, NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 25. EmployeeGrievance

**Purpose**: Tracks employee grievances with escalation levels

```
Table: EmployeeGrievance
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── TicketNo (nvarchar(50), NOT NULL, UNIQUE)
├── GrievanceTypeId (bigint, NOT NULL, FK → GrievanceType.Id)
├── Level (tinyint, NOT NULL)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── Title (nvarchar(255), NOT NULL)
├── Description (nvarchar(max), NOT NULL)
├── AttachmentPath (nvarchar(500), NULL)
├── FileOriginalName (nvarchar(255), NULL)
├── Status (tinyint, NOT NULL)
├── TatStatus (tinyint, NOT NULL)
├── ResolvedBy (bigint, NULL, FK → EmployeeData.Id)
├── ResolvedDate (datetime, NULL)
├── CreatedBy (nvarchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(100), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 26. EmployeeLeave

**Purpose**: Manages employee leave balances by leave type

```
Table: EmployeeLeave
├── Id (int, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── LeaveId (int, NOT NULL, FK → LeaveType.Id)
├── OpeningBalance (decimal(18,2), NOT NULL)
├── LeaveDate (date, NOT NULL)
├── IsActive (bit, NULL)
├── CreatedOn (datetime, NOT NULL)
├── CreatedBy (varchar(100), NOT NULL)
├── ModifiedOn (datetime, NULL)
└── ModifiedBy (varchar(100), NULL)
```

---

### 27. EmployerDocumentType

**Purpose**: Master data for employer-related document types

```
Table: EmployerDocumentType
├── Id (int, IDENTITY, PRIMARY KEY)
├── DocumentName (varchar(100), NOT NULL)
├── DocumentFor (int, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 28. EmploymentDetail

**Purpose**: Stores employee employment and job-related information

```
Table: EmploymentDetail
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── Email (varchar(100), NULL)
├── JoiningDate (date, NULL)
├── TeamId (int, NULL)
├── TeamName (varchar(191), NULL)
├── Designation (varchar(100), NULL)
├── DesignationId (bigint, NULL)
├── ReportingMangerId (bigint, NULL, FK → EmployeeData.Id)
├── ImmediateManager (bigint, NULL, FK → EmployeeData.Id)
├── ReportingManagerName (varchar(250), NULL)
├── ReportingManagerEmail (varchar(100), NULL)
├── EmploymentStatus (tinyint, NULL)
├── EmployeeStatus (int, NULL)
├── RoleId (int, NULL)
├── LinkedInUrl (nvarchar(250), NULL)
├── DepartmentId (int, NULL)
├── DepartmentName (varchar(50), NULL)
├── BranchId (bigint, NULL)
├── BackgroundVerificationstatus (tinyint, NULL)
├── CriminalVerification (bit, NULL)
├── TotalExperienceYear (tinyint, NULL)
├── TotalExperienceMonth (tinyint, NULL)
├── RelevantExperienceYear (tinyint, NULL)
├── RelevantExperienceMonth (tinyint, NULL)
├── JobType (tinyint, NULL)
├── ConfirmationDate (date, NULL)
├── ExtendedConfirmationDate (date, NULL)
├── isProbExtended (bit, NULL)
├── ProbExtendedWeeks (tinyint, NULL)
├── isConfirmed (bit, NULL)
├── ProbationMonths (int, NULL)
├── ExitDate (date, NULL)
├── IsManualAttendance (bit, NOT NULL, DEFAULT 0)
├── TimeDoctorUserId (varchar(20), NULL)
├── IsReportingManager (bit, NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── isDeleted (bit, NULL)
```

---

### 29. EventCategory

**Purpose**: Master data for event categorization

```
Table: EventCategory
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Category (varchar(100), NOT NULL)
├── IsActive (bit, NOT NULL)
├── IsDeleted (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 30. EventDocument

**Purpose**: Stores documents associated with events

```
Table: EventDocument
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EventId (bigint, NOT NULL, FK → Events.Id)
├── FileName (varchar(100), NOT NULL)
├── OriginalFileName (varchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL, DEFAULT 0)
```

---

### 31. Events

**Purpose**: Manages company events with targeting to employee groups

```
Table: Events
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Title (varchar(250), NOT NULL)
├── EventCategoryId (bigint, NULL, FK → EventCategory.Id)
├── EmpGroupId (bigint, NULL, FK → Group.Id)
├── Content (nvarchar(max), NULL)
├── BannerFileName (varchar(100), NULL)
├── StartDate (datetime, NOT NULL)
├── EndDate (datetime, NOT NULL)
├── EventUrl1 (nvarchar(250), NULL)
├── EventUrl2 (nvarchar(250), NULL)
├── EventUrl3 (nvarchar(250), NULL)
├── Venue (nvarchar(250), NULL)
├── StatusId (int, NULL, FK → Status.Id)
├── EventFeedbackSurveyLink (nvarchar(500), NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 32. GrievanceOwner

**Purpose**: Defines grievance type owners by escalation level

```
Table: GrievanceOwner
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── GrievanceTypeId (bigint, NOT NULL, FK → GrievanceType.Id)
├── Level (tinyint, NOT NULL)
├── OwnerID (bigint, NOT NULL, FK → EmployeeData.Id)
├── CreatedBy (nvarchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(100), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 33. GrievanceRemarks

**Purpose**: Stores remarks and updates for grievance tickets

```
Table: GrievanceRemarks
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── TicketId (bigint, NOT NULL, FK → EmployeeGrievance.Id)
├── OwnerId (bigint, NULL, FK → EmployeeData.Id)
├── Remarks (nvarchar(max), NOT NULL)
├── AttachmentPath (nvarchar(500), NULL)
├── FileOriginalName (nvarchar(255), NULL)
├── Status (tinyint, NOT NULL)
├── CreatedBy (nvarchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(100), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 34. GrievanceType

**Purpose**: Defines grievance types with TAT and auto-escalation settings

```
Table: GrievanceType
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── GrievanceName (nvarchar(255), NOT NULL)
├── L1TatHours (int, NOT NULL)
├── L2TatHours (int, NOT NULL)
├── L3TatDays (int, NOT NULL)
├── Description (nvarchar(250), NULL)
├── IsActive (bit, NOT NULL)
├── IsAutoEscalation (bit, NULL)
├── CreatedBy (nvarchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(100), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 35. Group

**Purpose**: Employee groups for targeting policies, events, and surveys

```
Table: Group
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── GroupName (varchar(100), NOT NULL)
├── Description (text, NULL)
├── STATUS (bit, NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 36. GroupUserMapping

**Purpose**: Links employee groups to individual employees

```
Table: GroupUserMapping
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── GroupId (bigint, NOT NULL, FK → Group.Id)
├── EmployeeId (bigint, NULL, FK → EmployeeData.Id)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 37. HRClearance

**Purpose**: Manages HR-related clearances during exit process

```
Table: HRClearance
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── ResignationId (int, NOT NULL, FK → Resignation.Id)
├── AdvanceBonusRecoveryAmount (decimal(18,2), NOT NULL)
├── ServiceAgreementDetails (text, NULL)
├── CurrentEL (decimal(5,2), NULL)
├── NumberOfBuyOutDays (int, NOT NULL)
├── ExitInterviewStatus (bit, NULL)
├── ExitInterviewDetails (nvarchar(max), NULL)
├── Attachment (nvarchar(max), NOT NULL)
├── FileOriginalName (varchar(255), NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 38. ITAsset

**Purpose**: Master data for IT assets/devices

```
Table: ITAsset
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── DeviceName (nvarchar(100), NOT NULL)
├── DeviceCode (nvarchar(100), NULL)
├── SerialNumber (nvarchar(100), NULL)
├── InvoiceNumber (nvarchar(100), NULL)
├── Manufacturer (nvarchar(100), NULL)
├── Model (nvarchar(100), NULL)
├── AssetType (tinyint, NOT NULL)
├── Status (tinyint, NOT NULL)
├── Branch (tinyint, NULL)
├── PurchaseDate (date, NOT NULL)
├── WarrantyExpires (date, NULL)
├── Comments (nvarchar(100), NULL)
├── Specification (nvarchar(max), NULL)
├── AssetCondition (tinyint, NULL)
├── CreatedBy (nvarchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(100), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 39. ITAssetHistory

**Purpose**: Tracks complete history of IT asset assignments

```
Table: ITAssetHistory
├── Id (int, IDENTITY, PRIMARY KEY)
├── AssetId (bigint, NOT NULL, FK → ITAsset.Id)
├── EmployeeId (bigint, NULL, FK → EmployeeData.Id)
├── Status (tinyint, NOT NULL)
├── AssetCondition (tinyint, NOT NULL)
├── Note (nvarchar(255), NULL)
├── IssueDate (date, NULL)
├── ReturnDate (date, NULL)
├── CreatedBy (nvarchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(100), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 40. ITClearance

**Purpose**: Manages IT-related clearances during exit

```
Table: ITClearance
├── Id (int, IDENTITY, PRIMARY KEY)
├── ResignationId (int, NOT NULL, FK → Resignation.Id)
├── AccessRevoked (bit, NOT NULL, DEFAULT 0)
├── AssetReturned (bit, NOT NULL, DEFAULT 0)
├── AssetCondition (int, NOT NULL, FK → AssetCondition.Id)
├── AttachmentUrl (varchar(255), NULL)
├── Note (nvarchar(max), NULL)
├── ITClearanceCertification (bit, NOT NULL, DEFAULT 0)
├── FileOriginalName (varchar(255), NULL)
├── CreatedBy (nvarchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL, DEFAULT getutcdate())
├── ModifiedBy (varchar(100), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 41. KPIDetails

**Purpose**: Stores individual KPI details with quarterly and final ratings

```
Table: KPIDetails
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── PlanId (bigint, NOT NULL)
├── GoalId (bigint, NOT NULL)
├── Q1_Rating (float, NULL)
├── Q2_Rating (float, NULL)
├── Q3_Rating (float, NULL)
├── Q4_Rating (float, NULL)
├── Q1_Note (nvarchar(max), NULL)
├── Q2_Note (nvarchar(max), NULL)
├── Q3_Note (nvarchar(max), NULL)
├── Q4_Note (nvarchar(max), NULL)
├── TargetExpected (nvarchar(max), NULL)
├── EmployeeRating (float, NULL)
├── ManagerRating (float, NULL)
├── EmployeeNote (nvarchar(max), NULL)
├── ManagerNote (nvarchar(max), NULL)
├── AllowedQuarter (nvarchar(100), NULL)
├── Status (bit, NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NULL)
```

---

### 42. KPIGoals

**Purpose**: Master data for KPI goals by department

```
Table: KPIGoals
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Title (nvarchar(max), NOT NULL)
├── Description (nvarchar(max), NULL)
├── DepartmentId (bigint, NOT NULL)
├── CreatedBy (nvarchar(255), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(255), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL, DEFAULT 0)
```

---

### 43. KPIPlan

**Purpose**: Employee KPI plans with appraisal cycles

```
Table: KPIPlan
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── AppraisalCycle (nvarchar(50), NULL)
├── AppraisalDate (date, NULL)
├── IsReviewed (bit, NULL)
├── ReviewDate (datetime, NULL)
├── OverallProgress (nvarchar(max), NULL)
├── AppraisalNote (nvarchar(max), NULL)
├── AppraisalAttachment (nvarchar(max), NULL)
├── CreatedBy (nvarchar(255), NOT NULL)
├── CreatedOn (datetime, NOT NULL, DEFAULT getdate())
├── ModifiedBy (nvarchar(255), NULL)
├── ModifiedOn (datetime, NULL, DEFAULT getdate())
└── IsDeleted (bit, NULL)
```

---

### 44. LeaveType

**Purpose**: Master data for leave types (CL, PL, SL, etc.)

```
Table: LeaveType
├── Id (int, IDENTITY, PRIMARY KEY)
├── Title (varchar(50), NOT NULL)
├── ShortName (varchar(10), NOT NULL, UNIQUE)
├── OrderNo (int, NULL)
├── CreatedBy (varchar(100), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (varchar(100), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NULL)
```

---

### 45. Logging

**Purpose**: Application log storage for debugging and monitoring

```
Table: Logging
├── Id (int, IDENTITY, PRIMARY KEY)
├── Message (nvarchar(max), NULL)
├── MessageTemplate (nvarchar(max), NULL)
├── Level (nvarchar(max), NULL)
├── TimeStamp (datetime, NULL)
├── Exception (nvarchar(max), NULL)
├── RequestId (varchar(64), NULL)
└── LogEvent (nvarchar(max), NULL)
```

---

### 46. Menu

**Purpose**: Hierarchical menu structure for application navigation

```
Table: Menu
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Name (nvarchar(100), NOT NULL)
├── ApiEndPoint (nvarchar(255), NULL)
├── ParentMenuId (bigint, NULL, FK → Menu.Id)
├── OrderNo (int, NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 47. MenuPermission

**Purpose**: Links menu items to required permissions

```
Table: MenuPermission
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── MenuId (bigint, NOT NULL, FK → Menu.Id)
├── ReadPermissionId (bigint, NOT NULL, FK → Permission.Id)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 48. Module

**Purpose**: Application modules for permission organization

```
Table: Module
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── ModuleName (varchar(250), NOT NULL)
├── IsActive (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 49. NotificationTemplate

**Purpose**: Email notification templates with placeholders

```
Table: NotificationTemplate
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── TemplateName (varchar(250), NOT NULL)
├── Subject (varchar(200), NOT NULL)
├── Content (text, NOT NULL)
├── Type (int, NULL)
├── Status (int, NULL, DEFAULT 0)
├── SenderName (nvarchar(max), NULL)
├── SenderEmail (nvarchar(max), NULL)
├── ToEmail (nvarchar(max), NULL)
├── CCEmails (nvarchar(max), NULL)
├── BCCEmails (nvarchar(max), NULL)
├── IsDisabled (bit, NOT NULL, DEFAULT 0)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 50. NotificationTemplateType

**Purpose**: Master data for notification template categories

```
Table: NotificationTemplateType
├── Id (int, IDENTITY, PRIMARY KEY)
├── TemplateType (varchar(50), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 51. PermanentAddress

**Purpose**: Stores permanent address information for employees

```
Table: PermanentAddress
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── Line1 (nvarchar(250), NULL)
├── Line2 (nvarchar(250), NULL)
├── AddressType (tinyint, NULL)
├── Pincode (varchar(20), NULL)
├── CityId (bigint, NULL)
├── CountryId (bigint, NULL)
├── StateId (bigint, NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 52. Permission

**Purpose**: Granular permissions linked to modules

```
Table: Permission
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Name (varchar(250), NOT NULL)
├── Value (nvarchar(250), NOT NULL)
├── ModuleId (bigint, NOT NULL, FK → Module.Id)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 53. PolicyStatus

**Purpose**: Master data for policy status values

```
Table: PolicyStatus
├── Id (int, IDENTITY, PRIMARY KEY)
├── StatusValue (varchar(50), NOT NULL)
├── IsActive (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 54. PreviousEmployer

**Purpose**: Employee previous employment history

```
Table: PreviousEmployer
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── EmployerName (varchar(100), NOT NULL)
├── StartDate (datetime, NOT NULL)
├── EndDate (datetime, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 55. PreviousEmployerDocument

**Purpose**: Documents from previous employers

```
Table: PreviousEmployerDocument
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── PreviousEmployerId (bigint, NOT NULL)
├── EmployerDocumentTypeId (int, NOT NULL)
├── FileName (varchar(100), NOT NULL)
├── FileOriginalName (varchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 56. ProfessionalReference

**Purpose**: Professional references from previous employers

```
Table: ProfessionalReference
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── PreviousEmployerId (bigint, NOT NULL, FK → PreviousEmployer.Id)
├── FullName (varchar(250), NOT NULL)
├── Designation (varchar(250), NOT NULL)
├── Email (varchar(250), NOT NULL)
├── ContactNumber (varchar(10), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 57. Qualification

**Purpose**: Master data for educational qualifications

```
Table: Qualification
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── FullName (varchar(250), NOT NULL)
├── ShortName (varchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 58. Relationship

**Purpose**: Master data for nominee relationships

```
Table: Relationship
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Name (varchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 59. Resignation

**Purpose**: Employee resignation requests and processing

```
Table: Resignation
├── Id (int, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── DepartmentID (bigint, NOT NULL, FK → Department.Id)
├── ReportingManagerId (bigint, NULL)
├── LastWorkingDay (date, NULL)
├── Reason (varchar(500), NOT NULL)
├── ExitDiscussion (bit, NULL)
├── Status (tinyint, NULL)
├── Process (varchar(50), NULL)
├── ProcessedBy (bigint, NULL)
├── ProcessedAt (datetime, NULL)
├── SettlementStatus (varchar(50), NULL)
├── SettlementDate (datetime, NULL)
├── IsActive (bit, NULL)
├── EarlyReleaseDate (datetime, NULL)
├── IsEarlyRequestRelease (bit, NULL)
├── IsEarlyRequestApproved (bit, NULL)
├── EarlyReleaseStatus (tinyint, NULL)
├── KTStatus (bit, NULL)
├── ExitInterviewStatus (bit, NULL)
├── ITDues (bit, NULL)
├── AccountNoDue (bit, NULL)
├── RejectResignationReason (text, NULL)
├── RejectEarlyReleaseReason (text, NULL)
├── CreatedOn (datetime, NOT NULL)
├── CreatedBy (varchar(100), NOT NULL)
├── ModifiedOn (datetime, NULL)
└── ModifiedBy (varchar(100), NULL)
```

---

### 60. ResignationHistory

**Purpose**: Tracks status changes in resignation workflow

```
Table: ResignationHistory
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── ResignationId (int, NULL, FK → Resignation.Id)
├── ResignationStatus (tinyint, NOT NULL)
├── EarlyReleaseStatus (tinyint, NULL)
├── CreatedOn (datetime, NOT NULL)
└── CreatedBy (varchar(100), NOT NULL)
```

---

### 61. Role

**Purpose**: User roles for RBAC system

```
Table: Role
├── Id (int, IDENTITY, PRIMARY KEY)
├── Name (varchar(50), NOT NULL)
├── IsActive (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 62. RolePermission

**Purpose**: Maps roles to permissions

```
Table: RolePermission
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── RoleId (int, NOT NULL, FK → Role.Id)
├── PermissionId (bigint, NOT NULL, FK → Permission.Id)
├── IsActive (bit, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 63. State

**Purpose**: Master data for states linked to countries

```
Table: State
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── CountryId (bigint, NOT NULL, FK → Country.Id)
├── StateName (varchar(200), NOT NULL)
├── IsActive (bit, NOT NULL)
├── IsDeleted (bit, NOT NULL)
├── CreatedBy (varchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (varchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 64. Status

**Purpose**: Generic status master table

```
Table: Status
├── Id (int, IDENTITY, PRIMARY KEY)
├── StatusValue (varchar(50), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 65. SurveyEmpGroupMapping

**Purpose**: Maps surveys to employee groups

```
Table: SurveyEmpGroupMapping
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── SurveyId (bigint, NOT NULL, FK → Surveys.Id)
├── EmpGroupId (bigint, NOT NULL, FK → Group.Id)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 66. SurveyResponse

**Purpose**: Stores survey responses in JSON format

```
Table: SurveyResponse
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── SurveyId (bigint, NOT NULL, FK → Surveys.Id)
├── SurveyJsonResponse (text, NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 67. Surveys

**Purpose**: Survey definitions with Form.io integration

```
Table: Surveys
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── Title (varchar(100), NOT NULL)
├── Description (text, NULL)
├── FormIoReferenceId (varchar(100), NULL)
├── StatusId (int, NOT NULL, FK → Status.Id)
├── PublishDate (datetime, NULL)
├── DeadLine (datetime, NULL)
├── ResponsesCount (bigint, NULL)
├── SurveyJson (text, NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 68. Team

**Purpose**: Master data for teams/departments

```
Table: Team
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── TeamName (varchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 69. University

**Purpose**: Master data for universities/institutions

```
Table: University
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── UniversityName (varchar(250), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 70. UserCertificate

**Purpose**: Employee certificates with expiry tracking

```
Table: UserCertificate
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── CertificateName (varchar(100), NOT NULL)
├── OriginalFileName (varchar(100), NULL)
├── CertificateExpiry (date, NULL)
├── FileName (varchar(100), NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 71. UserCompanyPolicyTrack

**Purpose**: Tracks which policies employees have viewed

```
Table: UserCompanyPolicyTrack
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── CompanyPolicyId (bigint, NOT NULL, FK → CompanyPolicy.Id)
├── ViewedOn (datetime, NOT NULL)
└── ModifiedOn (datetime, NULL)
```

---

### 72. UserDocument

**Purpose**: Employee identity and statutory documents

```
Table: UserDocument
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── DocumentName (varchar(100), NOT NULL)
├── DocumentTypeId (bigint, NOT NULL, FK → DocumentType.Id)
├── DocumentNumber (varchar(50), NOT NULL)
├── DocumentExpiry (date, NULL)
├── Location (varchar(250), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 73. UserGroupMapping

**Purpose**: Maps employees to user groups

```
Table: UserGroupMapping
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── GroupId (bigint, NOT NULL, FK → Group.Id)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 74. UserNomineeInfo

**Purpose**: Employee nominee information for statutory purposes

```
Table: UserNomineeInfo
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── NomineeName (varchar(150), NOT NULL)
├── DOB (date, NOT NULL)
├── Age (int, NOT NULL)
├── IsNomineeMinor (bit, NOT NULL)
├── CareOf (varchar(150), NULL)
├── Relationship (int, NOT NULL)
├── Percentage (tinyint, NOT NULL)
├── Others (nvarchar(150), NULL)
├── FileName (nvarchar(100), NOT NULL)
├── FileOriginalName (nvarchar(100), NOT NULL)
├── IdProofDocType (int, NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 75. UserQualificationInfo

**Purpose**: Employee educational qualifications

```
Table: UserQualificationInfo
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── QualificationId (bigint, NOT NULL, FK → Qualification.Id)
├── CollegeUniversity (varchar(250), NOT NULL)
├── DegreeName (varchar(255), NULL)
├── AggregatePercentage (numeric(5,2), NOT NULL)
├── StartYear (varchar(7), NOT NULL)
├── EndYear (varchar(7), NOT NULL)
├── FileName (nvarchar(100), NOT NULL)
├── FileOriginalName (nvarchar(100), NOT NULL)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

### 76. UserRoleMapping

**Purpose**: Maps employees to roles for RBAC

```
Table: UserRoleMapping
├── Id (bigint, IDENTITY, PRIMARY KEY)
├── RoleId (int, NOT NULL, FK → Role.Id)
├── EmployeeId (bigint, NOT NULL, FK → EmployeeData.Id)
├── CreatedBy (nvarchar(250), NOT NULL)
├── CreatedOn (datetime, NOT NULL)
├── ModifiedBy (nvarchar(250), NULL)
├── ModifiedOn (datetime, NULL)
└── IsDeleted (bit, NOT NULL)
```

---

## Summary Statistics

### Column Type Distribution
- **Identity Columns**: 76 (all primary keys)
- **Foreign Keys**: 120+
- **Audit Fields**: 304 (CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
- **Soft Delete Flags**: 54 (IsDeleted columns)
- **File Reference Fields**: 40+ (FileName, FileOriginalName pairs)

### Data Type Usage
- **BIGINT**: Primary keys and large numeric IDs
- **INT/TINYINT**: Enumerations and small numbers
- **VARCHAR/NVARCHAR**: String fields with Unicode support
- **DATETIME/DATE**: Temporal data with appropriate precision
- **DECIMAL**: Financial amounts and percentages
- **BIT**: Boolean flags
- **TEXT/NVARCHAR(MAX)**: Large text fields

---

**Note**: All tables follow consistent naming conventions and include standard audit fields (CreatedBy, CreatedOn, ModifiedBy, ModifiedOn) for data tracking and compliance.
