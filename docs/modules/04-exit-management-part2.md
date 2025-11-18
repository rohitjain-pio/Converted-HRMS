# Module 04: Exit Management - Part 2
# Department, IT & Accounts Clearance

---

## Features List (Continued)

### Department Clearance Process (Features 28-35)

**Feature 28: Department Clearance Form Access**
- After resignation accepted, Department Clearance tab available on exit details page
- Permission: Manager of employee's department or HR role can access
- Tab indicator shows completion status:
  - ⏳ Pending (orange) if not submitted
  - 🔄 In Progress (blue) if KT in progress
  - ✓ Completed (green) if submitted
- Click tab opens department clearance form
- API: GetDepartmentClearanceDetailByResignationId/{resignationId}
- If already completed, form displays in read-only mode
- "Edit" button available for manager to modify clearance
- Form focused on Knowledge Transfer (KT) documentation

**Feature 29: Knowledge Transfer Status Tracking**
- **Field:** KT Status
- Type: Dropdown with enum values:
  - Pending (1): KT not started
  - In Progress (2): KT sessions ongoing
  - Completed (3): KT fully transferred and verified
- Default status: Pending when clearance form first accessed
- Manager updates status as KT progresses through notice period
- Status change timeline:
  - Resignation Accepted → KT Status = Pending
  - First KT session scheduled → Manager updates to In Progress
  - All KT sessions done + verification → Manager updates to Completed
- KT Status visible in resignation list view as badge
- Status color coding: Pending (orange), In Progress (blue), Completed (green)
- Department clearance cannot be submitted until KT Status = Completed
- KT progress tracked independently; completion mandatory for exit

**Feature 30: KT Notes Documentation**
- **Field:** KT Notes
- Type: Multi-line text area (max 1000 characters)
- Purpose: Manager documents knowledge transfer activities and completeness
- Manager records:
  - List of responsibilities/tasks transferred
  - Systems/tools access handed over
  - Project status at handover
  - Documentation provided (SOPs, process docs, passwords)
  - Areas covered in KT sessions
  - Any pending items or follow-up needed
- Example KT Notes:
  ```
  KT Sessions Conducted:
  - Session 1 (DD/MM): Project X architecture, codebase walkthrough
  - Session 2 (DD/MM): Database schema, deployment process
  - Session 3 (DD/MM): Client communication protocols, escalation matrix
  
  Documentation Provided:
  - Technical design documents in Confluence
  - API documentation in Swagger
  - Runbook for production deployments
  
  Systems Handed Over:
  - AWS console access transferred to John Doe
  - GitHub admin access transferred to Jane Smith
  - Slack workspace admin role removed
  
  All responsibilities successfully transferred. No pending items.
  ```
- Notes stored in DepartmentClearance.KTNotes
- Viewable by HR for completion verification
- Required field if KT Status = Completed

**Feature 31: KT Handover Users Selection**
- **Field:** KT Users (Handover Recipients)
- Type: Multi-select employee autocomplete dropdown
- Purpose: Identify employees who received knowledge transfer
- Manager selects one or more employees from department/team
- Autocomplete searches active employees by:
  - Employee Code
  - Employee Name
  - Department (filtered to same department by default)
- Selected users stored as comma-separated EmployeeIds in DepartmentClearance.KTUsers
- Example: "1025,1067,1089" (EmployeeIds of KT recipients)
- Frontend displays selected users as chips with name + employee code
- Validation: At least one KT user required if KT Status = Completed
- Common scenarios:
  - Single replacement: Select one new joiner taking over role
  - Team distribution: Select multiple team members dividing responsibilities
  - Manager handover: Select reporting manager if no direct replacement
- KT users receive email notification about their responsibilities
- Users viewable in clearance form showing who has knowledge continuity

**Feature 32: Department Clearance - Document Upload**
- **Field:** Department Clearance Attachment
- Type: File upload component
- Accepted formats: PDF, DOC, DOCX, ZIP (max 10 MB for ZIP containing multiple docs)
- Manager uploads KT documentation:
  - Signed KT completion checklist
  - Process documentation/SOPs created for handover
  - Email confirmations from KT recipients
  - Screenshots of system access transfers
  - Project handover notes
- Single file upload (compress multiple files into ZIP)
- File uploaded to Azure Blob Storage container: "ExitDocumentsContainer"
- File URL stored in DepartmentClearance.Attachment
- Original filename stored in DepartmentClearance.FileOriginalName
- "View Document" button for preview/download after upload
- Existing attachment replaceable by uploading new file
- Attachment strongly recommended but not mandatory if KT notes comprehensive

