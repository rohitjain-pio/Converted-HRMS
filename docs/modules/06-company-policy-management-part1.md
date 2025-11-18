# Module 06: Company Policy Management - Part 1

## Module Overview

The Company Policy Management module provides a centralized system for creating, versioning, distributing, and tracking organizational policies. HR administrators can publish policies with categorization, target specific employee groups, and maintain complete version history. The system stores policy documents in the local file system, tracks employee views/downloads, and sends email notifications when policies are updated. Policy lifecycle includes Draft, Active, and Inactive statuses with automatic versioning when active policies are modified.

**Key Capabilities:**
- Policy document creation with metadata (name, description, category, effective date)
- Document upload with file validation (PDF, DOC, DOCX, JPEG, JPG, PNG formats, max 5 MB)
- Three-state lifecycle: Draft → Active → Inactive
- Automatic versioning system (increments on each update to active policy)
- Version history tracking with complete audit trail
- Employee group targeting for policy distribution
- User-level download/view tracking with timestamps
- Email notifications to all employees on policy updates
- Policy search and filtering by name, category, status
- Document category management for policy classification
- Soft delete capability for policy removal

---

## Features List

### 1. Policy Creation

**Description:**  
HR creates a new company policy by providing policy name, description, document category, status, accessibility flag, and uploading the policy document file. System validates file type and size before saving. Policy is assigned version number 1 on creation. If status is set to Active during creation, effective date is set to current UTC timestamp; if Draft, effective date remains null.

**Business Rules:**
- Policy Name: Required, max 250 characters
- Description: Optional, max 500 characters
- Document Category: Required, selected from master data (CompanyPolicyDocCategory)
- Status: Required, one of Draft (1), Active (2), Inactive (3)
- Accessibility: Boolean flag indicating if policy is accessible to all employees or restricted groups
- File Content: Required, accepted formats (.pdf, .doc, .docx, .jpeg, .jpg, .png), max size 5 MB
- File naming: Original filename + underscore + timestamp (ddMMyyyyHHmmss) + extension
- Email Request: Optional flag to send notification email to all employees
- Version Number: Automatically set to 1 for new policies
- Effective Date: Set to UTC now if status is Active, null if Draft
- Created By: Logged-in user's email address
- Created On: UTC timestamp

**User Interaction:**
- User navigates to Company Policy section
- Clicks "Add" button (requires CreateCompanyPolicy permission)
- Fills policy creation form with name, description, category dropdown, status dropdown
- Sets accessibility checkbox
- Uploads policy document file (file picker)
- Optionally checks "Send Email Notification" checkbox
- Clicks "Submit" button
- System validates all fields and file
- On success, policy is saved and user redirected to policy list with success message

**Validation:**
- Name is required
- Document Category ID is required and must exist in master table
- Status ID is required and must be valid (1, 2, or 3)
- File Content is required
- File extension must be in allowed list
- File size must not exceed configured maximum (PolicyDocumentMaxSize from AppConfig)
- Description max length 500 characters

**Data Flow:**
1. Frontend form submission with multipart/form-data encoding
2. CompanyPolicyController.Post endpoint receives CompanyPolicyRequestDto
3. Validation using FluentValidation CompanyPolicyRequestValidation
4. CompanyPolicyService.Add method processes request
5. File saved to local directory (WebRootPath + PolicyDirectoryLocation)
6. CompanyPolicy entity created with generated filename and metadata
7. Record inserted into CompanyPolicy table via repository
8. Policy ID returned from database (SCOPE_IDENTITY)
9. Initial version entry created in CompanyPolicyHistory table with version 0
10. If EmailRequest flag is true, UpdatedPolicy email sent to all employees
11. Success response returned to frontend

---

### 2. Policy Document Upload & Storage

**Description:**  
Policy documents are uploaded as files and stored in the local file system under a configured directory path. System generates unique filenames by appending timestamp to original filename to prevent naming conflicts. File path is constructed using WebRootPath and PolicyDirectoryLocation configuration. Directory is created if it does not exist. File security is enforced by validating that the final file path starts with the configured base path to prevent path traversal attacks.

**Business Rules:**
- Allowed file extensions: .pdf, .doc, .docx, .jpeg, .jpg, .png
- Maximum file size: Configured via AppConfigOptions.PolicyDocumentMaxSize (typically 5 MB)
- File naming pattern: {OriginalNameWithoutExtension}_{ddMMyyyyHHmmss}{Extension}
- Storage location: WebRootPath + FilePathOptions.PolicyDirectoryLocation
- Path traversal prevention: GetFullPath validation ensures file stays within allowed directory
- Auto-create directory if not exists
- Async file copy using FileStream

**Technical Implementation:**
- IFormFile received from multipart request
- Path.GetFileNameWithoutExtension and Path.GetExtension used for parsing
- DateTime.UtcNow.ToString("ddMMyyyyHHmmss") for timestamp generation
- Path.Combine for safe path construction
- Path.GetFullPath with StartsWith validation for security
- Directory.CreateDirectory with existence check
- FileStream with FileMode.Create for async copy
- CopyToAsync method for non-blocking file write

**Error Handling:**
- Invalid file extension: Returns 400 BadRequest with "File type is not supported" message
- File size exceeded: Returns 400 BadRequest with "Invalid policy max size" message
- File save failure: Returns 400 BadRequest with "Error in saving file" message
- If file save fails after policy record creation, document is deleted from file system

---

### 3. Policy Status Management

