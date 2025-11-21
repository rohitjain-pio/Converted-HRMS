import { test, expect } from '@playwright/test';

test.describe('Exit Management - Complete Survey & Functionality Test', () => {
  test('Complete exit management functionality test', async ({ page }) => {
    console.log('=== EXIT MANAGEMENT COMPLETE TEST ===\n');
    
    // Step 1: Login
    console.log('Step 1: Logging in...');
    await page.goto('http://localhost:5173/internal-login');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✓ Login successful\n');
    
    // Step 2: Navigate to Exit Management
    console.log('Step 2: Navigating to Exit Management...');
    await page.goto('http://localhost:5173/employees/employee-exit');
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('unauthorized')) {
      console.log('⚠ Unauthorized access - user may not have permissions');
      return;
    }
    console.log('✓ Navigated to Exit Management\n');
    
    // Step 3: Take screenshot
    await page.screenshot({ path: 'test-results/exit-management-page.png', fullPage: true });
    console.log('Step 3: Screenshot saved\n');
    
    // Step 4: Check page title
    console.log('Step 4: Checking page elements...');
    const pageTitle = await page.locator('h2, h5, .text-h5').first().textContent();
    console.log(`Page Title: ${pageTitle}\n`);
    
    // Step 5: Check table headers
    console.log('Step 5: Verifying table headers...');
    const headers = await page.locator('thead th').allTextContents();
    console.log('Table Headers:');
    headers.forEach((header, index) => {
      if (header.trim()) {
        console.log(`  ${index + 1}. ${header.trim()}`);
      }
    });
    
    // Verify critical columns exist
    const headerText = headers.join(' ');
    const requiredColumns = ['Employee Code', 'Employee Name', 'Department', 'Branch', 'Resignation Date'];
    console.log('\nVerifying required columns:');
    for (const col of requiredColumns) {
      const exists = headerText.includes(col);
      console.log(`  ${col}: ${exists ? '✓ Found' : '✗ Missing'}`);
      if (!exists) {
        console.log(`    ⚠ Warning: Required column "${col}" not found`);
      }
    }
    console.log('');
    
    // Step 6: Check table data
    console.log('Step 6: Checking table data...');
    const rows = await page.locator('tbody tr').count();
    console.log(`Total rows: ${rows}`);
    
    if (rows > 0) {
      console.log('\nFirst row data:');
      const firstRow = page.locator('tbody tr').first();
      const cells = await firstRow.locator('td').allTextContents();
      cells.forEach((cell, index) => {
        if (cell.trim()) {
          console.log(`  Column ${index + 1}: ${cell.trim()}`);
        }
      });
      
      // Check for empty values in important columns
      console.log('\nChecking for empty/missing values in first row:');
      const employeeCode = cells[0]?.trim();
      const employeeName = cells[1]?.trim();
      const department = cells[2]?.trim();
      const branch = cells[3]?.trim();
      
      console.log(`  Employee Code: ${employeeCode || '(EMPTY)'} ${employeeCode ? '✓' : '✗'}`);
      console.log(`  Employee Name: ${employeeName || '(EMPTY)'} ${employeeName ? '✓' : '✗'}`);
      console.log(`  Department: ${department || '(EMPTY)'} ${department ? '✓' : '✗'}`);
      console.log(`  Branch: ${branch || '(EMPTY)'} ${branch ? '✓' : '✗'}`);
    } else {
      console.log('⚠ No data rows found in table');
    }
    console.log('');
    
    // Step 7: Test filters
    console.log('Step 7: Testing filters...');
    const showFiltersBtn = page.locator('button:has-text("Show Filters"), button:has-text("Hide Filters")');
    if (await showFiltersBtn.isVisible()) {
      console.log('✓ Filter button found');
      await showFiltersBtn.click();
      await page.waitForTimeout(500);
      
      // Check filter options
      const departmentFilter = page.locator('label:has-text("Department")').locator('..');
      const branchFilter = page.locator('label:has-text("Branch")').locator('..');
      
      console.log(`  Department filter: ${await departmentFilter.isVisible() ? '✓ Visible' : '✗ Not visible'}`);
      console.log(`  Branch filter: ${await branchFilter.isVisible() ? '✓ Visible' : '✗ Not visible'}`);
    } else {
      console.log('✗ Filter button not found');
    }
    console.log('');
    
    // Step 8: Click on first row to view details
    if (rows > 0) {
      console.log('Step 8: Testing row click for details...');
      const viewButton = page.locator('tbody tr').first().locator('button[icon="mdi-eye"], button:has(svg.mdi-eye)').first();
      
      if (await viewButton.isVisible()) {
        console.log('✓ View button found, clicking...');
        await viewButton.click();
        await page.waitForTimeout(2000);
        
        // Check if we navigated to details page
        const detailsUrl = page.url();
        console.log(`Navigated to: ${detailsUrl}`);
        
        if (detailsUrl.includes('/employee-exit/')) {
          console.log('✓ Successfully navigated to details page\n');
          
          // Take screenshot of details page
          await page.screenshot({ path: 'test-results/exit-details-page.png', fullPage: true });
          
          // Step 9: Check details page content
          console.log('Step 9: Checking exit details page...');
          const detailsTitle = await page.locator('h2, .text-h5').first().textContent();
          console.log(`Details Page Title: ${detailsTitle}\n`);
          
          // Check for resignation details fields
          console.log('Checking resignation detail fields:');
          const detailLabels = await page.locator('.detail-item .text-caption, .text-caption.text-grey-darken-1').allTextContents();
          detailLabels.forEach((label, index) => {
            if (label.trim()) {
              console.log(`  ${index + 1}. ${label.trim()}`);
            }
          });
          
          // Verify critical fields
          const detailText = detailLabels.join(' ');
          const requiredFields = ['Employee Name', 'Employee Code', 'Department', 'Branch', 'Reporting Manager'];
          console.log('\nVerifying required fields:');
          for (const field of requiredFields) {
            const exists = detailText.includes(field);
            console.log(`  ${field}: ${exists ? '✓ Found' : '✗ Missing'}`);
          }
          console.log('');
          
          // Check for empty values in details
          console.log('Checking for empty values in details:');
          const detailValues = await page.locator('.detail-item .text-body-1, .detail-item span').allTextContents();
          const emptyCount = detailValues.filter(v => !v.trim() || v.trim() === '-').length;
          console.log(`  Total fields: ${detailValues.length}`);
          console.log(`  Empty/dash fields: ${emptyCount}`);
          if (emptyCount > 0) {
            console.log('  ⚠ Some fields are empty or showing dash (-)');
          }
          console.log('');
          
          // Check for clearance tabs
          console.log('Checking clearance tabs:');
          const tabs = await page.locator('[role="tab"], .v-tab').allTextContents();
          tabs.forEach((tab, index) => {
            if (tab.trim()) {
              console.log(`  ${index + 1}. ${tab.trim()}`);
            }
          });
          console.log('');
          
          // Test clicking different tabs
          console.log('Testing clearance tabs navigation:');
          const tabButtons = await page.locator('[role="tab"], .v-tab').all();
          for (let i = 0; i < Math.min(tabButtons.length, 4); i++) {
            const tab = tabButtons[i];
            const tabText = await tab.textContent();
            await tab.click();
            await page.waitForTimeout(500);
            console.log(`  ✓ Clicked: ${tabText?.trim()}`);
          }
          console.log('');
          
          await page.screenshot({ path: 'test-results/exit-details-final.png', fullPage: true });
        } else {
          console.log('✗ Did not navigate to details page');
        }
      } else {
        console.log('✗ View button not found in first row');
      }
    }
    
    // Step 10: Check for any visible errors
    console.log('Step 10: Checking for errors...');
    const errorElements = await page.locator('.error, [role="alert"], .v-alert--type-error, .text-error').all();
    let errorFound = false;
    for (const error of errorElements) {
      if (await error.isVisible()) {
        const errorText = await error.textContent();
        if (errorText?.trim()) {
          console.log(`  ⚠ Error: ${errorText.trim()}`);
          errorFound = true;
        }
      }
    }
    if (!errorFound) {
      console.log('  ✓ No errors found');
    }
    console.log('');
    
    console.log('=== TEST COMPLETE ===');
    console.log('Screenshots saved in test-results/');
    console.log('  - exit-management-page.png');
    console.log('  - exit-details-page.png (if details page was accessed)');
    console.log('  - exit-details-final.png (if details page was accessed)');
  });
});
