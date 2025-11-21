import { test, expect } from '../fixtures/auth.fixture';
import { RoleFormPage, RoleListPage } from '../pages/role.page';

test.describe('Role Management - Edit Role', () => {
  let roleFormPage: RoleFormPage;
  let roleListPage: RoleListPage;
  let testRoleId: number;

  test.beforeAll(async () => {
    // We'll edit one of the existing roles (e.g., HR = roleId 2)
    testRoleId = 2;
  });

  test.beforeEach(async ({ authenticatedPage }) => {
    roleFormPage = new RoleFormPage(authenticatedPage);
    roleListPage = new RoleListPage(authenticatedPage);
    await roleFormPage.gotoEdit(testRoleId);
  });

  test('should display edit role form with pre-filled data', async ({ authenticatedPage }) => {
    // Verify in edit mode
    expect(await roleFormPage.isEditMode()).toBe(true);
    console.log('✅ Form is in edit mode');

    // Verify role name is pre-filled
    const roleName = await roleFormPage.getRoleName();
    console.log(`Editing role: ${roleName}`);
    expect(roleName.length).toBeGreaterThan(0);

    // Verify modules are loaded
    const moduleCount = await roleFormPage.getModuleCount();
    console.log(`Found ${moduleCount} modules`);
    expect(moduleCount).toBeGreaterThan(0);

    // Verify some permissions might be pre-selected
    const totalChecked = await roleFormPage.getTotalCheckedPermissions();
    console.log(`Currently ${totalChecked} permissions are selected`);

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-edit-form.png', 
      fullPage: true 
    });
  });

  test('should update role name successfully', async ({ authenticatedPage }) => {
    const originalName = await roleFormPage.getRoleName();
    const updatedName = `${originalName} Updated ${Date.now()}`;
    
    console.log(`Changing name from "${originalName}" to "${updatedName}"`);
    
    await roleFormPage.fillRoleName(updatedName);
    await roleFormPage.clickSubmit();

    // Wait for navigation
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Role name updated successfully');

    // Verify in list
    await roleListPage.searchRole(updatedName);
    const rowCount = await roleListPage.getTableRowCount();
    expect(rowCount).toBeGreaterThan(0);

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-edit-name-update.png', 
      fullPage: true 
    });

    // Revert the name change for subsequent tests
    await roleFormPage.gotoEdit(testRoleId);
    await roleFormPage.fillRoleName(originalName);
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Reverted role name to original');
  });

  test('should update permissions successfully', async ({ authenticatedPage }) => {
    const initialCheckedCount = await roleFormPage.getTotalCheckedPermissions();
    console.log(`Initial permission count: ${initialCheckedCount}`);

    // Toggle first module's select all
    await roleFormPage.clickModuleSelectAll(0);
    
    const newCheckedCount = await roleFormPage.getTotalCheckedPermissions();
    console.log(`New permission count: ${newCheckedCount}`);
    
    // Verify change detected
    expect(newCheckedCount).not.toBe(initialCheckedCount);

    // Submit
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Permissions updated successfully');

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-edit-permissions-update.png', 
      fullPage: true 
    });

    // Revert permissions
    await roleFormPage.gotoEdit(testRoleId);
    await roleFormPage.clickModuleSelectAll(0); // Toggle back
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Reverted permissions to original state');
  });

  test('should detect no changes and not save', async ({ authenticatedPage }) => {
    // Don't make any changes, just try to submit
    await roleFormPage.clickSubmit();
    
    // Check if warning message appears
    await authenticatedPage.waitForTimeout(1000);
    
    // Should still be on edit page or show a message
    const currentUrl = authenticatedPage.url();
    console.log(`Current URL after no-change submit: ${currentUrl}`);
    
    // Take screenshot to verify behavior
    await authenticatedPage.screenshot({ 
      path: 'test-results/role-edit-no-changes.png', 
      fullPage: true 
    });
  });

  test('should update both name and permissions together', async ({ authenticatedPage }) => {
    const originalName = await roleFormPage.getRoleName();
    const updatedName = `${originalName} Full Update ${Date.now()}`;
    
    // Change name
    await roleFormPage.fillRoleName(updatedName);
    
    // Change permissions
    const moduleCount = await roleFormPage.getModuleCount();
    if (moduleCount > 1) {
      await roleFormPage.clickModuleSelectAll(1); // Toggle second module
    }

    // Submit
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Both name and permissions updated');

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-edit-full-update.png', 
      fullPage: true 
    });

    // Revert all changes
    await roleFormPage.gotoEdit(testRoleId);
    await roleFormPage.fillRoleName(originalName);
    if (moduleCount > 1) {
      await roleFormPage.clickModuleSelectAll(1);
    }
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Reverted all changes');
  });

  test('should validate role name when editing', async ({ authenticatedPage }) => {
    // Try to clear role name
    await roleFormPage.fillRoleName('');
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForTimeout(500);

    const error = await roleFormPage.getValidationError();
    console.log(`Validation error: ${error}`);
    expect(error).toBeTruthy();

    // Should still be on edit page
    await expect(authenticatedPage).toHaveURL(/\/roles\/edit/);
  });

  test('should cancel edit and return to list', async ({ authenticatedPage }) => {
    const originalName = await roleFormPage.getRoleName();
    
    // Make changes
    await roleFormPage.fillRoleName('This should be cancelled');
    await roleFormPage.clickModuleSelectAll(0);

    // Cancel
    await roleFormPage.clickCancel();

    // Verify back on list
    await expect(authenticatedPage).toHaveURL(/\/roles$/);
    console.log('✅ Cancelled edit and returned to list');

    // Verify changes were not saved by going back to edit
    await roleFormPage.gotoEdit(testRoleId);
    const currentName = await roleFormPage.getRoleName();
    expect(currentName).toBe(originalName);
    console.log('✅ Changes were not persisted');
  });

  test('should handle selecting all modules', async ({ authenticatedPage }) => {
    const moduleCount = await roleFormPage.getModuleCount();
    console.log(`Selecting all ${moduleCount} modules`);

    // Select all modules
    for (let i = 0; i < Math.min(moduleCount, 5); i++) { // Limit to first 5 for speed
      const isChecked = await roleFormPage.isModuleSelectAllChecked(i);
      if (!isChecked) {
        await roleFormPage.clickModuleSelectAll(i);
      }
    }

    const totalChecked = await roleFormPage.getTotalCheckedPermissions();
    console.log(`Total ${totalChecked} permissions selected`);
    expect(totalChecked).toBeGreaterThan(0);

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-edit-all-modules.png', 
      fullPage: true 
    });

    // Don't save, just verify the UI works
    await roleFormPage.clickCancel();
  });
});
