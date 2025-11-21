import { test, expect } from '@playwright/test';

test.describe('Employee Exit - Console and Network Check', () => {
  
  test('Check console errors and API responses', async ({ page }) => {
    test.setTimeout(60000);

    const consoleMessages: any[] = [];
    const consoleErrors: string[] = [];
    const apiResponses: any[] = [];

    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Capture API responses
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/master/departments') || url.includes('/api/master/branches')) {
        try {
          const data = await response.json();
          apiResponses.push({
            url: url.split('/api/')[1],
            status: response.status(),
            data: data
          });
        } catch (e) {
          apiResponses.push({
            url: url.split('/api/')[1],
            status: response.status(),
            error: 'Failed to parse JSON'
          });
        }
      }
    });

    console.log('=== Loading Page ===\n');

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
    await page.waitForTimeout(3000);
    console.log('✓ On Employee Exit page');

    // Click show filters
    const showFiltersBtn = page.locator('button:has-text("SHOW FILTERS")');
    await showFiltersBtn.click();
    await page.waitForTimeout(3000);
    console.log('✓ Filters expanded');

    await page.screenshot({ path: 'test-results/console-check-filters.png', fullPage: true });

    // Print API responses
    console.log('\n=== API RESPONSES ===');
    for (const resp of apiResponses) {
      console.log(`\n${resp.url}:`);
      console.log(`  Status: ${resp.status}`);
      if (resp.data) {
        console.log(`  Structure: ${JSON.stringify(Object.keys(resp.data))}`);
        if (resp.data.result) {
          console.log(`  Result count: ${resp.data.result.length}`);
          if (resp.data.result.length > 0) {
            console.log(`  First item keys: ${JSON.stringify(Object.keys(resp.data.result[0]))}`);
            console.log(`  First item: ${JSON.stringify(resp.data.result[0])}`);
          }
        }
        if (resp.data.data) {
          console.log(`  Data count: ${resp.data.data.length}`);
          if (resp.data.data.length > 0) {
            console.log(`  First item: ${JSON.stringify(resp.data.data[0])}`);
          }
        }
      } else if (resp.error) {
        console.log(`  Error: ${resp.error}`);
      }
    }

    // Print console errors
    console.log('\n=== CONSOLE ERRORS ===');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.log(`  ${err}`));
    } else {
      console.log('  No console errors');
    }

    // Check if department field exists and is visible
    console.log('\n=== CHECKING DOM ELEMENTS ===');
    const deptLabel = await page.locator('label:has-text("Department")').count();
    console.log(`Department label count: ${deptLabel}`);
    
    const branchLabel = await page.locator('label:has-text("Branch")').count();
    console.log(`Branch label count: ${branchLabel}`);

    // Check v-select elements
    const vSelects = await page.locator('.v-select').count();
    console.log(`Total v-select elements: ${vSelects}`);

    // Wait a bit more to see if anything loads
    await page.waitForTimeout(2000);

    console.log('\n=== FINAL STATUS ===');
    console.log(`API calls made: ${apiResponses.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log('\nTest completed. Check screenshot and logs above.');
  });

});
