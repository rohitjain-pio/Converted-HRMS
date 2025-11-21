# Role Management E2E Test Suite

Comprehensive Playwright test suite for the Role Management feature in HRMS.

## Test Structure

```
tests/
├── fixtures/
│   └── auth.fixture.ts          # Authentication helper fixture
├── pages/
│   └── role.page.ts             # Page Object Models for Role pages
└── e2e/
    ├── role-list.spec.ts        # Role list page tests
    ├── role-create.spec.ts      # Role creation tests
    ├── role-edit.spec.ts        # Role editing tests
    └── role-workflow.spec.ts    # End-to-end workflow tests
```

## Test Coverage

### 1. Role List Page Tests (`role-list.spec.ts`)
- ✅ Display roles list page with correct elements
- ✅ Display Add Role button (permission-based)
- ✅ Display at least 7 default roles
- ✅ Search for roles with debounce (500ms)
- ✅ Display user count for each role
- ✅ Display Edit button (permission-based)
- ✅ Navigate to add role page
- ✅ Navigate to edit role page
- ✅ Pagination functionality

**Test Count:** 9 tests

### 2. Role Creation Tests (`role-create.spec.ts`)
- ✅ Display create role form with correct elements
- ✅ Validate role name is required
- ✅ Validate role name only accepts alphabets
- ✅ Validate role name minimum length (2 characters)
- ✅ Validate role name maximum length (50 characters)
- ✅ Toggle "Select All" for a module
- ✅ Toggle individual permissions
- ✅ Create a new role successfully
- ✅ Cancel role creation
- ✅ Navigate back using back button

**Test Count:** 10 tests

### 3. Role Edit Tests (`role-edit.spec.ts`)
- ✅ Display edit role form with pre-filled data
- ✅ Update role name successfully
- ✅ Update permissions successfully
- ✅ Detect no changes and not save
- ✅ Update both name and permissions together
- ✅ Validate role name when editing
- ✅ Cancel edit and return to list
- ✅ Handle selecting all modules

**Test Count:** 8 tests

### 4. Workflow Tests (`role-workflow.spec.ts`)
- ✅ Complete role lifecycle: create → search → edit → verify
- ✅ Pagination and filtering workflow
- ✅ Permission matrix verification

**Test Count:** 3 tests

**Total Tests:** 30 comprehensive E2E tests

## Prerequisites

1. **Backend Server Running:**
   ```bash
   cd hrms-backend
   php artisan serve
   ```

2. **Frontend Server Running:**
   ```bash
   cd hrms-frontend
   npm run dev
   ```

3. **Database Seeded:**
   - 7 default roles (SuperAdmin, HR, Employee, Accounts, Manager, IT, Developer)
   - 24 modules with 131 permissions
   - Test user: `rohit.jain@programmers.io` with password `password`

## Running Tests

### Run all role management tests:
```bash
npm run test:e2e -- role-
```

### Run specific test suites:
```bash
# List page tests
npm run test:e2e -- role-list

# Create tests
npm run test:e2e -- role-create

# Edit tests
npm run test:e2e -- role-edit

# Workflow tests
npm run test:e2e -- role-workflow
```

### Run with UI mode (debugging):
```bash
npm run test:e2e:ui -- role-
```

### Generate HTML report:
```bash
npm run test:e2e:report
```

## Test User Credentials

Default test user (defined in `auth.fixture.ts`):
- **Email:** rohit.jain@programmers.io
- **Password:** password
- **Permissions:** Full SuperAdmin access (Read.Role, Create.Role, Edit.Role, Delete.Role)

## Page Object Models

### RoleListPage
Methods:
- `goto()` - Navigate to roles list
- `searchRole(roleName)` - Search for roles with debounce
- `clearSearch()` - Clear search input
- `clickAddRole()` - Navigate to create role page
- `getTableRowCount()` - Get number of table rows
- `getRoleNameInRow(index)` - Get role name from specific row
- `getUserCountInRow(index)` - Get user count from specific row
- `clickEditRole(index)` - Navigate to edit role page
- `isAddButtonVisible()` - Check Create.Role permission
- `isEditButtonVisible(index)` - Check Edit.Role permission

