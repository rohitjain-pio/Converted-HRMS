# Module 05: Asset Management (Part 2 of 3)

## API Endpoints

### 1. POST /api/AssetManagement/GetAssetList
**Purpose:** Retrieve paginated list of IT assets with filtering, sorting, and employee-based search.

**Authorization:** `[HasPermission(Permissions.ReadAsset)]`

**Request Body:**
```json
{
  "startIndex": 1,
  "pageSize": 10,
  "sortColumnName": "ModifiedOn",
  "sortDirection": "DESC",
  "filters": {
    "deviceName": "Laptop",
    "deviceCode": "LT001",
    "manufacturer": "Dell",
    "model": "Latitude 7420",
    "assetType": 1,
    "assetStatus": 2,
    "branch": 1,
    "employeeCodes": "EMP001,EMP002"
  }
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 45,
    "itAssetList": [
      {
        "id": 101,
        "deviceName": "Dell Laptop",
        "deviceCode": "LT001",
        "serialNumber": "SN12345678",
        "manufacturer": "Dell",
        "model": "Latitude 7420",
        "assetType": 1,
        "assetStatus": 2,
        "branch": 1,
        "purchaseDate": "2023-05-15",
        "warrantyExpires": "2026-05-14",
        "comments": "High-performance laptop",
        "modifiedOn": "2024-03-20T10:30:00Z",
        "allocatedBy": "admin@example.com",
        "custodian": "john.doe@example.com",
        "custodianFullName": "John Michael Doe"
      }
    ]
  }
}
```

**Backend Implementation:**
- Controller: `AssetManagementController.GetAssetList`
- Service: `AssetManagementService.GetAssetList`
- Repository: `AssetManagementRepository.GetAllITAssetAsync` → Stored Procedure: `GetAllITAsset`

**Stored Procedure Logic:**
- First result set: Total count with WHERE filters applied
- Second result set: Paginated data with LEFT JOINs to EmployeeAsset, EmploymentDetail, EmployeeData
- Dynamic sorting on any column with ASC/DESC support
- EmployeeCodes filter: Uses STRING_SPLIT to match multiple employee codes

---

### 2. POST /api/AssetManagement/UpsertITAsset
**Purpose:** Create new IT asset or update existing asset with file upload support. Handles allocation/deallocation logic if employee specified.

**Authorization:** `[HasPermission(Permissions.CreateAsset)]`

**Request Body (Form Data):**
```
deviceName: "Dell Laptop"
deviceCode: "LT001"
serialNumber: "SN12345678"
invoiceNumber: "INV-2023-001"
manufacturer: "Dell"
model: "Latitude 7420"
assetType: 1
assetStatus: 1
assetCondition: 1
branch: 1
purchaseDate: "2023-05-15"
warrantyExpires: "2026-05-14"
specification: "Intel i7, 16GB RAM, 512GB SSD"
comments: "High-performance laptop"
employeeId: 123
isAllocated: true
note: "Allocated for software development"
productFileOriginalName: [File]
signatureFileOriginalName: [File]
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Success",
  "result": 1
}
```

**Error Response (400 Bad Request - File Size Exceeded):**
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size of 5MB",
  "result": 0
}
```

**Backend Implementation:**
- Controller: `AssetManagementController.UpsertITAsset`
- Service: `AssetManagementService.UpsertITAssetAsync`:
  - Uploads files to Azure Blob Storage (if provided)
  - Maps DTO to ITAsset entity
  - Checks if asset exists (by Id) → UPDATE or INSERT
  - If status/condition changed, sets historyFlag=true
  - Calls repository.UpsertITAssetAsync
  - If isAllocated != null, calls AllocateAssetById (allocation/deallocation)
- Repository: `AssetManagementRepository.UpsertITAssetAsync`:
  - Transaction logic: UPDATE ITAsset, INSERT ITAssetHistory (if historyFlag=true)

**File Upload Logic:**
1. Validate file size (max 5MB)
2. Upload to BlobStorageClient → returns unique filename
3. Store ProductFileName/SignatureFileName in database
4. On failure: Delete uploaded files from blob storage (rollback)

---

### 3. GET /api/AssetManagement/GetAssetById/{AssetId}
**Purpose:** Retrieve complete asset details including custodian information and file references.

**Authorization:** `[HasPermission(Permissions.ViewAsset)]`

**Request Parameters:**
- `AssetId` (path parameter, long): Asset ID

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "id": 101,
    "deviceName": "Dell Laptop",
    "deviceCode": "LT001",
    "serialNumber": "SN12345678",
    "invoiceNumber": "INV-2023-001",
    "manufacturer": "Dell",
    "model": "Latitude 7420",
    "assetType": 1,
    "assetStatus": 2,
    "assetCondition": 1,
    "branch": 1,
    "purchaseDate": "2023-05-15",
    "warrantyExpires": "2026-05-14",
    "specification": "Intel i7, 16GB RAM, 512GB SSD",
    "comments": "High-performance laptop",
    "productFileOriginalName": "invoice-12345.pdf",
    "productFileName": "abc123-invoice.pdf",
    "signatureFileOriginalName": "acknowledgment-signed.pdf",
    "signatureFileName": "xyz789-signature.pdf",
    "modifiedOn": "2024-03-20T10:30:00Z",
    "custodian": {
      "employeeId": 123,
      "email": "john.doe@example.com",
      "firstName": "John",
      "middleName": "Michael",
      "lastName": "Doe",
      "fullName": "John Michael Doe"
    }
  }
}
```

