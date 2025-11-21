# Legacy HRMS - Resignation/Exit Flow Analysis

## Analysis Date
November 20, 2025

## Application Details
- **Frontend URL**: http://localhost:5173
- **Backend API**: http://localhost:5281/api/
- **Technology**: Vite + React + TypeScript + Material-UI

---

## Code Analysis Results

### 1. NAVIGATION FLOW

#### Entry Points to Resignation Flow

**A. Via Profile Avatar Menu (ProfileTab.tsx)**
- User clicks on avatar/profile icon in header
- Dropdown menu appears with three options:
  1. **Profile** - Navigate to profile page
  2. **Exit Portal** - Triggers resignation check
  3. **Logout** - Logs out user

**Exit Portal Button Behavior:**
```typescript
// When Exit Portal is clicked:
1. Calls API: getResignationActiveStatus(userId)
2. Checks if user has active resignation:
   - If NO resignation OR resignation is (cancelled/revoked):
     → Shows confirmation dialog
   - If ACTIVE resignation exists:
     → Navigates directly to /profile/exit-details
```

**B. Via Profile Page Link**
- On Personal Details tab, there's a link: "Click Here to get Resignation Form"
- Same logic as Exit Portal button

---

### 2. RESIGNATION STATUS CHECK

**API Endpoint:** `GET /api/resignation/active-status/{userId}`

**Response Structure:**
```typescript
{
  resignationStatus: "pending" | "accepted" | "cancelled" | "revoked" | null
}
```

**Status Logic:**
- `null` = No resignation exists → Can initiate new
- `cancelled` or `revoked` = Previous resignation ended → Can initiate new
- `pending` or `accepted` = Active resignation → Cannot initiate new, show details

---

### 3. RESIGNATION INITIATION FLOW

#### Step 1: Confirmation Dialog
When user can initiate resignation, dialog appears:

**Dialog Content:**
- **Title**: "Are you sure you want to resign?"
- **Message**: "Submitting your resignation will start the exit process, including notice period calculation and final approvals."
- **Buttons**: 
  - Cancel (closes dialog)
  - Confirm (navigates to resignation form)

#### Step 2: Resignation Form Page
**URL Pattern:** 
- Own resignation: `/resignation-form`
- For other employee (admin): `/resignation-form/{userId}`

**Form Fields (Read-only):**
1. Employee Name (pre-filled, disabled)
2. Department (pre-filled, disabled)
3. Reporting Manager (pre-filled, disabled)
4. **Resignation Reason** (editable, required, multiline, max 600 chars)

**API Calls on Load:**
1. `getResignationActiveStatus(userId)` - Verify can initiate
2. `getResignationForm(userId)` - Get employee details

**Validation:**
```typescript
resignationReason: 
  - Required
  - Max 500 characters
  - Trimmed
```

#### Step 3: Form Submission
**API Call:** `POST /api/resignation`

**Request Payload:**
```typescript
{
  employeeId: number,
  departmentId: number,
  reportingManagerId: number,
  jobType: string,
  reason: string
}
```

**On Success:**
1. Shows success dialog with calculated dates
2. Dialog includes:
   - Resignation Date (submission date)
   - Calculated Last Working Day (based on job type)
   - Notice about leave affecting last working day
3. OK button navigates to `/profile/exit-details`

**Last Working Day Calculation:**
- Based on `jobType` from employee data
- Uses `calculateLastWorkingDay()` utility function
- Considers company exit policy

---

### 4. EXIT DETAILS TAB VISIBILITY

**Location:** Profile page tabs

**Visibility Logic:**
```typescript
displayExitDetailsTab = resignationStatusData !== null
```

**Tab appears when:**
- Employee has ANY resignation record (pending, accepted, cancelled, revoked)

**Tab hidden when:**
- No resignation record exists

**Feature Flag:** `enableExitEmployee` must be enabled

---

### 5. EXIT DETAILS PAGE STRUCTURE