### RoleFormPage
Methods:
- `gotoAdd()` - Navigate to create role page
- `gotoEdit(roleId)` - Navigate to edit role page
- `isCreateMode()` - Check if in create mode
- `isEditMode()` - Check if in edit mode
- `fillRoleName(name)` - Fill role name input
- `getRoleName()` - Get current role name value
- `getModuleCount()` - Get number of modules
- `getModuleName(index)` - Get module name
- `clickModuleSelectAll(index)` - Toggle module's select all
- `isModuleSelectAllChecked(index)` - Check select all state
- `getPermissionCount(index)` - Get permission count in module
- `isPermissionChecked(moduleIndex, permIndex)` - Check permission state
- `clickPermission(moduleIndex, permIndex)` - Toggle permission
- `getCheckedPermissionCount(index)` - Get checked count in module
- `getTotalCheckedPermissions()` - Get total checked across all modules
- `clickSubmit()` - Submit form
- `clickCancel()` - Cancel form
- `getValidationError()` - Get validation error message

## Validation Rules Tested

1. **Role Name:**
   - Required field
   - Only alphabets and spaces allowed
   - Minimum 2 characters
   - Maximum 50 characters
   - No numbers or special characters

2. **Permissions:**
   - At least one permission must be selected
   - Module-level "Select All" toggles
   - Individual permission toggles
   - State tracking for change detection

3. **Change Detection:**
   - No save if no modifications detected (edit mode)
   - Tracks role name changes
   - Tracks permission changes
   - Validates before submission

## Test Screenshots

All tests automatically capture screenshots:
- `test-results/role-list-page.png` - List page view
- `test-results/role-create-form.png` - Create form view
- `test-results/role-edit-form.png` - Edit form view
- `test-results/role-create-success.png` - After successful creation
- `test-results/workflow-*.png` - Workflow step screenshots

## Known Behaviors

1. **Debounce Delay:** Search has 500ms debounce, tests wait 600ms
2. **No Changes Warning:** Edit mode shows info if no modifications detected
3. **Permission Matrix:** 24 modules with varying permission counts (total 122-131 permissions)
4. **User Count Button:** Links to employee list filtered by role
5. **Transaction Handling:** Backend uses stored procedure called outside transactions

## Debugging Tips

1. **Use UI Mode:**
   ```bash
   npm run test:e2e:ui
   ```

2. **Check Screenshots:**
   Screenshots saved in `test-results/` directory

3. **Check Playwright Trace:**
   Traces captured on first retry, view with:
   ```bash
   npx playwright show-trace trace.zip
   ```

4. **Console Logs:**
   Tests include extensive `console.log()` statements for debugging

5. **Verify Backend:**
   Test backend APIs directly:
   ```bash
   cd hrms-backend
   php test-role-api-complete.php
   ```

## CI/CD Integration

Tests configured for CI (see `playwright.config.ts`):
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI (sequential), parallel locally
- Server auto-start: `npm run dev` before tests
- HTML report generation

## Performance

- **Average test execution time:** ~30-45 seconds per suite
- **Full suite execution:** ~2-3 minutes
- **Screenshot generation:** Adds ~500ms per test
- **Network wait times:** Configured with reasonable timeouts

## Success Criteria

All tests passing indicates:
1. ✅ UI renders correctly with Vuetify components
2. ✅ Authentication and authorization working
3. ✅ Backend API integration successful
4. ✅ Form validation rules enforced
5. ✅ CRUD operations functioning
6. ✅ State management correct
7. ✅ Navigation flows working
8. ✅ Permission-based UI visibility
9. ✅ Search and pagination functional
10. ✅ Module-permission grouping correct

## Maintenance

When updating the role management feature:
1. Update page objects if UI structure changes
2. Add new tests for new features
3. Update validation rules if business logic changes
4. Regenerate screenshots for visual regression
5. Update this README with new test coverage

## Contact

Test Suite Author: GitHub Copilot
Test User: rohit.jain@programmers.io
Last Updated: November 20, 2025
