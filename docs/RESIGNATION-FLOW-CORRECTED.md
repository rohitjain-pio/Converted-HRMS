# Resignation Flow - Corrected Implementation

## Overview
This document describes the **correct resignation flow** based on the legacy .NET application, which has now been properly implemented in the Vue.js frontend.

## Legacy vs Previous Implementation

### ❌ Previous Incorrect Understanding
- Thought there was NO resignation form page
- Direct popup submission creates resignation

### ✅ Actual Legacy Flow
1. User clicks "Exit Portal" from profile menu
2. System calls `IsResignationExist` API
3. **If can initiate new resignation:**
   - Show confirmation dialog: "Are you sure you want to resign?"
   - If confirmed → Navigate to `/resignation-form` page
   - User fills resignation reason (required field)
   - On submit → Create resignation in database
   - Show success dialog with dates
   - Navigate to `/profile?tab=exit-details`
4. **If resignation already exists:**
   - Navigate directly to `/profile?tab=exit-details`

## Corrected Implementation

### 1. Exit Portal Menu (AppHeader.vue)
**Location:** `hrms-frontend/src/components/layout/AppHeader.vue`

**Functionality:**
```typescript
const handleExitClick = async () => {
  // Check resignation status via API
  const response = await exitEmployeeApi.isResignationExist(user.value.id);
  
  const canInitiateNew = !resignationData?.Exists || 
                         resignationData?.ResignationStatus === 4 || // Revoked
                         resignationData?.ResignationStatus === 3;   // Rejected
  
  if (canInitiateNew) {
    // Show confirmation dialog
    showResignationDialog.value = true;
  } else {
    // Navigate to exit details (active resignation exists)
    router.push('/profile?tab=exit-details');
  }
};
```

**Confirmation Dialog:**
- Title: "Are you sure you want to resign?"
- Message: "Submitting your resignation will start the exit process..."
- Actions: Cancel / Confirm
- On Confirm: Navigate to `/resignation-form`

### 2. Resignation Form Page
**Location:** `hrms-frontend/src/views/resignation/EmployeeResignationPage.vue`

**Form Fields:**
- Employee Name (read-only, from API)
- Department (read-only, from API)
- Reporting Manager (read-only, from API)
- Job Type (read-only, from API)
- **Resignation Reason** (required, 10-500 characters)
- Exit Discussion checkbox (optional)

**Submission Flow:**
```typescript
const handleSubmit = async () => {
  // Validate form
  if (!formValid) return;
  
  // Submit to AddResignation API
  const response = await exitEmployeeApi.addResignation({
    EmployeeId: user.value.id,
    Reason: formData.value.reason
  });
  
  // Show success dialog with resignation details
  submittedResignation.value = response.data.Data;
  showSuccessDialog.value = true;
};
```

**Success Dialog:**
- Shows resignation date (CreatedOn)
- Shows calculated last working day
- Note about LWD changes with leave
- Button: "OK" → Navigate to `/profile?tab=exit-details`

### 3. Profile Page with Exit Details Tab
**Location:** `hrms-frontend/src/views/profile/ProfilePage.vue`

**Tab Visibility Logic:**
```typescript
const checkResignationStatus = async () => {
  const response = await exitEmployeeApi.isResignationExist(user.value.id);
  
  // Show Exit Details tab if ANY resignation exists
  hasResignation.value = resignationData?.Exists === true;
};
```

**Exit Details Tab:**
- Shows resignation information
- Shows clearance status (IT, HR, Department, Account)
- Options: Revoke resignation (if pending)
- Document upload section
- Progress stepper

## API Endpoints Used

### IsResignationExist (GET)
**Endpoint:** `/api/ExitEmployee/IsResignationExist/{employeeId}`

**Response:**
```json
{
  "StatusCode": 200,
  "Data": {
    "Exists": true,
    "ResignationId": 1,
    "ResignationStatus": 1,  // 1=Pending, 2=Accepted, 3=Rejected, 4=Revoked
    "Status": "RESIGNED_PENDING"
  }
}
```

**Logic:**
- `Exists: false` → User can initiate new resignation
- `Exists: true` with Status 3 (Rejected) or 4 (Revoked) → Can initiate new
- `Exists: true` with Status 1 (Pending) or 2 (Accepted) → Show exit details

### GetResignationForm (GET)
**Endpoint:** `/api/ExitEmployee/GetResignationForm/{employeeId}`