**Feature 33: Department Clearance Submission**
- After filling fields, manager clicks "Submit" button
- Form validation checks:
  - KT Status must be "Completed" (cannot submit if Pending/In Progress)
  - KT Notes required (min 50 characters)
  - KT Users required (at least one employee selected)
  - Attachment optional but recommended
- API: UpsertDepartmentClearance
- Request payload:
  - EmployeeId: current user ID (manager)
  - ResignationId: resignation ID
  - KTStatus: enum value (3 = Completed)
  - KTNotes: text
  - KTUsers: comma-separated employee IDs
  - Attachment: file blob URL (if uploaded)
- If new clearance: system inserts into DepartmentClearance with CreatedBy, CreatedOn
- If updating: system updates with ModifiedBy, ModifiedOn
- Success message: "Department clearance saved successfully"
- Tab indicator changes to ✓ Completed (green)
- Form becomes read-only with "Edit" button
- Clearance completion visible in resignation list
- Email notification sent to HR: "Department clearance completed for [Employee Name]"

**Feature 34: KT Progress Monitoring by HR**
- HR can view KT status across all active resignations from list view
- "KT Status" column in resignation list shows current status badge
- Filter available: KT Status (Pending/In Progress/Completed)
- HR can drill down to department clearance tab to review KT notes
- HR can follow up with managers if KT status = Pending for extended period
- Typical KT timeline expectations:
  - Probation employee: KT within 1 week
  - Training employee: KT within 1-2 weeks
  - Confirmed employee: KT within notice period (spread across 2 months)
- Dashboard widget: "Pending KT Clearances" count
- Alerts if KT not started 50% into notice period
- HR can escalate to manager or department head if delays

**Feature 35: Department Clearance Edit & Version Control**
- Manager can edit department clearance after initial submission
- "Edit" button visible on read-only form (permission: manager or HR)
- Click Edit unlocks form fields for modification
- Manager can update:
  - KT Status (e.g., revert to In Progress if gaps identified)
  - KT Notes (add additional information)
  - KT Users (add/remove handover recipients)
  - Attachment (replace with updated document)
- On save, ModifiedBy and ModifiedOn updated
- No version history tracking (only latest version stored)
- Edit reason not captured (implicit via ModifiedBy/ModifiedOn)
- Best practice: Manager appends to KT Notes rather than overwriting
- Example append: "[Updated DD/MM/YYYY]: Added session 4 covering..."

---

### IT Clearance Process (Features 36-44)

**Feature 36: IT Clearance Form Access**
- After resignation accepted, IT Clearance tab available on exit details page
- Permission: IT role or admin role required to access/edit
- Tab indicator shows completion status:
  - ⏳ Pending (orange) if not completed
  - ✓ Completed (green) if submitted
- Click tab opens IT clearance form
- API: GetITClearanceDetailByResignationId/{resignationId}
- If already completed, form displays in read-only mode
- "Edit" button available for IT admin to modify
- Form focuses on asset return and access revocation

**Feature 37: Access Revocation Verification**
- **Field:** Access Revoked
- Type: Boolean dropdown (Yes/No or True/False)
- Purpose: IT confirms all system accesses revoked for exiting employee
- Default: false (not revoked)
- IT team verifies and revokes:
  - Active Directory (AD) account disabled
  - Email account access removed or mailbox archived
  - VPN access revoked
  - GitHub/GitLab/Bitbucket access removed
  - AWS/Azure/GCP console access revoked
  - Database access (production/staging) removed
  - Internal tools/systems (Jira, Confluence, Slack, etc.) access revoked
  - Any client system accesses removed
  - Badge/physical access cards deactivated
- IT follows internal checklist to verify all accesses
- Once all accesses revoked, IT marks field as "Yes"
- Mandatory field; clearance cannot be submitted if "No"
- Access revocation typically done on or just before last working day
- Verification: IT tests login attempts to confirm revocation effective

**Feature 38: Asset Return Verification**
- **Field:** Asset Returned
- Type: Boolean dropdown (Yes/No)
- Purpose: IT confirms all company assets returned by employee
- Default: false (not returned)
- IT verifies return of:
  - Laptop/Desktop
  - Monitor(s)
  - Keyboard, mouse, accessories
  - Mobile phone/tablet (if company-provided)
  - Headphones/webcam
  - ID card/badge
  - Access cards/keys
  - Dongle/adapters
  - Any specialized equipment (mic, camera, etc.)
