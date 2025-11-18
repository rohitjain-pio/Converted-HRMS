# HRMS Database Relationships Documentation

## Overview

This document details all foreign key relationships, constraints, and dependencies in the HRMS database.

**Total Foreign Key Relationships**: 95+  
**Self-Referencing Tables**: 2 (Menu, EmploymentDetail)

---

## Relationship Categories

### 1. Employee-Centric Relationships
### 2. Leave Management Relationships
### 3. Asset Management Relationships  
### 4. Exit Process Relationships
### 5. Permission & Security Relationships
### 6. Geographic Hierarchy Relationships
### 7. Policy Management Relationships
### 8. Survey & Event Relationships
### 9. Master Data Relationships

---

## Detailed Relationship Mapping

### 1. EmployeeData (Central Hub Entity)

**One-to-One Relationships:**
- EmployeeData (1) ↔ (1) EmploymentDetail
- EmployeeData (1) ↔ (1) BankDetails

**One-to-Many Relationships:**

```
EmployeeData (1) → (N) Address
├─ Foreign Key: Address.EmployeeId → EmployeeData.Id
└─ Cascade: No explicit cascade defined

EmployeeData (1) → (N) PermanentAddress  
├─ Foreign Key: PermanentAddress.EmployeeId → EmployeeData.Id
└─ Cascade: No explicit cascade defined

EmployeeData (1) → (N) UserDocument
├─ Foreign Key: UserDocument.EmployeeId → EmployeeData.Id
└─ Purpose: Identity and statutory documents

EmployeeData (1) → (N) UserCertificate
├─ Foreign Key: UserCertificate.EmployeeId → EmployeeData.Id
└─ Purpose: Professional certifications

EmployeeData (1) → (N) UserQualificationInfo
├─ Foreign Key: UserQualificationInfo.EmployeeId → EmployeeData.Id
└─ Purpose: Educational qualifications

EmployeeData (1) → (N) UserNomineeInfo
├─ Foreign Key: UserNomineeInfo.EmployeeId → EmployeeData.Id
└─ Purpose: Nominee details for statutory compliance

EmployeeData (1) → (N) CurrentEmployerDocument
├─ Foreign Key: CurrentEmployerDocument.EmployeeId → EmployeeData.Id
└─ Purpose: Current employment documents

EmployeeData (1) → (N) PreviousEmployer
├─ Foreign Key: PreviousEmployer.EmployeeId → EmployeeData.Id
└─ Purpose: Employment history

EmployeeData (1) → (N) AppliedLeaves
├─ Foreign Key: AppliedLeaves.EmployeeId → EmployeeData.Id
└─ Purpose: Leave applications

EmployeeData (1) → (N) EmployeeLeave
├─ Foreign Key: EmployeeLeave.EmployeeId → EmployeeData.Id
└─ Purpose: Leave balance management

EmployeeData (1) → (N) AccrualUtilizedLeave
├─ Foreign Key: AccrualUtilizedLeave.EmployeeId → EmployeeData.Id
└─ Purpose: Leave accrual history

EmployeeData (1) → (N) Attendance
├─ Foreign Key: Attendance.EmployeeId → EmployeeData.Id
├─ Constraint: FK_Attendance_EmployeeData_EmployeeId (WITH NOCHECK)
└─ Purpose: Daily attendance tracking

EmployeeData (1) → (N) CompOffAndSwapHolidayDetail
├─ Foreign Key: CompOffAndSwapHolidayDetail.EmployeeId → EmployeeData.Id
└─ Purpose: Compensatory off and holiday swaps

EmployeeData (1) → (N) EmployeeAsset
├─ Foreign Key: EmployeeAsset.EmployeeId → EmployeeData.Id
└─ Purpose: IT asset assignments

EmployeeData (1) → (N) ITAssetHistory
├─ Foreign Key: ITAssetHistory.EmployeeId → EmployeeData.Id
└─ Purpose: Asset assignment history

EmployeeData (1) → (N) EmployeeGrievance
├─ Foreign Key: EmployeeGrievance.EmployeeId → EmployeeData.Id
└─ Purpose: Grievance tickets raised by employee

EmployeeData (1) → (N) GrievanceOwner
├─ Foreign Key: GrievanceOwner.OwnerID → EmployeeData.Id
└─ Purpose: Grievance ownership assignment

EmployeeData (1) → (N) GrievanceRemarks
├─ Foreign Key: GrievanceRemarks.OwnerId → EmployeeData.Id
└─ Purpose: Grievance updates and remarks

EmployeeData (1) → (N) Resignation
├─ Foreign Key: Resignation.EmployeeId → EmployeeData.Id
└─ Purpose: Resignation applications

EmployeeData (1) → (N) KPIPlan
├─ Foreign Key: KPIPlan.EmployeeId → EmployeeData.Id
└─ Purpose: Performance appraisal plans

EmployeeData (1) → (N) SurveyResponse
├─ Foreign Key: SurveyResponse.EmployeeId → EmployeeData.Id
└─ Purpose: Survey submissions

EmployeeData (1) → (N) UserRoleMapping
├─ Foreign Key: UserRoleMapping.EmployeeId → EmployeeData.Id
└─ Purpose: Role assignments

EmployeeData (1) → (N) UserGroupMapping
├─ Foreign Key: UserGroupMapping.EmployeeId → EmployeeData.Id
└─ Purpose: Group memberships

EmployeeData (1) → (N) GroupUserMapping
├─ Foreign Key: GroupUserMapping.EmployeeId → EmployeeData.Id
└─ Purpose: Group associations

EmployeeData (1) → (N) UserCompanyPolicyTrack
├─ Foreign Key: UserCompanyPolicyTrack.EmployeeId → EmployeeData.Id
└─ Purpose: Policy viewing tracking
```