**Response (404 Not Found - Asset Not Exists):**
```json
{
  "statusCode": 404,
  "message": "Asset not found",
  "result": null
}
```

**Backend Implementation:**
- Repository: Joins ITAsset → EmployeeAsset (IsActive=1) → EmploymentDetail → EmployeeData
- Multi-mapping with Dapper: Splits on "EmployeeId" to populate custodian object

---

### 4. GET /api/AssetManagement/GetAssetHistoryById/{AssetId}
**Purpose:** Retrieve complete audit trail of asset lifecycle events.

**Authorization:** `[HasPermission(Permissions.ViewAsset)]`

**Request Parameters:**
- `AssetId` (path parameter, long): Asset ID

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": [
    {
      "employeeName": "John Michael Doe",
      "custodian": "john.doe@example.com",
      "assetStatus": 2,
      "assetCondition": 1,
      "note": "Asset allocated successfully.",
      "modifiedBy": "admin@example.com",
      "modifiedOn": "2024-03-20T10:30:00Z",
      "issueDate": "2024-03-20",
      "returnDate": null
    },
    {
      "employeeName": "Jane Smith",
      "custodian": "jane.smith@example.com",
      "assetStatus": 1,
      "assetCondition": 1,
      "note": "Asset deallocated successfully.",
      "modifiedBy": "admin@example.com",
      "modifiedOn": "2024-01-15T08:00:00Z",
      "issueDate": "2023-06-01",
      "returnDate": "2024-01-15"
    }
  ]
}
```

**Backend Implementation:**
- Repository: Query ITAssetHistory with LEFT JOINs to EmploymentDetail and EmployeeData
- Ordered by CreatedOn DESC (most recent first)

---

### 5. GET /api/AssetManagement/GetEmployeeAsset/{employeeId}
**Purpose:** Retrieve all assets ever allocated to a specific employee (active and returned).

**Authorization:** `[HasPermission(Permissions.ViewAsset)]`

**Request Parameters:**
- `employeeId` (path parameter, long): Employee ID

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": [
    {
      "assetId": 101,
      "serialNumber": "SN12345678",
      "deviceCode": "LT001",
      "manufacturer": "Dell",
      "model": "Latitude 7420",
      "assetType": 1,
      "assetStatus": 2,
      "assignedOn": "2024-03-20",
      "branch": 1,
      "assetCondition": 1,
      "returnDate": null,
      "assignedBy": "admin@example.com"
    },
    {
      "assetId": 95,
      "serialNumber": "SN87654321",
      "deviceCode": "LT002",
      "manufacturer": "HP",
      "model": "EliteBook 840",
      "assetType": 1,
      "assetStatus": 1,
      "assignedOn": "2023-01-10",
      "branch": 1,
      "assetCondition": 2,
      "returnDate": "2023-12-31",
      "assignedBy": "manager@example.com"
    }
  ]
}
```

**Backend Implementation:**
- Repository: Query EmployeeAsset JOIN ITAsset WHERE EmployeeId = @EmployeeId
- Returns all allocations (IsActive=true and IsActive=false)
- Ordered by AssignedOn DESC

**Use Case:** Exit Management module uses this to show all assets allocated to resigning employee.

---

### 6. POST /api/AssetManagement/GetEmployeeAssetList
**Purpose:** Retrieve list of asset allocations (EmployeeAsset records) with custodian details for administrative view.

**Authorization:** `[HasPermission(Permissions.ReadAsset)]`

**Request Body:**
```json
{
  "startIndex": 1,
  "pageSize": 10,
  "sortColumnName": "LastUpdate",
  "sortDirection": "DESC",
  "filters": {
    "assetName": "Laptop"
  }
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 30,
    "employeeAssetList": [
      {
        "id": 501,
        "assetId": 101,
        "isActive": true,
        "assetName": "Laptop",
        "assetNumber": "SN12345678",
        "brand": "Dell",
        "model": "Latitude 7420",
        "custodian": "john.doe@example.com",
        "lastUpdate": "2024-03-20T10:30:00Z"
      }
    ]
  }
}
```