**Description:**  
Policies have three lifecycle states managed through the PolicyStatus master table: Draft (1), Active (2), and Inactive (3). Draft policies are works-in-progress not yet published to employees. Active policies are currently enforced and visible to target employees. Inactive policies are archived versions no longer in effect. Status transitions trigger different system behaviors, particularly around effective dates and versioning.

**Business Rules:**
- Draft (StatusId = 1): Policy under preparation, EffectiveDate is null, not visible to employees
- Active (StatusId = 2): Policy published and enforced, EffectiveDate set to publication timestamp, visible to target employees
- Inactive (StatusId = 3): Policy archived, no longer enforced but retained for historical reference
- Status transition Draft → Active: Sets EffectiveDate to current UTC time
- Status transition Active → Draft/Inactive: Retains existing EffectiveDate
- Cannot directly edit Active policy (triggers versioning instead)

**Master Data (PolicyStatus Table):**
- Id: 1, StatusValue: "Draft", IsActive: 1
- Id: 2, StatusValue: "Active", IsActive: 1
- Id: 3, StatusValue: "Inactive", IsActive: 1

**Status Display:**
- Policy list shows status as text (Draft, Active, Inactive)
- Status filter dropdown in search populated from PolicyStatus table
- Status badge color coding in UI (Draft: gray, Active: green, Inactive: red)

**Permissions:**
- ReadCompanyPolicy: View policies regardless of status
- CreateCompanyPolicy: Create policies in any status
- EditCompanyPolicy: Update policy status and metadata
- ViewCompanyPolicy: View detailed policy information

---

### 4. Policy Categorization

**Description:**  
Policies are classified into categories using the CompanyPolicyDocCategory master table. Categories help organize policies by subject matter (e.g., HR Policies, IT Security, Code of Conduct, Leave Policy, Expense Policy). Each policy must be assigned to exactly one category. Categories are maintained as master data and can be filtered in policy search.

**Business Rules:**
- DocumentCategoryId is mandatory foreign key to CompanyPolicyDocCategory table
- Categories are pre-configured master data with Id and CategoryName
- IsActive flag controls category availability (only active categories shown in dropdown)
- Categories are sorted alphabetically in dropdown
- Category assignment cannot be null
- Category shown in policy list and detail views

**Master Data Structure (CompanyPolicyDocCategory):**
- Id: Bigint, Primary Key, Identity
- CategoryName: String, category display name
- IsActive: Boolean, controls visibility in dropdowns
- CreatedBy, CreatedOn, ModifiedBy, ModifiedOn: Audit fields
- IsDeleted: Boolean, soft delete flag

**Common Categories (Examples from Implementation):**
- HR Policies
- IT Security
- Code of Conduct
- Leave & Attendance
- Expense Reimbursement
- Health & Safety
- Confidentiality & NDA
- Employee Benefits

**Category Usage:**
- Category filter in policy search (dropdown populated from active categories)
- Category display in policy list table column
- Category shown in policy detail page
- Category required validation in create/edit forms

---

### 5. Policy Versioning System

**Description:**  
Automatic versioning system maintains complete history of policy changes. When an active policy (StatusId = 2) is updated, instead of modifying the existing record in-place, the system creates a new version by incrementing the VersionNo field and inserting the updated policy into CompanyPolicyHistory table. Original CompanyPolicy record is also updated to reflect new version. Version history preserves all previous policy states with timestamps, enabling rollback capability and audit compliance.

**Business Rules:**
- New policy created with VersionNo = 1
- Initial history entry created with VersionNo = 0 (baseline)
- Updating Draft or Inactive policy: Direct update without versioning (isUpdatedCompanyPolicy = true)
- Updating Active policy: Triggers versioning (isUpdatedCompanyPolicy = false)
- Version increment: VersionNo = VersionNo + 1
- History entry captures complete policy state at that point in time
- Both CompanyPolicy and CompanyPolicyHistory tables updated in transaction
- Versioning logic checks time since EffectiveDate (currently commented out in code, always triggers versioning for Active)

**Versioning Trigger Conditions:**
- Policy StatusId = 2 (Active)
- Policy has existing EffectiveDate (not null)
- Time since EffectiveDate exceeds PolicyVersionUpdateTime threshold (logic present but commented out)

**Version History Entry Contents:**
- PolicyId: Reference to main CompanyPolicy.Id
- Name, Description, DocumentCategoryId, StatusId, Accessibility: Policy metadata at this version
- FileName, FileOriginalName: Document file references
- VersionNo: Version sequence number
- EffectiveDate: When this version became effective (set to UTC now during versioning)
- CreatedBy, CreatedOn: Original policy creator and creation time
- ModifiedBy, ModifiedOn: Who modified and when
- IsDeleted: Soft delete flag for history entry

**Database Transaction:**
- BeginTransaction on SQL connection
- Execute INSERT INTO CompanyPolicyHistory
- Execute UPDATE CompanyPolicy SET VersionNo, EffectiveDate, other fields
- Commit transaction on success
- Rollback on any exception

**Version History Retrieval:**
- GetCompanyPolicyHistoryList stored procedure returns all versions for a policy
- Sorted by version number descending (newest first)
- Paginated results with search filters
- Each history entry shows version number, modified date, modified by

---

### 6. Policy List with Search & Filtering

**Description:**  
Comprehensive policy listing page with server-side search, filtering, sorting, and pagination. Users can filter policies by name (partial match), document category, and status. Results are displayed in a data table with columns for serial number, document name (clickable link), version, category, created by, created on, updated by, updated on, status, and actions. Supports column sorting and configurable page size.

