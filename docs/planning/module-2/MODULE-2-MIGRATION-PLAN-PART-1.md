@'
# Module-2 Employee Management Migration Plan - Part 1
## Module Overview, Database Design & Laravel Models

**Migration Context**: .NET/React → Laravel/Vue.js  
**Date**: November 10, 2025  
**Module Scope**: 21 tables, 80+ endpoints, 97 features

---

## 1. MODULE OVERVIEW

### 1.1 Purpose in HRMS

Module-2 (Employee Management) is the **core hub** of the HRMS system, managing the complete employee lifecycle from onboarding through active employment. It serves as the central data repository that all other modules depend on.

**Core Responsibilities**:
- Employee onboarding and profile creation
- Personal, employment, and statutory information management
- Educational qualifications and professional certifications
- Family information and nominee management (PF/Insurance)
- Previous employment history with references
- Document management (identity proofs, certificates, employer documents)
- Bank account details with encryption
- Address management (current and permanent)
- Reporting hierarchy and organizational structure

### 1.2 Key Features & Business Logic

**97 Implemented Features across 8 categories**:

1. **Onboarding Workflow (Features 1-15)**
   - Sequential employee code generation (EMP-0001, EMP-0002...)
   - Time Doctor integration for automatic attendance tracking
   - Leave balance initialization based on joining date and gender
   - Welcome email notification queue
   - Profile completeness tracking (8 sections, weighted scoring)

2. **Personal Details Management (Features 16-25)**
   - Demographic information (Name, DOB, Gender, Blood Group)
   - Contact details (Phone, Email, Emergency Contact)
   - Statutory information (PAN, Aadhaar, Passport, ESI, PF, UAN)
   - Profile photo upload to Azure Blob Storage
   - Marital status and nationality tracking

3. **Document Management (Features 26-35)**
   - Identity document upload with expiry tracking
   - Document type validation (PAN, Aadhaar, Passport, Driving License)
   - Azure Blob Storage integration (4 containers)
   - Secure SAS URL generation for downloads (15-min expiry)
   - File size (max 5MB) and type validation (PDF, JPG, PNG, DOC, DOCX)

4. **Bank Details (Features 36-40)**
   - Encrypted bank account storage
   - Account number masking for non-HR roles (XXXX1234)
   - IFSC code validation
   - Active/inactive account management
   - Multiple bank accounts per employee

5. **Family & Nominees (Features 41-50)**
   - Nominee information with percentage allocation
   - **Critical Validation**: Total nominee percentage must equal 100%
   - Minor nominee handling with guardian (CareOf) field
   - Relationship mapping (Father, Mother, Spouse, Son, Daughter)
   - Nominee ID proof document storage

6. **Education & Certification (Features 51-62)**
   - Educational qualifications with university/college details
   - Degree name, aggregate percentage, year range
   - Professional certification tracking with expiry dates
   - Document upload for degrees and certificates
   - Qualification type master data (B.Tech, MBA, M.Tech, etc.)

7. **Employment History (Features 63-75)**
   - Previous employer details (Name, Duration, Designation)
   - Professional references linked to previous employers
   - Employer document uploads (Offer Letter, Relieving Letter, Experience Certificate)
   - Reference contact information validation

8. **Search & Reporting (Features 76-97)**
   - Advanced search with 15+ filters
   - Employee list pagination and sorting
   - Excel export functionality
   - Bulk import from Excel
   - Profile view with all sections
   - Employment detail updates
   - Department/Team/Designation management
   - Reporting structure updates
   - Role assignment and permissions

### 1.3 Dependencies on Other Modules

**Upstream Dependencies** (Module-2 requires these):
- **Module-1 (Authentication & Authorization)**: JWT tokens, role-based permissions, user authentication
- **Master Data**: Country, State, City, Department, Designation, Team, Qualification, University, Relationship, DocumentType

**Downstream Dependencies** (These modules require Module-2):
- **Module-3 (Attendance)**: TimeDoctorUserId for time tracking integration
- **Module-4 (Exit Management)**: Employee details for resignation workflow
- **Module-5 (Asset Management)**: Employee status for asset allocation
- **Module-8 (Leave Management)**: Employee joining date and gender for leave accrual calculation
- **Module-11 (Reporting & Analytics)**: Employee data aggregation
- **Module-12 (Grievance)**: Employee information for ticket assignment
- **Dashboard Module**: Employee count, birthday widget, profile completeness metrics

**External Service Dependencies**:
- **Azure Blob Storage**: Document storage (ProfileImage, UserDocumentContainer, EmployerDocumentContainer containers)
- **Time Doctor API**: User lookup by email for attendance tracking
- **Email Service**: Welcome emails, notification queue
- **Leave Accrual Service**: Opening balance calculation for new joiners

---

## 2. DATABASE DESIGN (POST-MIGRATION)

### 2.1 Schema Overview