**Backend Implementation:**
- Repository: Query with JOINs: EmployeeAsset → ITAsset → EmploymentDetail
- Supports filtering by AssetType (AssetName column in query)
- Pagination and sorting support

---

### 7. POST /api/AssetManagement/UpsertEmployeeAsset
**Purpose:** Create or update EmployeeAsset record (not commonly used; allocation typically done via UpsertITAsset with isAllocated flag).

**Authorization:** `[HasPermission(Permissions.CreateAsset)]`

**Request Body:**
```json
{
  "employeeId": 123,
  "assetId": 101,
  "assignedOn": "2024-03-20",
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Success",
  "result": 1
}
```

**Backend Implementation:**
- Repository: Checks if EmployeeAsset record exists by EmployeeId → UPDATE or INSERT

---

### 8. POST /api/AssetManagement/ImportExcel
**Purpose:** Bulk import assets from Excel file with two-phase validation and confirmation.

**Authorization:** `[HasPermission(Permissions.CreateAsset)]`

**Request Parameters:**
- `excelfile` (form-data, File): Excel file (.xlsx, .xls)
- `importConfirmed` (query parameter, bool): false = validation only, true = actual import

**Request (Form Data):**
```
excelfile: [File]
importConfirmed: false
```

**Response Phase 1 - Validation (importConfirmed=false, 200 OK):**
```json
{
  "statusCode": 200,
  "message": "{\"validRecordsCount\":25,\"validRecords\":[{\"row\":2,\"serialNumber\":\"SN001\",\"deviceName\":\"Dell Laptop\"}, ...],\"duplicateCount\":2,\"duplicateRecords\":[{\"row\":15,\"serialNumber\":\"SN001\",\"deviceName\":\"Dell Laptop\"}],\"invalidCount\":3,\"invalidRecords\":[{\"row\":10,\"reason\":\"Missing Serial Number\"},{\"row\":20,\"reason\":\"Invalid Asset Type: Tablet\"}]}",
  "result": 1
}
```

**Response Phase 2 - Import (importConfirmed=true, 200 OK):**
```json
{
  "statusCode": 200,
  "message": "15 records imported, 10 records updated.",
  "result": 1
}
```

**Error Response (400 Bad Request - Invalid File):**
```json
{
  "statusCode": 400,
  "message": "Invalid Excel file format",
  "result": 0
}
```

**Error Response (400 Bad Request - Missing Headers):**
```json
{
  "statusCode": 409,
  "message": "Missing required column(s): User Name, Serial Number",
  "result": 0
}
```

**Backend Implementation:**
- Service: AssetManagementService.ImportExcelForAsset
- Validation Phase:
  - Validate file extension (.xlsx, .xls)
  - Validate file size (<= 10MB)
  - Parse Excel with EPPlus
  - Validate headers (19 required columns)
  - Iterate rows, validate each field, collect errors/duplicates/valid records
  - Return JSON response with counts and details
- Import Phase:
  - Process each valid record
  - Check if Serial Number exists → UPDATE or INSERT ITAsset
  - If User Name provided → INSERT EmployeeAsset + ITAssetHistory
  - Track import counts, return success message

**Excel Columns (19 Required):**
1. User Name (employee email, optional)
2. Assignment Date (required if User Name provided)
3. Device Name*
4. Device Code*
5. Serial Number*
6. Invoice Number*
7. Manufacturer*
8. Model*
9. Asset Type* (enum value)
10. Status* (enum value)
11. Location* (Branch enum value)
12. Purchase Date*
13. Warranty Expires*
14. OS
15. Processor
16. RAM
17. HDD 1
18. HDD 2
19. Comments

---

## UI Components

### 1. AddITAssetPage.tsx
**Purpose:** Form page for creating new IT assets with validation and file upload.

**Location:** `Frontend/HRMS-Frontend/source/src/pages/AssetManagement/AddITAssetPage.tsx`

**Features:**
- React Hook Form with Yup validation
- FormTextField for text inputs (Device Name, Code, Serial Number, Invoice Number, Manufacturer, Model, Specifications, Comments)
- AssetFormSelectField for Asset Type dropdown
- FormSelectField for Asset Status, Asset Condition dropdowns
- BranchSelectField for Branch location
- FormDatePicker for Purchase Date and Warranty Expires
- FileUpload component for Product Invoice (required) and Signature Document (optional)
- Submit button triggers validation → API call → success toast → form reset
- Reset button clears form

