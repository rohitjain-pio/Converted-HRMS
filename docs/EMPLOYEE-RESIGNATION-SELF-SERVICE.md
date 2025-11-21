# Employee Resignation Self-Service Feature

## Overview
Complete implementation of employee self-service resignation functionality matching the legacy application behavior. Employees can submit, view, and manage their resignations directly from their profile menu.

## Implementation Date
Date: 2024

## Features Implemented

### 1. Profile Menu Integration (AppHeader.vue)
- Added "Exit / Resignation" menu item in user profile dropdown
- Icon: `mdi-logout-variant`
- Smart navigation logic:
  - Checks if employee has existing resignation via `isResignationExist` API
  - If resignation exists: Navigates to `/profile?tab=exit-details`
  - If no resignation: Shows confirmation dialog, then navigates to `/resignation` form

### 2. Profile Page with Tabs (ProfilePage.vue)
**Path:** `/profile`

**Tabs:**
- Personal Details (placeholder)
- Employment Details (placeholder)
- Official Details (placeholder)
- Exit Details (conditional - only visible when resignation exists)

**Features:**
- Dynamic tab visibility based on resignation status
- URL query parameter support (`?tab=exit-details`)
- Auto-loads resignation status on mount
- Route watcher for tab switching via URL

### 3. Resignation Submission Form (EmployeeResignationPage.vue)
**Path:** `/resignation`

**Features:**
- Auto-fetches and displays employee details (read-only):
  - Employee Name
  - Employee ID
  - Email
  - Department
  - Designation
- Resignation reason textarea (10-500 characters required)
- Exit discussion checkbox (optional)
- Notice period calculation display
- Success dialog with resignation ID
- Auto-navigation to profile Exit Details tab after submission

**Validations:**
- Minimum 10 characters for reason
- Maximum 500 characters for reason
- Form submit disabled until valid

### 4. Exit Details Tab (ExitDetailsTab.vue)
**Location:** Embedded in ProfilePage as a tab

**Sections:**

#### Status Timeline
- Visual timeline with 4 stages:
  1. Submitted (with submission date)
  2. Under Review (manager approval)
  3. Clearance Process (HR, Dept, IT, Accounts)
  4. Completion (last working day)
- Dynamic status indicators (completed/pending)

#### Resignation Information
- Status badge with color coding:
  - Warning (Yellow): Pending (Status = 1)
  - Success (Green): Accepted (Status = 2)
  - Error (Red): Rejected (Status = 3)
  - Grey: Revoked/Other (Status = 4)
- Submission date
- Last working day (highlighted)
- Early release date (if requested)
- Resignation reason in card

#### Action Buttons
- **Revoke Resignation**: Available only for pending resignations (Status = 1)
- **Request Early Release**: Available for accepted resignations (Status = 2) without existing early release request
- **View Full Details**: Navigates to detailed resignation page

#### Clearance Status Cards
Displays for accepted resignations (Status = 2):
- HR Clearance (ExitInterviewStatus)
- Department Clearance (KTStatus)
- IT Clearance (ITDues)
- Accounts Clearance (AccountNoDue)

Each card shows:
- Icon (check/clock)
- Status (Completed/Pending)
- Color coding (green/grey)

### 5. Resignation Details Page (ResignationDetailsPage.vue)
**Path:** `/resignation/details/:id`

Comprehensive view with all resignation details, timeline, clearance status, and actions. Accessed via "View Full Details" button from Exit Details tab.

## API Integration

### Endpoints Used

1. **Check Resignation Exists**
   - Endpoint: `GET /api/exit-employee/isResignationExist`
   - Used by: AppHeader, ProfilePage
   - Returns: `{ Exists: boolean, ResignationId: number }`

2. **Get Resignation Form Data**
   - Endpoint: `GET /api/exit-employee/getResignationForm`
   - Used by: EmployeeResignationPage
   - Returns: Employee details for form pre-population