**Total Tables**: 21 (9 detail tables + 12 master/lookup tables)

**Naming Convention**: Preserve PascalCase from SQL Server for compatibility
**Primary Keys**: `id` (BIGINT UNSIGNED AUTO_INCREMENT)
**Soft Deletes**: `is_deleted` (TINYINT, 0=Active, 1=Deleted)
**Audit Fields**: `created_by`, `created_on`, `modified_by`, `modified_on`

### 2.2 Core Detail Tables (9)

#### **Table 1: employee_data**
```sql
CREATE TABLE employee_data (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50) NULL,
    last_name VARCHAR(50) NOT NULL,
    father_name VARCHAR(100) NULL,
    file_name VARCHAR(100) NULL COMMENT 'Profile photo filename',
    file_original_name VARCHAR(100) NULL,
    blood_group VARCHAR(10) NULL,
    gender TINYINT NULL COMMENT '1=Male, 2=Female, 3=Other',
    dob DATE NULL,
    phone VARCHAR(20) NULL,
    alternate_phone VARCHAR(20) NULL,
    personal_email VARCHAR(100) NULL,
    nationality VARCHAR(50) NULL,
    interest VARCHAR(250) NULL,
    marital_status TINYINT NULL COMMENT '1=Single, 2=Married, 3=Divorced, 4=Widowed',
    emergency_contact_person VARCHAR(100) NULL,
    emergency_contact_no VARCHAR(20) NULL,
    pan_number VARCHAR(100) NULL,
    aadhar_number VARCHAR(100) NULL,
    pf_number VARCHAR(100) NULL,
    esi_no VARCHAR(100) NULL,
    has_esi BIT NULL,
    has_pf BIT NULL,
    uan_no BIT NULL,
    passport_no VARCHAR(100) NULL,
    passport_expiry DATETIME NULL,
    pf_date DATETIME NULL,
    employee_code VARCHAR(20) NULL UNIQUE COMMENT 'EMP-0001 format',
    status TINYINT NULL COMMENT '1=Active, 2=FnF Pending, 3=On Notice, 4=Ex Employee',
    refresh_token VARCHAR(100) NULL,
    refresh_token_expiry_date DATETIME NULL,
    created_by NVARCHAR(250) NOT NULL,
    created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by NVARCHAR(250) NULL,
    modified_on DATETIME NULL,
    is_deleted BIT NOT NULL DEFAULT 0,
    INDEX idx_employee_code (employee_code),
    INDEX idx_status (status),
    INDEX idx_pan (pan_number),
    INDEX idx_aadhar (aadhar_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

#### **Table 2: employment_detail**
``sql
CREATE TABLE employment_detail (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    email VARCHAR(100) NULL UNIQUE,
    joining_date DATE NULL,
    team_id INT NULL,
    team_name VARCHAR(191) NULL,
    designation VARCHAR(100) NULL,
    designation_id BIGINT UNSIGNED NULL,
    reporting_manager_id BIGINT UNSIGNED NULL COMMENT 'Functional manager',
    immediate_manager BIGINT UNSIGNED NULL COMMENT 'Direct supervisor',
    employment_type TINYINT NULL COMMENT '1=Permanent, 2=Contract, 3=Intern',
    department_id BIGINT UNSIGNED NULL,
    employment_status TINYINT NULL COMMENT '1=Active, 2=Probation, 3=Notice Period',
    confirmation_date DATE NULL,
    notice_period INT NULL COMMENT 'Days',
    time_doctor_user_id INT NULL,
    is_manual_attendance BIT NULL DEFAULT 0,
    role_id BIGINT UNSIGNED NULL,
    branch VARCHAR(100) NULL,
    created_by NVARCHAR(250) NOT NULL,
    created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by NVARCHAR(250) NULL,
    modified_on DATETIME NULL,
    is_deleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employee_data(id) ON DELETE RESTRICT,
    FOREIGN KEY (reporting_manager_id) REFERENCES employee_data(id) ON DELETE SET NULL,
    FOREIGN KEY (immediate_manager) REFERENCES employee_data(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL,
    FOREIGN KEY (designation_id) REFERENCES designation(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL,
    INDEX idx_employee (employee_id),
    INDEX idx_email (email),
    INDEX idx_reporting (reporting_manager_id),
    INDEX idx_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

Table 3-9: Additional Tables
-- address, permanent_address, bank_details, user_qualification_info,
-- user_certificate, user_nominee_info, user_document,
-- current_employer_document, previous_employer, professional_reference,
-- previous_employer_document
-- (Full SQL schemas provided in migration files)

2.3 Master/Lookup Tables (12)
-- country, state, city (Geographic hierarchy)
-- department, team, designation (Organizational structure)
-- document_type, qualification, university (Reference data)
-- relationship, employer_document_type, role (Enums & RBAC)

3. LARAVEL MODEL STRUCTURE
3.1 EmployeeData Model
<?php
// app/Models/EmployeeData.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeData extends BaseModel
{
    protected $table = 'employee_data';

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'father_name',
        'file_name', 'file_original_name', 'blood_group', 'gender',
        'dob', 'phone', 'alternate_phone', 'personal_email',
        'nationality', 'interest', 'marital_status',
        'emergency_contact_person', 'emergency_contact_no',
        'pan_number', 'aadhar_number', 'pf_number', 'esi_no',
        'has_esi', 'has_pf', 'uan_no', 'passport_no',
        'passport_expiry', 'pf_date', 'employee_code', 'status',
        'refresh_token', 'refresh_token_expiry_date'
    ];

    protected $casts = [
        'dob' => 'date',
        'passport_expiry' => 'datetime',
        'pf_date' => 'datetime',
        'has_esi' => 'boolean',
        'has_pf' => 'boolean',
        'uan_no' => 'boolean',
        'refresh_token_expiry_date' => 'datetime',
    ];

    protected $appends = ['full_name', 'age', 'status_text'];

    // Relationships
    public function employmentDetail(): HasOne
    {
        return $this->hasOne(EmploymentDetail::class, 'employee_id');
    }

    public function currentAddress(): HasOne
    {
        return $this->hasOne(Address::class, 'employee_id')
            ->where('address_type', 1);
    }

    public function permanentAddress(): HasOne
    {
        return $this->hasOne(PermanentAddress::class, 'employee_id');
    }

    public function bankDetails(): HasMany
    {
        return $this->hasMany(BankDetails::class, 'employee_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(UserDocument::class, 'employee_id');
    }

    public function qualifications(): HasMany
    {
        return $this->hasMany(UserQualificationInfo::class, 'employee_id');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(UserCertificate::class, 'employee_id');
    }

    public function nominees(): HasMany
    {
        return $this->hasMany(UserNomineeInfo::class, 'employee_id');
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    public function getAgeAttribute(): ?int
    {
        return $this->dob ? $this->dob->age : null;
    }

    public function getStatusTextAttribute(): string
    {
        return match($this->status) {
            1 => 'Active',
            2 => 'F&F Pending',
            3 => 'On Notice',
            4 => 'Ex Employee',
            default => 'Unknown'
        };
    }

    // Business Logic
    public function calculateProfileCompleteness(): int
    {
        $sections = [
            'personal' => 20,
            'employment' => 15,
            'address' => 10,
            'bank' => 10,
            'documents' => 15,
            'education' => 10,
            'family' => 10,
            'nominee' => 10,
        ];

        $completed = 0;

        if ($this->isPersonalDetailsComplete()) {
            $completed += $sections['personal'];
        }

        if ($this->employmentDetail && $this->employmentDetail->isComplete()) {
            $completed += $sections['employment'];
        }

        if ($this->currentAddress && $this->permanentAddress) {
            $completed += $sections['address'];
        }

        if ($this->activeBankDetails) {
            $completed += $sections['bank'];
        }

        if ($this->documents->count() >= 2) {
            $completed += $sections['documents'];
        }

        if ($this->qualifications->count() > 0) {
            $completed += $sections['education'];
        }

        if ($this->nominees->sum('percentage') == 100) {
            $completed += $sections['nominee'];
        }

        return $completed;
    }

    public static function generateNextEmployeeCode(): string
    {
        $lastEmployee = self::orderBy('id', 'desc')->first();
        
        if (!$lastEmployee || !$lastEmployee->employee_code) {
            return 'EMP-0001';
        }

        $lastCode = (int) substr($lastEmployee->employee_code, 4);
        $nextCode = $lastCode + 1;
        
        return 'EMP-' . str_pad($nextCode, 4, '0', STR_PAD_LEFT);
    }
}
3.2 EmploymentDetail Model
<?php
// app/Models/EmploymentDetail.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmploymentDetail extends BaseModel
{
    protected $table = 'employment_detail';

    protected $fillable = [
        'employee_id', 'email', 'joining_date', 'team_id',
        'team_name', 'designation', 'designation_id',
        'reporting_manager_id', 'immediate_manager',
        'employment_type', 'department_id', 'employment_status',
        'confirmation_date', 'notice_period', 'time_doctor_user_id',
        'is_manual_attendance', 'role_id', 'branch'
    ];

    protected $casts = [
        'joining_date' => 'date',
        'confirmation_date' => 'date',
        'is_manual_attendance' => 'boolean',
    ];

    // Relationships
    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function designationModel(): BelongsTo
    {
        return $this->belongsTo(Designation::class, 'designation_id');
    }

    public function reportingManager(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'reporting_manager_id');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function isComplete(): bool
    {
        return !empty($this->email) &&
               !empty($this->joining_date) &&
               !empty($this->department_id) &&
               !empty($this->designation_id) &&
               !empty($this->role_id);
    }
}