**Validation Rules:**
- All text fields trimmed, required fields validated
- Asset Type/Status/Condition must be valid enum values
- Purchase Date required, Warranty Expires >= Purchase Date
- Product Invoice file required (max 5MB)
- Signature Document optional (max 5MB)
- File validation: extension check (.pdf, .doc, .docx, .jpeg, .jpg, .png)

**User Flow:**
1. User fills form → clicks Submit
2. Frontend validates via Yup schema
3. If valid → converts to FormData → calls upsertITAsset API
4. Success: Toast notification "Asset created successfully", form resets
5. Error: Error toast with message

---

### 2. ItAssetTable (index.tsx)
**Purpose:** Paginated data table displaying all IT assets with filtering, sorting, column visibility, and bulk import.

**Location:** `Frontend/HRMS-Frontend/source/src/pages/AssetManagement/ItAssetTable/index.tsx`

**Features:**
- Material-UI DataTable with server-side pagination and sorting
- TableTopToolbar with:
  - Filter toggle button
  - Employee autocomplete (multi-select)
  - Import Assets button
  - Column visibility controls
- FilterForm (collapsible) with inputs: Device Name, Device Code, Manufacturer, Model, Asset Type, Status, Branch
- Column visibility state management (Model and Comments hidden by default)
- Row click → navigates to Asset Details page
- Fetches data on mount, pagination change, sorting change, filter change

**Columns:**
- Id, Device Name, Device Code, Serial Number, Manufacturer, Model, Asset Type, Asset Status, Branch, Purchase Date, Warranty Expires, Comments, Modified On, Custodian, Custodian Full Name

**User Flow:**
1. Page loads → fetchItAssetList called → displays 10 rows
2. User clicks column header (e.g., "Device Name") → sorts ascending → re-fetches
3. User clicks "Show Filters" → filter form expands
4. User enters "Dell" in Device Name → clicks Apply → re-fetches with filter
5. User selects employee from autocomplete → filters by employee code
6. User clicks row → navigates to `/asset-management/{assetId}/general`
7. User clicks "Import Assets" → opens ImportDialog

---

### 3. ITAssetForm.tsx
**Purpose:** Reusable form component for both creating and editing assets with allocation/deallocation logic.

**Location:** `Frontend/HRMS-Frontend/source/src/pages/AssetManagement/components/ITAssetForm.tsx`

**Modes:**
- `mode="create"`: For AddITAssetPage (no employee selection, no allocation)
- `mode="edit"`: For AssetDetailsLayout (supports allocation/deallocation)

**Features (Edit Mode):**
- All fields editable except Serial Number and Id
- Asset Status change triggers conditional logic:
  - "In Inventory" → "Allocated": Employee autocomplete appears, isAllocated=true
  - "Allocated" → "In Inventory"/"Retired": isAllocated=false (deallocation)
- AssetUserAutocomplete: Fetches all employees, displays Employee Code - Full Name
- Note field: Optional, stores allocation/deallocation reason
- Conditional validation:
  - Cannot allocate retired asset (validation error)
  - Cannot allocate asset with "Damaged" or "Missing" condition from inventory
  - If status="Allocated" and employee selected, validates allocation eligibility
- File upload: Can replace existing files, shows "View Document" link if file exists

**Validation Context:**
- `isDisabled` flag: If true, disables certain validations (for read-only mode)

**User Flow (Allocation):**
1. User opens allocated asset → clicks Edit
2. User changes Status from "In Inventory" to "Allocated"
3. Employee autocomplete appears
4. User selects employee "John Doe - john.doe@example.com"
5. User enters note "Allocated for project ABC"
6. User clicks Submit → isAllocated=true sent in payload
7. API allocates asset → creates EmployeeAsset and ITAssetHistory
8. Success toast → asset details refreshed

**User Flow (Deallocation):**
1. User opens allocated asset → clicks Edit
2. User changes Status from "Allocated" to "In Inventory"
3. User selects Return Condition (Ok/Damaged/Missing)
4. User enters note "Laptop screen damaged"
5. User clicks Submit → isAllocated=false sent in payload
6. API deallocates asset → updates EmployeeAsset (IsActive=false, ReturnDate=today)
7. Success toast → asset details refreshed

---

### 4. AssetDetailsLayout.tsx
**Purpose:** Layout component for asset details page with tabs (General, History) and permission-based edit button.

**Location:** `Frontend/HRMS-Frontend/source/src/pages/AssetManagement/AssetDetails/AssetDetailsLayout.tsx`

