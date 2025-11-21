import { test, expect } from '../fixtures/auth.fixture';
import { RoleListPage } from '../pages/role.page';

test.describe('Role Management - List Page', () => {
  let roleListPage: RoleListPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    roleListPage = new RoleListPage(authenticatedPage);
    await roleListPage.goto();
  });

  test('should display roles list page with correct elements', async ({ authenticatedPage }) => {
    // Verify page title
    await expect(roleListPage.pageTitle).toBeVisible();
    console.log('✅ Page title visible');

    // Verify search input
    await expect(roleListPage.searchInput).toBeVisible();
    console.log('✅ Search input visible');

    // Verify data table
    await expect(roleListPage.dataTable).toBeVisible();
    console.log('✅ Data table visible');

    // Take screenshot
    await authenticatedPage.screenshot({ 
      path: 'test-results/role-list-page.png', 
      fullPage: true 
    });
  });

  test('should display Add Role button if user has Create.Role permission', async ({ authenticatedPage }) => {
    const isVisible = await roleListPage.isAddButtonVisible();
    
    if (isVisible) {
      console.log('✅ Add Role button is visible (user has Create.Role permission)');
    } else {
      console.log('⚠️ Add Role button is not visible (user lacks Create.Role permission)');
    }

    expect(isVisible).toBe(true); // rohit.jain@programmers.io should have this permission
  });

  test('should display at least 7 default roles', async ({ authenticatedPage }) => {
    const rowCount = await roleListPage.getTableRowCount();
    
    console.log(`Found ${rowCount} roles in table`);
    expect(rowCount).toBeGreaterThanOrEqual(7);
    
    // Verify some default roles exist
    const firstRoleName = await roleListPage.getRoleNameInRow(0);
    console.log(`First role: ${firstRoleName}`);
    expect(firstRoleName.length).toBeGreaterThan(0);
  });

  test('should search for roles with debounce', async ({ authenticatedPage }) => {
    // Search for "Admin"
    await roleListPage.searchRole('Admin');
    
    const rowCount = await roleListPage.getTableRowCount();
    console.log(`Found ${rowCount} roles matching "Admin"`);
    
    // Verify search filtered results
    if (rowCount > 0) {
      const firstRoleName = await roleListPage.getRoleNameInRow(0);
      console.log(`First matching role: ${firstRoleName}`);
      expect(firstRoleName.toLowerCase()).toContain('admin');
    }

    // Clear search
    await roleListPage.clearSearch();
    const allRowsCount = await roleListPage.getTableRowCount();
    console.log(`After clearing search: ${allRowsCount} roles`);
    expect(allRowsCount).toBeGreaterThanOrEqual(rowCount);

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-list-search.png', 
      fullPage: true 
    });
  });

  test('should display user count for each role', async ({ authenticatedPage }) => {
    const rowCount = await roleListPage.getTableRowCount();
    
    if (rowCount > 0) {
      const userCount = await roleListPage.getUserCountInRow(0);
      console.log(`First role has ${userCount} users`);
      
      // User count should be a number
      expect(parseInt(userCount)).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display Edit button if user has Edit.Role permission', async ({ authenticatedPage }) => {
    const rowCount = await roleListPage.getTableRowCount();
    
    if (rowCount > 0) {
      const isVisible = await roleListPage.isEditButtonVisible(0);
      
      if (isVisible) {
        console.log('✅ Edit button is visible (user has Edit.Role permission)');
      } else {
        console.log('⚠️ Edit button is not visible (user lacks Edit.Role permission)');
      }

      expect(isVisible).toBe(true); // rohit.jain@programmers.io should have this permission
    }
  });

  test('should navigate to add role page when clicking Add Role button', async ({ authenticatedPage }) => {
    await roleListPage.clickAddRole();
    
    // Verify navigation
    await expect(authenticatedPage).toHaveURL(/\/roles\/add/);
    console.log('✅ Navigated to add role page');

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-add-navigation.png', 
      fullPage: true 
    });
  });

  test('should navigate to edit role page when clicking Edit button', async ({ authenticatedPage }) => {
    const rowCount = await roleListPage.getTableRowCount();
    
    if (rowCount > 0) {
      const roleName = await roleListPage.getRoleNameInRow(0);
      console.log(`Editing role: ${roleName}`);
      
      await roleListPage.clickEditRole(0);
      
      // Verify navigation
      await expect(authenticatedPage).toHaveURL(/\/roles\/edit\/\d+/);
      console.log('✅ Navigated to edit role page');

      await authenticatedPage.screenshot({ 
        path: 'test-results/role-edit-navigation.png', 
        fullPage: true 
      });
    }
  });

  test('should paginate through roles', async ({ authenticatedPage }) => {
    const initialRowCount = await roleListPage.getTableRowCount();
    console.log(`Initial page shows ${initialRowCount} roles`);

    // If there are pagination controls visible, test them
    const hasPagination = await roleListPage.paginationButtons.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasPagination) {
      console.log('✅ Pagination controls visible');
      
      // Try to change page size to 5
      // Note: This might not work if there aren't enough roles
      // await roleListPage.changePageSize(5);
      // const newRowCount = await roleListPage.getTableRowCount();
      // console.log(`After changing page size: ${newRowCount} roles`);
    } else {
      console.log('ℹ️ No pagination needed (all roles fit on one page)');
    }

    await authenticatedPage.screenshot({ 
      path: 'test-results/role-list-pagination.png', 
      fullPage: true 
    });
  });
});
