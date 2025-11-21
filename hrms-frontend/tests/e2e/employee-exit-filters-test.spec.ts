import { test, expect } from '@playwright/test';

test.describe('Employee Exit - Detailed Filter Testing', () => {
  
  test('Test all filters and their functionality', async ({ page }) => {
    test.setTimeout(180000);

    console.log('=== STEP 1: LOGIN ===');
    await page.goto('http://localhost:5173/internal-login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Logged in successfully');

    console.log('\n=== STEP 2: NAVIGATE TO EMPLOYEE EXIT PAGE ===');
    await page.goto('http://localhost:5173/employees/employee-exit');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ On Employee Exit page');
    await page.screenshot({ path: 'test-results/exit-filters-01-initial.png' });

    console.log('\n=== STEP 3: CLICK SHOW FILTERS BUTTON ===');
    const showFiltersBtn = page.locator('button:has-text("SHOW FILTERS")');
    const btnVisible = await showFiltersBtn.isVisible();
    console.log(`Show Filters button visible: ${btnVisible}`);
    
    if (btnVisible) {
      await showFiltersBtn.click();
      await page.waitForTimeout(1000);
      console.log('✓ Filters expanded');
      await page.screenshot({ path: 'test-results/exit-filters-02-expanded.png' });
    } else {
      console.log('⚠ Show Filters button not found');
    }

    console.log('\n=== STEP 4: TEST ALL VISIBLE FILTERS ===');
    
    const filterTests = [];

    // Test 1: Search Field
    console.log('\n[Filter 1] Search by Employee Code or Name');
    try {
      const searchField = page.locator('input[placeholder*="employee code or name" i]').first();
      if (await searchField.isVisible()) {
        await searchField.fill('EMP001');
        const value = await searchField.inputValue();
        console.log(`  ✓ Can fill: "${value}"`);
        filterTests.push({ name: 'Search Field', status: 'Working', value });
        await searchField.clear();
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'Search Field', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'Search Field', status: 'Error', error: e.message });
    }

    // Test 2: Resignation Status
    console.log('\n[Filter 2] Resignation Status');
    try {
      const resignationStatus = page.locator('label:has-text("Resignation Status")').locator('..').locator('.v-select, input, select').first();
      if (await resignationStatus.isVisible()) {
        await resignationStatus.click();
        await page.waitForTimeout(500);
        const options = await page.locator('.v-list-item, .v-menu .v-list-item-title').allTextContents();
        console.log(`  ✓ Dropdown opened with ${options.length} options`);
        if (options.length > 0) {
          console.log(`  Options: ${options.slice(0, 5).map(o => o.trim()).filter(o => o).join(', ')}...`);
        }
        filterTests.push({ name: 'Resignation Status', status: 'Working', optionCount: options.length });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'Resignation Status', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'Resignation Status', status: 'Error', error: e.message });
    }

    // Test 3: Department
    console.log('\n[Filter 3] Department');
    try {
      const department = page.locator('label:has-text("Department")').locator('..').locator('.v-select, input, select').first();
      if (await department.isVisible()) {
        await department.click();
        await page.waitForTimeout(500);
        const options = await page.locator('.v-list-item, .v-menu .v-list-item-title').allTextContents();
        console.log(`  ✓ Dropdown opened with ${options.length} options`);
        if (options.length > 0) {
          console.log(`  Options: ${options.slice(0, 5).map(o => o.trim()).filter(o => o).join(', ')}...`);
        }
        filterTests.push({ name: 'Department', status: 'Working', optionCount: options.length });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'Department', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'Department', status: 'Error', error: e.message });
    }

    // Test 4: Branch
    console.log('\n[Filter 4] Branch');
    try {
      const branch = page.locator('label:has-text("Branch")').locator('..').locator('.v-select, input, select').first();
      if (await branch.isVisible()) {
        await branch.click();
        await page.waitForTimeout(500);
        const options = await page.locator('.v-list-item, .v-menu .v-list-item-title').allTextContents();
        console.log(`  ✓ Dropdown opened with ${options.length} options`);
        if (options.length > 0) {
          console.log(`  Options: ${options.slice(0, 5).map(o => o.trim()).filter(o => o).join(', ')}...`);
        }
        filterTests.push({ name: 'Branch', status: 'Working', optionCount: options.length });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'Branch', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'Branch', status: 'Error', error: e.message });
    }

    // Test 5: IT No Due
    console.log('\n[Filter 5] IT No Due');
    try {
      const itNoDue = page.locator('label:has-text("IT No Due")').locator('..').locator('.v-select, input, select').first();
      if (await itNoDue.isVisible()) {
        await itNoDue.click();
        await page.waitForTimeout(500);
        const options = await page.locator('.v-list-item, .v-menu .v-list-item-title').allTextContents();
        console.log(`  ✓ Dropdown opened with ${options.length} options`);
        filterTests.push({ name: 'IT No Due', status: 'Working', optionCount: options.length });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'IT No Due', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'IT No Due', status: 'Error', error: e.message });
    }

    // Test 6: Accounts No Due
    console.log('\n[Filter 6] Accounts No Due');
    try {
      const accountsNoDue = page.locator('label:has-text("Accounts No Due")').locator('..').locator('.v-select, input, select').first();
      if (await accountsNoDue.isVisible()) {
        await accountsNoDue.click();
        await page.waitForTimeout(500);
        const options = await page.locator('.v-list-item, .v-menu .v-list-item-title').allTextContents();
        console.log(`  ✓ Dropdown opened with ${options.length} options`);
        filterTests.push({ name: 'Accounts No Due', status: 'Working', optionCount: options.length });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'Accounts No Due', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'Accounts No Due', status: 'Error', error: e.message });
    }

    // Test 7: Last Working Day Range
    console.log('\n[Filter 7] Last Working Day Range');
    try {
      const lwdRange = page.locator('label:has-text("Last Working Day Range")').locator('..').locator('.v-select, input, select').first();
      if (await lwdRange.isVisible()) {
        await lwdRange.click();
        await page.waitForTimeout(500);
        const options = await page.locator('.v-list-item, .v-menu .v-list-item-title').allTextContents();
        console.log(`  ✓ Dropdown opened with ${options.length} options`);
        if (options.length > 0) {
          console.log(`  Options: ${options.slice(0, 5).map(o => o.trim()).filter(o => o).join(', ')}...`);
        }
        filterTests.push({ name: 'Last Working Day Range', status: 'Working', optionCount: options.length });
        
        // Test selecting "Custom" option
        const customOption = page.locator('.v-list-item-title:has-text("Custom")');
        if (await customOption.count() > 0) {
          await customOption.click();
          await page.waitForTimeout(500);
          console.log('  Testing custom date range fields...');
          
          const fromDate = page.locator('input[label="Last Working From"], label:has-text("Last Working From")').locator('..').locator('input[type="date"]').first();
          const toDate = page.locator('input[label="Last Working To"], label:has-text("Last Working To")').locator('..').locator('input[type="date"]').first();
          
          if (await fromDate.isVisible() && await toDate.isVisible()) {
            console.log('  ✓ Custom date fields appeared');
            await fromDate.fill('2025-01-01');
            await toDate.fill('2025-12-31');
            console.log('  ✓ Custom dates filled');
          }
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(300);
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'Last Working Day Range', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'Last Working Day Range', status: 'Error', error: e.message });
    }

    // Test 8: Resignation Date
    console.log('\n[Filter 8] Resignation Date');
    try {
      const resignationDate = page.locator('label:has-text("Resignation Date")').locator('..').locator('input[type="date"]').first();
      if (await resignationDate.isVisible()) {
        await resignationDate.fill('2025-11-21');
        const value = await resignationDate.inputValue();
        console.log(`  ✓ Can fill date: ${value}`);
        filterTests.push({ name: 'Resignation Date', status: 'Working', value });
        await resignationDate.clear();
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'Resignation Date', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'Resignation Date', status: 'Error', error: e.message });
    }

    // Test 9: Employee Status
    console.log('\n[Filter 9] Employee Status');
    try {
      const employeeStatus = page.locator('label:has-text("Employee Status")').locator('..').locator('.v-select, input, select').first();
      if (await employeeStatus.isVisible()) {
        await employeeStatus.click();
        await page.waitForTimeout(500);
        const options = await page.locator('.v-list-item, .v-menu .v-list-item-title').allTextContents();
        console.log(`  ✓ Dropdown opened with ${options.length} options`);
        if (options.length > 0) {
          console.log(`  Options: ${options.slice(0, 5).map(o => o.trim()).filter(o => o).join(', ')}...`);
        }
        filterTests.push({ name: 'Employee Status', status: 'Working', optionCount: options.length });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } else {
        console.log('  ✗ Not visible');
        filterTests.push({ name: 'Employee Status', status: 'Not Found' });
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      filterTests.push({ name: 'Employee Status', status: 'Error', error: e.message });
    }

    await page.screenshot({ path: 'test-results/exit-filters-03-all-tested.png' });

    console.log('\n=== STEP 5: TEST FILTER BUTTONS ===');
    
    // Test Search Button
    console.log('\n[Button 1] Search Button');
    try {
      const searchBtn = page.locator('button:has-text("Search")').first();
      if (await searchBtn.isVisible() && await searchBtn.isEnabled()) {
        console.log('  ✓ Search button is visible and enabled');
        
        // Monitor API call
        const responsePromise = page.waitForResponse(
          response => response.url().includes('/api/') && response.request().method() === 'POST',
          { timeout: 5000 }
        ).catch(() => null);
        
        await searchBtn.click();
        console.log('  ✓ Search button clicked');
        
        const response = await responsePromise;
        if (response) {
          console.log(`  ✓ API called: ${response.status()} ${response.url().split('/api/')[1]}`);
        }
        
        await page.waitForTimeout(2000);
      } else {
        console.log('  ✗ Search button not available');
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
    }

    await page.screenshot({ path: 'test-results/exit-filters-04-after-search.png' });

    // Test Reset Button
    console.log('\n[Button 2] Reset Button');
    try {
      const resetBtn = page.locator('button:has-text("Reset")').first();
      if (await resetBtn.isVisible() && await resetBtn.isEnabled()) {
        console.log('  ✓ Reset button is visible and enabled');
        await resetBtn.click();
        console.log('  ✓ Reset button clicked');
        await page.waitForTimeout(1000);
      } else {
        console.log('  ✗ Reset button not available');
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
    }

    await page.screenshot({ path: 'test-results/exit-filters-05-after-reset.png' });

    // Test Refresh Button
    console.log('\n[Button 3] Refresh Button');
    try {
      const refreshBtn = page.locator('button:has-text("REFRESH")').first();
      if (await refreshBtn.isVisible() && await refreshBtn.isEnabled()) {
        console.log('  ✓ Refresh button is visible and enabled');
        
        const responsePromise = page.waitForResponse(
          response => response.url().includes('/api/'),
          { timeout: 5000 }
        ).catch(() => null);
        
        await refreshBtn.click();
        console.log('  ✓ Refresh button clicked');
        
        const response = await responsePromise;
        if (response) {
          console.log(`  ✓ API called: ${response.status()}`);
        }
        
        await page.waitForTimeout(2000);
      } else {
        console.log('  ✗ Refresh button not available');
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
    }

    await page.screenshot({ path: 'test-results/exit-filters-06-final.png' });

    console.log('\n=== STEP 6: SUMMARY ===');
    console.log('\n📊 Filter Test Results:\n');
    
    const working = filterTests.filter(f => f.status === 'Working').length;
    const notFound = filterTests.filter(f => f.status === 'Not Found').length;
    const errors = filterTests.filter(f => f.status === 'Error').length;
    
    console.log(`Total Filters Tested: ${filterTests.length}`);
    console.log(`  ✓ Working: ${working}`);
    console.log(`  ⚠ Not Found: ${notFound}`);
    console.log(`  ✗ Errors: ${errors}`);
    
    console.log('\nDetailed Results:');
    filterTests.forEach(filter => {
      const icon = filter.status === 'Working' ? '✓' : filter.status === 'Not Found' ? '⚠' : '✗';
      let detail = '';
      if (filter.optionCount !== undefined) detail = ` (${filter.optionCount} options)`;
      if (filter.value) detail = ` (value: ${filter.value})`;
      if (filter.error) detail = ` (${filter.error})`;
      console.log(`  ${icon} ${filter.name}: ${filter.status}${detail}`);
    });

    console.log('\n=== TEST COMPLETE ===');
    console.log('All screenshots saved in test-results/ folder');
  });

});