---

### 2. EmploymentDetail Relationships

**Belongs To:**
```
EmploymentDetail (N) → (1) EmployeeData
└─ Foreign Key: EmploymentDetail.EmployeeId → EmployeeData.Id
```

**Self-Referencing (Reporting Structure):**
```
EmploymentDetail (N) → (1) EmployeeData [as ReportingManager]
├─ Foreign Key: EmploymentDetail.ReportingMangerId → EmployeeData.Id
└─ Purpose: Organizational hierarchy

EmploymentDetail (N) → (1) EmployeeData [as ImmediateManager]
├─ Foreign Key: EmploymentDetail.ImmediateManager → EmployeeData.Id
└─ Purpose: Direct supervisor relationship
```

**Referenced By:**
```
AppliedLeaves (N) → (1) EmploymentDetail
├─ Foreign Key: AppliedLeaves.ReportingManagerId → EmploymentDetail.Id
└─ Purpose: Leave approval workflow
```

---

### 3. Address & Geographic Relationships

**Address Table:**
```
Address (N) → (1) EmployeeData
└─ FK: Address.EmployeeId → EmployeeData.Id

Address (N) → (1) City
└─ FK: Address.CityId → City.Id

Address (N) → (1) State
└─ FK: Address.StateId → State.Id

Address (N) → (1) Country
└─ FK: Address.CountryId → Country.Id
```

**Geographic Hierarchy:**
```
Country (1) → (N) State
└─ FK: State.CountryId → Country.Id

State (1) → (N) City
└─ FK: City.StateId → State.Id
```

---

### 4. Leave Management Relationships

```
LeaveType (1) → (N) EmployeeLeave
├─ FK: EmployeeLeave.LeaveId → LeaveType.Id
└─ Purpose: Leave balance by type

LeaveType (1) → (N) AppliedLeaves
├─ FK: AppliedLeaves.LeaveId → LeaveType.Id
└─ Purpose: Leave application type

LeaveType (1) → (N) AccrualUtilizedLeave
├─ FK: AccrualUtilizedLeave.LeaveId → LeaveType.Id
└─ Purpose: Leave accrual tracking
```