- IT cross-checks with Asset Management module:
  - Retrieves all assets allocated to EmployeeId
  - Verifies each asset status = "Returned" in AssetAllocation table
  - Checks for any pending/outstanding assets
- If all assets returned and logged, IT marks "Yes"
- If any asset missing, IT marks "No" and follows up with employee
- Mandatory field; clearance cannot submit if "No"
- Asset return typically happens during last week of notice period

**Feature 39: Asset Condition Documentation**
- **Field:** Asset Condition
- Type: Dropdown with predefined values:
  - Good: Assets in working condition, no damage
  - Fair: Minor wear and tear, fully functional
  - Damaged: Significant damage, repair needed
  - Lost: Asset not returned, lost by employee
- Purpose: Document physical condition of returned assets
- IT inspects each returned asset:
  - Laptop: Check for physical damage, functionality test, screen condition
  - Accessories: Verify all parts present and working
  - ID card: Check if damaged or intact
- If multiple assets, overall condition assessment recorded
- If condition = "Damaged" or "Lost", IT documents in Notes field:
  - Description of damage
  - Repair cost estimation
  - Whether employee liable for cost recovery
- Condition affects accounts clearance:
  - Good/Fair: No deduction
  - Damaged: Repair cost may be deducted from FnF
  - Lost: Asset value deducted from FnF
- Stored in ITClearance.AssetCondition as string
- Required field if Asset Returned = Yes

**Feature 40: IT Clearance Notes**
- **Field:** Note
- Type: Multi-line text area (max 500 characters)
- Purpose: IT documents clearance details, issues, special cases
- IT records:
  - Specific assets returned with serial numbers
  - Condition details if damaged/lost
  - Recovery amounts for damaged/lost assets
  - Access revocation completion date
  - Any exceptions or pending items
  - Coordination with employee for asset handover
- Example notes:
  ```
  Assets Returned:
  - Laptop: Dell Latitude 5520, S/N: ABC12345 (Good condition)
  - Monitor: HP 24", S/N: MON56789 (Fair condition, minor scratches)
  - Accessories: Keyboard, mouse, charger (Good condition)
  
  Access Revocation Completed: DD/MM/YYYY
  - AD account disabled
  - Email archived
  - VPN access removed
  - GitHub access revoked
  - AWS console access removed
  
  All clearances complete. No pending items.
  ```
- Notes stored in ITClearance.Note
- Optional field but recommended for audit trail

**Feature 41: IT No-Due Certificate Flag**
- **Field:** IT Clearance Certification
- Type: Boolean checkbox (Yes/No)
- Purpose: IT certifies that employee has no pending dues from IT perspective
- IT checks:
  - All assets returned in acceptable condition
  - No outstanding asset repair costs
  - No unreturned dongles/accessories
  - All system accesses revoked
  - No pending IT support tickets assigned to employee
- Once all checks pass, IT checks the certification box
- Acts as final approval/sign-off from IT department
- Mandatory field; clearance cannot submit without certification
- Certification stored in ITClearance.ITClearanceCertification as bit (true/false)
- Certification date implicit via CreatedOn/ModifiedOn timestamp
- If uncertified, IT follows up to resolve pending items

**Feature 42: IT Clearance - Document Upload**
- **Field:** IT Clearance Attachment
- Type: File upload component
- Accepted formats: PDF, JPG, PNG, DOCX (max 5 MB)
- IT uploads supporting documents:
  - Asset return acknowledgment form (signed by employee)
  - Photos of returned assets showing condition
  - Access revocation checklist (completed)
  - Email approvals for exceptions
  - Damage assessment report (if applicable)
- Single file upload (merge/compress if multiple docs)
- File uploaded to Azure Blob Storage: "ExitDocumentsContainer"
- File URL stored in ITClearance.AttachmentUrl
- Original filename stored in ITClearance.FileOriginalName
- "View Document" button for preview after upload
- Attachment optional but recommended for audit compliance
- Existing attachment replaceable by uploading new file

**Feature 43: IT Clearance Submission**
- After filling all fields, IT admin clicks "Submit" button
- Form validation checks:
  - Access Revoked must be "Yes"
  - Asset Returned must be "Yes"
  - Asset Condition required (dropdown value selected)
  - IT Clearance Certification must be checked (true)
  - Notes optional but recommended
  - Attachment optional