**Business Rules:**
- Default status filter: Active (2) on page load
- Name filter: Case-insensitive partial match (LIKE '%name%')
- Category filter: Exact match on DocumentCategoryId
- Status filter: Exact match on StatusId
- Sorting: Enabled on Name, CreatedOn, ModifiedOn columns
- Default sort: Most recent first (typically by CreatedOn DESC)
- Pagination: Configurable page size (10, 25, 50, 100 records per page)
- Default page size: 10 records
- Total records count shown for filtered results
- Only non-deleted policies shown (IsDeleted = 0)

**API Request (POST /api/CompanyPolicy/GetCompanyPolicies):**
```json
{
  "sortColumnName": "CreatedOn",
  "sortDirection": "DESC",
  "startIndex": 1,
  "pageSize": 10,
  "filters": {
    "name": "Leave",
    "documentCategoryId": 2,
    "statusId": 2
  }
}
```

**API Response:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": {
    "companyPolicyList": [
      {
        "id": 15,
        "name": "Leave Policy 2024",
        "description": "Updated leave policy effective Jan 2024",
        "versionNo": 3,
        "documentCategory": "HR Policies",
        "createdBy": "hr@company.com",
        "createdOn": "2024-01-10T08:30:00Z",
        "modifiedBy": "hr.admin@company.com",
        "modifiedOn": "2024-09-15T10:45:00Z",
        "status": "Active"
      }
    ],
    "totalRecords": 25
  }
}
```

**UI Table Columns:**
1. S.No: Sequential number calculated as (startIndex - 1) * pageSize + index + 1
2. Document Name: Clickable link to detail page (if user has ViewCompanyPolicy permission), truncated to 20 chars with tooltip
3. Version: Current version number
4. Category: Document category name
5. Created By: Email of policy creator
6. Created On: Formatted date (formatDate utility)
7. Updated By: Email of last modifier (or "N/A" if never updated)
8. Updated On: Formatted date (or "N/A" if never updated)
9. Status: Status text (Draft, Active, Inactive)
10. Actions: View and Edit icon buttons (permission-gated)

**Frontend Features:**
- FilterForm component with name input, category dropdown, status dropdown
- Reset filter button clears all filters and reloads with defaults
- Column header click triggers sort direction toggle (ASC ↔ DESC)
- Page navigation controls (previous, next, page number input, page size selector)
- Loading indicator during API calls
- Error toast notifications for API failures
- Add button in page header (requires CreateCompanyPolicy permission)

**Database Stored Procedure:**
- GetCompanyPolicyDocuments stored procedure handles complex query with filters, sorting, pagination
- Joins CompanyPolicy with CompanyPolicyDocCategory for category name
- Dynamic WHERE clause based on provided filters
- Dynamic ORDER BY based on sortColumnName and sortDirection
- OFFSET-FETCH for pagination (StartIndex, PageSize)

---

### 7. Policy Detail View

**Description:**  
Comprehensive policy detail page displays all policy metadata, document information, and provides actions for viewing document, editing policy, and viewing version history. Page is divided into two main sections: DocumentDetails component showing current policy state, and DocumentHistory component showing all historical versions (visible only to non-employee roles).

**Business Rules:**
- Requires ViewCompanyPolicy permission to access
- Returns 404 Not Found page if policy doesn't exist or user lacks permission
- Document name shown with full text (no truncation)
- Version number displayed prominently
- Created and Modified audit information shown
- Document download button uses tracked download mechanism
- Edit button visible only to users with EditCompanyPolicy permission
- Version history tab visible only to HR/Admin roles (not visible to Employee role)

**API Request (GET /api/CompanyPolicy/{id}):**
```
GET /api/CompanyPolicy/15
```

**API Response:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": {
    "id": 15,
    "name": "Leave Policy 2024",
    "description": "Comprehensive leave policy covering all leave types, accrual rules, and approval workflows. Updated to comply with labor regulations effective January 2024.",
    "versionNo": 3,
    "documentCategory": "HR Policies",
    "documentCategoryId": "2",
    "statusId": "2",
    "status": "Active",
    "accessibility": true,
    "fileName": "LeavePolicy2024_15092024104530.pdf",
    "fileOriginalName": "Leave_Policy_2024.pdf",
    "createdBy": "hr@company.com",
    "createdOn": "2024-01-10T08:30:00Z",
    "modifiedBy": "hr.admin@company.com",
    "modifiedOn": "2024-09-15T10:45:00Z"
  }
}
```

**UI Layout:**
- Page Header: "Policy Details" with breadcrumb navigation
- DocumentDetails Card:
  - Policy Name (heading)
  - Description (multi-line text)
  - Category badge
  - Status badge with color coding
  - Version number badge
  - Accessibility indicator (icon or text)
  - Created by and Created on (formatted)
  - Updated by and Updated on (formatted, or "N/A")
  - File information: Original filename
  - Action buttons:
    - Download Document (downloads and tracks view)
    - Edit Policy (if EditCompanyPolicy permission, navigates to edit page)
- DocumentHistory Card (if not Employee role):
  - Version history data table
  - Columns: Version, Modified Date, Modified By, Description
  - Paginated list of all policy versions
  - Sorted by version descending

**Download Tracking:**
- Download button calls DownloadPolicyDocument API
- Requires companyPolicyId, employeeId, fileName
- System checks UserCompanyPolicyTrack table for existing record
- If exists: Updates ModifiedOn timestamp
- If not exists: Inserts new tracking record with ViewedOn timestamp
- Returns file content as base64 encoded byte array
- Frontend decodes and triggers browser download

---

