# Legacy HRMS - Resignation/Exit Flow Diagram

## Complete User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGGED IN                          │
│                    (Dashboard/Any Page)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Click Avatar/Profile  │
            │     Icon in Header     │
            └────────┬───────────────┘
                     │
                     ▼
     ┌───────────────────────────────────────┐
     │     Profile Dropdown Menu Opens       │
     │  ┌─────────────────────────────────┐  │
     │  │  • Profile                      │  │
     │  │  • Exit Portal  ←─── TARGET    │  │
     │  │  • Logout                       │  │
     │  └─────────────────────────────────┘  │
     └───────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Click "Exit Portal"       │
        │                            │
        │  Triggers API Call:        │
        │  GET /resignation/         │
        │      active-status/{id}    │
        └────────┬───────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  API Response │
         └───────┬───────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────────┐    ┌──────────────────┐
│ NO Resignation  │    │ Active           │
│ OR              │    │ Resignation      │
│ Status=Cancelled│    │ Exists           │
│ Status=Revoked  │    │                  │
└────┬────────────┘    └────┬─────────────┘
     │                      │
     ▼                      ▼
┌─────────────────────┐  ┌──────────────────────┐
│ Show Confirmation   │  │ Navigate Directly to │
│ Dialog              │  │ /profile/exit-details│
│                     │  └──────────────────────┘
│ "Are you sure you  │
│  want to resign?"  │
│                     │
│ [Cancel] [Confirm] │
└────┬────────────────┘
     │ (Click Confirm)
     ▼
┌──────────────────────────────────────┐
│     Navigate to /resignation-form    │
│                                      │
│  On Load:                            │
│  1. Verify status again (API call)  │
│  2. GET /resignation/form/{id}      │
│                                      │
└────────┬─────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────────┐
│         RESIGNATION FORM PAGE                 │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ Employee Name:    [John Doe]  (readonly)│ │
│  │ Department:       [Engineering](readonly)│ │
│  │ Reporting Manager:[Jane Smith] (readonly)│ │
│  │                                          │ │
│  │ Resignation Reason: *                    │ │
│  │ ┌────────────────────────────────────┐  │ │
│  │ │ [Text area - editable]             │  │ │
│  │ │ Max 600 chars                      │  │ │
│  │ └────────────────────────────────────┘  │ │
│  │                                          │ │
│  │      [Submit]  [Reset]                  │ │
│  └─────────────────────────────────────────┘ │
└───────────┬───────────────────────────────────┘
            │ (Click Submit)
            ▼
    ┌───────────────────┐
    │ API Call:         │
    │ POST /resignation │
    │                   │
    │ Payload:          │
    │ - employeeId      │
    │ - departmentId    │
    │ - reportingMgrId  │
    │ - jobType         │
    │ - reason          │
    └────┬──────────────┘
         │
         ▼ (Success)
┌──────────────────────────────────────────────┐
│       SUCCESS DIALOG APPEARS                 │
│                                              │
│  "Your resignation dated Nov 20, 2025       │
│   has been submitted successfully.          │
│                                              │
│   As per company exit policy, your          │
│   last working day will be Dec 20, 2025*    │
│                                              │
│   *Subject to acceptance by HR/Manager      │
│                                              │
│   Note: Leaves during notice may extend     │
│   your last working day."                   │
│                                              │
│              [OK]                            │
└────────┬─────────────────────────────────────┘
         │ (Click OK)
         ▼
┌────────────────────────────────────────────┐
│  Navigate to /profile/exit-details         │
│  (Exit Details Tab)                        │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│                PROFILE PAGE - EXIT DETAILS TAB           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Exit Details                                      │ │
│  │                                                    │ │
│  │  Name: John Doe                                   │ │
│  │  Department: Engineering                          │ │
│  │  Reporting Manager: Jane Smith                    │ │
│  │  Resignation Date: Nov 20, 2025                   │ │
│  │  Last Working Day: Dec 20, 2025                   │ │
│  │  Resignation Reason: [👁 View]  ←── Opens dialog │ │
│  │  Resignation Status: Pending 🟡                   │ │
│  │                                                    │ │
│  │  [Revoke]  [Request Early Release]                │ │
│  │   (red)         (blue - only if accepted)         │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Alternative Flows

### Flow A: Revoke Resignation

```
Exit Details Page
    │
    ▼
Click [Revoke] button
    │
    ▼
┌─────────────────────────────────┐
│  Revoke Confirmation Dialog     │
│                                 │
│  "Revoke Resignation?"          │
│                                 │
│  "Revoking will terminate       │
│   current resignation process.  │
│   Contact HR Admin for next     │
│   steps."                       │
│                                 │
│  [Cancel] [Confirm]             │
└──────┬──────────────────────────┘
       │ (Click Confirm)
       ▼
   API Call:
   POST /resignation/revoke/{id}
       │
       ▼
   Navigate to
   /profile/personal-details
   (Exit Details tab disappears)
```

### Flow B: Request Early Release

```
Exit Details Page
(Status = Accepted)
    │
    ▼
Click [Request Early Release]
    │
    ▼
┌─────────────────────────────────┐
│  Early Release Dialog           │
│                                 │
│  Early Release Date:            │
│  [Date Picker]                  │
│  (must be < Last Working Day)   │
│                                 │
│  Reason: *                      │
│  ┌───────────────────────────┐ │
│  │ [Text area]               │ │
│  └───────────────────────────┘ │
│                                 │
│  [Cancel] [Submit]              │
└──────┬──────────────────────────┘
       │ (Click Submit)
       ▼
   API Call:
   POST /resignation/early-release
       │
       ▼
   Refresh Exit Details
   (Now shows Early Release info)
```

