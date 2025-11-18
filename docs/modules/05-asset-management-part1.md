# Module 05: Asset Management (Part 1 of 3)

## Module Overview

**Module Name:** Asset Management  
**Module ID:** 05  
**Purpose:** Manage IT asset inventory lifecycle including registration, allocation to employees, tracking, return management, and complete audit trail with history tracking. Supports bulk imports, file attachments, and comprehensive reporting.

**Technology Stack:**
- Backend: ASP.NET Core 8.0 Web API, Dapper ORM, Clean Architecture
- Frontend: React 18.3.1, TypeScript, Material-UI 6.5.0
- Database: SQL Server with stored procedures
- Storage: Azure Blob Storage for product invoices and signature documents

**Key Capabilities:**
- IT asset inventory management (laptops, desktops, monitors, peripherals, software licenses)
- Asset lifecycle tracking (In Inventory → Allocated → Retired)
- Employee asset allocation and deallocation with condition tracking
- Complete audit trail with ITAssetHistory table
- Bulk import via Excel with validation
- File management (product invoices, acknowledgment/signature documents)
- Asset filtering, searching, and sorting
- Warranty expiry tracking
- Real-time allocation status validation

---

## Features List

### Feature 1: IT Asset Registration
**Description:** Register new IT assets with comprehensive details including device information, specifications, purchase details, warranty information, and file attachments.

**Business Rules:**
- Device Name, Device Code, Serial Number, Invoice Number are mandatory
- Purchase Date is required; Warranty Expiry Date must be after Purchase Date
- Serial Number must be unique across all assets
- Asset Type must be from predefined enum (14 types available)
- Asset Status defaults to "In Inventory" for new assets
- Asset Condition defaults to "Ok" unless specified otherwise
- Product Invoice file is required; Signature Document is optional
- File uploads must pass validation (size limit: 5MB, allowed extensions)
- Branch location is required
- Specifications stored as free text (supports OS, RAM, HDD, Processor details)

**User Interactions:**
1. User navigates to "Add Asset" page
2. User fills mandatory fields: Device Name, Device Code, Serial Number, Invoice Number, Manufacturer, Model
3. User selects Asset Type from dropdown (Laptop, Desktop, Monitor, Keyboard, Mouse, etc.)
4. User enters specifications (free text field for hardware specs)
5. User selects Branch location from dropdown
6. User enters Purchase Date and Warranty Expires Date via date pickers
7. User selects Asset Status (In Inventory/Retired for new assets; Allocated disabled)
8. User selects Asset Condition (Ok/Damaged/Missing)
9. User uploads Product Invoice file (required)
10. User optionally uploads Acknowledgment/Signature Document
11. User submits form → system validates all fields
12. System uploads files to Azure Blob Storage
13. System inserts ITAsset record with auto-generated Id
14. Success toast notification displayed; form resets

**Validations:**
- Frontend: Yup schema validation on all fields before submission
- Backend: FluentValidation (if configured) + business logic validation
- Serial Number uniqueness check in repository layer
- File validation: extension check, size limit (5MB max)
- Date validation: Warranty Expires must be >= Purchase Date
- Asset Type, Status, Condition, Branch must be valid enum values

**Data Flow:**
1. Frontend: ITAssetForm collects user input → converts to FormData (for file upload)
2. API Call: POST `/api/AssetManagement/UpsertITAsset` with multipart/form-data
3. Controller: AssetManagementController.UpsertITAsset receives ITAssetRequestDto
4. Service: AssetManagementService.UpsertITAssetAsync:
   - Maps DTO to ITAsset entity
   - Uploads ProductFileOriginalName to Blob Storage → receives ProductFileName
   - Uploads SignatureFileOriginalName to Blob Storage → receives SignatureFileName
   - Calls repository UpsertITAssetAsync with historyFlag=false (new asset)
5. Repository: AssetManagementRepository.UpsertITAssetAsync:
   - Checks if asset exists by Id (new assets have Id=0)
   - Executes INSERT query with all asset properties
   - Returns SCOPE_IDENTITY as new asset Id
6. Response: ApiResponseModel with CrudResult.Success
7. Frontend: Toast notification, form reset

**Dependent Modules:** Employee Management (for allocation feature), Blob Storage Service

---

### Feature 2: Asset Listing with Filters
**Description:** Display paginated list of all IT assets with advanced filtering, sorting, search by employee codes, and column visibility controls.