**Features:**
- Fetches asset data on mount via getAssetById API
- Provides outlet context to child routes (assetData, fetchAssetById, isLoading, isEditable)
- isEditable flag: Checks if user has "UpdateAsset" permission
- Edit button: Visible only if isEditable=true
- Tabs: General (asset form), History (audit trail)

**User Flow:**
1. User navigates to `/asset-management/101/general`
2. AssetDetailsLayout fetches asset by ID
3. AssetGeneralPage rendered with assetData as props
4. User clicks Edit → ITAssetForm enters edit mode
5. User clicks History tab → navigates to `/asset-management/101/history`

---

### 5. AssetGeneralPage.tsx
**Purpose:** Displays asset general information using ITAssetForm in edit mode.

**Location:** `Frontend/HRMS-Frontend/source/src/pages/AssetManagement/AssetDetails/AssetGeneralPage.tsx`

**Features:**
- Receives assetData from outlet context
- Renders ITAssetForm with mode="edit"
- Passes fetchAssetById callback to refresh data after edit
- Displays GlobalLoader while data loading

---

### 6. TableTopToolbar.tsx
**Purpose:** Toolbar component for IT Asset table with filters, employee search, import button, and action buttons.

**Location:** `Frontend/HRMS-Frontend/source/src/pages/AssetManagement/ItAssetTable/TableTopToolBar.tsx`

**Features:**
- "Show Filters" button: Toggles filter form visibility
- "Reset Filters" button: Clears all filters, resets pagination
- Employee autocomplete (multi-select): Filters assets by employee codes
- "Import Assets" button: Opens bulk import dialog
- "Add Asset" button: Navigates to AddITAssetPage
- "Export" button (if implemented): Exports asset list to Excel

**User Flow:**
1. User clicks "Show Filters" → filter form expands
2. User enters filter criteria → clicks Apply → table re-fetches
3. User selects 2 employees from autocomplete → table filters by those employees
4. User clicks "Import Assets" → ImportDialog opens
5. User uploads Excel → validation results displayed → confirms import → success toast

---

### 7. AssetUserAutocomplete.tsx
**Purpose:** Autocomplete dropdown for selecting employees during asset allocation.

**Location:** `Frontend/HRMS-Frontend/source/src/pages/AssetManagement/components/AssetUserAutocomplete.tsx`

**Features:**
- Fetches all employees from EmploymentDetail table
- Displays: Employee Code - Full Name (e.g., "EMP001 - John Michael Doe")
- Filters by Employee Code or Name
- On selection, sets employeeId in form

**User Flow:**
1. User types "John" → autocomplete filters employees
2. User selects "EMP001 - John Michael Doe" from dropdown
3. employeeId=123 set in form state
4. On submit, asset allocated to employee with ID 123

---

## Workflows

### Workflow 1: Asset Lifecycle - Purchase to Allocation
**Actors:** Asset Manager (Admin), IT Manager, Employee

**Steps:**
1. **Asset Purchase:**
   - Asset Manager receives new laptop with invoice and accessories
   - Asset Manager navigates to "Add Asset" page
   - Fills device details: Dell Laptop, SN12345678, LT001, invoice INV-2023-001
   - Selects Asset Type: Laptop, Status: In Inventory, Condition: Ok
   - Enters Purchase Date: 2023-05-15, Warranty Expires: 2026-05-14
   - Selects Branch: Headquarters
   - Enters Specifications: "Intel i7, 16GB RAM, 512GB SSD"
   - Uploads Product Invoice (PDF file)
   - Uploads Signature/Acknowledgment Document (scanned receipt)
   - Clicks Submit → Asset created with ID 101

2. **Asset Allocation:**
   - IT Manager receives allocation request for Employee John Doe
   - IT Manager navigates to IT Assets list → searches for "Dell Laptop"
   - Clicks asset row → opens Asset Details page
   - Clicks Edit button → form enters edit mode
   - Changes Asset Status from "In Inventory" to "Allocated"
   - Employee autocomplete appears
   - Selects "EMP001 - John Michael Doe" from dropdown
   - Enters Note: "Allocated for Software Development - Project XYZ"
   - Clicks Submit
   - System performs allocation:
     - Creates EmployeeAsset record (EmployeeId=123, AssetId=101, AssignedOn=today, IsActive=true)
     - Updates ITAsset (Status=Allocated, AssetCondition=Ok)
     - Creates ITAssetHistory entry (Status=Allocated, IssueDate=today, Note="Allocated for Software Development - Project XYZ")
   - Success toast: "Asset allocated successfully"
   - Asset Details page refreshed → shows Custodian: John Doe, john.doe@example.com

