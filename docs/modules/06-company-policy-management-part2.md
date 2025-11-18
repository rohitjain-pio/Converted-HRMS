# Module 06: Company Policy Management - Part 2

## API Endpoints Documentation

### 1. Create Company Policy

**Endpoint:** `POST /api/CompanyPolicy/CreateCompanyPolicy`

**Authentication:** Required (JWT token)

**Authorization:** Requires `CreateCompanyPolicy` permission

**Request Content-Type:** `multipart/form-data`

**Request Body:**
```
FormData:
- Name: string (required, max 250 chars)
- Description: string (required, max 500 chars)
- DocumentCategoryId: number (required)
- StatusId: number (required, 1-3)
- Accessibility: boolean (required)
- FileContent: File (required, max 5 MB, allowed types: pdf/doc/docx/jpeg/jpg/png)
- EmailRequest: boolean (required)
```

**Example Request:**
```typescript
const formData = new FormData();
formData.append('Name', 'Remote Work Policy 2024');
formData.append('Description', 'Guidelines for remote work arrangements...');
formData.append('DocumentCategoryId', '2');
formData.append('StatusId', '2');
formData.append('Accessibility', 'true');
formData.append('FileContent', policyFile);
formData.append('EmailRequest', 'true');

fetch('/api/CompanyPolicy/CreateCompanyPolicy', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer {token}' },
  body: formData
});
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Company policy saved successfully",
  "modelErrors": [],
  "result": null
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "statusCode": 400,
  "message": "Model state is invalid",
  "modelErrors": [
    "Name is required",
    "File type is not supported"
  ],
  "result": null
}
```

**400 Bad Request - File Size Error:**
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size of 5 MB",
  "modelErrors": [],
  "result": null
}
```

**400 Bad Request - File Type Error:**
```json
{
  "statusCode": 400,
  "message": "File type is not supported. Allowed types: pdf, doc, docx, jpeg, jpg, png",
  "modelErrors": [],
  "result": null
}
```

**Business Logic:**
1. Validates all form fields using FluentValidation
2. Checks file extension against allowed list
3. Checks file size against configured maximum
4. Generates unique filename: `{OriginalName}_{ddMMyyyyHHmmss}.{extension}`
5. Creates PolicyDirectoryLocation directory if not exists
6. Saves file to disk using async FileStream
7. Inserts CompanyPolicy record into database
8. Creates initial history entry (version 0) in CompanyPolicyHistory
9. If EmailRequest = true and StatusId = Active: Sends email notification to all employees
10. Returns success response

**Transaction Behavior:**
- Database operations are transactional
- If file save succeeds but database insert fails: File is deleted
- If database insert succeeds but email fails: Policy still saved (email failure logged)

---

### 2. Get Company Policy by ID

**Endpoint:** `GET /api/CompanyPolicy/{id}`

**Authentication:** Required (JWT token)

**Authorization:** Requires `ViewCompanyPolicy` permission

**Path Parameters:**
- `id` (long): Policy ID to retrieve

**Example Request:**
```
GET /api/CompanyPolicy/15
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": {
    "id": 15,
    "name": "Remote Work Policy 2024",
    "description": "Guidelines for remote work arrangements including eligibility, equipment provision, work hours, communication expectations, and security requirements.",
    "versionNo": 2,
    "documentCategory": "HR Policies",
    "documentCategoryId": "2",
    "statusId": "2",
    "status": "Active",
    "accessibility": true,
    "fileName": "RemoteWorkPolicy2024_31102024093015.pdf",
    "fileOriginalName": "Remote_Work_Policy_2024.pdf",
    "createdBy": "hr.admin@company.com",
    "createdOn": "2024-10-31T09:30:15Z",
    "modifiedBy": "hr.admin@company.com",
    "modifiedOn": "2024-10-31T14:20:30Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Policy not found or has been deleted",
  "modelErrors": [],
  "result": null
}
```

**Business Logic:**
1. Queries CompanyPolicy table by ID
2. Joins with CompanyPolicyDocCategory to get category name
3. Filters IsDeleted = 0 (excludes soft-deleted policies)
4. Returns complete policy details with metadata

---

### 3. Get Company Policy List

**Endpoint:** `POST /api/CompanyPolicy/GetCompanyPolicies`

**Authentication:** Required (JWT token)

**Authorization:** Requires `ReadCompanyPolicy` permission

**Request Body:**
```json
{
  "sortColumnName": "CreatedOn",
  "sortDirection": "DESC",
  "startIndex": 1,
  "pageSize": 10,
  "filters": {
    "name": "Work",
    "documentCategoryId": 2,
    "statusId": 2
  }
}
```

**Request Parameters:**
- `sortColumnName`: Column to sort by (Name, CreatedOn, ModifiedOn)
- `sortDirection`: ASC or DESC
- `startIndex`: Starting record number for pagination (1-based)
- `pageSize`: Number of records per page
- `filters.name`: Policy name partial match (optional)
- `filters.documentCategoryId`: Filter by category ID (optional, 0 = all)
- `filters.statusId`: Filter by status ID (optional, 0 = all)

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": {
    "companyPolicyList": [
      {
        "id": 15,
        "name": "Remote Work Policy 2024",
        "description": "Guidelines for remote work arrangements...",
        "versionNo": 2,
        "documentCategory": "HR Policies",
        "createdBy": "hr.admin@company.com",
        "createdOn": "2024-10-31T09:30:15Z",
        "modifiedBy": "hr.admin@company.com",
        "modifiedOn": "2024-10-31T14:20:30Z",
        "status": "Active"
      },
      {
        "id": 12,
        "name": "Work From Home Guidelines",
        "description": "Temporary WFH guidelines during pandemic...",
        "versionNo": 5,
        "documentCategory": "HR Policies",
        "createdBy": "hr@company.com",
        "createdOn": "2024-03-15T10:00:00Z",
        "modifiedBy": "hr.admin@company.com",
        "modifiedOn": "2024-09-20T11:30:00Z",
        "status": "Active"
      }
    ],
    "totalRecords": 25
  }
}
```