**Business Rules:**
- Supports filtering by: Device Name, Device Code, Manufacturer, Model, Asset Type, Asset Status, Branch
- Supports employee-based filtering: select multiple employees → show only assets allocated to those employees
- Default sort: ModifiedOn DESC (most recently updated first)
- Supports sorting on all columns: Id, DeviceName, DeviceCode, SerialNumber, Manufacturer, Model, AssetType, Status, Branch, PurchaseDate, WarrantyExpires, ModifiedOn
- Pagination: configurable page size (default 10 rows per page)
- Column visibility toggle: users can hide/show columns (Model and Comments hidden by default)
- Displays custodian information (employee email and full name) for allocated assets
- Unallocated assets show blank custodian fields

**User Interactions:**
1. User navigates to "IT Assets" page → system loads asset list with default filters
2. User clicks "Show Filters" button → filter form expands
3. User enters filter criteria: Device Name, Device Code, Manufacturer, Model, selects Asset Type/Status/Branch dropdowns
4. User clicks employee autocomplete → selects one or more employees → system filters by employee codes
5. User clicks "Apply Filters" → system reloads list with filtered results
6. User clicks column header to sort ascending/descending
7. User clicks pagination controls to navigate pages
8. User clicks column visibility icon → toggles column display
9. User clicks "Reset Filters" → clears all filters, resets to default view
10. User clicks asset row → navigates to Asset Details page

**Validations:**
- Filter values sanitized to prevent SQL injection (Dapper parameterized queries)
- Employee codes validated against EmploymentDetail table
- Sort column validated against allowed columns list
- Page size and start index validated (positive integers)

**Data Flow:**
1. Frontend: ItAssetTable component loads → triggers fetchItAssetList
2. API Call: POST `/api/AssetManagement/GetAssetList` with SearchRequestDto<ITAssetSearchRequestDto>
   - Payload: { startIndex, pageSize, sortColumnName, sortDirection, filters: { deviceName, deviceCode, manufacturer, model, assetType, assetStatus, branch, employeeCodes } }
3. Controller: AssetManagementController.GetAssetList → forwards to service
4. Service: AssetManagementService.GetAssetList → calls repository.GetAllITAssetAsync
5. Repository: Calls stored procedure `GetAllITAsset` with filters
6. Stored Procedure Logic:
   - First result set: Total count (single row with COUNT(*))
   - Second result set: Paginated asset list with LEFT JOINs:
     - ITAsset → EmployeeAsset (IsActive=1) → EmploymentDetail → EmployeeData
   - Returns: Id, DeviceName, DeviceCode, SerialNumber, Manufacturer, Model, AssetType, AssetStatus, Branch, PurchaseDate, WarrantyExpires, Comments, ModifiedOn, AllocatedBy (ModifiedBy), Custodian (Email), CustodianFullName
7. Response: ApiResponseModel with ITAssetListResponseDto { TotalRecords, ITAssetList }
8. Frontend: Updates table state, displays results

**Dependent Modules:** Employee Management (for employee filter and custodian display)

---

### Feature 3: Asset Detail View with Edit
**Description:** View complete asset information with history tracking, edit capabilities with permission controls, and asset allocation/deallocation features.

**Business Rules:**
- Asset details page shows: General Info, Custodian Info (if allocated), File Attachments, Asset History
- Edit button visible only if user has "UpdateAsset" permission
- Edit mode supports inline allocation/deallocation of assets to employees
- Asset condition and status changes trigger history entry creation
- Cannot allocate retired asset to employee
- Cannot allocate asset with "Damaged" or "Missing" condition from inventory
- Allocated assets cannot be directly edited (must deallocate first) unless changing non-critical fields
- File replacement: uploading new file replaces old file in Blob Storage; if no new file provided, existing file retained

**User Interactions:**
1. User clicks asset row in list → navigates to `/asset-management/:assetId/general`
2. System fetches asset details via GetAssetById API
3. Asset details displayed in read-only mode with:
   - General Info: Device Name, Code, Serial Number, Invoice Number, Manufacturer, Model, Asset Type, Specifications, Comments
   - Location & Dates: Branch, Purchase Date, Warranty Expires
   - Status Info: Asset Status, Asset Condition
   - Custodian Info: Employee Name, Email (if allocated)
   - File Attachments: Product Invoice (view/download), Signature Document (view/download if exists)
4. User clicks "Edit" button → form enters edit mode
5. User modifies fields (all fields editable except Serial Number and Id)
6. User changes Asset Status from "In Inventory" to "Allocated" → Employee autocomplete appears
7. User selects employee from dropdown → system validates allocation eligibility
8. User uploads new Product Invoice or Signature Document (optional)
9. User clicks "Submit" → system validates, uploads new files, updates asset record
10. System creates ITAssetHistory entry if Status or Condition changed
11. Success notification displayed; asset details refreshed