**Response:** Returns employee details for form:
```json
{
  "StatusCode": 200,
  "Data": {
    "employeeId": 6,
    "employeeName": "Rohit Jain",
    "departmentId": 1,
    "departmentName": "Engineering",
    "reportingManagerId": 5,
    "reportingManagerName": "John Manager",
    "jobType": 3
  }
}
```

### AddResignation (POST)
**Endpoint:** `/api/ExitEmployee/AddResignation`

**Request Body:**
```json
{
  "EmployeeId": 6,
  "Reason": "Better opportunity for career growth"
}
```

**Response:**
```json
{
  "StatusCode": 200,
  "Message": "Resignation submitted successfully",
  "Data": {
    "Id": 2,
    "EmployeeId": 6,
    "CreatedOn": "2025-01-20T10:30:00",
    "LastWorkingDay": "2025-03-21",  // 60 days for confirmed employees
    "Status": 1,
    "IsActive": 1
  }
}
```

## Backend Implementation Notes

### Fixed Issues (Already Implemented)
1. ✅ Model import: `Employment` → `EmploymentDetail`
2. ✅ Column names: `EmployeeId` → `employee_id`, etc.
3. ✅ IsActive field: Changed from boolean `true` to integer `1`
4. ✅ Reporting manager access: Load via `employmentDetail` relationship
5. ✅ Validation rules: Corrected table/column names

### Last Working Day Calculation
- **Probation (JobType=1):** CreatedOn + 15 days
- **Training (JobType=2):** CreatedOn + 15 days  
- **Confirmed (JobType=3):** CreatedOn + 60 days

**Controller:** `app/Http/Controllers/ExitEmployeeController.php`
**Service:** `app/Services/ExitEmployeeService.php`

## Testing the Flow

### Test Scenario 1: New Resignation Submission
1. Login as employee (e.g., Rohit.Jain@programmers.ai)
2. Click profile icon → "Exit Portal"
3. **Expected:** Confirmation dialog appears
4. Click "Confirm"
5. **Expected:** Navigate to `/resignation-form`
6. Fill resignation reason (min 10 chars)
7. Click "Submit Resignation"
8. **Expected:** Success dialog shows with dates
9. Click "OK"
10. **Expected:** Navigate to `/profile?tab=exit-details`
11. **Expected:** Exit Details tab shows resignation info

### Test Scenario 2: Existing Active Resignation
1. Login as employee with active resignation
2. Click profile icon → "Exit Portal"
3. **Expected:** NO confirmation dialog
4. **Expected:** Navigate directly to `/profile?tab=exit-details`

### Test Scenario 3: Revoked Resignation
1. Employee with revoked resignation
2. Click profile icon → "Exit Portal"
3. **Expected:** Confirmation dialog appears (can initiate new)
4. Can submit new resignation

## Database Verification

### Check Resignation Created
```sql
SELECT * FROM resignation WHERE EmployeeId = 6;
```

**Expected after submission:**
- Id: New auto-increment ID
- EmployeeId: 6
- Status: 1 (Pending)
- IsActive: 1 (Active)
- CreatedOn: Current timestamp
- LastWorkingDay: Calculated date
- Reason: User's input

### Check Resignation History
```sql
SELECT * FROM resignation_history WHERE ResignationId = [new_id];
```

**Expected:**
- ResignationId: Matches resignation.Id
- Status: 1 (Pending)
- UpdatedOn: Current timestamp
- UpdatedBy: Current user ID

## Key Differences from Previous Implementation

### Before (Incorrect)
- Exit menu directly navigated to profile tab
- No confirmation dialog
- Unclear user flow

### After (Correct - Matching Legacy)
- Exit menu checks resignation status first
- Shows confirmation dialog for new resignations
- Clear separation: popup → form → success → details
- Matches React legacy flow exactly

## File Changes Summary

1. **AppHeader.vue** - Added confirmation dialog and proper navigation logic
2. **Backend Already Fixed:**
   - ExitEmployeeController.php
   - ExitEmployeeService.php
   - Resignation.php model

## Success Criteria

✅ User can click "Exit Portal" from menu
✅ Confirmation dialog appears for new resignation
✅ Navigation to resignation form page works
✅ Form submission creates resignation in DB
✅ Success dialog shows resignation and last working day
✅ Exit Details tab appears in profile after submission
✅ User with existing resignation navigates directly to details

---

**Last Updated:** January 20, 2025
**Status:** ✅ Implementation Complete & Tested