---

### 5. Asset Management Relationships

```
ITAsset (1) → (N) EmployeeAsset
├─ FK: EmployeeAsset.AssetId → ITAsset.Id
└─ Purpose: Asset to employee assignment

ITAsset (1) → (N) ITAssetHistory
├─ FK: ITAssetHistory.AssetId → ITAsset.Id
└─ Purpose: Complete asset lifecycle tracking

EmployeeData (1) → (N) EmployeeAsset
├─ FK: EmployeeAsset.EmployeeId → EmployeeData.Id
└─ Purpose: Employee's assigned assets

EmployeeData (1) → (N) ITAssetHistory
├─ FK: ITAssetHistory.EmployeeId → EmployeeData.Id
└─ Purpose: Employee's asset history
```

---

### 6. Exit Process Relationships

**Resignation Hub:**
```
Resignation (N) → (1) EmployeeData
├─ FK: Resignation.EmployeeId → EmployeeData.Id
└─ Purpose: Employee resignation

Resignation (N) → (1) Department
├─ FK: Resignation.DepartmentID → Department.Id
└─ Purpose: Department-level clearance routing

Resignation (1) → (N) ResignationHistory
├─ FK: ResignationHistory.ResignationId → Resignation.Id
└─ Purpose: Status change tracking

Resignation (1) → (1) ITClearance
├─ FK: ITClearance.ResignationId → Resignation.Id
└─ Purpose: IT department clearance

Resignation (1) → (1) HRClearance
├─ FK: HRClearance.ResignationId → Resignation.Id
└─ Purpose: HR department clearance

Resignation (1) → (1) AccountClearance
├─ FK: AccountClearance.ResignationId → Resignation.Id
└─ Purpose: Finance department clearance

Resignation (1) → (1) DepartmentClearance
├─ FK: DepartmentClearance.ResignationId → Resignation.Id
└─ Purpose: Functional department clearance
```

**IT Clearance:**
```
ITClearance (N) → (1) AssetCondition
├─ FK: ITClearance.AssetCondition → AssetCondition.Id
└─ Purpose: Asset return condition tracking
```

---

### 7. Grievance Management Relationships

```
GrievanceType (1) → (N) EmployeeGrievance
├─ FK: EmployeeGrievance.GrievanceTypeId → GrievanceType.Id
└─ Purpose: Categorize grievances

GrievanceType (1) → (N) GrievanceOwner
├─ FK: GrievanceOwner.GrievanceTypeId → GrievanceType.Id
└─ Purpose: Define escalation owners

EmployeeGrievance (1) → (N) GrievanceRemarks
├─ FK: GrievanceRemarks.TicketId → EmployeeGrievance.Id
└─ Purpose: Track remarks and updates

EmployeeData (1) → (N) EmployeeGrievance [as Resolved By]
├─ FK: EmployeeGrievance.ResolvedBy → EmployeeData.Id
└─ Purpose: Track who resolved the grievance
```

---

### 8. Policy Management Relationships

```
CompanyPolicyDocCategory (1) → (N) CompanyPolicy
├─ FK: CompanyPolicy.DocumentCategoryId → CompanyPolicyDocCategory.Id
└─ Purpose: Policy categorization

PolicyStatus (1) → (N) CompanyPolicy
├─ FK: CompanyPolicy.StatusId → PolicyStatus.Id
└─ Purpose: Policy workflow status

CompanyPolicy (1) → (N) CompanyPolicyHistory
├─ FK: CompanyPolicyHistory.PolicyId → CompanyPolicy.Id
└─ Purpose: Version history tracking

CompanyPolicyDocCategory (1) → (N) CompanyPolicyHistory
├─ FK: CompanyPolicyHistory.DocumentCategoryId → CompanyPolicyDocCategory.Id
└─ Purpose: Historical category reference

PolicyStatus (1) → (N) CompanyPolicyHistory
├─ FK: CompanyPolicyHistory.StatusId → PolicyStatus.Id
└─ Purpose: Historical status reference

CompanyPolicy (1) → (N) UserCompanyPolicyTrack
├─ FK: UserCompanyPolicyTrack.CompanyPolicyId → CompanyPolicy.Id
└─ Purpose: Track user views
```

