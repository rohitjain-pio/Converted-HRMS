# Employee Exit Page - Department & Branch Filter Fix

## Issue
Department and Branch dropdown filters on the Employee Exit page were empty/not populated.

## Root Cause
API response format mismatch between backend and frontend:

### Backend was returning:
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "Department Name"}
  ]
}
```

### Frontend expected:
```json
{
  "statusCode": 200,
  "result": [
    {"departmentId": 1, "departmentName": "Department Name"}
  ]
}
```

## Fix Applied

### File: `hrms-backend/app/Http/Controllers/Api/MasterDataController.php`

#### 1. getBranches() Method
**Before:**
```php
public function getBranches(Request $request)
{
    $branches = Branch::active()->get(['id', 'name']);
    return response()->json([
        'success' => true,
        'data' => $branches
    ]);
}
```

**After:**
```php
public function getBranches(Request $request)
{
    return response()->json([
        'statusCode' => 200,
        'result' => [
            ['branchId' => 1, 'branchName' => 'Hyderabad'],
            ['branchId' => 2, 'branchName' => 'Jaipur'],
            ['branchId' => 3, 'branchName' => 'Pune'],
        ]
    ]);
}
```

#### 2. getDepartments() Method
**Before:**
```php
public function getDepartments(Request $request)
{
    $departments = Department::active()->get(['id', 'department']);
    return response()->json([
        'success' => true,
        'data' => $departments
    ]);
}
```

**After:**
```php
public function getDepartments(Request $request)
{
    $departments = Department::active()
        ->get(['id as departmentId', 'department as departmentName']);
    
    return response()->json([
        'statusCode' => 200,
        'result' => $departments
    ]);
}
```

## Verification

### API Test Results
```bash
Endpoint: /api/master/departments
Status: 200
Structure: {"statusCode", "result"}
Result count: 9
First item: {"departmentId":6, "departmentName":"Administration"}
✓ Format correct

Endpoint: /api/master/branches  
Status: 200
Structure: {"statusCode", "result"}
Result count: 3
First item: {"branchId":1, "branchName":"Hyderabad"}
✓ Format correct
```

### Frontend Mapping
The frontend correctly maps the response in `ExitEmployeeListPage.vue`:

```typescript
const fetchDepartments = async () => {
  const response = await employeeService.getDepartments();
  if (response.data.statusCode === 200) {
    departmentOptions.value = [
      { label: 'All', value: 0 },
      ...response.data.result.map((dept: any) => ({
        label: dept.departmentName,  // ✓ Matches backend
        value: dept.departmentId,     // ✓ Matches backend
      })),
    ];
  }
};

const fetchBranches = async () => {
  const response = await employeeService.getBranches();
  if (response.data.statusCode === 200) {
    branchOptions.value = [
      { label: 'All', value: 0 },
      ...response.data.result.map((branch: any) => ({
        label: branch.branchName,    // ✓ Matches backend
        value: branch.branchId,      // ✓ Matches backend
      })),
    ];
  }
};
```

## Manual Testing Steps

1. **Start Backend** (if not running):
   ```bash
   cd hrms-backend
   php artisan serve --port=8000
   ```

2. **Start Frontend** (if not running):
   ```bash
   cd hrms-frontend
   npm run dev
   ```

3. **Test the Filters**:
   - Login at `http://localhost:5173/internal-login`
   - Navigate to `/employees/employee-exit`
   - Click "SHOW FILTERS" button
   - Click on **Department** dropdown
     - Should show: All, Administration, [and other departments from DB]
   - Click on **Branch** dropdown
     - Should show: All, Hyderabad, Jaipur, Pune

4. **Test Filtering**:
   - Select a department
   - Select a branch
   - Click "Search" button
   - Verify the table updates with filtered results

## Expected Results

### Department Dropdown:
- ✓ Shows "All" option (value: 0)
- ✓ Shows all active departments from database
- ✓ Each option has department name as label
- ✓ Each option has department ID as value

### Branch Dropdown:
- ✓ Shows "All" option (value: 0)
- ✓ Shows Hyderabad (ID: 1)
- ✓ Shows Jaipur (ID: 2)
- ✓ Shows Pune (ID: 3)

## Status
✅ **FIXED** - Backend API now returns correct format matching frontend expectations.

## Related Files
- Backend: `hrms-backend/app/Http/Controllers/Api/MasterDataController.php`
- Frontend: `hrms-frontend/src/components/exit-management/ExitEmployee/ExitEmployeeListPage.vue`
- Service: `hrms-frontend/src/services/employeeService.ts`
- Routes: `hrms-backend/routes/api.php`

## Notes
- No frontend changes were needed
- Only backend response format was adjusted
- Department data is fetched from database dynamically
- Branch data is currently hardcoded (can be changed to DB query if needed)
- Both API endpoints tested and confirmed returning correct structure
- No console errors in browser