**Validations:**
- Same validations as Asset Registration (Feature 1)
- Additional: If changing status to "Allocated", employee must be selected
- If employee selected, asset must be in "Ok" condition and "In Inventory" status (or being deallocated from "Allocated" to "Retired/In Inventory")
- Warranty Expiry Date must be >= Purchase Date
- Serial Number immutable after creation (validation on backend)

**Data Flow:**
1. Frontend: AssetDetailsLayout fetches asset by Id on mount
2. API Call: GET `/api/AssetManagement/GetAssetById/{assetId}`
3. Repository: Joins ITAsset with EmployeeAsset (IsActive=1), EmploymentDetail, EmployeeData
4. Response: ITAssetResponseDto with custodian object (nested)
5. Frontend: Displays in ITAssetForm with mode="edit"
6. On Submit: POST `/api/AssetManagement/UpsertITAsset` (same endpoint as create)
7. Service: Checks if asset exists (Id != 0) → performs UPDATE
   - If files replaced, old files deleted from Blob Storage
   - If historyFlag=true (status/condition changed), creates ITAssetHistory entry
   - If isAllocated flag present, triggers AllocateAssetById or DeallocateAssetById
8. Response: Success/failure message
9. Frontend: Refreshes asset data, displays toast

**Dependent Modules:** Employee Management (employee selection), Blob Storage Service (file management)

---

### Feature 4: Asset Allocation to Employee
**Description:** Allocate available assets to employees with validation, automatic status updates, and history tracking. Supports inline allocation during asset creation/edit and dedicated allocation API.

**Business Rules:**
- Only assets with Status="In Inventory" and Condition="Ok" can be allocated
- Cannot allocate already allocated assets (IsActive=1 check in EmployeeAsset)
- Allocation creates EmployeeAsset record with IsActive=true
- Asset Status auto-updated to "Allocated"
- Asset Condition auto-updated to "Ok"
- ITAssetHistory entry created with:
  - Status = Allocated, AssetCondition = Ok, Note = "Asset allocated successfully." (or custom note)
  - IssueDate = AssignedOn date
- EmployeeId must exist in EmployeeData table (foreign key constraint)
- AssignedOn date defaults to current UTC date
- CreatedBy = logged-in user's email

**User Interactions:**
1. **Via Asset Edit Page:**
   - User opens asset in edit mode (Status="In Inventory")
   - User changes Status to "Allocated" → Employee autocomplete appears
   - User selects employee from dropdown
   - User enters optional note in "Note" field
   - User clicks Submit → system performs allocation
2. **Via Bulk Import:**
   - Excel contains User Name column with employee email
   - System auto-allocates asset to employee during import
3. **Validation Feedback:**
   - If asset already allocated: Error toast "Asset is already allocated to another employee"
   - If asset not in "Ok" condition: Error message prevents allocation
   - If asset status is "Retired": Cannot allocate (validation error)

**Validations:**
- AssetStatus must be "In Inventory" for initial allocation
- AssetCondition must be "Ok"
- EmployeeId must be valid (foreign key check)
- Asset cannot already be allocated (CHECK: EmployeeAsset.IsActive=1 for same AssetId)
- AssignedOn date cannot be before PurchaseDate (enforced in Excel import logic)

**Data Flow:**
1. Frontend: User selects employee, sets isAllocated=true in payload
2. API Call: POST `/api/AssetManagement/UpsertITAsset` with isAllocated=true, employeeId, note
3. Controller: After UpsertITAsset call, checks if requestDto.isAllocated != null
4. If true, calls service.AllocateAssetById(requestDto)
5. Service: AssetManagementService.AllocateAssetById:
   - Maps to EmployeeAsset entity
   - Sets AssignedOn = DateOnly.FromDateTime(DateTime.UtcNow)
   - Sets IsActive = true
   - Calls repository.AllocateAssetAsync(employeeAsset, note)