**URL Patterns:**
- Own profile: `/profile/exit-details`
- Other employee: `/profile/exit-details?employeeId={id}`

**API Call:** `GET /api/resignation/exit-details/{userId}`

**Displayed Information:**

| Field | Description |
|-------|-------------|
| Name | Employee name |
| Department | Department name |
| Reporting Manager | Manager name |
| Resignation Date | Date when resignation was submitted |
| Last Working Day | Calculated last working day |
| Resignation Reason | View button with icon (opens dialog) |
| Resignation Status | Status label with badge (Pending/Accepted/Cancelled/Revoked) |
| Rejection Reason | View button (only if status = cancelled) |

**Early Release Section** (conditionally shown):
- Appears if early release was requested
- Shows:
  - Early Release Date
  - Early Release Status (Pending/Approved/Rejected)
  - Rejection Reason (if rejected)

**Action Buttons:**

1. **Revoke Button** (shown when):
   - Status is "Pending" OR "Accepted"
   - Last Working Day is today or in future
   - Button label: "Revoke" (outlined, red)
   - API Call: `POST /api/resignation/revoke/{resignationId}`
   - After revoke: Redirects to Personal Details tab

2. **Request Early Release Button** (shown when):
   - Status is "Accepted"
   - No early release request exists yet
   - Button label: "Request Early Release" (contained, primary)
   - Opens dialog with date picker

**Progress Stepper** (currently disabled):
- Feature flag: `isEnableProgress = false`
- Would show: Pending → Manager Approved → HR Approved → Completed

---

### 6. RESIGNATION STATUSES

**Available Statuses:**

```typescript
enum ResignationStatus {
  pending = "RESIGNED_PENDING",
  accepted = "RESIGNED_ACCEPTED", 
  cancelled = "RESIGNED_CANCELLED",
  revoked = "RESIGNED_REVOKED"
}
```

**Status Labels:**
- `RESIGNED_PENDING` → "Resignation Pending"
- `RESIGNED_ACCEPTED` → "Resignation Accepted"
- `RESIGNED_CANCELLED` → "Resignation Cancelled"
- `RESIGNED_REVOKED` → "Resignation Revoked"

---

### 7. EARLY RELEASE FLOW

**Trigger:** User clicks "Request Early Release" on Exit Details page

**Dialog Opens with:**
- Early Release Date picker
- Reason text field (multiline, required)

**Validation:**
- Early release date must be before Last Working Day
- Reason is required

**API Call:** `POST /api/resignation/early-release`

**Payload:**
```typescript
{
  resignationId: number,
  earlyReleaseDate: string,
  reason: string
}
```

**Early Release Statuses:**
- `EARLY_RELEASE_PENDING`
- `EARLY_RELEASE_APPROVED`
- `EARLY_RELEASE_REJECTED`

---

### 8. ADMIN ACCESS TO EMPLOYEE EXIT

**Admin Routes:**
- `/employees/employee-exit` - List of all employees with resignations
- `/employees/employee-exit/{resignationId}` - Exit details for specific resignation

**Feature Guard:** `enableExitEmployee` feature flag

**Permissions Required:** `EMPLOYEES.READ`

---