3. **Employee Acknowledgment:**
   - Employee John Doe receives laptop
   - Employee signs acknowledgment form (physical or digital)
   - IT Manager uploads signed acknowledgment to asset record (if not done during allocation)

**Result:**
- Asset status: In Inventory → Allocated
- EmployeeAsset.IsActive = true
- ITAssetHistory entry created with allocation details
- Asset visible in employee's profile under "Assets Allocated"

---

### Workflow 2: Asset Return with Condition Tracking
**Actors:** Employee, IT Manager

**Steps:**
1. **Return Initiation:**
   - Employee John Doe no longer needs laptop (project completed)
   - Employee returns laptop to IT Manager physically
   - IT Manager inspects laptop → finds screen slightly damaged

2. **Asset Deallocation:**
   - IT Manager navigates to Asset Details page (Asset ID 101)
   - Clicks Edit button
   - Changes Asset Status from "Allocated" to "In Inventory" (to return to inventory) or "Retired" (if beyond repair)
   - Selects Return Condition: "Damaged"
   - Enters Note: "Laptop screen has minor crack, needs repair"
   - Clicks Submit
   - System performs deallocation:
     - Updates EmployeeAsset (IsActive=false, ReturnDate=today, ReturnCondition=Damaged)
     - Updates ITAsset (Status=In Inventory, AssetCondition=Damaged)
     - Creates ITAssetHistory entry (Status=In Inventory, AssetCondition=Damaged, IssueDate=2024-03-20, ReturnDate=today, Note="Laptop screen has minor crack, needs repair")
   - Success toast: "Asset returned successfully"

3. **Repair & Re-Inventory:**
   - IT Manager sends laptop for screen replacement
   - After repair, IT Manager updates asset:
     - Opens Asset Details → Edit
     - Changes Asset Condition from "Damaged" to "Ok"
     - Enters Note: "Screen replaced, fully functional"
     - Clicks Submit
     - System creates ITAssetHistory entry (Status=In Inventory, AssetCondition=Ok, Note="Screen replaced, fully functional")

4. **Asset History View:**
   - IT Manager clicks History tab → sees complete timeline:
     - Row 1: Status=In Inventory, Condition=Ok, Note="Screen replaced, fully functional" (2024-04-05)
     - Row 2: Status=In Inventory, Condition=Damaged, IssueDate=2024-03-20, ReturnDate=2024-04-01, Note="Laptop screen has minor crack, needs repair"
     - Row 3: Status=Allocated, Condition=Ok, IssueDate=2024-03-20, ReturnDate=null, Note="Allocated for Software Development - Project XYZ"

**Result:**
- Asset status: Allocated → In Inventory
- Asset condition tracked throughout lifecycle (Ok → Damaged → Ok)
- Complete audit trail in ITAssetHistory

---

### Workflow 3: Bulk Asset Import for New Office Setup
**Actors:** Asset Manager, HR Team

**Steps:**
1. **Preparation:**
   - HR Team provides list of new employees (20 employees) joining next month
   - IT Department procures 20 laptops, 20 monitors, 20 keyboards, 20 mice
   - Asset Manager receives all invoices and device details

2. **Excel File Creation:**
   - Asset Manager creates Excel file with 80 rows (20 employees × 4 assets each)
   - Columns filled:
     - User Name: Employee emails (e.g., john.doe@example.com)
     - Assignment Date: Expected allocation date (2024-05-01)
     - Device Name: Dell Laptop, Dell Monitor, Logitech Keyboard, Logitech Mouse
     - Device Code: LT020, MON020, KB020, MS020
     - Serial Number: Unique for each device
     - Invoice Number: INV-2024-050
     - Manufacturer: Dell, Dell, Logitech, Logitech
     - Model: Latitude 7420, P2422H, K380, M330
     - Asset Type: Laptop, Monitor, Keyboard, Mouse
     - Status: Allocated (since User Name provided)
     - Location: Headquarters
     - Purchase Date: 2024-04-15
     - Warranty Expires: 2027-04-14
     - OS: Windows 11 Pro (for laptops)
     - Processor: Intel i7 11th Gen (for laptops)
     - RAM: 16 (for laptops)
     - HDD 1: 512GB SSD (for laptops)
     - HDD 2: (empty for most)
     - Comments: Bulk import for new joiners batch May 2024

3. **Import Phase 1 - Validation:**
   - Asset Manager navigates to IT Assets page → clicks "Import Assets"
   - Uploads Excel file
   - System performs validation (importConfirmed=false)
   - System returns:
     - Valid Records: 78 (green badge)
     - Duplicate Records: 1 (yellow badge) → Row 45: SN-12345 already exists
     - Invalid Records: 1 (red badge) → Row 60: Invalid Asset Type "Tablet"
   - Asset Manager reviews errors:
     - Row 45: Serial Number SN-12345 duplicate → fixes in Excel (updates to SN-12346)
     - Row 60: Asset Type "Tablet" invalid → changes to "Laptop"

