import { test, expect } from '../fixtures/auth.fixture';
import { RoleListPage, RoleFormPage } from '../pages/role.page';

test.describe('Role Management - Complete Workflow', () => {
  const workflowTestRoleName = `Workflow Test Role ${Date.now()}`;

  test('complete role lifecycle: create, search, edit, verify', async ({ authenticatedPage }) => {
    // Step 1: Navigate to roles list
    const roleListPage = new RoleListPage(authenticatedPage);
    await roleListPage.goto();
    console.log('✅ Step 1: Navigated to roles list');

    // Step 2: Click Add Role
    await roleListPage.clickAddRole();
    console.log('✅ Step 2: Clicked Add Role button');

    // Step 3: Fill role form
    const roleFormPage = new RoleFormPage(authenticatedPage);
    await roleFormPage.fillRoleName(workflowTestRoleName);
    console.log(`✅ Step 3: Filled role name: ${workflowTestRoleName}`);

    // Step 4: Select permissions from multiple modules
    const moduleCount = await roleFormPage.getModuleCount();
    console.log(`Found ${moduleCount} modules`);

    if (moduleCount >= 3) {
      // Select all permissions from first 3 modules
      await roleFormPage.clickModuleSelectAll(0);
      await roleFormPage.clickModuleSelectAll(1);
      await roleFormPage.clickModuleSelectAll(2);
      
      const totalSelected = await roleFormPage.getTotalCheckedPermissions();
      console.log(`✅ Step 4: Selected ${totalSelected} permissions from 3 modules`);
      expect(totalSelected).toBeGreaterThan(0);
    }

    await authenticatedPage.screenshot({ 
      path: 'test-results/workflow-01-form-filled.png', 
      fullPage: true 
    });

    // Step 5: Submit form
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Step 5: Submitted form, returned to list');

    await authenticatedPage.screenshot({ 
      path: 'test-results/workflow-02-after-create.png', 
      fullPage: true 
    });

    // Step 6: Search for the new role
    await roleListPage.searchRole(workflowTestRoleName);
    await authenticatedPage.waitForTimeout(1000);
    
    const searchResults = await roleListPage.getTableRowCount();
    console.log(`✅ Step 6: Search found ${searchResults} result(s)`);
    expect(searchResults).toBeGreaterThan(0);

    const foundRoleName = await roleListPage.getRoleNameInRow(0);
    expect(foundRoleName).toBe(workflowTestRoleName);
    console.log(`✅ Found role: ${foundRoleName}`);

    await authenticatedPage.screenshot({ 
      path: 'test-results/workflow-03-search-results.png', 
      fullPage: true 
    });

    // Step 7: Edit the role
    await roleListPage.clickEditRole(0);
    await authenticatedPage.waitForURL(/\/roles\/edit\/\d+/, { timeout: 5000 });
    console.log('✅ Step 7: Navigated to edit page');

    // Step 8: Modify the role
    const updatedName = `${workflowTestRoleName} Modified`;
    await roleFormPage.fillRoleName(updatedName);
    
    // Toggle one module's permissions
    if (moduleCount >= 4) {
      await roleFormPage.clickModuleSelectAll(3);
      console.log('✅ Step 8: Added permissions from 4th module');
    }

    await authenticatedPage.screenshot({ 
      path: 'test-results/workflow-04-edit-form.png', 
      fullPage: true 
    });

    // Step 9: Save changes
    await roleFormPage.clickSubmit();
    await authenticatedPage.waitForURL('**/roles', { timeout: 10000 });
    console.log('✅ Step 9: Saved changes');

    // Step 10: Verify the update
    await roleListPage.searchRole(updatedName);
    await authenticatedPage.waitForTimeout(1000);
    
    const finalResults = await roleListPage.getTableRowCount();
    expect(finalResults).toBeGreaterThan(0);
    
    const finalRoleName = await roleListPage.getRoleNameInRow(0);
    expect(finalRoleName).toBe(updatedName);
    console.log(`✅ Step 10: Verified updated role: ${finalRoleName}`);

    await authenticatedPage.screenshot({ 
      path: 'test-results/workflow-05-final-verification.png', 
      fullPage: true 
    });

    console.log('\n🎉 Complete workflow test passed!');
  });

  test('pagination and filtering workflow', async ({ authenticatedPage }) => {
    const roleListPage = new RoleListPage(authenticatedPage);
    await roleListPage.goto();

    // Test 1: View all roles
    const totalRoles = await roleListPage.getTableRowCount();
    console.log(`Total roles on first page: ${totalRoles}`);
    expect(totalRoles).toBeGreaterThan(0);

    // Test 2: Filter by partial name
    await roleListPage.searchRole('Admin');
    await authenticatedPage.waitForTimeout(1000);
    
    const adminRoles = await roleListPage.getTableRowCount();
    console.log(`Roles containing "Admin": ${adminRoles}`);

    // Test 3: Clear filter
    await roleListPage.clearSearch();
    await authenticatedPage.waitForTimeout(1000);
    
    const allRolesAgain = await roleListPage.getTableRowCount();
    console.log(`After clearing filter: ${allRolesAgain} roles`);
    expect(allRolesAgain).toBeGreaterThanOrEqual(adminRoles);

    // Test 4: Search for specific role
    await roleListPage.searchRole('HR');
    await authenticatedPage.waitForTimeout(1000);
    
    const hrResults = await roleListPage.getTableRowCount();
    if (hrResults > 0) {
      const hrRoleName = await roleListPage.getRoleNameInRow(0);
      console.log(`HR search result: ${hrRoleName}`);
    }

    await authenticatedPage.screenshot({ 
      path: 'test-results/workflow-pagination-filtering.png', 
      fullPage: true 
    });

    console.log('✅ Pagination and filtering workflow completed');
  });

  test('permission matrix verification', async ({ authenticatedPage }) => {
    const roleFormPage = new RoleFormPage(authenticatedPage);
    await roleFormPage.gotoAdd();

    // Get module structure
    const moduleCount = await roleFormPage.getModuleCount();
    console.log(`\n📊 Permission Matrix:`);
    console.log(`Total Modules: ${moduleCount}\n`);

    let totalPermissions = 0;
    const moduleDetails: any[] = [];

    // Collect details about each module
    for (let i = 0; i < Math.min(moduleCount, 10); i++) { // Limit to first 10 for performance
      const moduleName = await roleFormPage.getModuleName(i);
      const permissionCount = await roleFormPage.getPermissionCount(i);
      totalPermissions += permissionCount;

      moduleDetails.push({ name: moduleName, permissions: permissionCount });
      console.log(`${i + 1}. ${moduleName}: ${permissionCount} permissions`);
    }

    console.log(`\nTotal Permissions Counted: ${totalPermissions}`);
    expect(totalPermissions).toBeGreaterThan(0);

    // Verify module structure
    expect(moduleCount).toBeGreaterThanOrEqual(24); // Should have at least 24 modules based on seeder

    // Test select all functionality across multiple modules
    console.log('\n🧪 Testing Select All across modules:');
    
    for (let i = 0; i < Math.min(3, moduleCount); i++) {
      await roleFormPage.clickModuleSelectAll(i);
      const checkedCount = await roleFormPage.getCheckedPermissionCount(i);
      const totalCount = await roleFormPage.getPermissionCount(i);
      
      console.log(`Module ${i + 1}: ${checkedCount}/${totalCount} selected`);
      expect(checkedCount).toBe(totalCount);
    }

    const grandTotal = await roleFormPage.getTotalCheckedPermissions();
    console.log(`Grand Total Selected: ${grandTotal}`);
    expect(grandTotal).toBeGreaterThan(0);

    await authenticatedPage.screenshot({ 
      path: 'test-results/workflow-permission-matrix.png', 
      fullPage: true 
    });

    console.log('✅ Permission matrix verification completed');
  });
});