### 8. Policy Creation Form

**Description:**  
Dedicated form page for creating new policies with comprehensive field validation, file upload, and optional email notification. Form uses React Hook Form with Yup schema validation. Supports all policy metadata fields including name, description, category, status, accessibility, file upload, and email request option.

**Business Rules:**
- Name: Required, string, trimmed
- Description: Required, string, max 500 characters
- DocumentCategoryId: Required, selected from dropdown populated with active categories
- StatusId: Required, selected from dropdown (Draft, Active, Inactive)
- Accessibility: Boolean checkbox, defaults to false
- FileContent: Required for new policies, file input with validation
- EmailRequest: Boolean checkbox, defaults to false, disabled if status is not Active or form is pristine

**Form Fields:**
1. **Name** (Text Input):
   - Label: "Policy Name"
   - Required field indicator (*)
   - Validation: Required, max 250 characters
   - Error message: "Policy name is required"

2. **Description** (Textarea):
   - Label: "Description"
   - Required field indicator (*)
   - Multi-line input, rows 4
   - Validation: Required, max 500 characters
   - Character counter shown
   - Error message: "Description is required" or "Maximum 500 characters allowed"

3. **Document Category** (Dropdown):
   - Label: "Category"
   - Required field indicator (*)
   - Options loaded from GetDocumentCategoryList API
   - Validation: Required, must be valid category ID
   - Error message: "Please select a category"

4. **Status** (Dropdown):
   - Label: "Status"
   - Required field indicator (*)
   - Options: Draft, Active, Inactive (loaded from GetPolicyStatusList API)
   - Validation: Required, must be valid status ID
   - Default: Draft
   - Error message: "Please select a status"

5. **Accessibility** (Checkbox):
   - Label: "Make policy accessible to all employees"
   - Default: Unchecked (false)
   - Tooltip: "If checked, policy is visible to all employees; otherwise restricted to specific groups"

6. **File Upload** (File Input):
   - Label: "Policy Document"
   - Required field indicator (*)
   - Accepted formats: .pdf, .doc, .docx, .jpeg, .jpg, .png
   - Max size: 5 MB
   - Validation: Required, file type validation, file size validation
   - Shows selected filename
   - Error messages: "Please upload a document", "Invalid file type", "File size exceeds 5 MB"

7. **Send Email Notification** (Checkbox):
   - Label: "Send email notification to all employees"
   - Default: Unchecked (false)
   - Disabled conditions:
     - Status is not Active
     - Form is pristine (no changes made)
   - Only shown when creating Active policy
   - Warning message if checked: "Email will be sent to all employees upon submission"

**Form Actions:**
- **Submit Button**: "Create Policy"
  - Validates all fields
  - Shows confirmation dialog if email notification is enabled
  - Calls CreateCompanyPolicy API with multipart form data
  - On success: Shows success toast and redirects to policy list
  - On error: Shows error toast with API error messages
  - Loading state: Button disabled and shows spinner during API call

- **Reset Button**: "Reset"
  - Clears all form fields to defaults
  - Resets file input
  - Clears all validation errors

- **Cancel Button**: "Cancel"
  - Navigates back to policy list without saving

**Email Confirmation Dialog:**
- Appears when EmailRequest is true and form is submitted
- Message: "You are about to send email notification to all employees about this policy. Do you want to continue?"
- Actions:
  - Confirm: Proceeds with policy creation and email sending
  - Cancel: Closes dialog, returns to form without submission

**API Integration (POST /api/CompanyPolicy/CreateCompanyPolicy):**
- Content-Type: multipart/form-data
- Form fields converted to FormData object using objectToFormData utility
- FileContent sent as File object
- All other fields sent as strings
- Response handling:
  - 200 OK: Success toast, navigate to list
  - 400 Bad Request: Error toast with modelErrors array
  - Other errors: Generic error toast

**Validation Schema (Yup):**
```javascript
{
  name: Yup.string().required("Policy name is required").max(250),
  description: Yup.string().required("Description is required").max(500),
  documentCategoryId: Yup.string().required("Please select a category"),
  statusId: Yup.string().required("Please select a status"),
  accessibility: Yup.boolean(),
  fileContent: Yup.mixed().required("Please upload a document"),
  emailRequest: Yup.boolean()
}
```

---

### 9. Policy Update & Edit

**Description:**  
Policy editing functionality with different behaviors based on policy status. Draft and Inactive policies can be directly updated. Active policies trigger versioning system which creates a new version entry in history table while updating main record. Edit form pre-populates with existing policy data and allows updating all fields including replacing policy document.

**Business Rules:**
- Edit requires EditCompanyPolicy permission
- Policy loaded by ID via GetCompanyPolicyById API on form load
- All fields pre-populated with current values
- File upload optional (if not provided, existing file retained)
- If new file provided:
  - Old file deleted from file system (if exists)
  - New file saved with timestamp-based naming
- Active policy update behavior:
  - Creates new version in CompanyPolicyHistory
  - Increments VersionNo in CompanyPolicy
  - Sets new EffectiveDate to UTC now
  - Updates ModifiedBy and ModifiedOn
- Draft/Inactive policy update behavior:
  - Direct update of CompanyPolicy record
  - EffectiveDate updated only if status changed to Active
  - No version history entry created (only updates existing record)
- Email notification optional via EmailRequest checkbox
- Email sent to all employees if EmailRequest = true and policy is Active

**Edit Form Differences from Create:**
- Title: "Edit Policy" instead of "Create Policy"
- Submit button text: "Update Policy"
- File upload field:
  - Optional (not required)
  - Shows current filename if document exists
  - Validation message: "Upload new document to replace existing" (if no file selected)