**Empty Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "No records found",
  "modelErrors": [],
  "result": null
}
```

**Business Logic:**
1. Builds dynamic SQL query based on provided filters
2. Applies name filter using LIKE '%{name}%' (case-insensitive)
3. Applies category and status filters if provided
4. Executes stored procedure GetCompanyPolicyDocuments with parameters
5. Joins CompanyPolicy with CompanyPolicyDocCategory for category names
6. Applies sorting based on sortColumnName and sortDirection
7. Implements pagination using OFFSET-FETCH (StartIndex, PageSize)
8. Returns paginated list with total record count

---

### 4. Update Company Policy

**Endpoint:** `PUT /api/CompanyPolicy/UpdateCompanyPolicy`

**Authentication:** Required (JWT token)

**Authorization:** Requires `EditCompanyPolicy` permission

**Request Content-Type:** `multipart/form-data`

**Request Body:**
```
FormData:
- Id: number (required)
- Name: string (required, max 250 chars)
- Description: string (required, max 500 chars)
- DocumentCategoryId: number (required)
- StatusId: number (required, 1-3)
- Accessibility: boolean (required)
- FileContent: File (optional, if provided: max 5 MB, allowed types)
- EmailRequest: boolean (required)
```

**Example Request:**
```typescript
const formData = new FormData();
formData.append('Id', '15');
formData.append('Name', 'Remote Work Policy 2024 - Updated');
formData.append('Description', 'Updated guidelines with new security requirements...');
formData.append('DocumentCategoryId', '2');
formData.append('StatusId', '2');
formData.append('Accessibility', 'true');
if (newFile) {
  formData.append('FileContent', newFile);
} else {
  formData.append('FileContent', '');
}
formData.append('EmailRequest', 'true');
```

**Success Response - Direct Update (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Company policy updated successfully",
  "modelErrors": [],
  "result": null
}
```

**Success Response - Version Update (200 OK):**
```json
{
  "statusCode": 200,
  "message": "New version created successfully",
  "modelErrors": [],
  "result": null
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Company policy does not exist",
  "modelErrors": [],
  "result": null
}
```

**Business Logic:**

**For Active Policies (StatusId = 2 with EffectiveDate):**
1. Loads existing policy from database
2. Detects Active status and triggers versioning logic
3. If new file provided: Saves new file, deletes old file
4. If no file: Retrieves existing FileName and FileOriginalName
5. Increments VersionNo by 1
6. Sets EffectiveDate to current UTC time
7. Inserts new entry into CompanyPolicyHistory table (complete snapshot)
8. Updates CompanyPolicy record with new version number and effective date
9. Both operations wrapped in database transaction
10. If EmailRequest = true: Sends version update email to all employees
11. Returns "New version created successfully" message

**For Draft/Inactive Policies:**
1. Loads existing policy
2. Direct update mode (no versioning)
3. If new file provided: Replaces file on disk
4. Updates CompanyPolicy record fields
5. EffectiveDate set to UTC now only if status changed to Active
6. If EmailRequest = true: Sends policy update email
7. Returns "Company policy updated successfully" message

**File Replacement:**
- Old file deleted from PolicyDirectoryLocation
- New file saved with new timestamp-based filename
- Path traversal validation on both old and new file paths

---

### 5. Delete Company Policy

**Endpoint:** `DELETE /api/CompanyPolicy/{id}`

**Authentication:** Required (JWT token)

**Authorization:** Requires `DeleteCompanyPolicy` permission

**Path Parameters:**
- `id` (long): Policy ID to delete

**Example Request:**
```
DELETE /api/CompanyPolicy/15
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": null
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Policy not found",
  "modelErrors": [],
  "result": null
}
```

**Business Logic:**
1. Retrieves policy by ID to verify existence
2. Performs soft delete: Sets IsDeleted = 1, ModifiedBy = current user, ModifiedOn = UTC now
3. Policy record retained in database but excluded from queries
4. Policy file NOT deleted from disk (retained for audit/recovery)
5. Version history entries remain intact
6. Policy no longer appears in policy list or searches
7. Can be recovered by setting IsDeleted = 0 (requires database access)

---

### 6. Get Policy Status List

**Endpoint:** `GET /api/CompanyPolicy/GetPolicyStatusList`

**Authentication:** Required (JWT token)

**Authorization:** Requires `ReadCompanyPolicy` permission

**Example Request:**
```
GET /api/CompanyPolicy/GetPolicyStatusList
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": [
    {
      "id": 1,
      "statusValue": "Draft"
    },
    {
      "id": 2,
      "statusValue": "Active"
    },
    {
      "id": 3,
      "statusValue": "Inactive"
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "No status records found",
  "modelErrors": [],
  "result": null
}
```

**Business Logic:**
1. Queries PolicyStatus table
2. Filters IsDeleted = 0
3. Returns all active status records
4. Used to populate status dropdown in create/edit forms and search filters

---

### 7. Get Document Category List

**Endpoint:** `GET /api/CompanyPolicy/GetDocumentCategoryList`

**Authentication:** Required (JWT token)

**Authorization:** Requires `ReadCompanyPolicy` permission

**Example Request:**
```
GET /api/CompanyPolicy/GetDocumentCategoryList
Authorization: Bearer {token}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": [
    {
      "id": 1,
      "categoryName": "Code of Conduct"
    },
    {
      "id": 2,
      "categoryName": "HR Policies"
    },
    {
      "id": 3,
      "categoryName": "IT Security"
    },
    {
      "id": 4,
      "categoryName": "Leave & Attendance"
    },
    {
      "id": 5,
      "categoryName": "Health & Safety"
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "No category records found",
  "modelErrors": [],
  "result": null
}
```

**Business Logic:**
1. Queries CompanyPolicyDocCategory table
2. Filters IsDeleted = 0
3. Orders by CategoryName ASC (alphabetical)
4. Returns all active categories
5. Used to populate category dropdown in create/edit forms and search filters

---

### 8. Get Policy History List

**Endpoint:** `POST /api/CompanyPolicy/GetCompanyPolicyHistoryList`

**Authentication:** Required (JWT token)

**Authorization:** Requires `ViewCompanyPolicy` permission

**Request Body:**
```json
{
  "startIndex": 1,
  "pageSize": 10,
  "sortColumnName": "VersionNo",
  "sortDirection": "DESC",
  "filters": {
    "policyId": 15
  }
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": {
    "companyPolicyHistoryResponseDto": [
      {
        "id": 52,
        "policyId": 15,
        "name": "Remote Work Policy 2024",
        "description": "Updated with security requirements",
        "versionNo": 2,
        "documentCategory": "HR Policies",
        "fileName": "RemoteWorkPolicy2024_31102024142030.pdf",
        "fileOriginalName": "Remote_Work_Policy_2024_v2.pdf",
        "createdBy": "hr.admin@company.com",
        "createdOn": "2024-10-31T09:30:15Z",
        "modifiedBy": "hr.admin@company.com",
        "modifiedOn": "2024-10-31T14:20:30Z"
      },
      {
        "id": 45,
        "policyId": 15,
        "name": "Remote Work Policy 2024",
        "description": "Initial version",
        "versionNo": 1,
        "documentCategory": "HR Policies",
        "fileName": "RemoteWorkPolicy2024_31102024093015.pdf",
        "fileOriginalName": "Remote_Work_Policy_2024.pdf",
        "createdBy": "hr.admin@company.com",
        "createdOn": "2024-10-31T09:30:15Z",
        "modifiedBy": null,
        "modifiedOn": null
      }
    ],
    "totalRecords": 2
  }
}
```