3. **Submit Resignation**
   - Endpoint: `POST /api/exit-employee/addResignation`
   - Used by: EmployeeResignationPage
   - Payload: `{ Reason: string, ExitInterviewGiven: boolean }`

4. **Get Resignation Details**
   - Endpoint: `GET /api/exit-employee/getResignationDetails/:id`
   - Used by: ExitDetailsTab, ResignationDetailsPage
   - Returns: Full resignation object

5. **Revoke Resignation**
   - Endpoint: `POST /api/exit-employee/revokeResignation/:id`
   - Used by: ExitDetailsTab
   - Action: Revokes pending resignation

6. **Request Early Release**
   - Endpoint: `POST /api/exit-employee/requestEarlyRelease`
   - Used by: ExitDetailsTab
   - Payload: `{ ResignationId: number, EarlyReleaseDate: string }`

## Store Usage

**resignationStore** (stores/resignationStore.ts)
- `currentResignation`: Stores active resignation data
- `checkResignationExists(employeeId)`: Check if resignation exists
- `fetchResignation(id)`: Load resignation details
- `submitResignation(data)`: Submit new resignation
- State management for resignation lifecycle

## Navigation Flow

### Flow 1: New Resignation
1. User clicks "Exit / Resignation" in profile menu (AppHeader)
2. API checks if resignation exists → No
3. Shows confirmation dialog "Are you sure you want to initiate resignation?"
4. User clicks "Proceed" → Navigates to `/resignation`
5. User fills form and submits
6. Success dialog shows resignation ID
7. Auto-navigates to `/profile?tab=exit-details`

### Flow 2: Existing Resignation
1. User clicks "Exit / Resignation" in profile menu (AppHeader)
2. API checks if resignation exists → Yes
3. Directly navigates to `/profile?tab=exit-details`
4. Exit Details tab shows resignation status and details

### Flow 3: View Full Details
1. User is on ProfilePage Exit Details tab
2. Clicks "View Full Details" button
3. Navigates to `/resignation/details/:id`
4. Shows comprehensive resignation page

### Flow 4: Revoke Resignation
1. User is on Exit Details tab with pending resignation
2. Clicks "Revoke Resignation" button
3. Confirms action in browser alert
4. API revokes resignation
5. Success snackbar shown
6. Resignation data reloaded (status updated)

### Flow 5: Request Early Release
1. User is on Exit Details tab with accepted resignation
2. Clicks "Request Early Release" button
3. Dialog opens with date picker
4. Selects desired early release date
5. Submits request
6. Success snackbar shown
7. Resignation data reloaded (early release date added)

## Database Fields Used

### Resignation Table
- `ResignationId`: Primary key
- `EmployeeId`: Foreign key to employee
- `Status`: 1=Pending, 2=Accepted, 3=Rejected, 4=Revoked
- `Reason`: Resignation reason text
- `CreatedOn`: Submission timestamp
- `LastWorkingDay`: Calculated/set last working day
- `EarlyReleaseDate`: Requested early release date
- `EarlyReleaseStatus`: Status of early release request
- `RejectEarlyReleaseReason`: Reason if early release rejected
- `ExitInterviewStatus`: HR clearance status (boolean)
- `KTStatus`: Department/Knowledge Transfer clearance (boolean)
- `ITDues`: IT clearance status (boolean)
- `AccountNoDue`: Accounts clearance status (boolean)
- `ExitInterviewGiven`: Whether exit interview given (boolean)

## Backend Changes

### AdminExitEmployeeController.php
**Fixed Issues:**
- Department display: Now uses `employment_details.department_id`
- Branch display: Now uses `employment_details.branch_id` with branchMap
- BranchMap added: `[401 => 'Hyderabad', 402 => 'Jaipur', 403 => 'Pune']`
- Reporting Manager: Fixed column name typo `reporting_manger_id`
- Eager loading: Added `employee.employmentDetail` relationship

## UI/UX Features

