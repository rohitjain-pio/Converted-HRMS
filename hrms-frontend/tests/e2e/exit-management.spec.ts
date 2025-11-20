import { test, expect } from '@playwright/test';

test.describe('Exit Management Route Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to internal login
    await page.goto('http://localhost:5173/internal-login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill in credentials
    await page.fill('input[type="email"], input[name="email"]', 'rohit.jain@programmers.io');
    await page.fill('input[type="password"], input[name="password"]', 'password');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait a bit for auth to settle
    await page.waitForTimeout(2000);
  });

  test('should display employee exit page with functional data table', async ({ page }) => {
    console.log('Navigating to /employees/employee-exit...');
    
    // Navigate to employee exit page
    await page.goto('http://localhost:5173/employees/employee-exit');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/exit-page-loaded.png', fullPage: true });
    
    // Check if title is visible
    const title = await page.locator('text=Employee Exit').first();
    await expect(title).toBeVisible();
    console.log('✅ Title found');
    
    // Check if data table exists
    const dataTable = await page.locator('.v-data-table, table').first();
    await expect(dataTable).toBeVisible();
    console.log('✅ Data table found');
    
    // Check for filter button
    const filterButton = await page.locator('button:has-text("Filters")').first();
    await expect(filterButton).toBeVisible();
    console.log('✅ Filter button found');
    
    // Check for refresh button
    const refreshButton = await page.locator('button:has-text("Refresh")').first();
    await expect(refreshButton).toBeVisible();
    console.log('✅ Refresh button found');
    
    // Wait for any API calls to complete
    await page.waitForTimeout(2000);
    
    // Check if table has content or shows empty state
    const tableRows = await page.locator('tbody tr').count();
    console.log(`Table rows: ${tableRows}`);
    
    if (tableRows > 0) {
      console.log('✅ Table has data rows');
      
      // Check if view button exists in first row
      const viewButton = await page.locator('tbody tr:first-child button[title="View"], tbody tr:first-child a:has(svg)').first();
      if (await viewButton.isVisible()) {
        console.log('✅ View button found in first row');
      }
    } else {
      // Check for empty state
      const emptyState = await page.locator('text=No resignation records found').first();
      if (await emptyState.isVisible()) {
        console.log('✅ Empty state displayed (no records in database)');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/exit-page-complete.png', fullPage: true });
    
    console.log('✅ Test completed successfully');
  });

  test('should check filter functionality', async ({ page }) => {
    // Navigate to employee exit page
    await page.goto('http://localhost:5173/employees/employee-exit');
    await page.waitForLoadState('networkidle');
    
    // Click show filters button
    const filterButton = await page.locator('button:has-text("Filters")').first();
    await filterButton.click();
    
    // Wait for filters to expand
    await page.waitForTimeout(500);
    
    // Check if filter inputs are visible
    const employeeCodeInput = await page.locator('input[label="Employee Code"], input:below(label:has-text("Employee Code"))').first();
    await expect(employeeCodeInput).toBeVisible();
    console.log('✅ Employee Code filter visible');
    
    // Check if search button exists
    const searchButton = await page.locator('button:has-text("Search")').first();
    await expect(searchButton).toBeVisible();
    console.log('✅ Search button visible');
    
    // Check if reset button exists
    const resetButton = await page.locator('button:has-text("Reset")').first();
    await expect(resetButton).toBeVisible();
    console.log('✅ Reset button visible');
  });
});