**Empty Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "No records found",
  "modelErrors": [],
  "result": null
}
```

**Business Logic:**
1. Queries CompanyPolicyHistory table filtered by PolicyId
2. Joins with CompanyPolicyDocCategory for category names
3. Filters IsDeleted = 0
4. Applies sorting and pagination
5. Executes GetHistoryListByPolicyId stored procedure
6. Returns chronological list of all policy versions

---

### 9. Download Policy Document

**Endpoint:** `POST /api/CompanyPolicy/DownloadPolicyDocument`

**Authentication:** Required (JWT token)

**Authorization:** Requires `ViewCompanyPolicy` permission

**Request Body:**
```json
{
  "companyPolicyId": 15,
  "employeeId": 234,
  "fileName": "RemoteWorkPolicy2024_31102024093015.pdf"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": {
    "fileContent": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL... [base64 encoded file content]"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "File not found or access denied",
  "modelErrors": [],
  "result": {
    "fileContent": null
  }
}
```

**Business Logic:**
1. Constructs file path: WebRootPath + PolicyDirectoryLocation + fileName
2. Validates path security (prevents path traversal)
3. Reads file from disk as byte array using Helper.FileToByteArray
4. Checks if tracking record exists: SELECT Id FROM UserCompanyPolicyTrack WHERE CompanyPolicyId = @id AND EmployeeId = @empId
5. If tracking record exists (Id > 0): Updates ModifiedOn = UTC now
6. If no tracking record: Inserts new record with ViewedOn = UTC now
7. Returns file content as base64 string
8. Frontend decodes base64 and triggers browser download

**Tracking Table Updates:**
- **First Download:** INSERT INTO UserCompanyPolicyTrack (EmployeeId, CompanyPolicyId, ViewedOn) VALUES (@empId, @policyId, GETUTCDATE())
- **Subsequent Downloads:** UPDATE UserCompanyPolicyTrack SET ModifiedOn = GETUTCDATE() WHERE CompanyPolicyId = @policyId

**Security:**
- Path traversal prevention via GetFullPath and StartsWith validation
- File must exist within PolicyDirectoryLocation
- User must have ViewCompanyPolicy permission
- EmployeeId validated against logged-in user context

---

### 10. Get User Policy Track List

**Endpoint:** `POST /api/CompanyPolicy/GetUserCompanyPoliciesTrack`

**Authentication:** Required (JWT token)

**Authorization:** Requires `ViewCompanyPolicy` permission

**Request Body:**
```json
{
  "startIndex": 1,
  "pageSize": 10,
  "sortColumnName": "ViewedOn",
  "sortDirection": "DESC",
  "filters": {
    "companyPolicyId": 15,
    "employeeName": "Smith"
  }
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": {
    "companyPolicyTrackList": [
      {
        "id": 450,
        "employeeId": 234,
        "employeeName": "John Smith",
        "employeeCode": "EMP234",
        "companyPolicyId": 15,
        "policyName": "Remote Work Policy 2024",
        "viewedOn": "2024-10-31T10:15:00Z",
        "modifiedOn": "2024-10-31T14:30:00Z"
      },
      {
        "id": 448,
        "employeeId": 189,
        "employeeName": "Jane Smith",
        "employeeCode": "EMP189",
        "companyPolicyId": 15,
        "policyName": "Remote Work Policy 2024",
        "viewedOn": "2024-10-31T09:45:00Z",
        "modifiedOn": null
      }
    ],
    "totalRecords": 87
  }
}
```

**Business Logic:**
1. Queries UserCompanyPolicyTrack table
2. Joins with EmployeeData to get employee details
3. Filters by CompanyPolicyId if provided
4. Filters by employee name (partial match on FirstName, MiddleName, or LastName) if provided
5. Applies sorting and pagination
6. Executes GetUserCompanyPolicyTrackList stored procedure
7. Returns list of employees who viewed the policy with timestamps

**Use Cases:**
- HR reporting: Who has viewed a specific policy
- Compliance tracking: Ensure mandatory policies viewed by all employees
- Audit reports: Policy engagement metrics
- Follow-up: Identify employees who haven't viewed new/updated policies

---

## UI Components

### 1. Company Policy List Page (`/company-policy`)

**Component:** `CompanyPolicyPage (index.tsx)`

**Purpose:** Main landing page displaying all company policies with search, filter, sort, and pagination capabilities.

**Features:**
- Page header with "Company Policy" title and breadcrumb navigation
- Add button in header (permission-gated: CreateCompanyPolicy)
- Filter form component with:
  - Name input field (text search)
  - Category dropdown (populated from GetDocumentCategoryList API)
  - Status dropdown (populated from GetPolicyStatusList API, default: Active)
  - Reset button to clear filters
- Data table with columns:
  - S.No (calculated: (startIndex - 1) * pageSize + index + 1)
  - Document Name (clickable link to detail page, truncated with tooltip)
  - Version (version number)
  - Category (category name)
  - Created By (creator email)
  - Created On (formatted date)
  - Updated By (modifier email or "N/A")
  - Updated On (formatted date or "N/A")
  - Status (Draft/Active/Inactive)
  - Actions (View and Edit icon buttons, permission-gated)
- Pagination controls (page size selector, page navigation)
- Sorting on Name, CreatedOn, ModifiedOn columns

**State Management:**
- data: Array of policy records
- sortColumnName: Current sort column
- sortDirection: ASC or DESC
- startIndex: Current page start (1-based)
- pageSize: Records per page (default 10)
- totalRecords: Total filtered record count
- name: Filter value for name search
- documentCategoryId: Filter value for category (default 0)
- statusId: Filter value for status (default 2 = Active)

**Permissions:**
- READ: View policy list
- VIEW: View policy details (enables document name link and View button)
- EDIT: Edit policy (enables Edit button)
- CREATE: Create new policy (enables Add button)

**Initial Load:**
1. Sets default statusId filter to Active (2)
2. Fetches company policy list via getCompanyPolicyList API
3. Displays policies in data table
4. Shows total record count

**User Interactions:**
- Change filter values → triggers API call with new filters
- Click column header → toggles sort direction, triggers API call
- Click page navigation → changes startIndex, triggers API call
- Change page size → resets to page 1, triggers API call
- Click document name → navigates to `/company-policy/view/{id}`
- Click View icon → navigates to `/company-policy/view/{id}`
- Click Edit icon → navigates to `/company-policy/edit/{id}`
- Click Add button → navigates to `/company-policy/add`

**Error Handling:**
- API errors displayed via toast notification (methods.throwApiError)
- Loading state shows spinner during API calls
- Empty state message if no policies found

---

### 2. Policy Detail Page (`/company-policy/view/{id}`)

**Component:** `CompanyPolicyDetailPage (Detail/index.tsx)`

**Purpose:** Display comprehensive policy information including metadata, document details, and version history.

**Features:**
- Page header with "Policy Details" title and breadcrumb navigation
- DocumentDetails card showing:
  - Policy name (heading)
  - Description (multi-line text)
  - Category badge
  - Status badge (color-coded: Draft=gray, Active=green, Inactive=red)
  - Version number
  - Accessibility indicator
  - Created by and Created on
  - Updated by and Updated on (or "N/A")
  - Original filename
  - Action buttons:
    - Download Document (tracks view)
    - Edit Policy (if EditCompanyPolicy permission)
- DocumentHistory card (visible only to non-Employee roles):
  - Version history table
  - Paginated list of all versions
  - Columns: Version, Modified On, Modified By, Description, File Name
  - Sorted by version descending

**Data Loading:**
1. Extracts policy ID from URL params
2. Calls getCompanyPolicy API on component mount
3. Displays policy details in DocumentDetails component
4. Loads version history in DocumentHistory component (if not Employee role)

**Permissions:**
- Requires ViewCompanyPolicy permission
- Edit button requires EditCompanyPolicy permission
- Version history tab hidden for Employee role

**Download Flow:**
1. User clicks "Download Document" button
2. Calls downloadPolicyDocument API with companyPolicyId, employeeId, fileName
3. Receives base64 encoded file content
4. Decodes base64 to binary
5. Creates blob with appropriate MIME type
6. Triggers browser download using anchor tag with download attribute
7. System records view in UserCompanyPolicyTrack table

**Error Handling:**
- Policy not found: Shows NotFoundPage component
- No permission: Shows NotFoundPage component
- API errors: Toast notification
- Loading state: Shows Loader component

---

### 3. Policy Create/Edit Form (`/company-policy/add`, `/company-policy/edit/{id}`)

**Component:** `EditCompanyPolicy (Edit/EditCompanyPolicy/EditCompanyPolicy.tsx)`

**Purpose:** Form for creating new policies or editing existing policies with comprehensive validation.

**Features:**

**Form Fields:**
1. Policy Name (text input, required, max 250 chars)
2. Description (textarea, required, max 500 chars, character counter)
3. Document Category (dropdown, required, populated from API)
4. Status (dropdown, required, options: Draft/Active/Inactive)
5. Accessibility (checkbox, "Make accessible to all employees")
6. File Upload (file input, required for create, optional for edit)
7. Send Email Notification (checkbox, conditionally enabled)

**Form Behavior:**

**Create Mode (no ID in URL):**
- All fields empty/default
- File upload required
- Submit button: "Create Policy"
- Calls createCompanyPolicy API

**Edit Mode (ID in URL):**
- Form pre-populated with existing policy data via getCompanyPolicyById API
- File upload optional (shows current filename)
- Submit button: "Update Policy"
- Calls updateCompanyPolicy API
- Reset button resets to loaded values

**Email Notification Checkbox:**
- Disabled conditions:
  - Status is not Active (statusId !== 2)
  - Form is pristine (no changes made) in edit mode
- If enabled and checked:
  - Shows confirmation dialog before submission
  - Dialog message: "You are about to send email notification to all employees about this policy. Do you want to continue?"
  - Confirm: Proceeds with submission
  - Cancel: Returns to form without submitting

**Validation:**
- Real-time field validation using React Hook Form + Yup
- Error messages displayed below fields
- Submit button disabled if form invalid or API call in progress
- File type validation: .pdf, .doc, .docx, .jpeg, .jpg, .png
- File size validation: Max 5 MB

**Submit Flow:**
1. User fills/edits form fields
2. User clicks Submit button
3. Form validation runs
4. If emailRequest enabled: Shows confirmation dialog
5. On confirm or if no email: Converts form data to FormData object
6. Calls API (create or update based on mode)
7. On success:
   - Shows success toast
   - Navigates to `/company-policy` list page
8. On error:
   - Shows error toast with modelErrors
   - User remains on form to correct issues

**State Management:**
- companyPolicyData: Loaded policy data (edit mode)
- isEditForm: Boolean flag (true if ID present)
- openConfirmEmailDialog: Boolean for email confirmation dialog
- Form state managed by React Hook Form (values, errors, isDirty, isValid)
- Loading states: isLoading, isSaving, isUpdating

**Action Buttons:**
- Submit: Creates or updates policy
- Reset: Resets form to default/loaded values
- Cancel: Navigates back to policy list without saving

---

### 4. Filter Form Component

**Component:** `FilterForm (CompanyPolicy/components/FilterForm.tsx)`

**Purpose:** Reusable filter component for policy list page with name, category, and status filters.

**Features:**
- Name input field:
  - Label: "Search by Policy Name"
  - Placeholder: "Enter policy name"
  - onChange triggers parent callback
  - Debounced input (300ms delay) to reduce API calls
- Category dropdown:
  - Label: "Category"
  - Options loaded from GetDocumentCategoryList API
  - Default option: "All Categories" (value = 0)
  - onChange triggers parent callback
- Status dropdown:
  - Label: "Status"
  - Options loaded from GetPolicyStatusList API
  - Default option: "All Statuses" (value = 0)
  - Initial value: Active (2)
  - onChange triggers parent callback
- Reset button:
  - Clears all filter fields
  - Resets to default values (statusId = 2)
  - Triggers parent callback to reload data

**Props Interface:**
```typescript
{
  name: string | undefined;
  documentCategoryId: number | string | undefined;
  statusId: number | string | undefined;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: number | string) => void;
  onStatusChange: (value: number | string) => void;
  onReset: () => void;
}
```

**Usage:**
- Embedded in CompanyPolicyPage
- Filter changes immediately trigger parent component to fetch filtered data
- Reset action reloads with default filters

---

### 5. Document Details Component

**Component:** `DocumentDetails (CompanyPolicy/components/DocumentDetails.tsx)`

**Purpose:** Display detailed policy information in policy detail page.

**Features:**
- Policy name as heading (Typography variant h4)
- Description paragraph (multi-line, full text)
- Metadata grid with labels and values:
  - Category: Badge component with category name
  - Status: Badge component with status (color-coded)
  - Version: Badge with version number
  - Accessibility: Icon or text indicator
  - Created By: Email address
  - Created On: Formatted date (DD/MM/YYYY HH:mm)
  - Updated By: Email or "N/A"
  - Updated On: Formatted date or "N/A"
  - File Name: Original filename
- Action buttons section:
  - Download Document button (primary color, download icon)
  - Edit Policy button (if EditCompanyPolicy permission, edit icon)

**Props Interface:**
```typescript
{
  data: CompanyPolicyType;
}
```

**Styling:**
- Material-UI Paper component with elevation
- Organized grid layout with consistent spacing
- Labels in bold, values in regular font
- Color-coded status badges
- Responsive design for mobile/tablet

---

### 6. Document History Component

**Component:** `DocumentHistory (CompanyPolicy/components/DocumentHistory.tsx)`

**Purpose:** Display version history table in policy detail page for non-Employee roles.

**Features:**
- History table with columns:
  - S.No (sequential number)
  - Version (version number)
  - Modified On (formatted date)
  - Modified By (email)
  - Description (policy description at that version)
  - File Name (original filename)
- Pagination controls (page size, page navigation)
- Sorting by version or modified date
- Loading spinner during API call
- Empty state: "No version history available"

**Data Loading:**
1. Extracts policy ID from URL or props
2. Calls getCompanyPolicyHistory API
3. Displays history entries in table
4. Supports pagination for policies with many versions

**Conditional Rendering:**
- Only rendered if user role is not Employee
- Uses useUserStore to check userData.roleName
- Hidden for role.EMPLOYEE constant

---

### 7. File Preview Component

**Component:** `FilePreview (CompanyPolicy/components/FilePreview.tsx)`

**Purpose:** Display policy document in modal/dialog for quick viewing without download.

**Features:**
- Modal dialog component
- PDF viewer for .pdf files
- Document viewer for .doc/.docx files (if browser supports)
- Image viewer for .jpeg/.jpg/.png files
- Close button to dismiss modal
- Fullscreen option for better viewing
- Download button within modal

**Usage:**
- Can be integrated into DocumentDetails component
- Opens when user clicks "Preview" button
- Renders appropriate viewer based on file type

---

## Workflows

### Workflow 1: Create and Publish New Policy

**Actors:** HR Administrator, Employees

**Preconditions:**
- HR Admin has CreateCompanyPolicy permission
- Policy document prepared in approved format (PDF/DOC/DOCX)
- Policy content reviewed and approved by management

**Steps:**

1. **Navigate to Policy Creation** (HR Admin)
   - Login to HRMS application
   - Navigate to "Company Policy" section from main menu
   - Click "Add" button in page header
   - System navigates to `/company-policy/add`

2. **Fill Policy Details** (HR Admin)
   - Enter Policy Name (e.g., "Remote Work Policy 2024")
   - Enter Description (summary of policy content, max 500 chars)
   - Select Document Category from dropdown (e.g., "HR Policies")
   - Select Status: "Active" (to publish immediately) or "Draft" (to save without publishing)
   - Check "Make accessible to all employees" if policy applies to everyone
   - Click "Choose File" and select policy document from computer
   - Validate file meets requirements (size < 5 MB, allowed type)
   - Duration: 3-5 minutes

3. **Optional Email Notification** (HR Admin)
   - If Status = Active: "Send Email Notification" checkbox becomes enabled
   - Check checkbox if HR wants to notify all employees about new policy
   - Duration: 10 seconds

4. **Submit Policy** (HR Admin)
   - Review all entered information
   - Click "Create Policy" button
   - If email checkbox selected: Confirmation dialog appears
   - Confirm email notification: Click "Confirm"
   - System validates form fields (client-side + server-side)
   - Duration: 30 seconds

5. **System Processing** (System)
   - Validates all form data using FluentValidation
   - Checks file extension against allowed list
   - Checks file size against configured maximum (5 MB)
   - Generates unique filename with timestamp
   - Creates PolicyDocuments directory if not exists
   - Saves file to WebRootPath/PolicyDocuments/
   - Inserts record into CompanyPolicy table with StatusId, VersionNo=1, EffectiveDate
   - Generates Policy ID from database (SCOPE_IDENTITY)
   - Inserts initial history entry (version 0) into CompanyPolicyHistory
   - If email notification requested: Queues email to all active employees
   - Duration: 2-3 seconds

6. **Email Notification** (System, if enabled)
   - EmailNotificationService.UpdatedPolicy called with policyName, isVersionUpdate=false
   - Retrieves list of all active employees from EmployeeData table
   - Generates personalized email for each employee using notification template
   - Email content: "New policy '{PolicyName}' has been published. Please review."
   - Emails queued via background job queue (fire-and-forget)
   - Employees receive email within 1-2 minutes
   - Duration: 1-5 minutes (background process)

7. **Confirmation and Redirect** (System)
   - Success toast notification: "Company policy saved successfully"
   - Browser redirects to `/company-policy` list page
   - New policy appears in list (if status Active, visible immediately)
   - Duration: 1 second

8. **Employee Views Policy** (Employees)
   - Employee logs into HRMS
   - Receives email notification (if enabled)
   - Navigates to Company Policy section
   - Sees new policy in list (if Active and accessible)
   - Clicks policy name to view details
   - Views policy information on detail page
   - Clicks "Download Document" button
   - System tracks view in UserCompanyPolicyTrack table (inserts ViewedOn timestamp)
   - Browser downloads PDF/document file
   - Employee reviews policy content
   - Duration: 5-10 minutes per employee

**Postconditions:**
- New policy record created in CompanyPolicy table
- Policy document stored in file system
- Initial history entry created in CompanyPolicyHistory
- If Active: Policy visible to target employees
- If email sent: All employees notified and tracking records created upon downloads
- HR can view policy list with new entry
- HR can track employee engagement via policy track report

**Alternative Flows:**

**A1: Save as Draft Instead of Publishing**
- At step 2, HR selects Status = "Draft"
- EffectiveDate remains null
- Policy not visible to employees
- No email notification option
- Can edit later and publish by changing status to Active

**A2: File Validation Failure**
- At step 4, system detects invalid file type or size exceeded
- Error toast shown: "File type not supported" or "File size exceeds 5 MB"
- User returns to step 2 to upload valid file

**A3: Form Validation Errors**
- At step 4, required fields missing or invalid
- Error messages displayed below each invalid field
- Submit button remains disabled
- User corrects errors and resubmits

**A4: Database Error During Save**
- At step 5, database insert fails
- Uploaded file automatically deleted from disk
- Error toast shown: "Error saving policy. Please try again."
- User returns to form with data preserved
- Can retry submission

**Total Duration:** 10-15 minutes (HR), ongoing (employees viewing)

---

### Workflow 2: Update Active Policy (Versioning)

**Actors:** HR Administrator, Employees

**Preconditions:**
- Policy exists in Active status (StatusId = 2)
- Policy has EffectiveDate set (not null)
- HR Admin has EditCompanyPolicy permission
- Updated policy document prepared (if replacing file)

**Steps:**

1. **Navigate to Policy Edit** (HR Admin)
   - Login to HRMS application
   - Navigate to Company Policy list
   - Find policy to update using search/filters
   - Click "Edit" icon button or "Edit Policy" button in detail page
   - System navigates to `/company-policy/edit/{id}`
   - Duration: 1-2 minutes

2. **Load Existing Policy** (System)
   - Calls getCompanyPolicyById API with policy ID
   - Retrieves current policy data from CompanyPolicy table
   - Pre-populates form with existing values:
     - Name, Description, DocumentCategoryId, StatusId, Accessibility
   - Displays current filename (not editable, can replace)
   - Duration: 1 second

3. **Modify Policy Details** (HR Admin)
   - Updates Name, Description, or Category as needed
   - Keeps Status = "Active" (versioning only triggers for Active policies)
   - Optionally uploads new policy document file (replaces existing)
   - Checks "Send Email Notification" if employees should be notified of update
   - Duration: 5-10 minutes

4. **Submit Update** (HR Admin)
   - Reviews changes (form shows isDirty=true)
   - Clicks "Update Policy" button
   - If email checkbox selected: Confirmation dialog appears
   - Confirms email notification
   - Duration: 30 seconds

5. **System Detects Active Policy and Triggers Versioning** (System)
   - Loads existing policy from database
   - Checks StatusId = 2 (Active) AND EffectiveDate is not null
   - Sets versioning flag: isUpdatedCompanyPolicy = false
   - Duration: <1 second

6. **File Replacement (if new file uploaded)** (System)
   - Validates new file (type, size)
   - Generates new filename with current timestamp
   - Saves new file to PolicyDocuments directory
   - Deletes old file from disk (path validation first)
   - Updates FileName and FileOriginalName in memory
   - Duration: 1-2 seconds

7. **Create New Version in History** (System)
   - Increments VersionNo: currentVersion + 1
   - Sets EffectiveDate to current UTC timestamp
   - Creates CompanyPolicy object with all updated fields
   - Begins database transaction
   - Inserts new entry into CompanyPolicyHistory table:
     - PolicyId = original policy ID
     - All current field values (Name, Description, etc.)
     - VersionNo = incremented version
     - EffectiveDate = UTC now
     - ModifiedBy = current user email
     - ModifiedOn = UTC now
   - Duration: <1 second

8. **Update Main Policy Record** (System)
   - Updates CompanyPolicy table:
     - VersionNo = new version number
     - EffectiveDate = UTC now
     - ModifiedBy = current user email
     - ModifiedOn = UTC now
     - All other updated fields (Name, Description, etc.)
   - Commits database transaction
   - Both history insert and policy update succeed or rollback together
   - Duration: <1 second

9. **Email Notification (if enabled)** (System)
   - If EmailRequest = true: Calls EmailNotificationService.UpdatedPolicy with isVersionUpdate=true
   - Retrieves all employees who previously viewed this policy from UserCompanyPolicyTrack
   - Generates email for each employee
   - Email content: "Policy '{PolicyName}' has been updated to version {VersionNo}. Please review changes."
   - Emails queued via background job
   - Duration: 1-5 minutes (background)

10. **Confirmation and Redirect** (System)
    - Success toast: "New version created successfully"
    - Browser redirects to policy list page
    - Updated policy shows new version number in list
    - Duration: 1 second

11. **Employees Notified and Review Updated Policy** (Employees)
    - Employees receive email notification (if enabled)
    - Navigate to policy detail page
    - See new version number displayed
    - Download updated document
    - System updates UserCompanyPolicyTrack.ModifiedOn timestamp (subsequent view)
    - View version history tab (if non-Employee role) to see all changes
    - Duration: 5-10 minutes per employee

**Postconditions:**
- CompanyPolicy record updated with new version number and effective date
- New entry created in CompanyPolicyHistory preserving complete previous state
- Old policy document retained in history (new file saved if uploaded)
- Version history shows all policy versions chronologically
- If email sent: Employees notified of policy update
- Download tracking continues on updated policy

**Alternative Flows:**

**A1: Update Draft or Inactive Policy (No Versioning)**
- At step 5, system detects StatusId ≠ 2 or EffectiveDate is null
- Sets isUpdatedCompanyPolicy = true (direct update mode)
- No history entry created
- Directly updates CompanyPolicy record
- EffectiveDate only updated if status changes to Active
- Success message: "Company policy updated successfully" (not "version created")

**A2: Update Without File Replacement**
- At step 3, HR does not upload new file
- At step 6, system retrieves existing FileName and FileOriginalName from database
- Uses existing file references in history entry
- No file deletion or upload occurs
- Version history shows same filename

**A3: Transaction Failure During Versioning**
- At step 8, database transaction fails (history insert or policy update)
- Transaction automatically rolled back
- No changes persisted to database
- If new file was uploaded: File remains on disk (orphaned)
- Error toast: "Error updating policy. Please try again."
- User can retry submission

**A4: No Changes Made (Form Pristine)**
- At step 3, HR opens form but makes no changes
- Form state isDirty = false
- "Send Email Notification" checkbox remains disabled
- Submit button may be disabled or shows warning
- If submitted: No-op or error message

**Total Duration:** 15-20 minutes (HR), ongoing (employees reviewing)

---

### Workflow 3: Track Policy Acknowledgment and Compliance

**Actors:** HR Administrator, Employees, System

**Preconditions:**
- One or more Active policies published in system
- Employees have ViewCompanyPolicy permission
- UserCompanyPolicyTrack table configured

**Steps:**

1. **HR Identifies Compliance Requirement** (HR Admin)
   - Determines which policies require employee acknowledgment
   - Examples: Code of Conduct, IT Security Policy, Confidentiality Agreement
   - Sets target compliance date (e.g., all employees must review within 30 days)
   - Duration: 15-30 minutes (planning)

2. **HR Publishes Policy with Email Notification** (HR Admin)
   - Creates or updates policy with Status = Active
   - Checks "Send Email Notification" checkbox
   - Submits policy
   - System sends email to all employees
   - Email contains policy name and link to policy page
   - Duration: 5 minutes + email delivery time

3. **Employees Receive Notification** (Employees)
   - Receive email in inbox
   - Subject: "New Policy Published: {PolicyName}" or "Policy Updated: {PolicyName}"
   - Email body includes:
     - Policy name and description
     - Link to policy detail page in HRMS
     - Request to review and acknowledge
   - Duration: Immediate (email delivery)

4. **Employees Access and Download Policy** (Employees)
   - Click link in email or navigate to Company Policy section
   - Find policy in list (filter by Active status)
   - Click policy name to open detail page
   - Review policy information
   - Click "Download Document" button
   - Duration: 3-5 minutes per employee

5. **System Tracks Policy Download** (System)
   - Receives downloadPolicyDocument API request with companyPolicyId and employeeId
   - Queries UserCompanyPolicyTrack table:
     ```sql
     SELECT Id FROM UserCompanyPolicyTrack 
     WHERE CompanyPolicyId = @policyId AND EmployeeId = @empId
     ORDER BY Id DESC
     ```
   - If no record exists (Id = 0 or NULL):
     - Inserts new tracking record:
       ```sql
       INSERT INTO UserCompanyPolicyTrack (EmployeeId, CompanyPolicyId, ViewedOn)
       VALUES (@empId, @policyId, GETUTCDATE())
       ```
     - ViewedOn timestamp marks first download
   - If record exists (Id > 0):
     - Updates existing record:
       ```sql
       UPDATE UserCompanyPolicyTrack 
       SET ModifiedOn = GETUTCDATE()
       WHERE CompanyPolicyId = @policyId
       ```
     - ModifiedOn timestamp marks subsequent downloads
   - Returns file content to employee
   - Duration: <1 second per download

6. **HR Monitors Compliance Progress** (HR Admin)
   - Navigates to policy detail page
   - Views "Policy Track" tab or report
   - Calls GetUserCompanyPoliciesTrack API with companyPolicyId filter
   - System returns list of employees who viewed policy with timestamps
   - Duration: 2-3 minutes

7. **Generate Compliance Report** (HR Admin)
   - Views policy track list showing:
     - Employee Name and Code
     - Viewed On date (first view)
     - Modified On date (last view, if multiple views)
   - Filters by employee name to search specific employees
   - Sorts by ViewedOn to see chronological order
   - Pagination for policies with many views
   - Duration: 5-10 minutes

8. **Identify Non-Compliant Employees** (HR Admin)
   - Compares policy track list against total employee list
   - Identifies employees NOT in track list (haven't viewed policy)
   - Query logic:
     ```sql
     SELECT e.Id, e.FirstName, e.LastName, e.Email
     FROM EmployeeData e
     WHERE e.EmployeeStatus = 'Active' AND e.IsDeleted = 0
     AND NOT EXISTS (
       SELECT 1 FROM UserCompanyPolicyTrack uct
       WHERE uct.CompanyPolicyId = @policyId AND uct.EmployeeId = e.Id
     )
     ```
   - Creates list of non-compliant employees
   - Duration: 5 minutes

9. **HR Sends Reminder to Non-Compliant Employees** (HR Admin)
   - Manually or via automated reminder job
   - Sends follow-up email to employees who haven't viewed policy
   - Email content: "Reminder: Please review {PolicyName} policy. Acknowledgment required by {DueDate}."
   - Includes direct link to policy detail page
   - Duration: 2-3 minutes (manual), automatic (if job configured)

10. **Employees Complete Compliance** (Employees)
    - Receive reminder email
    - Access and download policy (triggers step 5 again)
    - Tracking record created/updated
    - Employee now appears in compliance report
    - Duration: 3-5 minutes per employee

11. **HR Verifies 100% Compliance** (HR Admin)
    - Re-runs compliance report after due date
    - Confirms all active employees have viewed policy
    - ViewedOn timestamps all before or on due date
    - Exports report for audit records
    - Duration: 5 minutes

12. **Ongoing Monitoring** (HR Admin, System)
    - HR periodically reviews policy engagement metrics
    - Tracks how many times each employee re-downloads policy
    - Identifies policies with low engagement (may need revision)
    - System maintains historical tracking data indefinitely
    - Duration: Ongoing

**Postconditions:**
- UserCompanyPolicyTrack table contains complete record of policy views
- HR has visibility into policy compliance status
- Non-compliant employees identified and reminded
- Audit trail available for compliance reporting
- Tracking data used for policy effectiveness analysis

**Alternative Flows:**

**A1: Employee Views Policy Multiple Times**
- At step 5, employee downloads policy again
- System finds existing tracking record
- Updates ModifiedOn timestamp (does not create new record)
- ViewedOn timestamp preserved (first view)
- HR can see both first view and last view dates

**A2: Policy Updated After Initial Tracking**
- After step 5, policy is updated to new version (Workflow 2)
- Existing UserCompanyPolicyTrack records remain unchanged
- Employee re-downloads updated policy
- ModifiedOn updated to reflect review of new version
- HR can track re-compliance after policy changes

**A3: Automated Compliance Reminders**
- System background job runs daily
- Identifies policies with target compliance date
- Queries non-compliant employees (no tracking record)
- Automatically sends reminder emails X days before due date
- HR configures reminder schedule (e.g., 7 days, 3 days, 1 day before)

**A4: Employee Views Policy Without Downloading**
- Employee navigates to policy detail page but doesn't click download
- No tracking record created (tracking only on download action)
- Employee not counted as compliant
- HR reminder system still flags employee as non-compliant

**Total Duration:** 1-4 weeks (compliance campaign), ongoing (monitoring)

---

## Error Handling / Edge Cases

### 1. File Upload Errors

**Error:** File Type Not Supported
- **Cause:** User uploads file with extension not in allowed list (not .pdf, .doc, .docx, .jpeg, .jpg, .png)
- **Detection:** Path.GetExtension extracts extension, checked against _AllowedFileExtensions list
- **Response:** HTTP 400 Bad Request
- **Message:** "File type is not supported. Allowed types: pdf, doc, docx, jpeg, jpg, png"
- **User Action:** Select and upload file with valid extension
- **Prevention:** Client-side file input accept attribute limits selectable files

**Error:** File Size Exceeded
- **Cause:** Uploaded file larger than PolicyDocumentMaxSize (5 MB)
- **Detection:** IFormFile.Length property checked against _appConfig.PolicyDocumentMaxSize
- **Response:** HTTP 400 Bad Request
- **Message:** "File size exceeds maximum allowed size of 5 MB"
- **User Action:** Compress or split document, reduce image quality, convert to more efficient format
- **Prevention:** Client-side validation checks file.size before upload (advisory only)

**Error:** File Save Failure
- **Cause:** Disk full, permissions issue, path too long, I/O error
- **Detection:** Exception during FileStream.CopyToAsync or Directory.CreateDirectory
- **Response:** HTTP 400 Bad Request
- **Message:** "Error in saving file. Please try again later"
- **System Action:** If policy record already created, delete record and file to maintain consistency
- **Recovery:** Admin checks disk space and directory permissions, user retries upload
- **Logging:** Exception logged to application logs for admin investigation

**Error:** Path Traversal Attempt
- **Cause:** Malicious filename with ../ sequences attempting directory traversal
- **Detection:** GetFullPath resolves path, StartsWith checks if result within base directory
- **Response:** File operation silently fails (returns false), policy creation rejected
- **Message:** "Error in saving file"
- **Security:** Attack attempt logged, potential security incident flagged
- **Prevention:** Path.GetFileName strips directory info from user-provided filename

---

### 2. Validation Errors

**Error:** Required Field Missing
- **Cause:** User submits form with empty Name, Description, DocumentCategoryId, StatusId, or FileContent
- **Detection:** FluentValidation CompanyPolicyRequestValidation, [Required] attributes
- **Response:** HTTP 400 Bad Request
- **Message:** "Model state is invalid"
- **ModelErrors:** Array of specific field errors (e.g., ["Name is required", "Please select a category"])
- **User Action:** Fill in all required fields marked with * indicator
- **Prevention:** Client-side validation disables submit button until required fields filled

**Error:** String Length Exceeded
- **Cause:** Name > 250 characters or Description > 500 characters
- **Detection:** FluentValidation max length rules, database column constraints
- **Response:** HTTP 400 Bad Request
- **Message:** "Model state is invalid"
- **ModelErrors:** ["Name must not exceed 250 characters"] or ["Description must not exceed 500 characters"]
- **User Action:** Shorten text to within limits
- **Prevention:** Client-side character counter and max length attributes on inputs

**Error:** Invalid Foreign Key
- **Cause:** DocumentCategoryId or StatusId references non-existent or deleted master record
- **Detection:** Database foreign key constraint violation during INSERT/UPDATE
- **Response:** HTTP 400 Bad Request or 500 Internal Server Error
- **Message:** "Invalid category or status selected"
- **User Action:** Refresh page to reload latest category/status options, re-select
- **Prevention:** Dropdowns populated from API call immediately before form submission

---

### 3. Policy Not Found Errors

**Error:** Policy Does Not Exist
- **Cause:** User requests policy by ID that doesn't exist in database or IsDeleted = 1
- **Detection:** GetByIdAsync returns null
- **Response:** HTTP 404 Not Found
- **Message:** "Policy not found or has been deleted"
- **User Action:** Return to policy list, verify policy wasn't deleted
- **UI Behavior:** NotFoundPage component rendered
- **Common Scenarios:** Policy deleted by another user, incorrect ID in URL, user bookmarked deleted policy

**Error:** Policy Not Found During Update
- **Cause:** User attempts to edit policy that was deleted between page load and form submission
- **Detection:** Edit operation loads policy, returns null
- **Response:** HTTP 404 Not Found
- **Message:** "Company policy does not exist"
- **User Action:** Return to policy list, verify policy status
- **Prevention:** None (race condition), user informed to check with HR admin

---

### 4. Versioning Errors

**Error:** Version History Insert Fails
- **Cause:** Database error during CompanyPolicyHistory INSERT within transaction
- **Detection:** Exception during transaction execution
- **Response:** HTTP 400 Bad Request or 500 Internal Server Error
- **Message:** "Error updating policy. Please try again"
- **System Action:** Transaction rolled back, CompanyPolicy update reverted
- **Consistency:** No partial updates (transaction ensures both history and policy updated or neither)
- **Recovery:** User retries update, admin checks database health if persistent

**Error:** File Deletion Fails During Update
- **Cause:** Old policy file locked by another process, file not found, permissions issue
- **Detection:** Exception during Helper.DeleteFile
- **Response:** Update continues (file deletion failure not critical)
- **System Action:** New file saved successfully, old file orphaned on disk
- **Cleanup:** Admin can manually delete orphaned files using file system scripts
- **Impact:** Disk space gradually consumed by old files (requires periodic cleanup)

---

### 5. Email Notification Errors

**Error:** Email Service Failure
- **Cause:** SMTP server down, network issue, authentication failure, rate limiting
- **Detection:** Exception during EmailNotificationService.UpdatedPolicy
- **Response:** Policy save succeeds (email failure does not block policy operation)
- **Message:** Success message shown to user ("Policy saved successfully")
- **Logging:** Email exception logged to application logs
- **User Impact:** Policy created/updated but employees not notified
- **Recovery:** Admin manually sends notification or users discover policy through normal navigation
- **Prevention:** Email service health monitoring, retry logic in background job

**Error:** Invalid Employee Email Address
- **Cause:** Employee record has null, empty, or malformed email address
- **Detection:** Email validation during recipient list generation
- **Response:** Email skipped for that employee, continues with other employees
- **Logging:** Invalid email logged for data quality review
- **Impact:** Employee not notified, may miss policy update
- **Resolution:** HR corrects employee email address in Employee Management module

---

### 6. Concurrent Access Issues

**Error:** Simultaneous Policy Updates
- **Cause:** Two HR users edit same policy simultaneously
- **Detection:** Last write wins (no optimistic concurrency control)
- **Impact:** First user's changes overwritten by second user
- **Mitigation:** Version number increases correctly (each update increments from loaded value)
- **History:** Both updates create separate history entries if both Active
- **User Notification:** No conflict warning shown
- **Best Practice:** HR team coordination to avoid simultaneous edits

**Error:** Policy Deleted While User Editing
- **Cause:** User A edits policy, User B deletes it before User A submits
- **Detection:** Update operation finds IsDeleted = 1 or record not found
- **Response:** HTTP 404 Not Found, "Policy not found"
- **User Action:** User A's changes lost, informed policy was deleted
- **Prevention:** Soft delete allows recovery if needed

---

### 7. Download Tracking Errors

**Error:** File Not Found During Download
- **Cause:** Policy document file deleted from disk but database record exists
- **Detection:** FileToByteArray throws FileNotFoundException
- **Response:** HTTP 404 Not Found
- **Message:** "File not found or access denied"
- **System Action:** No tracking record created/updated (download failed)
- **Recovery:** Admin restores file from backup or re-uploads document
- **Prevention:** Backup policy document directory regularly

**Error:** Tracking Insert/Update Fails
- **Cause:** Database error during UserCompanyPolicyTrack INSERT or UPDATE
- **Detection:** Exception during tracking repository call
- **Response:** Download succeeds (tracking failure not critical)
- **Impact:** Employee download not recorded in compliance tracking
- **System Action:** File content returned to user despite tracking failure
- **Logging:** Tracking exception logged for investigation
- **Data Quality:** Compliance reports show lower engagement than actual

---

### 8. Permission Errors

**Error:** Insufficient Permissions
- **Cause:** User attempts action without required permission (e.g., create policy without CreateCompanyPolicy)
- **Detection:** [HasPermission] attribute on controller action
- **Response:** HTTP 403 Forbidden (or redirect to login if not authenticated)
- **Message:** "You do not have permission to perform this action"
- **UI Prevention:** Action buttons hidden if user lacks permission (ViewCompanyPolicy check)
- **API Prevention:** Server-side authorization enforced regardless of UI state

**Error:** Employee Accessing Policy Without Permission
- **Cause:** Employee role doesn't have ViewCompanyPolicy permission
- **Detection:** Permission check on page load
- **Response:** NotFoundPage component rendered (404 behavior for security)
- **Message:** Generic "Page not found" (doesn't reveal policy exists)
- **Security:** Policy existence not disclosed to unauthorized users

---

## Continuation

This completes Part 2 of the Company Policy Management module documentation. Part 3 will cover Integration Points, Testing Scenarios, Dependencies, and Known Limitations.