- Reset button resets to loaded policy values (not blank form)
- EmailRequest checkbox behavior:
  - Disabled if status is not Active
  - Disabled if form is pristine (no changes made) - prevents accidental spam
  - Only enabled when form is dirty AND status is Active

**API Request (PUT /api/CompanyPolicy/UpdateCompanyPolicy):**
```
PUT /api/CompanyPolicy/UpdateCompanyPolicy
Content-Type: multipart/form-data

Form Data:
- Id: 15
- Name: "Leave Policy 2024 - Updated"
- DocumentCategoryId: 2
- StatusId: 2
- Description: "Updated leave policy with new sick leave rules"
- Accessibility: true
- FileContent: [File object or empty string if not replacing]
- EmailRequest: true
```

**API Response:**
```json
{
  "statusCode": 200,
  "message": "Company policy updated successfully",
  "modelErrors": [],
  "result": null
}
```

**Version Update Response (for Active policies):**
```json
{
  "statusCode": 200,
  "message": "New version created successfully",
  "modelErrors": [],
  "result": null
}
```

**Update Flow for Active Policy:**
1. User submits edit form
2. CompanyPolicyService.Edit receives request
3. Loads existing policy from database
4. Checks if StatusId = 2 (Active) and has EffectiveDate
5. Sets isUpdatedCompanyPolicy = false (triggers versioning)
6. If new file provided:
   - Validates file extension and size
   - Generates new filename with timestamp
   - Saves file to disk
7. If no new file provided:
   - Retrieves existing FileName and FileOriginalName from database
8. Creates CompanyPolicy object with updated values
9. Updates VersionNo = existing VersionNo + 1
10. Sets EffectiveDate = UTC now
11. Calls AddPolicyHistory (inserts into CompanyPolicyHistory table)
12. If EmailRequest = true, sends UpdatedPolicy email (with isVersionUpdate = true)
13. Returns success message "New version created successfully"

**Update Flow for Draft/Inactive Policy:**
1. Steps 1-4 same as above
2. Sets isUpdatedCompanyPolicy = true (direct update)
3. If new file provided: Saves file and deletes old file
4. Updates CompanyPolicy record directly (no history entry)
5. EffectiveDate set to UTC now only if StatusId = Active
6. If EmailRequest = true, sends UpdatedPolicy email (with isVersionUpdate = false)
7. Returns success message "Company policy updated successfully"

**File Replacement Logic:**
- Old file path: WebRootPath + PolicyDirectoryLocation + existing FileName
- Path traversal prevention: Validates old file path starts with base directory
- Deletes old file using Helper.DeleteFile
- New file saved with new timestamp-based filename
- Both FileName and FileOriginalName fields updated in database

**Validation:**
- Same validation rules as create form
- FileContent not required (can skip file update)
- If file provided, must meet type and size requirements
- All other fields remain required

---

### 10. Policy Version History Viewing

**Description:**  
Version history tab displays all historical versions of a policy in a paginated, sortable table. Each row shows version number, modified date, modified by email, and description snapshot from that version. Users can see evolution of policy over time with complete audit trail. History entries are read-only; no edit or delete actions available on historical versions.

**Business Rules:**
- History only visible to non-Employee roles (HR, Admin, Manager)
- Employee role does not see history tab in detail page
- History retrieved from CompanyPolicyHistory table filtered by PolicyId
- Sorted by version number descending (newest version first)
- Paginated with configurable page size (default 10 records)
- Shows total count of history entries
- Only non-deleted history entries shown (IsDeleted = 0)

**API Request (POST /api/CompanyPolicy/GetCompanyPolicyHistoryList):**
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