### Design Elements
- Material Design 3 (Vuetify 3)
- Responsive layout (mobile-friendly)
- Color-coded status badges
- Timeline visualization
- Icon-based clearance cards
- Loading states with progress indicators
- Error handling with alerts
- Success feedback with snackbars
- Confirmation dialogs for critical actions

### Accessibility
- Proper contrast ratios for status colors
- Icon + text labels for clarity
- Keyboard navigation support (Vuetify default)
- Clear action button labels

## Testing Checklist

### Navigation Tests
- [ ] Click "Exit / Resignation" without existing resignation → Shows dialog
- [ ] Click "Proceed" in dialog → Navigates to resignation form
- [ ] Click "Exit / Resignation" with existing resignation → Goes to profile exit-details tab
- [ ] Profile menu "My Profile" → Opens profile page
- [ ] Exit Details tab only visible when resignation exists

### Form Tests
- [ ] Resignation form pre-populates employee details correctly
- [ ] Cannot submit with reason < 10 characters
- [ ] Cannot submit with reason > 500 characters
- [ ] Form submits successfully with valid data
- [ ] Success dialog shows resignation ID
- [ ] Auto-navigates to profile exit-details tab after submit

### Exit Details Tab Tests
- [ ] Timeline shows correct status progression
- [ ] Status badge shows correct color and label
- [ ] Dates display correctly formatted
- [ ] Reason displays in card
- [ ] "Revoke" button only shows for pending resignations
- [ ] "Request Early Release" button only shows for accepted resignations without early release
- [ ] "View Full Details" button navigates to resignation details page

### Action Tests
- [ ] Revoke resignation shows confirmation → Revokes successfully → Shows success snackbar
- [ ] Early release request dialog opens → Date selection works → Submits successfully
- [ ] Early release request updates resignation data (shows early release date)
- [ ] Clearance status cards show correct states for accepted resignations

### Error Handling Tests
- [ ] Network error during resignation check shows error message
- [ ] Network error during form submit shows error message
- [ ] Invalid resignation ID shows error in details view
- [ ] API errors show snackbar with error message

## Legacy Compatibility

Matches legacy application behavior:
- ✅ Profile has Exit Details tab (conditional visibility)
- ✅ Exit menu item in profile dropdown
- ✅ Checks resignation status before navigation
- ✅ Navigates to profile exit-details tab instead of separate page
- ✅ Exit Details tab shows resignation info, status, timeline
- ✅ Actions available (revoke, early release) based on status
- ✅ Proper flow and popups
- ✅ Database connections intact

## File Structure

```
hrms-frontend/src/
├── components/
│   ├── layout/
│   │   └── AppHeader.vue (Exit menu integration)
│   └── employees/
│       └── tabs/
│           └── ExitDetailsTab.vue (Resignation details in tab)
├── views/
│   └── employees/
│       ├── ProfilePage.vue (Tabbed profile page)
│       ├── EmployeeResignationPage.vue (Resignation form)
│       └── ResignationDetailsPage.vue (Full details view)
├── stores/
│   └── resignationStore.ts (State management)
├── api/
│   └── exitEmployeeApi.ts (API methods)
└── router/
    └── index.ts (Route definitions)
```

## Routes Added

```typescript
{
  path: '/profile',
  name: 'Profile',
  component: ProfilePage,
  meta: { requiresAuth: true, title: 'My Profile' }
},
{
  path: '/resignation',
  name: 'EmployeeResignation',
  component: EmployeeResignationPage,
  meta: { requiresAuth: true, title: 'Submit Resignation' }
},
{
  path: '/resignation/details/:id',
  name: 'ResignationDetails',
  component: ResignationDetailsPage,
  meta: { requiresAuth: true, title: 'Resignation Details' }
}
```

## Known Issues
None reported.

## Future Enhancements
1. Implement Personal Details tab content
2. Implement Employment Details tab content
3. Implement Official Details tab content
4. Add email notifications for resignation status changes
5. Add document upload for resignation (if required)
6. Add manager approval workflow UI (if needed)
7. Add resignation withdrawal history/audit trail

## Support
For issues or questions, contact the development team.