6. Repository: Transaction-based operation:
   - Step 1: Check if asset already allocated (SELECT COUNT(1) FROM EmployeeAsset WHERE AssetId=X AND IsActive=1)
   - If count > 0, return false (already allocated)
   - Step 2: INSERT INTO EmployeeAsset (EmployeeId, AssetId, AssignedOn, IsActive, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
   - Step 3: UPDATE ITAsset SET Status=Allocated, AssetCondition=Ok WHERE Id=AssetId
   - Step 4: INSERT INTO ITAssetHistory (AssetId, EmployeeId, Status, AssetCondition, Note, IssueDate, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
   - Commit transaction; if any step fails, rollback
7. Response: CrudResult.Success or CrudResult.Failed
8. Frontend: Toast notification, asset details refreshed

**Dependent Modules:** Employee Management (employee selection, validation)

---

### Feature 5: Asset Deallocation (Return) from Employee
**Description:** Return allocated assets from employees, update asset status and condition, track return date and condition, and create history entry. Supports retirement or return to inventory.

**Business Rules:**
- Only assets with Status="Allocated" can be deallocated
- Deallocation updates EmployeeAsset record: Sets IsActive=false, ReturnDate=current date, ReturnCondition=selected condition
- Asset Status updated to new status (In Inventory or Retired) based on user selection
- ReturnCondition can be: Ok, Damaged, Missing
- ITAssetHistory entry created with:
  - Status = new status (In Inventory/Retired), AssetCondition = return condition
  - IssueDate = original AssignedOn, ReturnDate = current date
  - Note = "Asset deallocated successfully." or custom note
- If asset retired with damage/missing condition, cannot be reallocated until repaired and status changed

**User Interactions:**
1. User opens allocated asset in edit mode (Status="Allocated")
2. User changes Status from "Allocated" to "In Inventory" or "Retired"
3. System automatically triggers deallocation flow (isAllocated=false in payload)
4. User selects Return Condition (Ok/Damaged/Missing) from dropdown
5. User enters optional note (e.g., "Laptop screen damaged, needs repair")
6. User clicks Submit → system performs deallocation
7. System updates EmployeeAsset (IsActive=false, ReturnDate=today)
8. System updates ITAsset (Status=new status, no custodian)
9. System creates ITAssetHistory entry
10. Success notification displayed; asset details refreshed

**Validations:**
- Asset must be currently allocated (IsActive=1 in EmployeeAsset)
- Return Condition must be valid enum value (Ok/Damaged/Missing)
- ReturnDate auto-set to current date (no manual input)

**Data Flow:**
1. Frontend: User changes status from "Allocated" to "In Inventory"/"Retired", sets isAllocated=false
2. API Call: POST `/api/AssetManagement/UpsertITAsset` with isAllocated=false, assetCondition, note
3. Controller: After UpsertITAsset, checks if isAllocated == false
4. If false, calls service.AllocateAssetById (same method handles both allocation and deallocation based on isAllocated flag)
5. Service: Detects isAllocated=false → calls repository.DeallocateAssetAsync
6. Repository: Transaction-based operation:
   - Step 1: UPDATE EmployeeAsset SET ReturnDate=@ReturnDate, IsActive=0, ReturnCondition=@AssetCondition WHERE EmployeeId=X AND AssetId=Y
   - Step 2: UPDATE ITAsset SET Status=@AssetStatus WHERE Id=AssetId (removes allocation, updates status)
   - Step 3: INSERT INTO ITAssetHistory (AssetId, EmployeeId, Status, AssetCondition, Note, IssueDate, ReturnDate, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
   - Commit transaction; if any step fails, rollback
7. Response: CrudResult.Success or CrudResult.Failed
8. Frontend: Toast notification, asset details refreshed

**Dependent Modules:** Employee Management (to identify employee), Exit Management (assets returned during exit process)

---

### Feature 6: Asset History Tracking
**Description:** Maintain complete audit trail of all asset lifecycle events including allocations, deallocations, status changes, and condition changes with timestamp and user tracking.

**Business Rules:**
- ITAssetHistory table stores snapshot of asset state at each change event
- History entry created when:
  - Asset allocated to employee (Status change to "Allocated")
  - Asset deallocated from employee (Status change to "In Inventory"/"Retired")
  - Asset condition changed (Ok → Damaged/Missing or vice versa)
  - Asset status changed without allocation (e.g., Retired directly from inventory)
- History fields: AssetId, EmployeeId, Status, AssetCondition, Note, IssueDate, ReturnDate, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
- IssueDate = allocation date; ReturnDate = deallocation date (null if still allocated)
- Note field stores reason/description (e.g., "Asset allocated successfully.", "Laptop screen damaged", "Imported from Excel")
- History entries immutable (no UPDATE/DELETE allowed)
- History visible on Asset Details page in chronological order (most recent first)

**User Interactions:**
1. User navigates to Asset Details page → clicks "History" tab (or inline history section)
2. System displays table with columns: Custodian (Email), Employee Name, Asset Status, Asset Condition, Issue Date, Return Date, Note, Modified By, Modified On
3. Rows displayed in DESC order by CreatedOn (newest first)
4. For allocated assets: Return Date is blank
5. For deallocated assets: Both Issue Date and Return Date populated
6. User can view complete lifecycle: Inventory → Allocated (Employee A) → Returned → Allocated (Employee B) → Retired

**Validations:**
- No user input required; history auto-generated by system
- History entries read-only (no edit/delete UI)

**Data Flow:**
1. Frontend: Fetches history via GET `/api/AssetManagement/GetAssetHistoryById/{assetId}`
2. Controller: Forwards to service.GetITAssetHistoryById
3. Service: Calls repository.GetITAssetHistoryByIdAsync
4. Repository: Executes SQL query with JOINs:
   ```sql
   SELECT 
       CONCAT(E.FirstName, ' ', NULLIF(E.MiddleName, '') + ' ', E.LastName) AS EmployeeName,
       ED.Email AS Custodian,
       H.Status AS AssetStatus,
       H.AssetCondition,
       H.Note,
       H.ModifiedBy,
       H.ModifiedOn,
       H.IssueDate,
       H.ReturnDate
   FROM ITAssetHistory H
   LEFT JOIN EmploymentDetail ED ON H.EmployeeId = ED.EmployeeId
   LEFT JOIN EmployeeData E ON E.Id = ED.EmployeeId
   WHERE H.AssetId = @AssetId
   ORDER BY H.CreatedOn DESC
   ```
5. Response: ApiResponseModel<IEnumerable<ITAssetHistoryResponseDto>>
6. Frontend: Displays in table/timeline component

**Dependent Modules:** Employee Management (employee details in history)

---

### Feature 7: Bulk Asset Import via Excel
**Description:** Import multiple assets at once via Excel file upload with validation, duplicate detection, employee auto-allocation, and comprehensive error reporting.

**Business Rules:**
- Excel file must be .xlsx or .xls format, max size 10MB
- Required columns (19 total): User Name, Assignment Date, Device Name, Device Code, Serial Number, Invoice Number, Manufacturer, Model, Asset Type, Status, Location, Purchase Date, Warranty Expires, OS, Processor, RAM, HDD 1, HDD 2, Comments
- User Name (employee email) is optional; if provided, asset auto-allocated to that employee
- Assignment Date required only if User Name provided; must be >= Purchase Date and <= Warranty Expiry
- Serial Number must be unique within Excel and database
- Asset Type, Status, Location must match enum values (case-insensitive parsing)
- Status validation: If User Name provided, Status must be "Allocated"; if User Name blank, Status must be "InInventory"
- Purchase Date required; Warranty Expiry Date must be > Purchase Date and >= Assignment Date
- Duplicate Serial Numbers in Excel: flagged as duplicates, not imported
- Invalid records: collected and returned to user with row number and reason
- Two-phase import: 
  - Phase 1 (importConfirmed=false): Validation only, returns counts (valid, duplicate, invalid) with details
  - Phase 2 (importConfirmed=true): Actual import after user confirmation
- Existing assets (matched by Serial Number): Updated with new data; if newly allocated, creates EmployeeAsset and ITAssetHistory
- New assets: Inserted with allocation if User Name provided
- Specification field auto-generated: concatenates OS + Processor + RAM + HDD1 + HDD2

**User Interactions:**
1. User navigates to IT Assets list page → clicks "Import Assets" button
2. File upload dialog appears; user selects Excel file
3. User clicks "Upload" → system performs Phase 1 validation (importConfirmed=false)
4. System displays validation summary:
   - Valid Records: X (green badge)
   - Duplicate Records: Y (yellow badge) with list: Row, Serial Number, Device Name
   - Invalid Records: Z (red badge) with list: Row, Reason
5. User reviews validation results
6. If issues found, user clicks "Cancel" → fixes Excel → re-uploads
7. If satisfied, user clicks "Confirm Import" → system performs Phase 2 (importConfirmed=true)
8. System processes each row:
   - Checks if Serial Number exists → UPDATE existing asset OR INSERT new asset
   - If User Name provided → creates EmployeeAsset and ITAssetHistory
9. Success message: "X records imported, Y records updated."
10. Asset list auto-refreshes with newly imported assets

**Validations:**
- File extension: .xlsx, .xls only
- File size: <= 10MB
- Header validation: All 19 required headers must exist (case-insensitive)
- Row-level validations (per row):
  - Serial Number: Required, unique in Excel, unique in database (for new assets)
  - Device Name: Required
  - User Name: If provided, must exist in EmploymentDetail table
  - Assignment Date: If User Name provided, required and valid date format (MM/DD/YYYY)
  - Assignment Date must be >= Purchase Date and < Warranty Expiry
  - Purchase Date: Required, valid date format
  - Warranty Expiry: Valid date format, must be > Purchase Date
  - Asset Type: Must match enum (Laptop, Desktop, Monitor, Keyboard, Mouse, Printer, Scanner, UPS, ExternalHardDrive, Headset, Webcam, Projector, SoftwareLicense, NetworkCable)
  - Status: If User Name provided, must be "Allocated"; if User Name empty, must be "InInventory"
  - Location (Branch): Must match BranchLocation enum
  - RAM: If provided, must be valid integer
  - Existing asset check: If Serial Number exists and Status=Allocated, cannot import as InInventory (conflict)

**Data Flow:**
1. Frontend: User uploads file → sends FormData with file
2. API Call: POST `/api/AssetManagement/ImportExcel?importConfirmed=false` (Phase 1)
3. Service: AssetManagementService.ImportExcelForAsset:
   - Validates file extension and size
   - Reads Excel with EPPlus library
   - Validates headers
   - Iterates each row, validates data, collects errors/duplicates/valid records
   - Returns JSON response with counts and lists
4. Frontend: Displays validation summary
5. User confirms → API Call: POST `/api/AssetManagement/ImportExcel?importConfirmed=true` (Phase 2)
6. Service: Processes valid records:
   - For each asset:
     - Check if Serial Number exists (GetAssetBySerialNumberAsync)
     - If exists: UPDATE ITAsset (UpdateITAssetAsync); if newly allocated, INSERT EmployeeAsset + ITAssetHistory
     - If new: INSERT ITAsset (InsertITAssetAsync), if User Name provided, INSERT EmployeeAsset + ITAssetHistory
   - Track success counts (imported, updated)
7. Response: "X records imported, Y records updated."
8. Frontend: Toast notification, asset list refreshed

**Dependent Modules:** Employee Management (employee validation), EPPlus library (Excel parsing)

---

## Data Models

### 1. ITAsset (Main Asset Table)
**Table Name:** `dbo.ITAsset`  
**Purpose:** Stores IT asset inventory with device details, specifications, status, and file references.

**Schema:**
```sql
CREATE TABLE [dbo].[ITAsset] (
    [Id] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DeviceName] NVARCHAR(100) NOT NULL,
    [DeviceCode] NVARCHAR(100) NULL,
    [SerialNumber] NVARCHAR(100) NULL,
    [InvoiceNumber] NVARCHAR(100) NULL,
    [Manufacturer] NVARCHAR(100) NULL,
    [Model] NVARCHAR(100) NULL,
    [AssetType] TINYINT NOT NULL,  -- Enum: AssetType
    [Status] TINYINT NOT NULL,     -- Enum: AssetStatus
    [AssetCondition] TINYINT NULL, -- Enum: AssetCondition
    [Branch] TINYINT NULL,         -- Enum: BranchLocation
    [PurchaseDate] DATE NOT NULL,
    [WarrantyExpires] DATE NULL,
    [Specification] NVARCHAR(MAX) NULL,  -- Free text: OS, Processor, RAM, HDD
    [Comments] NVARCHAR(100) NULL,
    [ProductFileOriginalName] NVARCHAR(MAX) NULL,  -- Original filename of invoice
    [ProductFileName] NVARCHAR(MAX) NULL,           -- Blob storage filename
    [SignatureFileOriginalName] NVARCHAR(MAX) NULL, -- Original filename of signature
    [SignatureFileName] NVARCHAR(MAX) NULL,         -- Blob storage filename
    [CreatedBy] NVARCHAR(100) NOT NULL,
    [CreatedOn] DATETIME NOT NULL,
    [ModifiedBy] NVARCHAR(100) NULL,
    [ModifiedOn] DATETIME NULL
)
```

**Entity Class (C#):**
```csharp
public class ITAsset : BaseEntity  // BaseEntity provides Id, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
{
    public string? DeviceName { get; set; }
    public string? DeviceCode { get; set; }
    public string? SerialNumber { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public AssetType AssetType { get; set; }
    public AssetStatus Status { get; set; }
    public AssetCondition AssetCondition { get; set; } = AssetCondition.Ok;
    public BranchLocation? Branch { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public DateOnly? WarrantyExpires { get; set; }
    public string? Specification { get; set; }
    public string? Comments { get; set; }
    public string? ProductFileOriginalName { get; set; }
    public string? ProductFileName { get; set; }
    public string? SignatureFileOriginalName { get; set; }
    public string? SignatureFileName { get; set; }
}
```

**Key Relationships:**
- One-to-Many with EmployeeAsset (one asset can have multiple allocation history records)
- One-to-Many with ITAssetHistory (one asset can have multiple history entries)

---

### 2. EmployeeAsset (Asset Allocation Table)
**Table Name:** `dbo.EmployeeAsset`  
**Purpose:** Tracks asset allocations to employees with assignment dates, active status, and return information.

**Schema:**
```sql
CREATE TABLE [dbo].[EmployeeAsset] (
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [EmployeeId] [bigint] NOT NULL,  -- FK to EmployeeData.Id
    [AssetId] [bigint] NOT NULL,     -- FK to ITAsset.Id
    [AssignedOn] [date] NOT NULL,
    [IsActive] [bit] NOT NULL,       -- true = currently allocated, false = returned
    [ReturnDate] [date] NULL,        -- Populated when asset returned
    [ReturnCondition] [tinyInt] NULL, -- Enum: AssetCondition at time of return
    [CreatedBy] [nvarchar](100) NOT NULL,
    [CreatedOn] [datetime] NOT NULL,
    [ModifiedBy] [nvarchar](100) NULL,
    [ModifiedOn] [datetime] NULL,
    CONSTRAINT [FK_EmployeeAsset_EmployeeData_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [dbo].[EmployeeData] ([Id]),
    CONSTRAINT [FK_EmployeeAsset_ITAsset_AssetId] FOREIGN KEY ([AssetId]) REFERENCES [dbo].[ITAsset] ([Id])
)
```

**Entity Class (C#):**
```csharp
public class EmployeeAsset : BaseEntity
{
    public long EmployeeId { get; set; }
    public long AssetId { get; set; }
    public DateOnly AssignedOn { get; set; }
    public bool IsActive { get; set; }  // true = currently allocated
    public AssetCondition AssetCondition { get; set; }
    public AssetStatus AssetStatus { get; set; }
    public DateOnly ReturnDate { get; set; }
}
```

**Key Relationships:**
- Many-to-One with EmployeeData (EmployeeId FK)
- Many-to-One with ITAsset (AssetId FK)

**Business Logic:**
- Only one active allocation per asset (IsActive=1 constraint enforced in repository)
- When asset allocated: IsActive=true, ReturnDate=null
- When asset returned: IsActive=false, ReturnDate=current date, ReturnCondition=final condition

---

### 3. ITAssetHistory (Audit Trail Table)
**Table Name:** `dbo.ITAssetHistory`  
**Purpose:** Immutable audit log of all asset lifecycle events including allocations, returns, status changes, and condition changes.

**Schema:**
```sql
CREATE TABLE [dbo].[ITAssetHistory] (
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [AssetId] [bigint] NOT NULL,     -- Reference to ITAsset (no FK, denormalized for history preservation)
    [EmployeeId] [bigint] NOT NULL,  -- Employee involved in the event (0 if no employee)
    [Status] [tinyint] NOT NULL,     -- AssetStatus at time of event
    [AssetCondition] [tinyint] NOT NULL,  -- AssetCondition at time of event
    [Note] [nvarchar](255) NULL,     -- Event description/reason
    [IssueDate] [date] NULL,         -- Allocation date (null if status change only)
    [ReturnDate] [date] NULL,        -- Return date (null if still allocated)
    [CreatedBy] [nvarchar](100) NOT NULL,  -- User who triggered the event
    [CreatedOn] [datetime] NOT NULL,
    [ModifiedBy] [nvarchar](100) NULL,
    [ModifiedOn] [datetime] NULL
)
```

**Entity Class (C#):**
```csharp
public class ITAssetHistory : BaseEntity
{
    public long AssetId { get; set; }
    public long EmployeeId { get; set; }
    public string? Note { get; set; }
    public AssetStatus Status { get; set; }
    public AssetCondition AssetCondition { get; set; } = AssetCondition.Ok;
    public DateOnly? IssueDate { get; set; }
    public DateOnly? ReturnDate { get; set; }
}
```

**Key Relationships:**
- No formal foreign keys (denormalized for history preservation; allows asset/employee deletion without cascading)
- Logical relationship: AssetId references ITAsset.Id, EmployeeId references EmployeeData.Id

**Sample History Flow:**
1. Asset created: No history entry (history starts at first allocation/status change)
2. Asset allocated to Employee A: History entry (Status=Allocated, IssueDate=today, ReturnDate=null, Note="Asset allocated successfully.")
3. Asset returned: History entry (Status=InInventory, IssueDate=original AssignedOn, ReturnDate=today, Note="Asset deallocated successfully.")
4. Asset retired: History entry (Status=Retired, IssueDate=null, ReturnDate=null, Note="Asset retired from inventory")

---

## Configuration & Enums

### AssetType Enum
**Values:**
```csharp
public enum AssetType
{
    Laptop = 1,
    Desktop = 2,
    Monitor = 3,
    Keyboard = 4,
    Mouse = 5,
    Printer = 6,
    Scanner = 7,
    UPS = 8,
    ExternalHardDrive = 9,
    Headset = 10,
    Webcam = 11,
    Projector = 12,
    SoftwareLicense = 13,
    NetworkCable = 14
}
```

**Usage:** Categorizes IT assets for inventory management and reporting.

---

### AssetStatus Enum
**Values:**
```csharp
public enum AssetStatus
{
    InInventory = 1,  // Available for allocation
    Allocated = 2,    // Currently assigned to employee
    Retired = 3       // No longer in use, cannot be allocated
}
```

**Frontend Labels:**
```typescript
export const ASSET_STATUS_LABEL: Record<AssetStatus, string> = {
  [AssetStatus.InInventory]: "In Inventory",
  [AssetStatus.Allocated]: "Allocated",
  [AssetStatus.Retired]: "Retired",
};
```

**Business Rules:**
- InInventory → Allocated: Valid (via allocation)
- Allocated → InInventory: Valid (via return)
- Allocated → Retired: Valid (asset retired while allocated, triggers deallocation)
- InInventory → Retired: Valid (asset retired without allocation)
- Retired → Allocated: Invalid (cannot allocate retired assets)
- Retired → InInventory: Valid (asset repaired and brought back to inventory)

---

### AssetCondition Enum
**Values:**
```csharp
public enum AssetCondition
{       
   Ok = 1,       // Fully functional
   Damage = 2,   // Physically damaged but repairable
   Missing = 3   // Lost or stolen
}
```

**Frontend Labels:**
```typescript
export const ASSET_CONDITION_OPTIONS = [
  { id: "1", label: "Ok" },
  { id: "2", label: "Damaged" },
  { id: "3", label: "Missing" },
];
```

**Business Rules:**
- Assets with "Damaged" or "Missing" condition cannot be allocated from inventory
- Assets can be returned with any condition
- Condition changes trigger history entry creation

---

## External Dependencies

### 1. Azure Blob Storage
**Purpose:** Store product invoice files and signature/acknowledgment documents.

**Implementation:**
- BlobStorageClient service handles file upload/download/delete operations
- Container: UserDocumentContainer (shared with other modules)
- File naming: System-generated unique filenames stored in ProductFileName/SignatureFileName
- Original filenames preserved in ProductFileOriginalName/SignatureFileOriginalName for display/download

**Methods Used:**
- `UploadFile(IFormFile file, long userId, string containerName)`: Returns unique filename
- `DeleteFile(string fileName, string containerName)`: Removes file from blob storage
- File validation: Max size 5MB (configurable via AppConfigOptions.UserDocFileMaxSize)

---

### 2. EPPlus Library
**Purpose:** Excel file parsing for bulk asset import feature.

**Version:** EPPlus 5.x or higher (NonCommercial license)

**Usage:**
```csharp
OfficeOpenXml.ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
using (var package = new ExcelPackage(stream))
{
    var worksheet = package.Workbook.Worksheets.First();
    var rowCount = worksheet.Dimension.Rows;
    // Parse headers, validate data, extract rows
}
```

---

### 3. AutoMapper
**Purpose:** Map DTOs to Entities and vice versa.

**Mappings Required:**
- `ITAssetRequestDto` → `ITAsset`
- `EmployeeAssetCreateDto` → `EmployeeAsset`
- `ITAssetRequestDto` → `EmployeeAsset` (for allocation feature)

---

### 4. Dapper ORM
**Purpose:** Execute parameterized SQL queries and stored procedures with type-safe mapping.

**Custom Type Handlers:**
- `SqlDateOnlyTypeHandler`: Maps DateOnly (C# 10+) to SQL DATE type
- `SqlTimeOnlyTypeHandler`: Maps TimeOnly to SQL TIME type

**Registration:**
```csharp
SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
```

---

**End of Part 1**  
**Continue to Part 2:** API Endpoints, UI Components, Workflows, Error Handling