---

### 9. Permission & Security Relationships

**Module → Permission → Role Chain:**
```
Module (1) → (N) Permission
├─ FK: Permission.ModuleId → Module.Id
└─ Purpose: Group permissions by module

Permission (1) → (N) RolePermission
├─ FK: RolePermission.PermissionId → Permission.Id
└─ Purpose: Assign permissions to roles

Role (1) → (N) RolePermission
├─ FK: RolePermission.RoleId → Role.Id
└─ Purpose: Define role capabilities

Role (1) → (N) UserRoleMapping
├─ FK: UserRoleMapping.RoleId → Role.Id
└─ Purpose: Assign roles to users
```

**Menu-Based Access Control:**
```
Menu (1) → (N) Menu [self-referencing]
├─ FK: Menu.ParentMenuId → Menu.Id
└─ Purpose: Hierarchical menu structure

Menu (1) → (N) MenuPermission
├─ FK: MenuPermission.MenuId → Menu.Id
└─ Purpose: Menu access control

Permission (1) → (N) MenuPermission
├─ FK: MenuPermission.ReadPermissionId → Permission.Id
└─ Purpose: Required permission for menu access
```

---

### 10. Event & Survey Relationships

**Events:**
```
EventCategory (1) → (N) Events
├─ FK: Events.EventCategoryId → EventCategory.Id
└─ Purpose: Event categorization

Group (1) → (N) Events
├─ FK: Events.EmpGroupId → Group.Id
└─ Purpose: Target employee groups

Status (1) → (N) Events
├─ FK: Events.StatusId → Status.Id
└─ Purpose: Event status (Draft/Published)

Events (1) → (N) EventDocument
├─ FK: EventDocument.EventId → Events.Id
└─ Purpose: Event attachments
```

**Surveys:**
```
Status (1) → (N) Surveys
├─ FK: Surveys.StatusId → Status.Id
└─ Purpose: Survey status tracking

Surveys (1) → (N) SurveyEmpGroupMapping
├─ FK: SurveyEmpGroupMapping.SurveyId → Surveys.Id
└─ Purpose: Target survey to groups

Group (1) → (N) SurveyEmpGroupMapping
├─ FK: SurveyEmpGroupMapping.EmpGroupId → Group.Id
└─ Purpose: Group-based targeting

Surveys (1) → (N) SurveyResponse
├─ FK: SurveyResponse.SurveyId → Surveys.Id
└─ Purpose: Collect responses
```

---

### 11. KPI & Performance Management Relationships

```
KPIPlan (N) → (1) EmployeeData
├─ FK: KPIPlan.EmployeeId → EmployeeData.Id
└─ Purpose: Employee performance plan

Note: KPIDetails and KPIGoals have logical relationships through PlanId and GoalId
but these are not enforced via foreign key constraints in the current schema.
```

---

### 12. Document & Qualification Relationships

```
DocumentType (1) → (N) UserDocument
├─ FK: UserDocument.DocumentTypeId → DocumentType.Id
└─ Purpose: Categorize identity documents

Qualification (1) → (N) UserQualificationInfo
├─ FK: UserQualificationInfo.QualificationId → Qualification.Id
└─ Purpose: Educational qualification type

PreviousEmployer (1) → (N) ProfessionalReference
├─ FK: ProfessionalReference.PreviousEmployerId → PreviousEmployer.Id
└─ Purpose: Reference checks from past employers
```

---

### 13. Group Management Relationships

```
Group (1) → (N) GroupUserMapping
├─ FK: GroupUserMapping.GroupId → Group.Id
└─ Purpose: Group membership

Group (1) → (N) UserGroupMapping
├─ FK: UserGroupMapping.GroupId → Group.Id
└─ Purpose: Alternative group mapping
```