### 9. KEY API ENDPOINTS

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/resignation/active-status/{userId}` | Check if user has active resignation |
| GET | `/api/resignation/form/{userId}` | Get employee data for resignation form |
| POST | `/api/resignation` | Submit new resignation |
| GET | `/api/resignation/exit-details/{userId}` | Get exit details for employee |
| POST | `/api/resignation/revoke/{resignationId}` | Revoke resignation |
| POST | `/api/resignation/early-release` | Request early release |

---

### 10. DIALOG/POPUP BEHAVIORS

#### A. Resignation Confirmation Dialog
- **Trigger:** Click "Exit Portal" when can initiate new resignation
- **Type:** Confirmation Dialog
- **Buttons:** Cancel, Confirm
- **Action:** Navigate to `/resignation-form` on confirm

#### B. Resignation Success Dialog
- **Trigger:** After successful resignation submission
- **Type:** Information Dialog
- **Content:** Resignation date, last working day, policy notice
- **Buttons:** OK
- **Action:** Navigate to `/profile/exit-details` on OK

#### C. Resignation Reason Preview Dialog
- **Trigger:** Click view icon on Exit Details page
- **Type:** Modal Dialog
- **Content:** Full resignation reason text
- **Buttons:** Close

#### D. Rejection Reason Preview Dialog
- **Trigger:** Click view icon next to cancelled status
- **Type:** Modal Dialog
- **Content:** Rejection reason from HR/Manager
- **Buttons:** Close

#### E. Early Release Request Dialog
- **Trigger:** Click "Request Early Release" button
- **Type:** Form Dialog
- **Fields:** Early Release Date (date picker), Reason (textarea)
- **Buttons:** Cancel, Submit
- **Validation:** Date must be before last working day, reason required

#### F. Revoke Resignation Dialog
- **Trigger:** Click "Revoke" button
- **Type:** Confirmation Dialog
- **Content:** Warning about terminating resignation process
- **Buttons:** Cancel, Confirm
- **Action:** Call revoke API and redirect to Personal Details

---

### 11. PROFILE PAGE TAB STRUCTURE

**Tabs Available:**
1. Personal Details
2. Official Details
3. Employment Details
4. Education Details
5. Nominee Details
6. Certificate Details
7. IT Asset Details (feature flag)
8. **Exit Details** (shown only if resignation exists, feature flag)

**Tab Permissions:** Each tab has READ permission check

---

### 12. URL NAVIGATION SUMMARY

```
1. User clicks Avatar → Exit Portal
   ↓
2. Check resignation status API
   ↓
3a. NO active resignation
    → Show confirmation dialog
    → Confirm
    → /resignation-form
    → Submit form
    → Success dialog
    → /profile/exit-details

3b. ACTIVE resignation exists
    → /profile/exit-details directly

4. On Exit Details page:
   - Can view resignation info
   - Can revoke (if pending/accepted)
   - Can request early release (if accepted)
   - Can view rejection reasons
```

---

## Summary of Findings

### Critical Flow Points:

1. **Double Check System**: App checks resignation status BEFORE showing form and AFTER clicking Exit Portal
2. **Feature Flag Gated**: Entire exit feature controlled by `enableExitEmployee` flag
3. **Permission Based**: Admin can view/manage other employees' resignations
4. **Status-Driven UI**: Different buttons/options based on resignation status
5. **Calculation Logic**: Last working day calculated based on job type
6. **Revoke Window**: Can only revoke if last working day hasn't passed
7. **Early Release**: Additional feature available after acceptance

### User Experience Flow:

```
Profile Avatar Menu
    ↓
Exit Portal Button (checks status)
    ↓
IF can initiate → Confirmation Dialog → Resignation Form
IF cannot → Direct to Exit Details Tab
    ↓
Form Submission
    ↓
Success Dialog (with dates)
    ↓
Exit Details Tab (now visible in profile)
    ↓
Actions: Revoke OR Request Early Release
```

---

## Testing Recommendations

To properly test this flow with Playwright:

1. **Setup Test User**: Create employee with appropriate permissions
2. **Test Scenarios:**
   - First time resignation (no prior record)
   - Second resignation attempt (should block if active)
   - Resignation after revoke (should allow)
   - Admin viewing other employee's resignation
   - Revoke functionality
   - Early release request
   - Date calculations
   - Dialog behaviors
   - Tab visibility logic

3. **API Mocking**: May need to mock backend responses if backend not running

---

## Notes

- Backend API (port 5281) was NOT running during analysis
- Frontend (port 5173) IS running
- Analysis based on source code examination
- Actual UI testing would require backend to be operational
- Screenshots could not be captured without functional backend
