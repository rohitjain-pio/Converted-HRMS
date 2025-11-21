import { test, expect } from '@playwright/test';

test.describe('Employee Exit - Department and Branch Filters', () => {
  
  test('Verify department and branch dropdowns are populated', async ({ page }) => {
    test.setTimeout(60000);

    console.log('=== Testing Department and Branch Filters ===\n');

    // Login
    await page.goto('http://localhost:5173/internal-login');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Logged in');

    // Navigate
    await page.goto('http://localhost:5173/employees/employee-exit');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ On Employee Exit page');

    // Monitor API calls
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/master/departments') || url.includes('/api/master/branches')) {
        apiCalls.push({
          endpoint: url.split('/api/')[1],
          status: response.status(),
          promise: response.json().catch(() => null)
        });
      }
    });

    // Click show filters
    const showFiltersBtn = page.locator('button:has-text("SHOW FILTERS")');
    await showFiltersBtn.click();
    await page.waitForTimeout(2000);
    console.log('✓ Filters expanded');

    await page.screenshot({ path: 'test-results/dept-branch-01-filters-shown.png' });

    // Wait for API calls to complete
    await page.waitForTimeout(1000);
    
    console.log('\n=== API Calls Made ===');
    for (const call of apiCalls) {
      const data = await call.promise;
      console.log(`${call.endpoint}: Status ${call.status}`);
      if (data) {
        console.log(`  Response structure: ${JSON.stringify(Object.keys(data))}`);
        if (data.result || data.data) {
          const items = data.result || data.data;
          console.log(`  Items count: ${items.length}`);
          if (items.length > 0) {
            console.log(`  First item: ${JSON.stringify(items[0])}`);
          }
        }
      }
    }

    // Test Department dropdown
    console.log('\n=== Testing Department Dropdown ===');
    const deptField = page.locator('label:has-text("Department")').locator('..').locator('.v-input').first();
    
    // Click on the input area to open dropdown
    await deptField.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
    
    // Check if dropdown menu appeared
    const deptOptions = await page.locator('.v-overlay--active .v-list-item-title').allTextContents();
    console.log(`Department options found: ${deptOptions.length}`);
    if (deptOptions.length > 0) {
      console.log('✓ Department dropdown is populated');
      console.log(`  Options: ${deptOptions.slice(0, 5).join(', ')}${deptOptions.length > 5 ? '...' : ''}`);
    } else {
      console.log('✗ Department dropdown is empty');
    }
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/dept-branch-02-dept-dropdown.png' });

    // Test Branch dropdown
    console.log('\n=== Testing Branch Dropdown ===');
    const branchField = page.locator('label:has-text("Branch")').locator('..').locator('.v-input').first();
    
    await branchField.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
    
    const branchOptions = await page.locator('.v-overlay--active .v-list-item-title').allTextContents();
    console.log(`Branch options found: ${branchOptions.length}`);
    if (branchOptions.length > 0) {
      console.log('✓ Branch dropdown is populated');
      console.log(`  Options: ${branchOptions.slice(0, 5).join(', ')}${branchOptions.length > 5 ? '...' : ''}`);
    } else {
      console.log('✗ Branch dropdown is empty');
    }
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/dept-branch-03-branch-dropdown.png' });

    // Try selecting a department
    if (deptOptions.length > 1) { // More than just "All"
      console.log('\n=== Testing Department Selection ===');
      await deptField.click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
      
      // Select the second option (first real department, skip "All")
      const secondOption = page.locator('.v-overlay--active .v-list-item').nth(1);
      await secondOption.click();
      await page.waitForTimeout(500);
      
      console.log('✓ Department selected');
      await page.screenshot({ path: 'test-results/dept-branch-04-dept-selected.png' });
    }

    // Try selecting a branch
    if (branchOptions.length > 1) {
      console.log('\n=== Testing Branch Selection ===');
      await branchField.click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
      
      const secondOption = page.locator('.v-overlay--active .v-list-item').nth(1);
      await secondOption.click();
      await page.waitForTimeout(500);
      
      console.log('✓ Branch selected');
      await page.screenshot({ path: 'test-results/dept-branch-05-branch-selected.png' });
    }

    // Click Search to test if filters work
    console.log('\n=== Testing Search with Filters ===');
    const searchBtn = page.locator('button:has-text("Search")').first();
    
    const searchApiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/GetResignationList')) {
        searchApiCalls.push({
          status: response.status(),
          promise: response.json().catch(() => null)
        });
      }
    });
    
    await searchBtn.click();
    await page.waitForTimeout(2000);
    
    if (searchApiCalls.length > 0) {
      console.log('✓ Search API called');
      const searchData = await searchApiCalls[0].promise;
      if (searchData) {
        console.log(`  Status: ${searchApiCalls[0].status}`);
        console.log(`  Result count: ${searchData.result?.totalRecords || 'N/A'}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/dept-branch-06-search-results.png' });

    console.log('\n=== SUMMARY ===');
    console.log(`Department options: ${deptOptions.length > 0 ? '✓ POPULATED' : '✗ EMPTY'}`);
    console.log(`Branch options: ${branchOptions.length > 0 ? '✓ POPULATED' : '✗ EMPTY'}`);
    console.log(`API calls made: ${apiCalls.length}`);
    console.log('\nCheck screenshots in test-results/ folder for visual confirmation');
  });

});