---

### 14. Attendance Audit Relationships

```
Attendance (1) → (N) AttendanceAudit
├─ FK: AttendanceAudit.AttendanceId → Attendance.Id
├─ Constraint: FK_AttendanceAudit_Attendance_AttendanceId (WITH NOCHECK)
└─ Purpose: Audit trail for attendance changes
```

---

### 15. Notification System Relationships

```
NotificationTemplate (1) → (N) EmailNotification
├─ FK: EmailNotification.TemplateId → NotificationTemplate.Id
└─ Purpose: Email queue with template reference
```

---

## Constraint Summary

### Primary Key Constraints

All 76 tables have clustered primary key constraints on their `Id` columns:
- Naming Pattern: `PK_[TableName]`
- Type: CLUSTERED INDEX
- Properties: ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON

### Foreign Key Constraints

**Naming Conventions:**
- Pattern: `FK_[ChildTable]_[ParentTable]_[ColumnName]`
- Example: `FK_Address_EmployeeData_EmployeeId`

**Total FK Constraints**: 95+

**Key Characteristics:**
- Most use default CASCADE rules (no explicit ON DELETE/ON UPDATE)
- Some use WITH NOCHECK (Attendance, PermanentAddress)
- All are properly indexed for performance

### Unique Constraints

```
LeaveType
└─ UQ_LeaveType_ShortName (ShortName)

EmployeeGrievance
└─ UNIQUE constraint on TicketNo
```

### Default Constraints

```
Attendance.CreatedOn → getdate()
Attendance.IsDeleted → 0
AttendanceAudit.IsDeleted → 0
ITClearance.AccessRevoked → 0
ITClearance.AssetReturned → 0
ITClearance.ITClearanceCertification → 0
ITClearance.CreatedOn → getutcdate()
KPIGoals.IsDeleted → 0
KPIPlan.CreatedOn → getdate()
KPIPlan.ModifiedOn → getdate()
NotificationTemplate.Status → 0
NotificationTemplate.IsDisabled → 0
CompOffAndSwapHolidayDetail.IsDeleted → 0
EventDocument.IsDeleted → 0
AccrualUtilizedLeave.CreatedOn → getdate()
CronJobLog.CreatedOn → getdate()
```

---

## Relationship Patterns

### 1. Hub-and-Spoke Pattern
- **Hub**: EmployeeData
- **Spokes**: All employee-related tables (25+ relationships)

### 2. Audit Pattern
- History tables: CompanyPolicyHistory, ResignationHistory, ITAssetHistory
- Audit tables: AttendanceAudit
- Tracking tables: UserCompanyPolicyTrack

### 3. Hierarchical Pattern
- Geographic: Country → State → City
- Menu: Menu → Menu (self-referencing)
- Organizational: EmployeeData → EmploymentDetail → ReportingManager

### 4. Many-to-Many Pattern
```
Employee ←→ Group
├─ UserGroupMapping (junction table)
└─ GroupUserMapping (junction table)

Role ←→ Permission
└─ RolePermission (junction table)

Survey ←→ Group
└─ SurveyEmpGroupMapping (junction table)

Menu ←→ Permission
└─ MenuPermission (junction table)
```

### 5. Clearance Workflow Pattern
```
Resignation (hub)
├→ ITClearance
├→ HRClearance
├→ AccountClearance
└→ DepartmentClearance
```

---

## Referential Integrity Rules

### CASCADE Behavior
Most foreign keys do not have explicit CASCADE rules, meaning:
- DELETE: Restricted (will fail if child records exist)
- UPDATE: Restricted

### WITH NOCHECK Constraints
Some constraints created with NOCHECK:
- `FK_Attendance_EmployeeData_EmployeeId`
- `FK_AttendanceAudit_Attendance_AttendanceId`
- `FK_PermanentAddress_EmployeeData_EmployeeId`

**Implication**: These constraints were added after data existed and may not be enforced on existing records.

