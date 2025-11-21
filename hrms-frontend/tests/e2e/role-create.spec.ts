import { test, expect } from '../fixtures/auth.fixture';
import { RoleFormPage, RoleListPage } from '../pages/role.page';

test.describe('Role Management - Create Role', () => {
  let roleFormPage: RoleFormPage;
  const testRoleName = `Test Role ${Date.now()}`;

  test.beforeEach(async ({ authenticatedPage }) => {
    roleFormPage = new RoleFormPage(authenticatedPage);
    await roleFormPage.gotoAdd();
  });

  test('should display create role form with correct elements', async ({ authenticatedPage }) => {
    // Verify in create mode
    expect(await roleFormPage.isCreateMode()).toBe(true);
    console.log('✅ Form is in create mode');

    // Verify role name input
    await expect(roleFormPage.roleNameInput).toBeVisible();
    console.log('✅ Role name input visible');

    // Verify modules are loaded
    const moduleCount = await roleFormPage.getModuleCount();
    console.log(`Found ${moduleCount} modules`);
    expect(moduleCount).toBeGreaterThan(0);

    // Verify first module has permissions
    if (moduleCount > 0) {
      const firstModuleName = await roleFormPage.getModuleName(0);
      const permissionCount = await roleFormPage.getPermissionCount(0);
      console.log(`First module "${firstModuleName}" has ${permissionCount} permissions`);
      expect(permissionCount).toBeGreaterThan(0);
    }

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-create-form.png', 
      fullPage: true 
    });
  });

  test('should validate role name is required', async ({ authenticatedPage }) => {
    // Try to submit without role name
    await roleFormPage.clickSubmit();
    
    // Wait a moment for validation
    await authenticatedPage.waitForTimeout(500);

    // Check for validation error
    const error = await roleFormPage.getValidationError();
    console.log(`Validation error: ${error}`);
    
    // Should still be on the same page (not navigated away)
    await expect(authenticatedPage).toHaveURL(/\/roles\/add/);
    console.log('✅ Form validation prevented submission');
  });

  test('should validate role name only accepts alphabets', async ({ authenticatedPage }) => {
    // Try with numbers only
    await roleFormPage.fillRoleName('12345');
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForTimeout(500);

    const error = await roleFormPage.getValidationError();
    console.log(`Validation error for numbers: ${error}`);
    
    // Should show error
    expect(error).toBeTruthy();

    // Try with special characters
    await roleFormPage.fillRoleName('Test@Role!');
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForTimeout(500);

    const error2 = await roleFormPage.getValidationError();
    console.log(`Validation error for special chars: ${error2}`);
  });

  test('should validate role name minimum length (2 characters)', async ({ authenticatedPage }) => {
    await roleFormPage.fillRoleName('A');
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForTimeout(500);

    const error = await roleFormPage.getValidationError();
    console.log(`Validation error for min length: ${error}`);
    expect(error).toBeTruthy();
  });

  test('should validate role name maximum length (50 characters)', async ({ authenticatedPage }) => {
    const longName = 'A'.repeat(51);
    await roleFormPage.fillRoleName(longName);
    
    // Input should truncate to 50 characters
    const actualValue = await roleFormPage.getRoleName();
    console.log(`Input length: ${actualValue.length}`);
    expect(actualValue.length).toBeLessThanOrEqual(50);
  });

  test('should toggle "Select All" for a module', async ({ authenticatedPage }) => {
    const moduleCount = await roleFormPage.getModuleCount();
    
    if (moduleCount > 0) {
      // Check initial state
      const initialCheckedCount = await roleFormPage.getCheckedPermissionCount(0);
      console.log(`Module 0 initially has ${initialCheckedCount} checked permissions`);

      // Click "Select All"
      await roleFormPage.clickModuleSelectAll(0);

      // Verify all permissions are checked
      const afterSelectAllCount = await roleFormPage.getCheckedPermissionCount(0);
      const totalPermissions = await roleFormPage.getPermissionCount(0);
      console.log(`After Select All: ${afterSelectAllCount}/${totalPermissions} checked`);
      expect(afterSelectAllCount).toBe(totalPermissions);

      // Click "Select All" again to deselect
      await roleFormPage.clickModuleSelectAll(0);

      // Verify all permissions are unchecked
      const afterDeselectCount = await roleFormPage.getCheckedPermissionCount(0);
      console.log(`After deselect: ${afterDeselectCount} checked`);
      expect(afterDeselectCount).toBe(0);
    }

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-create-select-all.png', 
      fullPage: true 
    });
  });

  test('should toggle individual permissions', async ({ authenticatedPage }) => {
    const moduleCount = await roleFormPage.getModuleCount();
    
    if (moduleCount > 0 && await roleFormPage.getPermissionCount(0) > 0) {
      // Click first permission
      const wasChecked = await roleFormPage.isPermissionChecked(0, 0);
      await roleFormPage.clickPermission(0, 0);
      
      // Verify state changed
      const isNowChecked = await roleFormPage.isPermissionChecked(0, 0);
      expect(isNowChecked).toBe(!wasChecked);
      console.log(`✅ Permission toggled from ${wasChecked} to ${isNowChecked}`);
    }
  });

  test('should create a new role successfully', async ({ authenticatedPage }) => {
    // Fill role name
    await roleFormPage.fillRoleName(testRoleName);
    console.log(`Creating role: ${testRoleName}`);

    // Select some permissions (select all from first module)
    const moduleCount = await roleFormPage.getModuleCount();
    if (moduleCount > 0) {
      await roleFormPage.clickModuleSelectAll(0);
      
      const checkedCount = await roleFormPage.getTotalCheckedPermissions();
      console.log(`Selected ${checkedCount} permissions`);
      expect(checkedCount).toBeGreaterThan(0);
    }

    // Submit form
    await roleFormPage.clickSubmit();

    // Wait for navigation back to list
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Navigated back to roles list');

    // Verify the new role appears in the list
    const roleListPage = new RoleListPage(authenticatedPage);
    await roleListPage.searchRole(testRoleName);
    
    const rowCount = await roleListPage.getTableRowCount();
    expect(rowCount).toBeGreaterThan(0);
    
    const firstRoleName = await roleListPage.getRoleNameInRow(0);
    expect(firstRoleName).toBe(testRoleName);
    console.log(`✅ New role "${testRoleName}" found in list`);

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-create-success.png', 
      fullPage: true 
    });
  });

  test('should cancel role creation', async ({ authenticatedPage }) => {
    // Fill some data
    await roleFormPage.fillRoleName('Cancel Test Role');
    await roleFormPage.clickModuleSelectAll(0);

    // Click cancel
    await roleFormPage.clickCancel();

    // Verify navigation back to list
    await expect(authenticatedPage).toHaveURL(/\/roles$/);
    console.log('✅ Cancelled and returned to list');
  });

  test('should navigate back using back button', async ({ authenticatedPage }) => {
    await roleFormPage.backButton.click();
    await expect(authenticatedPage).toHaveURL(/\/roles$/);
    console.log('✅ Back button navigation works');
  });
});
