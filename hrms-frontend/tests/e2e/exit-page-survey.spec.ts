import { test, expect } from '@playwright/test';

test.describe('Employee Exit Page Survey', () => {
  test('Survey all elements and interactions on Exit page', async ({ page }) => {
    console.log('=== EMPLOYEE EXIT PAGE SURVEY ===\n');
    
    // Step 1: Login
    console.log('Step 1: Logging in as admin@hrms.com...');
    await page.goto('http://localhost:5173/internal-login');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✓ Login successful\n');
    
    // Step 2: Navigate to Exit Management page
    console.log('Step 2: Navigating to Exit Management...');
    
    // Try to find and click Exit/Resignation menu
    try {
      // Look for navigation menu items
      const navItems = await page.locator('nav a, nav button, [role="navigation"] a, [role="navigation"] button').all();
      console.log(`Found ${navItems.length} navigation items`);
      
      for (const item of navItems) {
        const text = await item.textContent();
        if (text && (text.includes('Exit') || text.includes('Resignation'))) {
          console.log(`  Found: "${text}"`);
        }
      }
      
      // Try to navigate to exit management directly
      await page.goto('http://localhost:5173/exit-management');
      await page.waitForTimeout(2000);
      console.log('✓ Navigated to exit management page\n');
    } catch (e) {
      console.log(`⚠ Navigation failed: ${e}`);
    }
    
    // Step 3: Take screenshot of current page
    await page.screenshot({ path: 'test-results/exit-page-initial.png', fullPage: true });
    console.log('Step 3: Screenshot saved as exit-page-initial.png\n');
    
    // Step 4: Check URL and page title
    const currentUrl = page.url();
    const title = await page.title();
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Page Title: ${title}\n`);
    
    // Step 5: Survey all visible elements
    console.log('Step 5: Surveying page elements...\n');
    
    // Check for headers
    console.log('=== HEADERS ===');
    const headers = await page.locator('h1, h2, h3, h4, h5, h6').all();
    for (const header of headers) {
      const text = await header.textContent();
      const visible = await header.isVisible();
      if (visible && text?.trim()) {
        console.log(`  ${text.trim()}`);
      }
    }
    console.log('');
    
    // Check for tables
    console.log('=== TABLES ===');
    const tables = await page.locator('table').all();
    console.log(`Found ${tables.length} table(s)`);
    
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const visible = await table.isVisible();
      if (visible) {
        console.log(`\nTable ${i + 1}:`);
        
        // Get table headers
        const headerCells = await table.locator('thead th, thead td').all();
        if (headerCells.length > 0) {
          console.log('  Headers:');
          for (const cell of headerCells) {
            const text = await cell.textContent();
            if (text?.trim()) {
              console.log(`    - ${text.trim()}`);
            }
          }
        }
        
        // Get row count
        const rows = await table.locator('tbody tr').all();
        console.log(`  Data Rows: ${rows.length}`);
        
        // Sample first row data
        if (rows.length > 0) {
          console.log('  First Row Data:');
          const cells = await rows[0].locator('td').all();
          for (let j = 0; j < cells.length && j < 10; j++) {
            const text = await cells[j].textContent();
            console.log(`    Col ${j + 1}: ${text?.trim() || '(empty)'}`);
          }
        }
      }
    }
    console.log('');
    
    // Check for buttons
    console.log('=== BUTTONS ===');
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} button(s)`);
    const visibleButtons: string[] = [];
    for (const button of buttons) {
      const visible = await button.isVisible();
      if (visible) {
        const text = await button.textContent();
        if (text?.trim()) {
          visibleButtons.push(text.trim());
        }
      }
    }
    visibleButtons.forEach(b => console.log(`  - ${b}`));
    console.log('');
    
    // Check for form inputs
    console.log('=== FORM INPUTS ===');
    const inputs = await page.locator('input, select, textarea').all();
    console.log(`Found ${inputs.length} input(s)`);
    for (const input of inputs) {
      const visible = await input.isVisible();
      if (visible) {
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        const name = await input.getAttribute('name');
        console.log(`  - Type: ${type || 'text'}, Name: ${name || 'N/A'}, Placeholder: ${placeholder || 'N/A'}`);
      }
    }
    console.log('');
    
    // Check for tabs
    console.log('=== TABS ===');
    const tabs = await page.locator('[role="tab"], .v-tab').all();
    if (tabs.length > 0) {
      console.log(`Found ${tabs.length} tab(s):`);
      for (const tab of tabs) {
        const text = await tab.textContent();
        const visible = await tab.isVisible();
        if (visible && text?.trim()) {
          console.log(`  - ${text.trim()}`);
        }
      }
    } else {
      console.log('No tabs found');
    }
    console.log('');
    
    // Check for empty or missing data
    console.log('=== CHECKING FOR EMPTY VALUES ===');
    const allText = await page.textContent('body');
    const emptyMarkers = [
      '(empty)',
      'N/A',
      'null',
      'undefined',
      '---',
      'No data',
      'Loading...'
    ];
    
    for (const marker of emptyMarkers) {
      if (allText?.includes(marker)) {
        console.log(`  ⚠ Found empty marker: "${marker}"`);
      }
    }
    console.log('');
    
    // Check for visible errors
    console.log('=== CHECKING FOR ERRORS ===');
    const errorElements = await page.locator('.error, [role="alert"], .v-messages__message, .error--text, .text-error').all();
    if (errorElements.length > 0) {
      console.log(`Found ${errorElements.length} error element(s):`);
      for (const error of errorElements) {
        const visible = await error.isVisible();
        if (visible) {
          const text = await error.textContent();
          if (text?.trim()) {
            console.log(`  ⚠ ${text.trim()}`);
          }
        }
      }
    } else {
      console.log('No errors found');
    }
    console.log('');
    
    // Try to click first row if exists to see details
    console.log('=== TESTING INTERACTIONS ===');
    try {
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        console.log('Attempting to click first row...');
        await firstRow.click();
        await page.waitForTimeout(1000);
        
        // Check if dialog/modal opened
        const dialogs = await page.locator('[role="dialog"], .v-dialog').all();
        for (const dialog of dialogs) {
          if (await dialog.isVisible()) {
            console.log('✓ Dialog opened!');
            await page.screenshot({ path: 'test-results/exit-page-dialog.png', fullPage: true });
            
            // Get dialog content
            const dialogText = await dialog.textContent();
            console.log('Dialog content preview:');
            console.log(dialogText?.substring(0, 500));
            
            // Check for department, branch, etc. fields
            const fields = ['Department', 'Branch', 'Employee', 'Resignation', 'Status', 'Date'];
            console.log('\nChecking for field visibility:');
            for (const field of fields) {
              const fieldElement = dialog.locator(`text=${field}`);
              const exists = await fieldElement.count() > 0;
              console.log(`  ${field}: ${exists ? '✓ Found' : '✗ Not found'}`);
            }
          }
        }
      }
    } catch (e) {
      console.log(`⚠ Interaction test failed: ${e}`);
    }
    console.log('');
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/exit-page-final.png', fullPage: true });
    console.log('=== SURVEY COMPLETE ===');
    console.log('Screenshots saved in test-results/');
  });
});