- API: AddUpdateITClearance
- Request payload:
  - EmployeeId: current user ID (IT person)
  - ResignationId: resignation ID
  - AccessRevoked: boolean (true)
  - AssetReturned: boolean (true)
  - AssetCondition: string (Good/Fair/Damaged/Lost)
  - Note: text (optional)
  - ITClearanceCertification: boolean (true)
  - AttachmentUrl: blob URL (if uploaded)
- If new clearance: system inserts into ITClearance with CreatedBy, CreatedOn
- If updating: system updates with ModifiedBy, ModifiedOn
- On insert, system also updates asset allocation records:
  - Sets AssetAllocation.Status = "Returned" for all employee assets
  - Sets AssetAllocation.ReturnDate = current date
  - Sets AssetAllocation.ReturnCondition = selected asset condition
- Success message: "IT clearance saved successfully"
- Tab indicator changes to ✓ Completed (green)
- Form becomes read-only with "Edit" button
- "IT No Due" badge shows as completed in resignation list
- Email notification sent to HR: "IT clearance completed for [Employee Name]"

**Feature 44: IT Clearance Integration with Asset Management**
- IT Clearance tightly integrated with Asset Management module
- When IT opens clearance form, system auto-fetches allocated assets:
  - API call: GetAssetsByEmployeeId
  - Returns list of all assets allocated to resigning employee
  - Displays asset list in clearance form for reference:
    - Asset Type, Asset Name, Serial Number, Allocation Date
- IT can click "View Assets" link to navigate to Asset Management page
- Asset return process initiated from Asset Management module:
  - IT receives asset physically
  - IT logs asset return in Asset Management (marks as "Returned")
  - Asset condition documented in Asset Management
- IT Clearance form shows summary:
  - Total Assets Allocated: X
  - Assets Returned: Y
  - Pending Assets: X - Y
- If pending assets > 0, "Asset Returned" field shows warning
- IT cannot mark "Asset Returned = Yes" if pending assets exist (validation)
- Once all assets returned in Asset Management, IT can complete clearance
- Bidirectional sync: IT clearance submission updates asset statuses
- Asset condition in IT clearance overrides individual asset conditions (if bulk return)

---

### Accounts Clearance Process (Features 45-52)

**Feature 45: Accounts Clearance Form Access**
- After resignation accepted, Accounts Clearance tab available on exit details page
- Permission: Accounts role or admin role required to access/edit
- Tab indicator shows completion status:
  - ⏳ Pending (orange) if not completed
  - ✓ Completed (green) if submitted
- Click tab opens accounts clearance form
- API: GetAccountClearance/{resignationId}
- If already completed, form displays in read-only mode
- "Edit" button available for accounts team to modify
- Form focuses on Full & Final (FnF) settlement calculation

**Feature 46: FnF Statement Status**
- **Field:** FnF Status
- Type: Boolean dropdown (Pending/Completed or Yes/No)
- Purpose: Indicates whether FnF statement prepared and approved
- Default: false/Pending
- Accounts team marks "Completed" after:
  - Calculating all salary dues (pro-rata salary for notice period worked)
  - Adding leave encashment amount
  - Adding reimbursement dues
  - Deducting advance/bonus recovery (from HR clearance)
  - Deducting asset repair/loss costs (from IT clearance)
  - Deducting any loans outstanding
  - Finalizing net FnF amount payable
- FnF statement typically Excel sheet or PDF document with breakdown
- Statement reviewed by Finance Manager before marking complete
- Mandatory field; clearance cannot submit if status = Pending
- Status stored in AccountClearance.FnFStatus as bit (nullable)

**Feature 47: FnF Amount Calculation**
- **Field:** FnF Amount
- Type: Decimal number input (₹, up to 2 decimal places)
- Purpose: Net amount payable to employee after all adjustments
- Accounts calculates:
  
  **Dues to Employee (+):**
  - Pro-rata salary for notice period worked: (MonthlySalary / 30) × DaysWorked
  - Leave encashment: (BuyoutDays from HR clearance) × DailyRate
  - Pending reimbursements (if any): travel, medical, etc.
  - Bonus/incentive accrued but unpaid
  - Provident Fund (PF) withdrawal amount (if applicable)
  - Gratuity amount (if eligible, typically 5+ years service)
  
  **Deductions from Employee (-):**
  - Advance Bonus Recovery Amount (from HR clearance)
  - Asset damage/loss cost (from IT clearance notes)
  - Notice period shortfall (if early release with penalty)
  - Outstanding loans (personal loan, salary advance)
  - Excess salary paid (if overpaid in previous months)
  
  **Net FnF Amount:** Sum of dues - Sum of deductions
  