4. **Import Phase 2 - Confirmation:**
   - Asset Manager re-uploads corrected Excel
   - System validates again → Valid Records: 80, Duplicates: 0, Invalid: 0
   - Asset Manager clicks "Confirm Import"
   - System processes import (importConfirmed=true):
     - Inserts 80 ITAsset records
     - Inserts 80 EmployeeAsset records (IsActive=true, AssignedOn=2024-05-01)
     - Inserts 80 ITAssetHistory records (Status=Allocated, Note="Imported from Excel")
   - Success message: "80 records imported, 0 records updated."
   - Asset list auto-refreshes → shows all new assets

5. **Verification:**
   - Asset Manager verifies allocation:
     - Searches for employee "john.doe@example.com"
     - Sees 4 assets allocated: Laptop, Monitor, Keyboard, Mouse
   - Asset Manager generates report → confirms all 20 employees have full setup

**Result:**
- 80 assets imported in one operation
- All assets automatically allocated to employees
- Complete audit trail created for each asset
- Significant time saved compared to manual entry (80 assets × 5 minutes = 400 minutes saved)

---

## Error Handling

### 1. File Upload Errors
**Scenarios:**
- **File Size Exceeded:** User uploads 10MB invoice file (max 5MB)
  - Error: "File size exceeds maximum allowed size of 5MB"
  - Status Code: 400
  - User Action: Compress file or use smaller version

- **Invalid File Extension:** User uploads .txt file instead of PDF
  - Error: "Invalid file extension. Allowed: .pdf, .doc, .docx, .jpeg, .jpg, .png"
  - Status Code: 400
  - User Action: Convert file to allowed format

- **Blob Storage Upload Failed:** Network error during file upload
  - Error: "Error uploading file to storage. Please try again."
  - Status Code: 500
  - System Action: Rollback asset creation, delete any uploaded files
  - User Action: Retry upload

- **File Deletion Failed (Rollback):** After asset creation fails, file deletion from blob also fails
  - Error: "Asset creation failed. Uploaded files may remain in storage."
  - Status Code: 500
  - System Action: Log error for manual cleanup
  - Admin Action: Manually delete orphaned files from blob storage

---

### 2. Validation Errors
**Scenarios:**
- **Serial Number Duplicate:** User creates asset with existing serial number
  - Error: "Asset with serial number SN12345678 already exists"
  - Status Code: 409
  - User Action: Verify serial number, update if incorrect

- **Warranty Date Before Purchase Date:** User enters Warranty Expires = 2023-01-01, Purchase Date = 2023-05-15
  - Error: "Warranty Expires Date cannot be before Purchase Date"
  - Status Code: 400
  - User Action: Correct warranty expiry date

- **Invalid Asset Type:** User sends invalid enum value (AssetType=99)
  - Error: "Invalid Asset Type value"
  - Status Code: 400
  - User Action: Select valid asset type from dropdown

- **Missing Required Fields:** User submits form without Device Name
  - Error: "Device Name is required"
  - Status Code: 400
  - User Action: Fill mandatory field

- **Retired Asset Allocation:** User tries to allocate asset with Status=Retired
  - Error: "Cannot allocate a retired asset"
  - Status Code: 400
  - User Action: Change status to "In Inventory" first, then allocate

- **Damaged Asset Allocation:** User tries to allocate asset with Condition=Damaged from inventory
  - Error: "Asset cannot be allocated because it is currently marked as damaged in inventory."
  - Status Code: 400
  - User Action: Repair asset, change condition to "Ok", then allocate

---

### 3. Allocation/Deallocation Errors
**Scenarios:**
- **Asset Already Allocated:** User tries to allocate asset that's already assigned to another employee
  - Error: "Asset is already allocated to another employee"
  - Status Code: 400
  - Repository: AllocateAssetAsync checks `SELECT COUNT(1) FROM EmployeeAsset WHERE AssetId=X AND IsActive=1`
  - User Action: Deallocate from current employee first, then allocate to new employee

- **Employee Not Found:** User selects employee that was deleted
  - Error: "Employee not found"
  - Status Code: 404
  - User Action: Select valid employee from autocomplete

- **Deallocation of Unallocated Asset:** User tries to deallocate asset that's not allocated
  - Error: "Asset is not currently allocated"
  - Status Code: 400
  - User Action: Verify asset status before deallocation

