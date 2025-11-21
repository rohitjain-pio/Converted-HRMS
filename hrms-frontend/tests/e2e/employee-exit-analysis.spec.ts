import { test, expect } from '@playwright/test';

test.describe('Employee Exit Page - Comprehensive Analysis', () => {
  
  test('Analyze Employee Exit page filters and functionality', async ({ page }) => {
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
    
    // Try multiple possible navigation paths
    const navigationAttempts = [
      { method: 'Direct URL', action: async () => {
        await page.goto('http://localhost:5173/employees/employee-exit');
        await page.waitForLoadState('networkidle');
      }},
      { method: 'Menu Navigation', action: async () => {
        // Look for Employee Exit in menu
        const menuItems = ['Employee Exit', 'Exit Management', 'Resignation', 'Exit'];
        for (const item of menuItems) {
          const menuItem = page.locator(`text=${item}`);
          if (await menuItem.count() > 0) {
            await menuItem.first().click();
            await page.waitForTimeout(2000);
            break;
          }
        }
      }}
    ];

    let pageLoaded = false;
    for (const attempt of navigationAttempts) {
      try {
        console.log(`Trying: ${attempt.method}`);
        await attempt.action();
        await page.waitForTimeout(2000);
        
        // Check if we're on the right page
        const url = page.url();
        console.log(`Current URL: ${url}`);
        
        if (url.includes('exit') || url.includes('resignation')) {
          console.log(`✓ Successfully navigated via ${attempt.method}`);
          pageLoaded = true;
          break;
        }
      } catch (e) {
        console.log(`✗ ${attempt.method} failed: ${e.message}`);
      }
    }

    if (!pageLoaded) {
      console.log('⚠ Could not navigate to Employee Exit page');
      await page.screenshot({ path: 'test-results/exit-01-navigation-failed.png' });
      throw new Error('Failed to navigate to Employee Exit page');
    }

    await page.screenshot({ path: 'test-results/exit-02-page-loaded.png' });

    console.log('\n=== STEP 3: ANALYZE PAGE STRUCTURE ===');
    
    // Check page title/heading
    const headings = await page.locator('h1, h2, h3, h4, .page-title, .v-toolbar-title').allTextContents();
    console.log('Page headings found:', headings);

    // Check for main sections
    const sections = [
      'Employee Exit',
      'Resignation',
      'Exit Management',
      'Exit List',
      'Exit Requests',
      'Pending Exit',
      'Approved Exit',
      'Rejected Exit'
    ];

    console.log('\nChecking for sections:');
    for (const section of sections) {
      const count = await page.locator(`text=${section}`).count();
      console.log(`  ${section}: ${count > 0 ? '✓ Found' : '✗ Not found'}`);
    }

    console.log('\n=== STEP 4: IDENTIFY ALL FILTERS ===');
    
    // Look for various filter elements
    const filterSelectors = [
      { name: 'Text Fields', selector: 'input[type="text"]' },
      { name: 'Search Fields', selector: 'input[type="search"], input[placeholder*="search" i]' },
      { name: 'Select/Dropdown', selector: 'select, .v-select, .v-autocomplete' },
      { name: 'Date Pickers', selector: 'input[type="date"], .v-date-picker' },
      { name: 'Checkboxes', selector: 'input[type="checkbox"]' },
      { name: 'Radio Buttons', selector: 'input[type="radio"]' },
      { name: 'Buttons', selector: 'button' }
    ];

    const foundFilters = [];
    console.log('\nScanning for filter elements:');
    
    for (const filter of filterSelectors) {
      const elements = page.locator(filter.selector);
      const count = await elements.count();
      console.log(`\n${filter.name}: ${count} found`);
      
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 10); i++) {
          try {
            const element = elements.nth(i);
            const isVisible = await element.isVisible().catch(() => false);
            
            if (isVisible) {
              const label = await element.getAttribute('label').catch(() => null) ||
                           await element.getAttribute('placeholder').catch(() => null) ||
                           await element.getAttribute('aria-label').catch(() => null) ||
                           await element.innerText().catch(() => '');
              
              const id = await element.getAttribute('id').catch(() => '');
              const name = await element.getAttribute('name').catch(() => '');
              
              if (label || id || name) {
                foundFilters.push({
                  type: filter.name,
                  label: label || id || name || 'Unnamed',
                  selector: filter.selector,
                  index: i
                });
                console.log(`  [${i}] ${label || id || name || 'Unnamed'}`);
              }
            }
          } catch (e) {
            // Skip elements that can't be accessed
          }
        }
      }
    }

    await page.screenshot({ path: 'test-results/exit-03-filters-visible.png' });

    console.log('\n=== STEP 5: TEST EACH FILTER ===');
    
    // Look for common filter fields by label
    const commonFilters = [
      { label: /employee.*name/i, type: 'text', testValue: 'Test' },
      { label: /employee.*code/i, type: 'text', testValue: 'EMP001' },
      { label: /department/i, type: 'select', testValue: null },
      { label: /designation/i, type: 'select', testValue: null },
      { label: /status/i, type: 'select', testValue: null },
      { label: /exit.*type/i, type: 'select', testValue: null },
      { label: /resignation.*type/i, type: 'select', testValue: null },
      { label: /from.*date|start.*date/i, type: 'date', testValue: '2025-01-01' },
      { label: /to.*date|end.*date/i, type: 'date', testValue: '2025-12-31' },
      { label: /search/i, type: 'text', testValue: 'test search' }
    ];

    const filterResults = [];

    for (const filter of commonFilters) {
      console.log(`\nTesting filter: ${filter.label}`);
      
      try {
        // Try to find the filter by various methods
        let filterElement = null;
        
        // Method 1: By label text
        const labels = page.locator('label, .v-label').filter({ hasText: filter.label });
        if (await labels.count() > 0) {
          const labelElement = labels.first();
          // Find associated input
          const forAttr = await labelElement.getAttribute('for').catch(() => null);
          if (forAttr) {
            filterElement = page.locator(`#${forAttr}`);
          } else {
            // Try to find input near the label
            filterElement = labelElement.locator('..').locator('input, select').first();
          }
        }

        // Method 2: By placeholder
        if (!filterElement || await filterElement.count() === 0) {
          filterElement = page.locator(`input[placeholder*="${filter.label}" i], select[placeholder*="${filter.label}" i]`).first();
        }

        // Method 3: By aria-label
        if (!filterElement || await filterElement.count() === 0) {
          filterElement = page.locator(`[aria-label*="${filter.label}" i]`).first();
        }

        if (await filterElement.count() > 0 && await filterElement.isVisible()) {
          console.log(`  ✓ Filter found`);
          
          // Test the filter
          if (filter.type === 'text' || filter.type === 'date') {
            await filterElement.fill(filter.testValue);
            const value = await filterElement.inputValue();
            
            if (value === filter.testValue) {
              console.log(`  ✓ Can fill value: ${value}`);
              filterResults.push({ filter: filter.label, status: 'Working', detail: 'Can fill value' });
            } else {
              console.log(`  ✗ Value not set correctly. Expected: ${filter.testValue}, Got: ${value}`);
              filterResults.push({ filter: filter.label, status: 'Issue', detail: 'Value not set correctly' });
            }
            
            // Clear the field
            await filterElement.clear();
          } else if (filter.type === 'select') {
            // Try to click to see options
            await filterElement.click();
            await page.waitForTimeout(500);
            
            // Check for dropdown options
            const options = await page.locator('.v-list-item, option, .v-menu .v-list-item-title').count();
            console.log(`  ✓ Dropdown opened with ${options} options`);
            filterResults.push({ filter: filter.label, status: 'Working', detail: `${options} options available` });
            
            // Close dropdown
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          }
        } else {
          console.log(`  ✗ Filter not found`);
          filterResults.push({ filter: filter.label, status: 'Not Found', detail: 'Element not visible' });
        }
      } catch (e) {
        console.log(`  ✗ Error testing filter: ${e.message}`);
        filterResults.push({ filter: filter.label, status: 'Error', detail: e.message });
      }
    }

    await page.screenshot({ path: 'test-results/exit-04-after-filter-tests.png' });

    console.log('\n=== STEP 6: CHECK DATA TABLE ===');
    
    // Look for data table
    const tableSelectors = [
      'table',
      '.v-table',
      '.v-data-table',
      '[role="table"]'
    ];

    let dataTable = null;
    for (const selector of tableSelectors) {
      const table = page.locator(selector).first();
      if (await table.count() > 0 && await table.isVisible()) {
        dataTable = table;
        console.log(`✓ Data table found using selector: ${selector}`);
        break;
      }
    }

    if (dataTable) {
      // Check table headers
      const headers = await dataTable.locator('th, .v-data-table-header th').allTextContents();
      console.log(`\nTable Headers (${headers.length}):`);
      headers.forEach((header, i) => {
        if (header.trim()) console.log(`  ${i + 1}. ${header.trim()}`);
      });

      // Check rows
      const rows = await dataTable.locator('tbody tr, .v-data-table__tr').count();
      console.log(`\nTable Rows: ${rows}`);

      if (rows > 0) {
        console.log('\nFirst row data:');
        const firstRowCells = await dataTable.locator('tbody tr, .v-data-table__tr').first().locator('td').allTextContents();
        firstRowCells.forEach((cell, i) => {
          if (cell.trim()) console.log(`  Column ${i + 1}: ${cell.trim()}`);
        });
      } else {
        console.log('⚠ No data rows found in table');
        
        // Check for "no data" message
        const noDataMessages = [
          'No data available',
          'No records found',
          'No exit requests',
          'No employees found',
          'Empty'
        ];
        
        for (const msg of noDataMessages) {
          if (await page.locator(`text=${msg}`).count() > 0) {
            console.log(`  Found message: "${msg}"`);
          }
        }
      }

      await page.screenshot({ path: 'test-results/exit-05-data-table.png' });
    } else {
      console.log('✗ Data table not found');
    }

    console.log('\n=== STEP 7: CHECK ACTION BUTTONS ===');
    
    const actionButtons = [
      'Add',
      'Create',
      'New',
      'Export',
      'Download',
      'Filter',
      'Clear',
      'Reset',
      'Search',
      'View',
      'Edit',
      'Delete',
      'Approve',
      'Reject'
    ];

    console.log('\nAction buttons available:');
    const availableButtons = [];
    for (const btnText of actionButtons) {
      const buttons = page.locator(`button:has-text("${btnText}")`);
      const count = await buttons.count();
      if (count > 0) {
        const firstBtn = buttons.first();
        const isVisible = await firstBtn.isVisible().catch(() => false);
        const isEnabled = await firstBtn.isEnabled().catch(() => false);
        
        if (isVisible) {
          console.log(`  ${btnText}: ${count} button(s) - ${isEnabled ? 'Enabled' : 'Disabled'}`);
          availableButtons.push({ text: btnText, count, enabled: isEnabled });
        }
      }
    }

    await page.screenshot({ path: 'test-results/exit-06-action-buttons.png' });

    console.log('\n=== STEP 8: TEST API CALLS ===');
    
    // Monitor network requests
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiCalls.push({
          url: url,
          status: response.status(),
          method: response.request().method()
        });
      }
    });

    // Try to trigger a filter action
    const searchButton = page.locator('button:has-text("Search"), button:has-text("Filter"), button[type="submit"]').first();
    if (await searchButton.count() > 0 && await searchButton.isVisible()) {
      console.log('Clicking search/filter button to trigger API call...');
      await searchButton.click();
      await page.waitForTimeout(3000);
    }

    console.log(`\nAPI Calls made (${apiCalls.length}):`);
    apiCalls.forEach(call => {
      console.log(`  ${call.method} ${call.url.split('/api/')[1]} - Status: ${call.status}`);
    });

    await page.screenshot({ path: 'test-results/exit-07-final-state.png' });

    console.log('\n=== STEP 9: SUMMARY ===');
    console.log('\n📊 Filter Test Results:');
    filterResults.forEach(result => {
      const icon = result.status === 'Working' ? '✓' : result.status === 'Not Found' ? '⚠' : '✗';
      console.log(`  ${icon} ${result.filter}: ${result.status} - ${result.detail}`);
    });

    console.log('\n📋 Available Action Buttons:');
    availableButtons.forEach(btn => {
      console.log(`  • ${btn.text} (${btn.enabled ? 'Enabled' : 'Disabled'})`);
    });

    console.log('\n🔗 API Endpoints Used:');
    const uniqueEndpoints = [...new Set(apiCalls.map(c => c.url.split('/api/')[1]?.split('?')[0]))];
    uniqueEndpoints.forEach(endpoint => {
      if (endpoint) console.log(`  • /api/${endpoint}`);
    });

    console.log('\n=== TEST COMPLETE ===');
    console.log('All screenshots saved in test-results/ folder');
  });

});