- Example calculation:
  ```
  Pro-rata Salary (15 days): ₹25,000
  Leave Encashment (10 days): ₹10,000
  Reimbursement: ₹2,000
  Total Dues: ₹37,000
  
  Advance Recovery: -₹15,000
  Asset Damage: -₹3,000
  Total Deductions: ₹18,000
  
  Net FnF Amount: ₹19,000
  ```
  
- Field accepts positive or negative values (negative if employee owes company)
- Amount stored in AccountClearance.FnFAmount as decimal(18,2)
- Required field; must be calculated and entered before submission
- Validation: Amount must be reasonable (not > 10× monthly salary)

**Feature 48: No-Due Certificate Issuance**
- **Field:** Issue No Due Certificate
- Type: Boolean dropdown (Yes/No)
- Purpose: Accounts certifies employee has no outstanding financial dues
- Accounts checks:
  - FnF amount calculated and settlement processed
  - No pending reimbursement claims
  - No outstanding loans
  - No unreturned cash/advance
  - No pending credit card bills (if corporate card issued)
  - All financial obligations cleared
- If all checks pass, Accounts marks "Yes"
- No-due certificate typically PDF document stating:
  - "This is to certify that [Employee Name] has cleared all financial dues with [Company Name] as of [Date]"
  - Certificate signed by Finance Head
- Certificate attached to accounts clearance form or emailed to employee
- Mandatory for relieving letter issuance
- Stored in AccountClearance.IssueNoDueCertificate as bit (nullable)
- Required field; clearance cannot submit if "No"

**Feature 49: Accounts Clearance Notes**
- **Field:** Note
- Type: Multi-line text area (max 500 characters)
- Purpose: Accounts documents FnF calculation breakdown and special cases
- Accounts records:
  - FnF calculation summary (dues + deductions breakdown)
  - Payment mode (bank transfer, cheque)
  - Payment date (expected/actual)
  - Any exceptions or adjustments approved
  - Tax deductions (TDS on leave encashment, gratuity)
  - PF/Gratuity withdrawal status
- Example notes:
  ```
  FnF Calculation:
  Pro-rata Salary (10 days @ ₹50,000/month): ₹16,667
  Leave Encashment (12 days @ ₹1,667/day): ₹20,000
  Reimbursement Pending: ₹1,500
  Gross Due: ₹38,167
  
  Deductions:
  Advance Recovery (HR): ₹10,000
  Asset Damage (IT): ₹2,000
  Total Deductions: ₹12,000
  
  Net FnF: ₹26,167
  TDS Deducted: ₹2,617
  Net Payable: ₹23,550
  
  Payment Mode: Bank Transfer to Salary Account
  Payment Date: Last Working Day + 7 days
  ```
- Notes stored in AccountClearance.Note
- Optional but strongly recommended for audit trail
- Helps resolve disputes about FnF amount

**Feature 50: Accounts Clearance - Document Upload**
- **Field:** Account Attachment
- Type: File upload component
- Accepted formats: PDF, XLSX, DOCX (max 5 MB)
- Accounts uploads:
  - FnF statement/calculation sheet (Excel or PDF)
  - No-due certificate (signed PDF)
  - Payment advice/proof (bank transfer confirmation)
  - Tax deduction certificate (Form 16 part)
  - Approval emails for exceptions
- Single file upload (merge docs into single PDF if multiple)
- File uploaded to Azure Blob Storage: "ExitDocumentsContainer"
- File URL stored in AccountClearance.AccountAttachment
- Original filename stored in AccountClearance.FileOriginalName
- "View Document" button for preview/download
- Attachment mandatory for accounts clearance (policy)
- FnF statement must be attached for transparency
- Existing attachment replaceable by uploading new file

**Feature 51: Accounts Clearance Submission**
- After filling all fields, accounts team clicks "Submit" button
- Form validation checks:
  - FnF Status must be "Completed"
  - FnF Amount required (must be non-zero decimal)
  - Issue No Due Certificate must be "Yes"
  - Account Attachment required (FnF statement must be uploaded)
  - Notes optional but recommended
- API: AddUpdateAccountClearance
- Request payload:
  - EmployeeId: current user ID (accounts person)
  - ResignationId: resignation ID
  - FnFStatus: boolean (true)
  - FnFAmount: decimal
  - IssueNoDueCertificate: boolean (true)
  - Note: text (optional)
  - AccountAttachment: blob URL