- **Transaction Rollback:** During allocation, EmployeeAsset INSERT succeeds but ITAsset UPDATE fails
  - Error: "An error occurred while allocating the asset: [SQL Error]"
  - Status Code: 500
  - System Action: Rollback transaction (EmployeeAsset INSERT reverted)
  - User Action: Retry allocation

---

### 4. Import Errors
**Scenarios:**
- **Invalid Excel Format:** User uploads .csv file instead of .xlsx
  - Error: "Invalid Excel file format"
  - Status Code: 400
  - User Action: Convert file to .xlsx format

- **Excel File Too Large:** User uploads 15MB file (max 10MB)
  - Error: "Excel file size exceeds maximum allowed size of 10MB"
  - Status Code: 400
  - User Action: Split file into multiple smaller files or remove unnecessary rows

- **Missing Required Headers:** Excel missing "Serial Number" column
  - Error: "Missing required column(s): Serial Number"
  - Status Code: 409
  - User Action: Add missing column to Excel, re-upload

- **Invalid Data in Row:** Row 25 has Asset Type "Tablet" (not in enum)
  - Validation Phase Response:
    ```json
    "invalidRecords": [{"row": 25, "reason": "Invalid Asset Type: Tablet"}]
    ```
  - User Action: Correct Asset Type to valid value (e.g., "Laptop"), re-upload

- **Duplicate Serial Numbers in Excel:** Serial Number SN-12345 appears in rows 10 and 50
  - Validation Phase Response:
    ```json
    "duplicateRecords": [{"row": 50, "serialNumber": "SN-12345", "deviceName": "Dell Laptop"}]
    ```
  - User Action: Update one of the duplicate serial numbers, re-upload

- **Assignment Date Before Purchase Date:** Row 30 has Assignment Date = 2023-01-01, Purchase Date = 2023-05-15
  - Validation Phase Response:
    ```json
    "invalidRecords": [{"row": 30, "reason": "Assignment Date (1/1/2023) cannot be earlier than Purchase Date (5/15/2023)"}]
    ```
  - User Action: Correct assignment date, re-upload

- **Employee Email Not Found:** Row 40 has User Name "nonexistent@example.com"
  - Validation Phase Response:
    ```json
    "invalidRecords": [{"row": 40, "reason": "Invalid User Name: nonexistent@example.com"}]
    ```
  - User Action: Verify employee email, update in Excel, re-upload

- **Partial Import Failure:** 50 assets importing, 5 fail due to database constraint errors
  - Error: "45 records imported, 5 records failed. Please review error logs."
  - Status Code: 200 (partial success)
  - System Action: Log failed records with reasons
  - Admin Action: Review error logs, manually fix failed records

---

### 5. Concurrency Errors
**Scenarios:**
- **Simultaneous Allocation:** Two users try to allocate same asset to different employees at same time
  - User A clicks Submit (Asset 101 → Employee A)
  - User B clicks Submit (Asset 101 → Employee B) 1 second later
  - System: Transaction 1 locks EmployeeAsset table, inserts record
  - System: Transaction 2 checks IsActive=1 → finds existing allocation → returns false
  - User B Error: "Asset is already allocated to another employee"
  - Status Code: 400
  - User B Action: Refresh page to see current allocation

- **Simultaneous Edit:** Two users editing same asset simultaneously
  - User A edits asset (updates Manufacturer to "HP")
  - User B edits asset (updates Comments to "Needs repair") 
  - System: User A's changes saved (ModifiedOn = T1)
  - System: User B's changes overwrite User A's changes (ModifiedOn = T2)
  - Result: "Needs repair" comment saved, but "HP" manufacturer overwritten if User B didn't see it
  - Mitigation: Implement optimistic concurrency with RowVersion/Timestamp column (not currently implemented)
  - User Action: Refresh page to see latest data before editing

---

### 6. Permission Errors
**Scenarios:**
- **Unauthorized Access:** User without "ReadAsset" permission tries to access IT Assets list
  - Error: "You do not have permission to view assets"
  - Status Code: 403
  - User Action: Contact admin to request permission

- **Unauthorized Edit:** User without "UpdateAsset" permission tries to edit asset
  - Frontend: Edit button hidden (not rendered)
  - If user bypasses frontend (direct API call):
    - Error: "You do not have permission to update assets"
    - Status Code: 403

- **Unauthorized Import:** User without "CreateAsset" permission tries to import Excel
  - Error: "You do not have permission to create assets"
  - Status Code: 403
  - User Action: Contact admin to request permission

---

**End of Part 2**  
**Continue to Part 3:** Integration Points, Testing Scenarios, Dependencies, Known Limitations, Summary