### Flow C: View Resignation Reason

```
Exit Details Page
    │
    ▼
Click [👁 View] icon
next to Resignation Reason
    │
    ▼
┌─────────────────────────────────┐
│  Resignation Reason Dialog      │
│                                 │
│  "I am leaving because..."      │
│  (Full text displayed)          │
│                                 │
│  [Close]                        │
└─────────────────────────────────┘
```

## Status-Based UI Changes

### When Status = PENDING
```
┌────────────────────────────────┐
│ Resignation Status: Pending 🟡 │
│                                │
│ Actions Available:             │
│ • [Revoke] button visible      │
│ • Early Release: NOT available │
└────────────────────────────────┘
```

### When Status = ACCEPTED
```
┌────────────────────────────────┐
│ Resignation Status: Accepted ✅│
│                                │
│ Actions Available:             │
│ • [Revoke] button visible      │
│ • [Request Early Release]      │
│   button visible (if no prior  │
│   early release request)       │
└────────────────────────────────┘
```

### When Status = CANCELLED
```
┌────────────────────────────────┐
│ Resignation Status: Cancelled ❌│
│ [👁 View Rejection Reason]    │
│                                │
│ Actions Available:             │
│ • Can initiate NEW resignation │
│ • Exit Details tab still shows │
│   historical data              │
└────────────────────────────────┘
```

### When Status = REVOKED
```
┌────────────────────────────────┐
│ Resignation Status: Revoked 🔄 │
│                                │
│ Actions Available:             │
│ • Can initiate NEW resignation │
│ • Exit Details tab still shows │
│   historical data              │
└────────────────────────────────┘
```

## Profile Page Tab Visibility Logic

```
Profile Page Load
    │
    ▼
Check Resignation Status API
    │
    ├── NULL response
    │   └─► Exit Details Tab: HIDDEN
    │
    ├── ANY status (pending/accepted/cancelled/revoked)
    │   └─► Exit Details Tab: VISIBLE
    │
    └── Feature Flag: enableExitEmployee = false
        └─► Exit Details Tab: HIDDEN
```

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────┐
│                      Header (Layout)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ProfileTab Component                            │  │
│  │  • Shows dropdown menu                           │  │
│  │  • Contains "Exit Portal" button                 │  │
│  │  • Fetches resignation status on click           │  │
│  │  • Shows confirmation dialog                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              ResignationForm Component                   │
│  • Loads employee data from API                         │
│  • Validates status before showing form                 │
│  • Handles form submission                              │
│  • Shows success dialog with date calculations          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Profile Page Component                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │  EmployeeTabs Component                           │ │
│  │  • Dynamically builds tab list                    │ │
│  │  • Shows Exit Details tab if resignation exists  │ │
│  │  • Controlled by feature flag                    │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              ExitDetails Component                       │
│  • Displays resignation information                     │
│  • Shows status-based action buttons                    │
│  • Handles revoke functionality                         │
│  • Manages early release requests                       │
│  • View dialogs for reasons                             │
└─────────────────────────────────────────────────────────┘
```

## API Call Sequence

```
User Journey Step                    API Calls Made
─────────────────────────────────────────────────────────
1. Click "Exit Portal"          →    GET /resignation/active-status/{id}
                                     
2. Confirm resignation dialog   →    (No API call)

3. Load resignation form        →    GET /resignation/active-status/{id}
                                     GET /resignation/form/{id}

4. Submit resignation           →    POST /resignation

5. Navigate to exit details     →    GET /resignation/exit-details/{id}

6. Click Revoke button          →    POST /resignation/revoke/{id}

7. Request early release        →    POST /resignation/early-release

8. View on profile page load    →    GET /resignation/active-status/{id}
                                     (to determine tab visibility)
```

## Dialog Types Summary

| Dialog Name | Trigger | Type | Purpose |
|-------------|---------|------|---------|
| Resignation Confirmation | Click Exit Portal (when can initiate) | Confirmation | Confirm intent to resign |
| Resignation Success | After form submission | Information | Show dates and policy |
| Reason Preview | Click view icon | Modal | Display full resignation reason |
| Rejection Reason Preview | Click view icon (cancelled status) | Modal | Display HR/Manager rejection reason |
| Early Release Request | Click Request Early Release | Form | Submit early release request |
| Early Release Rejection | Click view icon (rejected early release) | Modal | Display rejection reason |
| Revoke Confirmation | Click Revoke button | Confirmation | Confirm revoke action |

## Key Validation Rules

1. **Can Initiate New Resignation:**
   - No existing resignation, OR
   - Previous resignation status is "cancelled" or "revoked"

2. **Can Revoke Resignation:**
   - Status is "pending" OR "accepted"
   - Last working day is today or in future

3. **Can Request Early Release:**
   - Status is "accepted"
   - No previous early release request exists

4. **Form Validation:**
   - Resignation reason: Required, max 500-600 chars
   - Early release date: Must be before last working day
   - Early release reason: Required

## Permission Requirements

- **Employee Self-Service:** User can manage own resignation
- **Admin Access:** Requires `EMPLOYEES.READ` permission to view/manage other employees
- **Feature Flag:** `enableExitEmployee` must be true for entire flow