- If new clearance: system inserts into AccountClearance with CreatedBy, CreatedOn
- If updating: system updates with ModifiedBy, ModifiedOn
- Success message: "Accounts clearance saved successfully"
- Tab indicator changes to ✓ Completed (green)
- Form becomes read-only with "Edit" button
- "Accounts No Due" badge shows as completed in resignation list
- Email notification sent to HR: "Accounts clearance completed for [Employee Name]"
- FnF payment typically processed within 7-15 days after last working day
- Employee receives FnF amount in salary account

**Feature 52: FnF Payment Processing Workflow**
- After accounts clearance submitted, payment processing initiated:
  1. Accounts team prepares payment file with employee bank details
  2. Finance Manager reviews and approves FnF amount
  3. Payment processed via bank transfer (NEFT/IMPS)
  4. Payment confirmation received from bank (typically next business day)
  5. Accounts updates payment status (external tracking, not in HRMS)
- Payment timeline:
  - Best case: Last working day + 3 business days
  - Standard: Last working day + 7 business days
  - Delayed (if disputes/issues): Last working day + 30 days
- Employee can track payment status via finance team contact
- Payment proof (bank statement entry) sent to employee email
- If FnF amount negative (employee owes company):
  - Accounts sends demand notice to employee
  - Employee must clear dues before receiving relieving letter
  - Legal action if employee does not respond

---

## Data Models (Continued)

### DepartmentClearance Entity
```
DepartmentClearance
├── Id: int (PK, Identity)
├── ResignationId: int (FK → Resignation, unique)
├── KTStatus: int (enum: Pending=1, InProgress=2, Completed=3)
├── KTNotes: nvarchar(max) - knowledge transfer documentation
├── KTUsers: nvarchar(max) - comma-separated EmployeeIds of KT recipients
├── Attachment: nvarchar(max) - blob storage URL for KT documents
├── FileOriginalName: nvarchar(max) - original filename
├── CreatedBy: nvarchar(256)
├── CreatedOn: datetime2
├── ModifiedBy: nvarchar(256)
└── ModifiedOn: datetime2
```

### ITClearance Entity
```
ITClearance
├── Id: int (PK, Identity)
├── ResignationId: int (FK → Resignation, unique)
├── AccessRevoked: bit - all system accesses revoked flag
├── AssetReturned: bit - all assets returned flag
├── AssetCondition: nvarchar(50) - condition of returned assets (Good/Fair/Damaged/Lost)
├── Note: nvarchar(max) - clearance notes
├── AttachmentUrl: nvarchar(max) - blob storage URL for documents
├── FileOriginalName: nvarchar(max) - original filename
├── ITClearanceCertification: bit - IT no-due certificate flag
├── CreatedBy: nvarchar(256)
├── CreatedOn: datetime2
├── ModifiedBy: nvarchar(256)
└── ModifiedOn: datetime2
```

### AccountClearance Entity
```
AccountClearance
├── Id: int (PK, Identity)
├── ResignationId: int (FK → Resignation, unique)
├── FnFStatus: bit (nullable) - FnF statement status
├── FnFAmount: decimal(18,2) (nullable) - net amount payable
├── IssueNoDueCertificate: bit (nullable) - no-due certificate flag
├── Note: nvarchar(max) - FnF calculation notes
├── AccountAttachment: nvarchar(max) - blob storage URL for FnF statement
├── FileOriginalName: nvarchar(max) - original filename
├── CreatedBy: nvarchar(256)
├── CreatedOn: datetime2
├── ModifiedBy: nvarchar(256)
└── ModifiedOn: datetime2
```

### KTStatus Enum
```
Pending = 1      // KT not started
InProgress = 2   // KT sessions ongoing
Completed = 3    // KT fully transferred
```

### AssetCondition Values
```
Good      // Assets in working condition, no damage
Fair      // Minor wear, fully functional
Damaged   // Significant damage, repair needed
Lost      // Asset not returned, lost by employee
```

---

## End of Part 2

**Part 2 Summary:** This document covered Department Clearance with KT tracking (8 features), IT Clearance with asset return and access revocation (9 features), and Accounts Clearance with FnF settlement (8 features). Total 25 features in Part 2.

**Next:** Part 3 will cover clearance coordination, completion workflow, exit list management, API documentation, and UI components.