**API Response:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "modelErrors": [],
  "result": {
    "companyPolicyHistoryResponseDto": [
      {
        "id": 45,
        "policyId": 15,
        "name": "Leave Policy 2024",
        "description": "Updated sick leave rules to 12 days per year",
        "versionNo": 3,
        "documentCategory": "HR Policies",
        "fileName": "LeavePolicy2024_15092024104530.pdf",
        "fileOriginalName": "Leave_Policy_2024_v3.pdf",
        "createdBy": "hr@company.com",
        "createdOn": "2024-01-10T08:30:00Z",
        "modifiedBy": "hr.admin@company.com",
        "modifiedOn": "2024-09-15T10:45:00Z"
      },
      {
        "id": 38,
        "policyId": 15,
        "name": "Leave Policy 2024",
        "description": "Added comp-off guidelines",
        "versionNo": 2,
        "documentCategory": "HR Policies",
        "fileName": "LeavePolicy2024_05052024143020.pdf",
        "fileOriginalName": "Leave_Policy_2024_v2.pdf",
        "createdBy": "hr@company.com",
        "createdOn": "2024-01-10T08:30:00Z",
        "modifiedBy": "hr@company.com",
        "modifiedOn": "2024-05-05T14:30:00Z"
      }
    ],
    "totalRecords": 3
  }
}
```

**UI History Table Columns:**
1. **S.No**: Sequential number (startIndex - 1) * pageSize + index + 1
2. **Version**: Version number (integer)
3. **Modified On**: Formatted date from ModifiedOn field
4. **Modified By**: Email address of modifier
5. **Description**: Policy description text at that version (truncated with tooltip if too long)
6. **File Name**: Original file name (not the generated filename)

**UI Features:**
- Table inside collapsible card titled "Version History"
- Pagination controls at bottom
- Sorting by clicking column headers (Version, Modified On)
- Loading spinner during API call
- Empty state message if no history: "No version history available"
- Each row shows snapshot of policy state at that version
- No action buttons (history is read-only)

**Database Stored Procedure:**
- GetHistoryListByPolicyId handles query with pagination and sorting
- Joins CompanyPolicyHistory with CompanyPolicyDocCategory for category name
- Filters by PolicyId from request
- Dynamic ORDER BY based on sortColumnName and sortDirection
- OFFSET-FETCH for pagination
- Returns list of history entries with total count

---

## Data Models

### CompanyPolicy Entity

**Table:** `CompanyPolicy`

**Purpose:** Main table storing current state of all company policies with document references and versioning information.

**Columns:**
- **Id** (bigint, PK, Identity): Unique policy identifier
- **Name** (varchar(250), NOT NULL): Policy title/name
- **Description** (nvarchar(500), NULL): Detailed policy description
- **FileName** (varchar(255), NULL): Generated filename stored in file system (with timestamp)
- **FileOriginalName** (varchar(255), NULL): Original uploaded filename
- **DocumentCategoryId** (bigint, NOT NULL, FK): Foreign key to CompanyPolicyDocCategory
- **EffectiveDate** (datetime, NULL): When policy became effective (UTC), null for Draft status
- **VersionNo** (int, NOT NULL): Current version number, starts at 1, increments on updates
- **StatusId** (int, NOT NULL, FK): Foreign key to PolicyStatus (1=Draft, 2=Active, 3=Inactive)
- **Accessibility** (bit, NOT NULL): Flag indicating if policy is accessible to all employees
- **CreatedBy** (nvarchar(250), NOT NULL): Email of policy creator
- **CreatedOn** (datetime, NOT NULL): UTC timestamp of policy creation
- **ModifiedBy** (nvarchar(250), NULL): Email of last modifier
- **ModifiedOn** (datetime, NULL): UTC timestamp of last modification
- **IsDeleted** (bit, NOT NULL, Default: 0): Soft delete flag

**Indexes:**
- Primary Key on Id (clustered)

**Foreign Keys:**
- FK_CompanyPolicy_CompanyPolicyDocCategory_DocumentCategoryId: DocumentCategoryId → CompanyPolicyDocCategory.Id
- FK_CompanyPolicy_PolicyStatus_StatusId: StatusId → PolicyStatus.Id

**Business Rules Enforced:**
- Name and Description support Unicode characters
- VersionNo always >= 1 for active policies
- EffectiveDate nullable to support Draft policies
- StatusId must reference valid PolicyStatus record
- DocumentCategoryId must reference valid active category
- IsDeleted = 0 for active records (soft delete pattern)

---

### CompanyPolicyHistory Entity

**Table:** `CompanyPolicyHistory`

**Purpose:** Audit table storing all historical versions of policies for complete change tracking and rollback capability.

**Columns:**
- **Id** (bigint, PK, Identity): Unique history record identifier
- **PolicyId** (bigint, NOT NULL): Reference to CompanyPolicy.Id (parent policy)
- **Name** (varchar(250), NOT NULL): Policy name at this version
- **Description** (nvarchar(500), NULL): Policy description at this version
- **FileName** (varchar(255), NULL): Document filename at this version
- **FileOriginalName** (varchar(255), NULL): Original filename at this version
- **DocumentCategoryId** (bigint, NOT NULL): Category at this version
- **EffectiveDate** (datetime, NULL): When this version became effective
- **VersionNo** (int, NOT NULL): Version sequence number
- **StatusId** (int, NOT NULL): Policy status at this version
- **Accessibility** (bit, NOT NULL): Accessibility flag at this version
- **CreatedBy** (nvarchar(250), NOT NULL): Original policy creator (copied from CompanyPolicy)
- **CreatedOn** (datetime, NOT NULL): Original policy creation date (copied)
- **ModifiedBy** (nvarchar(250), NULL): Who created this version
- **ModifiedOn** (datetime, NULL): When this version was created
- **IsDeleted** (bit, NOT NULL, Default: 0): Soft delete flag for history entry

**Indexes:**
- Primary Key on Id (clustered)
- Recommended index on PolicyId for efficient history queries

**No Foreign Keys:**
- PolicyId is not a formal FK to allow history retention even if parent policy deleted
- Denormalized design for audit trail preservation

**History Entry Creation:**
- Created during policy update operations (for Active policies)
- Initial history entry (version 0) created when policy first created
- Each update to Active policy inserts new history row with incremented VersionNo
- Complete snapshot of policy state at that point in time
- ModifiedBy and ModifiedOn reflect who made the change and when

**Query Patterns:**
- Retrieve all versions for a policy: WHERE PolicyId = @PolicyId AND IsDeleted = 0 ORDER BY VersionNo DESC
- Count versions: SELECT COUNT(*) FROM CompanyPolicyHistory WHERE PolicyId = @PolicyId AND IsDeleted = 0
- Latest version: TOP 1 with ORDER BY VersionNo DESC

---

### CompanyPolicyDocCategory Entity

**Table:** `CompanyPolicyDocCategory`

**Purpose:** Master data table defining policy categories for classification and organization.

**Columns:**
- **Id** (bigint, PK, Identity): Unique category identifier
- **CategoryName** (varchar, NOT NULL): Display name of category
- **IsActive** (bit, NOT NULL): Flag controlling category availability in dropdowns
- **CreatedBy** (nvarchar(250), NOT NULL): Email of category creator
- **CreatedOn** (datetime, NOT NULL): UTC timestamp of creation
- **ModifiedBy** (nvarchar(250), NULL): Email of last modifier
- **ModifiedOn** (datetime, NULL): UTC timestamp of last modification
- **IsDeleted** (bit, NOT NULL, Default: 0): Soft delete flag

**Indexes:**
- Primary Key on Id (clustered)

**Usage:**
- Populated with predefined categories during system setup
- Referenced by CompanyPolicy.DocumentCategoryId
- Categories retrieved via GetDocumentCategoryList API endpoint
- Only active categories (IsActive = 1, IsDeleted = 0) shown in dropdowns
- Sorted alphabetically by CategoryName in UI

**Common Categories:**
- HR Policies
- IT Security Policies
- Code of Conduct
- Leave & Attendance
- Expense & Reimbursement
- Health & Safety
- Confidentiality Agreements
- Employee Benefits
- Training & Development
- Performance Management

---

### PolicyStatus Entity

**Table:** `PolicyStatus`

**Purpose:** Master data table defining policy lifecycle states.

**Columns:**
- **Id** (int, PK, Identity): Unique status identifier
- **StatusValue** (varchar, NOT NULL): Status display name
- **IsActive** (bit, NOT NULL): Flag controlling status availability
- **CreatedBy** (nvarchar(250), NOT NULL): Email of status creator
- **CreatedOn** (datetime, NOT NULL): UTC timestamp of creation
- **ModifiedBy** (nvarchar(250), NULL): Email of last modifier
- **ModifiedOn** (datetime, NULL): UTC timestamp of last modification
- **IsDeleted** (bit, NOT NULL, Default: 0): Soft delete flag

**Indexes:**
- Primary Key on Id (clustered)

**Master Data Records:**
```sql
Id | StatusValue | IsActive
---|-------------|----------
1  | Draft       | 1
2  | Active      | 1
3  | Inactive    | 1
```

**Status Definitions:**
- **Draft (1)**: Policy under development, not visible to employees, EffectiveDate null
- **Active (2)**: Policy published and enforced, EffectiveDate set, visible to target employees
- **Inactive (3)**: Policy archived or suspended, no longer in effect

**Usage:**
- Referenced by CompanyPolicy.StatusId
- Retrieved via GetPolicyStatusList API endpoint
- Used in policy list filters
- Controls versioning behavior (Active policies trigger versioning on update)
- Only active statuses (IsActive = 1, IsDeleted = 0) shown in dropdowns

---

### UserCompanyPolicyTrack Entity

**Table:** `UserCompanyPolicyTrack`

**Purpose:** Tracking table recording employee views/downloads of policy documents for compliance and audit purposes.

**Columns:**
- **Id** (bigint, PK, Identity): Unique tracking record identifier
- **EmployeeId** (bigint, NOT NULL, FK): Foreign key to EmployeeData.Id (employee who viewed)
- **CompanyPolicyId** (bigint, NOT NULL): Reference to CompanyPolicy.Id (policy viewed)
- **ViewedOn** (datetime, NOT NULL): UTC timestamp when employee first viewed/downloaded policy
- **ModifiedOn** (datetime, NULL): UTC timestamp of last view/download (for subsequent downloads)

**Indexes:**
- Primary Key on Id (clustered)
- Recommended composite index on (CompanyPolicyId, EmployeeId) for efficient lookups

**Foreign Keys:**
- FK_UserCompanyPolicyTrack_EmployeeData_EmployeeId: EmployeeId → EmployeeData.Id

**Tracking Logic:**
- First download/view: INSERT new record with ViewedOn = current UTC time
- Subsequent downloads: UPDATE existing record SET ModifiedOn = current UTC time
- Lookup query: SELECT Id WHERE CompanyPolicyId = @PolicyId AND EmployeeId = @EmployeeId
- If Id > 0: Record exists, execute UPDATE
- If Id = 0 or NULL: New view, execute INSERT

**Use Cases:**
- Compliance reporting: Who has viewed which policies
- Policy acknowledgment tracking: Ensure all employees have accessed mandatory policies
- Audit trail: When employees accessed policy documents
- HR reports: Policy engagement metrics (view counts, unread policies)
- Reminder notifications: Send alerts to employees who haven't viewed new policies

**Query Patterns:**
- Get all employees who viewed a policy:
  ```sql
  SELECT e.FirstName, e.LastName, e.Email, uct.ViewedOn
  FROM UserCompanyPolicyTrack uct
  JOIN EmployeeData e ON uct.EmployeeId = e.Id
  WHERE uct.CompanyPolicyId = @PolicyId
  ORDER BY uct.ViewedOn DESC
  ```

- Get unread policies for an employee:
  ```sql
  SELECT cp.* FROM CompanyPolicy cp
  WHERE cp.StatusId = 2 AND cp.IsDeleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM UserCompanyPolicyTrack uct
    WHERE uct.CompanyPolicyId = cp.Id AND uct.EmployeeId = @EmployeeId
  )
  ```

---

## Configuration & Enums

### CompanyPolicyStatus Enum

**Purpose:** Enum defining policy lifecycle states matching PolicyStatus master table.

**Values:**
- **Draft = 1**: Policy in draft state, not yet published
- **Active = 2**: Policy published and currently enforced
- **Inactive = 3**: Policy archived or suspended

**Usage in Code:**
```csharp
public enum CompanyPolicyStatus
{
    Draft = 1,
    Active = 2,
    Inactive = 3
}
```

**Behavioral Implications:**
- **Draft**:
  - EffectiveDate is null
  - Not visible to employees
  - Can be edited directly without versioning
  - Can be deleted
  
- **Active**:
  - EffectiveDate set to publication time
  - Visible to target employees
  - Updates trigger versioning system
  - Shown in dashboard widgets
  - Included in compliance reports
  
- **Inactive**:
  - Retained for historical reference
  - Not visible to employees
  - Can be edited directly without versioning
  - Can be reactivated by changing status to Active

---

### FilePathOptions Configuration

**Purpose:** Configuration class defining file storage paths for policy documents.

**Configuration Properties:**
- **PolicyDirectoryLocation** (string): Relative path from WebRootPath where policy files are stored

**Example Configuration (appsettings.json):**
```json
{
  "FilePathOptions": {
    "PolicyDirectoryLocation": "PolicyDocuments/"
  }
}
```

**Usage:**
- Injected via IOptions<FilePathOptions>
- Combined with IHostingEnvironment.WebRootPath for full path
- Path construction: Path.Combine(WebRootPath, PolicyDirectoryLocation)
- Directory auto-created if not exists during first file upload
- Used in CreatePolicyDocument, DeleteDocument, DownloadPolicyDocument methods

**Path Security:**
- GetFullPath used to resolve absolute path
- StartsWith validation ensures file path within allowed directory
- Prevents path traversal attacks (../ sequences)

---

### AppConfigOptions Configuration

**Purpose:** Application-wide configuration settings including policy-specific limits.

**Policy-Related Properties:**
- **PolicyDocumentMaxSize** (long): Maximum allowed file size for policy documents in bytes

**Example Configuration (appsettings.json):**
```json
{
  "AppConfigOptions": {
    "PolicyDocumentMaxSize": 5242880
  }
}
```

**Size Limits:**
- PolicyDocumentMaxSize: 5,242,880 bytes = 5 MB
- Validation occurs before file save operation
- Rejection returns 400 BadRequest with error message "Invalid policy max size"

---

### Allowed File Extensions

**Purpose:** Whitelist of acceptable file types for policy document uploads.

**Allowed Extensions:**
- .pdf (Adobe PDF)
- .doc (Microsoft Word 97-2003)
- .docx (Microsoft Word 2007+)
- .jpeg (JPEG Image)
- .jpg (JPEG Image)
- .png (PNG Image)

**Implementation:**
```csharp
private readonly List<string> _AllowedFileExtensions = new List<string>() 
{ 
    ".pdf", ".doc", ".docx", ".jpeg", ".jpg", ".png" 
};
```

**Validation Logic:**
- Extension extracted using Path.GetExtension(filename)
- Converted to lowercase for case-insensitive matching
- Checked against allowed list: _AllowedFileExtensions.Contains(fileExtension.ToLower())
- Rejection returns 400 BadRequest with error message "File type is not supported"

---

## External Dependencies

### Azure Blob Storage (Note: Local File System Used)

**Description:**  
Despite documentation references to Azure Blob Storage, the actual implementation uses **local file system storage**. Policy documents are saved to the web server's file system under the configured PolicyDirectoryLocation path. No Azure Blob Storage connection or configuration is present in the codebase.

**Actual Storage Mechanism:**
- Files stored in: WebRootPath + FilePathOptions.PolicyDirectoryLocation
- Example full path: `C:\inetpub\wwwroot\HRMSWebApi\PolicyDocuments\LeavePolicy2024_15092024104530.pdf`
- File operations use System.IO.FileStream
- No blob client, SAS tokens, or Azure connection strings involved

**Implications:**
- Files stored on web server (not cloud storage)
- Backup and disaster recovery managed at server level
- Scalability limited to single server unless using shared network storage
- No CDN integration
- Access control via application logic (not blob-level permissions)

---

### Email Notification Service

**Description:**  
Integration with EmailNotificationService for sending policy update notifications to employees. Two email methods are used: one for new policies and one for policy updates/versioning.

**Email Methods:**

**1. UpdatedPolicy (New Policy Creation)**
```csharp
await _email.UpdatedPolicy(policyName, isVersionUpdate: false);
```
- Triggered when: New policy created with EmailRequest = true
- Parameters: policyName (string), isVersionUpdate (bool = false)
- Recipients: All active employees in system
- Email content: Notification about new policy publication with policy name
- Template variables: PolicyName, PublishedDate, EmployeeName

**2. UpdatedPolicy (Policy Version Update)**
```csharp
await _email.UpdatedPolicy(policyName, isVersionUpdate: true);
```
- Triggered when: Active policy updated with EmailRequest = true
- Parameters: policyName (string), isVersionUpdate (bool = true)
- Recipients: All active employees who previously viewed the policy
- Email content: Notification about policy revision with version info
- Template variables: PolicyName, VersionNumber, UpdatedDate, EmployeeName

**Email Service Configuration:**
- SMTP settings configured in appsettings.json
- Uses Office 365 SMTP server: smtp.office365.com
- Port: 587 with TLS
- From address: configured sender email
- Template-based email generation
- Fire-and-forget pattern (async, non-blocking)

**Email Notification Behavior:**
- Optional feature controlled by EmailRequest checkbox
- Only sent for Active status policies
- Disabled if form is pristine (prevents accidental spam on edit page)
- Confirmation dialog shown before sending (for new policies and updates)
- Email failure does not prevent policy save (logs error but continues)

---

## Continuation

This completes Part 1 of the Company Policy Management module documentation, covering features 1-10, data models, configuration, and external dependencies. Part 2 will continue with API endpoints, UI components, workflows, error handling, integration points, testing scenarios, and dependencies.