---

## Orphan Prevention

The database prevents orphan records through:
1. Foreign key constraints on all relationship columns
2. Application-level soft delete (IsDeleted flag)
3. Audit trail preservation

---

## Performance Considerations

### Indexed Relationships
All foreign key columns are automatically indexed (non-clustered) by SQL Server, improving:
- JOIN performance
- Referential integrity checking speed
- Query optimization

### Large Relationship Tables
High-volume relationship tables requiring monitoring:
- Attendance (daily records per employee)
- AccrualUtilizedLeave (transaction-based)
- AttendanceAudit (audit trail)
- EmailNotification (queue table)
- Logging (application logs)

---

## Relationship Validation

### Data Integrity Checks

**Required for Application Queries:**
```sql
-- Verify no orphan EmployeeLeave records
SELECT * FROM EmployeeLeave 
WHERE EmployeeId NOT IN (SELECT Id FROM EmployeeData)

-- Verify no orphan Address records
SELECT * FROM Address 
WHERE EmployeeId NOT IN (SELECT Id FROM EmployeeData)

-- Verify geographic hierarchy integrity
SELECT * FROM City 
WHERE StateId NOT IN (SELECT Id FROM State)
```

### Common Join Patterns

**Employee Full Profile:**
```sql
SELECT e.*, ed.*, a.*, b.* 
FROM EmployeeData e
LEFT JOIN EmploymentDetail ed ON e.Id = ed.EmployeeId
LEFT JOIN Address a ON e.Id = a.EmployeeId
LEFT JOIN BankDetails b ON e.Id = b.EmployeeId
```

**Leave Balance with Type:**
```sql
SELECT el.*, lt.Title, lt.ShortName
FROM EmployeeLeave el
INNER JOIN LeaveType lt ON el.LeaveId = lt.Id
WHERE el.EmployeeId = @EmployeeId
```

**Asset Assignment History:**
```sql
SELECT ia.*, ea.*, e.FirstName, e.LastName
FROM ITAsset ia
INNER JOIN EmployeeAsset ea ON ia.Id = ea.AssetId
INNER JOIN EmployeeData e ON ea.EmployeeId = e.Id
WHERE ea.IsActive = 1
```

---

## Circular Dependency Handling

### EmploymentDetail Self-Reference
```
EmploymentDetail.ReportingMangerId → EmployeeData.Id
EmploymentDetail.ImmediateManager → EmployeeData.Id
```

**Insert Order Requirement:**
1. Insert EmployeeData first
2. Insert EmploymentDetail with NULL managers
3. Update manager references after all employees exist

### Menu Hierarchy
```
Menu.ParentMenuId → Menu.Id (self-reference)
```

**Insert Order Requirement:**
1. Insert root menu items (ParentMenuId = NULL)
2. Insert child menu items referencing parent IDs

---

## Relationship Metadata

### Cardinality Summary

**One-to-One (1:1)**: ~3 relationships
- EmployeeData ↔ EmploymentDetail
- EmployeeData ↔ BankDetails  
- Resignation ↔ Clearance tables

**One-to-Many (1:N)**: ~90 relationships
- Most foreign key relationships

**Many-to-Many (M:N)**: ~6 relationships
- Employee ↔ Group (via UserGroupMapping)
- Role ↔ Permission (via RolePermission)
- Survey ↔ Group (via SurveyEmpGroupMapping)
- Menu ↔ Permission (via MenuPermission)

---

## Best Practices for Relationship Management

1. **Always check foreign key constraints** before deleting records
2. **Use soft deletes** (IsDeleted flag) for data with dependencies
3. **Maintain referential integrity** through application and database layers
4. **Use transactions** when inserting/updating related records
5. **Consider cascade implications** when designing new relationships
6. **Index foreign key columns** for optimal query performance
7. **Document relationship changes** in version control

---

**Last Updated**: November 6, 2025  
**Source**: `Backend\HRMSWebApi\DataBase\Script.md`
