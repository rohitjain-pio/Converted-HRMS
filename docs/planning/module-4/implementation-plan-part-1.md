# Module 4 — Exit Management Migration Plan (Part 1)
# Module Overview, Verification & Backend Migration

---

**Version:** v1.0.0  
**Date:** November 19, 2025  
**Migration Type:** Controlled 1:1 Replication  
**Source:** Legacy React + .NET → Vue.js + Laravel

---

## 1. Module Overview

### Purpose & Scope

**Module 4 — Exit Management** handles the complete employee resignation and exit process from submission through final settlement. This module implements a multi-stage clearance workflow involving HR, Department/Manager, IT, and Accounts teams.

### Core Functionalities

1. **Resignation Submission** — Employee-initiated resignation with automated notice period calculation
2. **Approval Workflow** — Manager/HR resignation acceptance or rejection with reason tracking
3. **Early Release Management** — Employee requests and HR approval for shortened notice periods
4. **Multi-Department Clearance** — Four-stage clearance process (HR, Department, IT, Accounts)
5. **Knowledge Transfer Tracking** — Department-level KT documentation and completion verification
6. **Asset Return & Access Revocation** — IT clearance for physical assets and system access removal
7. **Full & Final Settlement** — Accounts clearance with salary dues, recoveries, and leave encashment
8. **Exit Interview Documentation** — HR exit interview tracking and feedback capture
9. **Audit Trail** — Complete history of all resignation status changes and actions
10. **Email Notifications** — Automated notifications at each workflow stage

### Business Rules Verified

- **Notice Period by Job Type:**
  - Probation: 15 days
  - Training: 15 days
  - Confirmed: 2 months (60 days)

- **Resignation Status Workflow:**
  - Pending → Accepted/Cancelled/Revoked → Completed

- **Employee Status Updates:**
  - Active → Resigned (on acceptance) → Exited (post last working day)

- **Clearance Completion:**
  - All four clearances (HR, Department, IT, Accounts) must complete
  - Status auto-updates to Completed when all clearances done + past last working day

- **Revocation Rules:**
  - Employee can revoke only if Status = Pending (before HR acceptance)
  - After acceptance, revocation not allowed

- **Early Release:**
  - Can be requested only after resignation accepted
  - HR can approve/reject with reason
  - Updates LastWorkingDay if approved

### Dependency Modules

| Dependency | Purpose |
|-----------|---------|
| **Employee Management** | Employee data, reporting structure, employment status updates |
| **Leave Management** | Current leave balances for encashment calculation |
| **Asset Management** | Asset allocation tracking and return verification |
| **Authentication & Authorization** | Role-based permissions (HR, IT, Accounts, Manager) |
| **Email Notification Service** | Automated workflow notifications |
| **Azure Blob Storage** | Clearance document storage |

### Version & Changelog Metadata

**Version:** v1.0.0  
**Changelog:**
- Initial migration plan for Module 4 — Exit Management
- Created implementation plan documentation structure
- Verified all database schema elements from Tables.md and Relations.md
- Mapped legacy .NET controllers to Laravel equivalents
- Identified all React components for Vue migration
- No UNDEFINED elements — all schema verified from legacy database documentation

---

## 2. Verification Checklist

### Database Entities Verified ✓

All tables verified from `docs/database documentation/Tables.md`:

- [x] **Resignation** — Core resignation data with status, dates, and reasons (Table #59)
- [x] **ResignationHistory** — Status change audit trail (Table #60)
- [x] **HRClearance** — HR clearance with interview, leave buyout, recovery (Table #37)
- [x] **DepartmentClearance** — KT status, notes, handover users (Table #18)
- [x] **ITClearance** — Asset return, access revocation, certification (Table #40)
- [x] **AccountClearance** — FnF status, amount, no-due certificate (Table #1)
- [x] **AssetCondition** — Asset condition master data (Table #5)

### Relationships Verified ✓

All relationships verified from `docs/database documentation/Relations.md`:

- [x] Resignation → EmployeeData (Foreign Key)
- [x] Resignation → Department (Foreign Key)
- [x] Resignation → ResignationHistory (One-to-Many)
- [x] Resignation → HRClearance (One-to-One)
- [x] Resignation → DepartmentClearance (One-to-One)
- [x] Resignation → ITClearance (One-to-One)
- [x] Resignation → AccountClearance (One-to-One)
- [x] ITClearance → AssetCondition (Foreign Key)
- [x] EmployeeData → Resignation (One-to-Many)
- [x] Department → Resignation (One-to-Many)

### .NET Backend Controllers Verified ✓

Verified from `Legacy-Folder/Backend/HRMSWebApi/HRMS.API/Controllers/`:

- [x] **ExitEmployeeController** — Employee resignation submission and tracking
- [x] **AdminExitEmployeeController** — HR/Admin resignation management and clearances

### React Frontend Components Verified ✓

Verified from `Legacy-Folder/Frontend/HRMS-Frontend/source/src/`:

- [x] **services/EmployeeExitAdmin/** — API service layer with TypeScript types
- [x] **utils/constants.ts** — Resignation status enums and labels
- [x] Email notification types for resignation workflow

### UI/UX Design Verified ✓

Verified from `docs/modules/04-exit-management-changelog.md`:

- [x] Exit management accessed via **"Exit Details" tab** in employee profile (not separate sidebar)
- [x] No standalone /employees/employee-exit routes
- [x] Tabbed interface for clearances within resignation detail view
- [x] Strictly replicates legacy UI/UX per v1.1.0 compliance update

### Cross-Module Dependencies Verified ✓

- [x] Employee Management module integration points identified
- [x] Leave Management module for leave balance retrieval
- [x] Asset Management module for asset return verification
- [x] Authentication module for role-based clearance permissions
- [x] Email notification template requirements documented

---

## 3. Backend Migration Plan (Laravel)

### 3.1 Database Schema Migration

#### Laravel Migrations to Create

**File:** `database/migrations/YYYY_MM_DD_create_resignations_table.php`

```php
Schema::create('resignations', function (Blueprint $table) {
    $table->id(); // int IDENTITY PRIMARY KEY
    $table->unsignedBigInteger('employee_id'); // FK to employee_data
    $table->unsignedBigInteger('department_id'); // FK to departments
    $table->unsignedBigInteger('reporting_manager_id')->nullable();
    $table->date('last_working_day')->nullable();
    $table->text('reason'); // varchar(500) in legacy
    $table->boolean('exit_discussion')->nullable();
    $table->tinyInteger('status')->nullable(); // ResignationStatus enum
    $table->string('process', 50)->nullable();
    $table->unsignedBigInteger('processed_by')->nullable();
    $table->timestamp('processed_at')->nullable();
    $table->string('settlement_status', 50)->nullable();
    $table->timestamp('settlement_date')->nullable();
    $table->boolean('is_active')->nullable();
    $table->timestamp('early_release_date')->nullable();
    $table->boolean('is_early_request_release')->nullable();
    $table->boolean('is_early_request_approved')->nullable();
    $table->tinyInteger('early_release_status')->nullable();
    $table->boolean('kt_status')->nullable();
    $table->boolean('exit_interview_status')->nullable();
    $table->boolean('it_dues')->nullable();
    $table->boolean('account_no_due')->nullable();
    $table->text('reject_resignation_reason')->nullable();
    $table->text('reject_early_release_reason')->nullable();
    $table->timestamp('created_at'); // CreatedOn
    $table->string('created_by', 100); // CreatedBy
    $table->timestamp('updated_at')->nullable(); // ModifiedOn
    $table->string('updated_by', 100)->nullable(); // ModifiedBy
    
    // Foreign Keys
    $table->foreign('employee_id')->references('id')->on('employee_data');
    $table->foreign('department_id')->references('id')->on('departments');
    
    // Indexes
    $table->index('employee_id');
    $table->index('status');
    $table->index(['employee_id', 'status']);
});
```

**File:** `database/migrations/YYYY_MM_DD_create_resignation_histories_table.php`

```php
Schema::create('resignation_histories', function (Blueprint $table) {
    $table->id(); // bigint IDENTITY PRIMARY KEY
    $table->unsignedInteger('resignation_id')->nullable(); // FK to resignations
    $table->tinyInteger('resignation_status');
    $table->tinyInteger('early_release_status')->nullable();
    $table->timestamp('created_at'); // CreatedOn
    $table->string('created_by', 100); // CreatedBy
    
    // Foreign Key
    $table->foreign('resignation_id')->references('id')->on('resignations');
    
    // Index
    $table->index('resignation_id');
});
```

**File:** `database/migrations/YYYY_MM_DD_create_hr_clearances_table.php`

```php
Schema::create('hr_clearances', function (Blueprint $table) {
    $table->id(); // bigint IDENTITY PRIMARY KEY
    $table->unsignedInteger('resignation_id'); // FK to resignations, UNIQUE
    $table->decimal('advance_bonus_recovery_amount', 18, 2)->default(0);
    $table->text('service_agreement_details')->nullable();
    $table->decimal('current_el', 5, 2)->nullable();
    $table->integer('number_of_buyout_days')->default(0);
    $table->boolean('exit_interview_status')->nullable();
    $table->text('exit_interview_details')->nullable();
    $table->text('attachment'); // nvarchar(max) for blob URL
    $table->string('file_original_name')->nullable();
    $table->string('created_by', 250);
    $table->timestamp('created_at');
    $table->string('updated_by', 250)->nullable();
    $table->timestamp('updated_at')->nullable();
    
    // Foreign Key with Unique Constraint
    $table->foreign('resignation_id')->references('id')->on('resignations');
    $table->unique('resignation_id');
});
```

**File:** `database/migrations/YYYY_MM_DD_create_department_clearances_table.php`

```php
Schema::create('department_clearances', function (Blueprint $table) {
    $table->id(); // bigint IDENTITY PRIMARY KEY
    $table->unsignedInteger('resignation_id'); // FK to resignations, UNIQUE
    $table->tinyInteger('kt_status')->nullable(); // 1=Pending, 2=InProgress, 3=Completed
    $table->text('kt_notes'); // nvarchar(max)
    $table->text('attachment'); // nvarchar(max) for blob URL
    $table->text('kt_users'); // varchar(max) comma-separated employee IDs
    $table->string('file_original_name')->nullable();
    $table->string('created_by', 250);
    $table->timestamp('created_at');
    $table->string('updated_by', 250)->nullable();
    $table->timestamp('updated_at')->nullable();
    
    // Foreign Key with Unique Constraint
    $table->foreign('resignation_id')->references('id')->on('resignations');
    $table->unique('resignation_id');
});
```

**File:** `database/migrations/YYYY_MM_DD_create_it_clearances_table.php`

```php
Schema::create('it_clearances', function (Blueprint $table) {
    $table->id(); // int IDENTITY PRIMARY KEY
    $table->unsignedInteger('resignation_id'); // FK to resignations, UNIQUE
    $table->boolean('access_revoked')->default(false);
    $table->boolean('asset_returned')->default(false);
    $table->unsignedInteger('asset_condition'); // FK to asset_conditions
    $table->string('attachment_url')->nullable();
    $table->text('note')->nullable();
    $table->boolean('it_clearance_certification')->default(false);
    $table->string('file_original_name')->nullable();
    $table->string('created_by', 100);
    $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
    $table->string('updated_by', 100)->nullable();
    $table->timestamp('updated_at')->nullable();
    
    // Foreign Keys
    $table->foreign('resignation_id')->references('id')->on('resignations');
    $table->foreign('asset_condition')->references('id')->on('asset_conditions');
    $table->unique('resignation_id');
});
```

**File:** `database/migrations/YYYY_MM_DD_create_account_clearances_table.php`

```php
Schema::create('account_clearances', function (Blueprint $table) {
    $table->id(); // int IDENTITY PRIMARY KEY
    $table->unsignedInteger('resignation_id'); // FK to resignations, UNIQUE
    $table->boolean('fnf_status')->nullable();
    $table->decimal('fnf_amount', 18, 2)->nullable();
    $table->boolean('issue_no_due_certificate')->nullable();
    $table->text('note')->nullable();
    $table->string('account_attachment')->nullable();
    $table->string('file_original_name')->nullable();
    $table->string('created_by', 100);
    $table->timestamp('created_at');
    $table->string('updated_by', 100)->nullable();
    $table->timestamp('updated_at')->nullable();
    
    // Foreign Key with Unique Constraint
    $table->foreign('resignation_id')->references('id')->on('resignations');
    $table->unique('resignation_id');
});
```

**File:** `database/migrations/YYYY_MM_DD_create_asset_conditions_table.php`

```php
Schema::create('asset_conditions', function (Blueprint $table) {
    $table->id(); // int PRIMARY KEY
    $table->string('status', 50); // Good/Fair/Damaged/Lost
    $table->string('created_by')->nullable();
    $table->timestamp('created_at')->nullable();
});

// Seeder data:
// 1 => 'Good'
// 2 => 'Fair'
// 3 => 'Damaged'
// 4 => 'Lost'
```

#### Enums Configuration

**File:** `config/resignation.php`

```php
return [
    'status' => [
        'pending' => 1,
        'revoked' => 2,
        'accepted' => 3,
        'cancelled' => 4,
        'completed' => 5,
    ],
    
    'early_release_status' => [
        'pending' => 1,
        'accepted' => 2,
        'rejected' => 3,
    ],
    
    'kt_status' => [
        'pending' => 1,
        'in_progress' => 2,
        'completed' => 3,
    ],
    
    'job_type_notice_periods' => [
        'probation' => 15, // days
        'training' => 15, // days
        'confirmed' => 2, // months
    ],
    
    'asset_conditions' => [
        'good' => 1,
        'fair' => 2,
        'damaged' => 3,
        'lost' => 4,
    ],
];
```

### 3.2 Laravel Eloquent Models

**File:** `app/Models/Resignation.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Resignation extends Model
{
    protected $table = 'resignations';
    
    protected $fillable = [
        'employee_id',
        'department_id',
        'reporting_manager_id',
        'last_working_day',
        'reason',
        'exit_discussion',
        'status',
        'process',
        'processed_by',
        'processed_at',
        'settlement_status',
        'settlement_date',
        'is_active',
        'early_release_date',
        'is_early_request_release',
        'is_early_request_approved',
        'early_release_status',
        'kt_status',
        'exit_interview_status',
        'it_dues',
        'account_no_due',
        'reject_resignation_reason',
        'reject_early_release_reason',
        'created_by',
        'updated_by',
    ];
    
    protected $casts = [
        'last_working_day' => 'date',
        'exit_discussion' => 'boolean',
        'is_active' => 'boolean',
        'is_early_request_release' => 'boolean',
        'is_early_request_approved' => 'boolean',
        'kt_status' => 'boolean',
        'exit_interview_status' => 'boolean',
        'it_dues' => 'boolean',
        'account_no_due' => 'boolean',
        'early_release_date' => 'datetime',
        'processed_at' => 'datetime',
        'settlement_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    const STATUS_PENDING = 1;
    const STATUS_REVOKED = 2;
    const STATUS_ACCEPTED = 3;
    const STATUS_CANCELLED = 4;
    const STATUS_COMPLETED = 5;
    
    const EARLY_RELEASE_PENDING = 1;
    const EARLY_RELEASE_ACCEPTED = 2;
    const EARLY_RELEASE_REJECTED = 3;
    
    // Relationships
    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }
    
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
    
    public function reportingManager(): BelongsTo
    {
        return $this->belongsTo(EmployeeData::class, 'reporting_manager_id');
    }
    
    public function histories(): HasMany
    {
        return $this->hasMany(ResignationHistory::class, 'resignation_id');
    }
    
    public function hrClearance(): HasOne
    {
        return $this->hasOne(HRClearance::class, 'resignation_id');
    }
    
    public function departmentClearance(): HasOne
    {
        return $this->hasOne(DepartmentClearance::class, 'resignation_id');
    }
    
    public function itClearance(): HasOne
    {
        return $this->hasOne(ITClearance::class, 'resignation_id');
    }
    
    public function accountClearance(): HasOne
    {
        return $this->hasOne(AccountClearance::class, 'resignation_id');
    }
    
    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }
    
    public function scopeAccepted($query)
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }
    
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }
    
    // Helper Methods
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
    
    public function isAccepted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }
    
    public function canRevoke(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
    
    public function allClearancesCompleted(): bool
    {
        return $this->hrClearance()->exists()
            && $this->departmentClearance()->exists()
            && $this->itClearance()->exists()
            && $this->accountClearance()->exists();
    }
}
```

**File:** `app/Models/ResignationHistory.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResignationHistory extends Model
{
    protected $table = 'resignation_histories';
    
    public $timestamps = false; // Only created_at, no updated_at
    
    protected $fillable = [
        'resignation_id',
        'resignation_status',
        'early_release_status',
        'created_by',
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
    ];
    
    public function resignation(): BelongsTo
    {
        return $this->belongsTo(Resignation::class, 'resignation_id');
    }
}
```

**File:** `app/Models/HRClearance.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HRClearance extends Model
{
    protected $table = 'hr_clearances';
    
    protected $fillable = [
        'resignation_id',
        'advance_bonus_recovery_amount',
        'service_agreement_details',
        'current_el',
        'number_of_buyout_days',
        'exit_interview_status',
        'exit_interview_details',
        'attachment',
        'file_original_name',
        'created_by',
        'updated_by',
    ];
    
    protected $casts = [
        'advance_bonus_recovery_amount' => 'decimal:2',
        'current_el' => 'decimal:2',
        'exit_interview_status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public function resignation(): BelongsTo
    {
        return $this->belongsTo(Resignation::class, 'resignation_id');
    }
}
```

**File:** `app/Models/DepartmentClearance.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepartmentClearance extends Model
{
    protected $table = 'department_clearances';
    
    protected $fillable = [
        'resignation_id',
        'kt_status',
        'kt_notes',
        'attachment',
        'kt_users',
        'file_original_name',
        'created_by',
        'updated_by',
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    const KT_PENDING = 1;
    const KT_IN_PROGRESS = 2;
    const KT_COMPLETED = 3;
    
    public function resignation(): BelongsTo
    {
        return $this->belongsTo(Resignation::class, 'resignation_id');
    }
    
    public function getKtUsersArrayAttribute(): array
    {
        return $this->kt_users ? explode(',', $this->kt_users) : [];
    }
}
```

**File:** `app/Models/ITClearance.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ITClearance extends Model
{
    protected $table = 'it_clearances';
    
    protected $fillable = [
        'resignation_id',
        'access_revoked',
        'asset_returned',
        'asset_condition',
        'attachment_url',
        'note',
        'it_clearance_certification',
        'file_original_name',
        'created_by',
        'updated_by',
    ];
    
    protected $casts = [
        'access_revoked' => 'boolean',
        'asset_returned' => 'boolean',
        'it_clearance_certification' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public function resignation(): BelongsTo
    {
        return $this->belongsTo(Resignation::class, 'resignation_id');
    }
    
    public function assetConditionMaster(): BelongsTo
    {
        return $this->belongsTo(AssetCondition::class, 'asset_condition');
    }
}
```

**File:** `app/Models/AccountClearance.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountClearance extends Model
{
    protected $table = 'account_clearances';
    
    protected $fillable = [
        'resignation_id',
        'fnf_status',
        'fnf_amount',
        'issue_no_due_certificate',
        'note',
        'account_attachment',
        'file_original_name',
        'created_by',
        'updated_by',
    ];
    
    protected $casts = [
        'fnf_status' => 'boolean',
        'fnf_amount' => 'decimal:2',
        'issue_no_due_certificate' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public function resignation(): BelongsTo
    {
        return $this->belongsTo(Resignation::class, 'resignation_id');
    }
}
```

### 3.3 .NET to Laravel Controller Mapping

#### Legacy .NET Controllers Identified

From `Legacy-Folder/Backend/HRMSWebApi/HRMS.API/Controllers/`:

1. **ExitEmployeeController** — Employee resignation operations
2. **AdminExitEmployeeController** — HR/Admin operations and clearances

#### Laravel Controllers to Create

**File:** `app/Http/Controllers/Api/ExitEmployeeController.php`

Maps to legacy `ExitEmployeeController.cs`

**Endpoints:**
- POST `/api/exit-employee/add-resignation` → AddResignation
- GET `/api/exit-employee/resignation-form/{id}` → GetResignationForm
- GET `/api/exit-employee/resignation-details/{id}` → GetResignationDetails
- POST `/api/exit-employee/revoke-resignation/{id}` → RevokeResignation
- POST `/api/exit-employee/request-early-release` → RequestEarlyRelease
- GET `/api/exit-employee/is-resignation-exist/{employeeId}` → IsResignationExist

**File:** `app/Http/Controllers/Api/AdminExitEmployeeController.php`

Maps to legacy `AdminExitEmployeeController.cs`

**Endpoints:**
- POST `/api/admin-exit-employee/resignation-list` → GetResignationList
- GET `/api/admin-exit-employee/resignation/{id}` → GetResignationById
- POST `/api/admin-exit-employee/accept-resignation/{id}` → AcceptResignation
- POST `/api/admin-exit-employee/accept-early-release` → AcceptEarlyRelease
- POST `/api/admin-exit-employee/admin-rejection` → AdminRejection
- PATCH `/api/admin-exit-employee/update-last-working-day` → UpdateLastWorkingDay
- GET `/api/admin-exit-employee/hr-clearance/{resignationId}` → GetHRClearanceByResignationId
- POST `/api/admin-exit-employee/hr-clearance` → UpsertHRClearance
- GET `/api/admin-exit-employee/department-clearance/{resignationId}` → GetDepartmentClearanceDetailByResignationId
- POST `/api/admin-exit-employee/department-clearance` → UpsertDepartmentClearance
- GET `/api/admin-exit-employee/it-clearance/{resignationId}` → GetITClearanceDetailByResignationId
- POST `/api/admin-exit-employee/it-clearance` → AddUpdateITClearance
- GET `/api/admin-exit-employee/account-clearance/{resignationId}` → GetAccountClearance
- POST `/api/admin-exit-employee/account-clearance` → AddUpdateAccountClearance

### 3.4 Laravel Routes Configuration

**File:** `routes/api.php`

```php
use App\Http\Controllers\Api\ExitEmployeeController;
use App\Http\Controllers\Api\AdminExitEmployeeController;

// Employee Resignation Routes
Route::middleware(['auth:sanctum'])->prefix('exit-employee')->group(function () {
    Route::post('add-resignation', [ExitEmployeeController::class, 'addResignation']);
    Route::get('resignation-form/{id}', [ExitEmployeeController::class, 'getResignationForm']);
    Route::get('resignation-details/{id}', [ExitEmployeeController::class, 'getResignationDetails']);
    Route::post('revoke-resignation/{id}', [ExitEmployeeController::class, 'revokeResignation']);
    Route::post('request-early-release', [ExitEmployeeController::class, 'requestEarlyRelease']);
    Route::get('is-resignation-exist/{employeeId}', [ExitEmployeeController::class, 'isResignationExist']);
});

// Admin Resignation Management Routes
Route::middleware(['auth:sanctum', 'role:HR,Admin'])->prefix('admin-exit-employee')->group(function () {
    Route::post('resignation-list', [AdminExitEmployeeController::class, 'getResignationList']);
    Route::get('resignation/{id}', [AdminExitEmployeeController::class, 'getResignationById']);
    Route::post('accept-resignation/{id}', [AdminExitEmployeeController::class, 'acceptResignation']);
    Route::post('accept-early-release', [AdminExitEmployeeController::class, 'acceptEarlyRelease']);
    Route::post('admin-rejection', [AdminExitEmployeeController::class, 'adminRejection']);
    Route::patch('update-last-working-day', [AdminExitEmployeeController::class, 'updateLastWorkingDay']);
    
    // HR Clearance
    Route::get('hr-clearance/{resignationId}', [AdminExitEmployeeController::class, 'getHRClearance']);
    Route::post('hr-clearance', [AdminExitEmployeeController::class, 'upsertHRClearance']);
    
    // Department Clearance
    Route::get('department-clearance/{resignationId}', [AdminExitEmployeeController::class, 'getDepartmentClearance']);
    Route::post('department-clearance', [AdminExitEmployeeController::class, 'upsertDepartmentClearance']);
    
    // IT Clearance
    Route::get('it-clearance/{resignationId}', [AdminExitEmployeeController::class, 'getITClearance']);
    Route::post('it-clearance', [AdminExitEmployeeController::class, 'upsertITClearance']);
    
    // Account Clearance
    Route::get('account-clearance/{resignationId}', [AdminExitEmployeeController::class, 'getAccountClearance']);
    Route::post('account-clearance', [AdminExitEmployeeController::class, 'upsertAccountClearance']);
});
```

### 3.5 Business Logic & Service Layer

**File:** `app/Services/ExitEmployeeService.php`

```php
<?php

namespace App\Services;

use App\Models\Resignation;
use App\Models\ResignationHistory;
use App\Models\EmploymentDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\EmailNotificationService;
use Exception;

class ExitEmployeeService
{
    protected EmailNotificationService $emailService;
    
    public function __construct(EmailNotificationService $emailService)
    {
        $this->emailService = $emailService;
    }
    
    /**
     * Calculate last working day based on job type
     */
    public function calculateLastWorkingDay(int $jobType): Carbon
    {
        $today = Carbon::now();
        $noticePeriods = config('resignation.job_type_notice_periods');
        
        switch ($jobType) {
            case 1: // Probation
                return $today->addDays($noticePeriods['probation']);
            case 3: // Training
                return $today->addDays($noticePeriods['training']);
            case 2: // Confirmed
                return $today->addMonths($noticePeriods['confirmed']);
            default:
                throw new Exception('Invalid job type');
        }
    }
    
    /**
     * Check if employee has active resignation
     */
    public function hasActiveResignation(int $employeeId): bool
    {
        return Resignation::where('employee_id', $employeeId)
            ->whereIn('status', [
                Resignation::STATUS_PENDING,
                Resignation::STATUS_ACCEPTED
            ])
            ->exists();
    }
    
    /**
     * Submit resignation
     */
    public function submitResignation(array $data, string $createdBy): Resignation
    {
        DB::beginTransaction();
        
        try {
            // Calculate last working day
            $lastWorkingDay = $this->calculateLastWorkingDay($data['job_type']);
            
            // Create resignation
            $resignation = Resignation::create([
                'employee_id' => $data['employee_id'],
                'department_id' => $data['department_id'],
                'reporting_manager_id' => $data['reporting_manager_id'],
                'reason' => $data['reason'],
                'last_working_day' => $lastWorkingDay,
                'status' => Resignation::STATUS_PENDING,
                'is_active' => true,
                'created_by' => $createdBy,
            ]);
            
            // Create history record
            ResignationHistory::create([
                'resignation_id' => $resignation->id,
                'resignation_status' => Resignation::STATUS_PENDING,
                'created_by' => $createdBy,
                'created_at' => now(),
            ]);
            
            DB::commit();
            
            // Send email notifications (fire and forget)
            try {
                $this->emailService->sendResignationSubmitted($resignation->id);
            } catch (Exception $e) {
                Log::warning('Failed to send resignation submission email', [
                    'resignation_id' => $resignation->id,
                    'error' => $e->getMessage()
                ]);
            }
            
            return $resignation;
            
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Accept resignation
     */
    public function acceptResignation(int $resignationId, string $acceptedBy): Resignation
    {
        DB::beginTransaction();
        
        try {
            $resignation = Resignation::findOrFail($resignationId);
            
            if (!$resignation->isPending()) {
                throw new Exception('Resignation has already been processed');
            }
            
            // Update resignation status
            $resignation->update([
                'status' => Resignation::STATUS_ACCEPTED,
                'updated_by' => $acceptedBy,
            ]);
            
            // Update employee status to Resigned
            EmploymentDetail::where('employee_id', $resignation->employee_id)
                ->update(['employee_status' => 2]); // 2 = Resigned
            
            // Create history record
            ResignationHistory::create([
                'resignation_id' => $resignation->id,
                'resignation_status' => Resignation::STATUS_ACCEPTED,
                'created_by' => $acceptedBy,
                'created_at' => now(),
            ]);
            
            DB::commit();
            
            // Send email notification
            try {
                $this->emailService->sendResignationApproved($resignation->id);
            } catch (Exception $e) {
                Log::warning('Failed to send resignation approval email', [
                    'resignation_id' => $resignation->id,
                    'error' => $e->getMessage()
                ]);
            }
            
            return $resignation->fresh();
            
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Auto-complete resignation when all clearances done
     */
    public function checkAndCompleteResignation(int $resignationId): void
    {
        $resignation = Resignation::with([
            'hrClearance',
            'departmentClearance',
            'itClearance',
            'accountClearance'
        ])->findOrFail($resignationId);
        
        // Check if all clearances exist
        if (!$resignation->allClearancesCompleted()) {
            return;
        }
        
        // Check if past last working day
        if (Carbon::now()->lt($resignation->last_working_day)) {
            return;
        }
        
        DB::beginTransaction();
        
        try {
            // Update resignation status
            $resignation->update([
                'status' => Resignation::STATUS_COMPLETED,
            ]);
            
            // Update employee status to Exited
            EmploymentDetail::where('employee_id', $resignation->employee_id)
                ->update([
                    'employee_status' => 4, // 4 = Exited
                    'exit_date' => now(),
                ]);
            
            DB::commit();
            
            // Send completion email
            try {
                $this->emailService->sendExitCompleted($resignation->id);
            } catch (Exception $e) {
                Log::warning('Failed to send exit completion email', [
                    'resignation_id' => $resignation->id,
                    'error' => $e->getMessage()
                ]);
            }
            
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to auto-complete resignation', [
                'resignation_id' => $resignationId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
```

---

## End of Part 1

**Summary:** Part 1 covers Module Overview, Verification Checklist, and Backend Migration Plan including database migrations, Eloquent models, controller mapping, routes, and core business logic service layer.

**Next:** Part 2 will cover validation, frontend migration, UI components, testing plan, and implementation timeline.
