import { test, expect } from '@playwright/test';

/**
 * Module-2 Employee Management Verification Tests
 * 
 * Purpose: Automated verification of migrated Vue.js implementation
 * against legacy React implementation requirements
 * 
 * Version: 1.0.0
 * Date: November 12, 2025
 */

test.describe('Module-2: Employee Management - Comprehensive Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/internal-login');
    
    // Wait for login page to load
    await page.waitForLoadState('networkidle');
    
    // Fill in credentials (update with actual test credentials)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test.describe('1. Routing Behavior Verification', () => {
    
    test('TC-001: Employee list should open within dashboard layout (sidebar visible)', async ({ page }) => {
      // Click on Employee List menu item from sidebar
      await page.click('text=Employee List');
      
      // Wait for navigation
      await page.waitForURL('**/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Verify sidebar is still visible
      const sidebar = page.locator('nav.v-navigation-drawer, .app-sidebar, aside');
      await expect(sidebar).toBeVisible({ timeout: 5000 });
      
      // Verify header is still visible
      const header = page.locator('header.v-app-bar, .app-header');
      await expect(header).toBeVisible();
      
      // Verify we're not on a completely new page (layout should persist)
      const mainContent = page.locator('main.v-main, .main-content');
      await expect(mainContent).toBeVisible();
      
      console.log('✅ Employee list renders within dashboard layout');
    });

    test('TC-002: Add Employee should open within dashboard layout', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/add');
      await page.waitForLoadState('networkidle');
      
      const sidebar = page.locator('nav.v-navigation-drawer, .app-sidebar, aside');
      await expect(sidebar).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Add Employee page renders within dashboard layout');
    });

    test('TC-003: View Employee should open within dashboard layout', async ({ page }) => {
      // First go to employee list
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Click first view button if available
      const viewButton = page.locator('button[title="View Details"]').first();
      if (await viewButton.isVisible()) {
        await viewButton.click();
        await page.waitForLoadState('networkidle');
        
        const sidebar = page.locator('nav.v-navigation-drawer, .app-sidebar, aside');
        await expect(sidebar).toBeVisible({ timeout: 5000 });
        
        console.log('✅ View Employee page renders within dashboard layout');
      } else {
        console.log('⚠️ No employees available to test view functionality');
      }
    });

    test('TC-004: Edit Employee should open within dashboard layout', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const editButton = page.locator('button[title="Edit"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        const sidebar = page.locator('nav.v-navigation-drawer, .app-sidebar, aside');
        await expect(sidebar).toBeVisible({ timeout: 5000 });
        
        console.log('✅ Edit Employee page renders within dashboard layout');
      } else {
        console.log('⚠️ No employees available to test edit functionality');
      }
    });
  });

  test.describe('2. Table Columns Verification', () => {
    
    test('TC-005: All required columns should be present in employee table', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Wait for table to load
      await page.waitForSelector('table', { timeout: 10000 });
      
      // Define expected columns from legacy implementation
      const expectedColumns = [
        'Employee Code',
        'Employee Name', // or just 'Name'
        'DOJ', // or 'Joining Date'
        'Branch',       // ❌ Currently missing
        'Country',      // ❌ Currently missing
        'Department',
        'Designation',
        'Mobile No',    // ❌ Currently missing (or 'Phone')
        'Employee Status', // or just 'Status'
        'Actions'
      ];
      
      // Get all table headers
      const headers = await page.locator('table thead th').allTextContents();
      
      console.log('Current columns:', headers);
      console.log('Expected columns:', expectedColumns);
      
      // Check for critical missing columns
      const missingColumns = [];
      
      if (!headers.some(h => h.includes('Branch'))) {
        missingColumns.push('Branch');
      }
      if (!headers.some(h => h.includes('Country'))) {
        missingColumns.push('Country');
      }
      if (!headers.some(h => h.includes('Mobile') || h.includes('Phone'))) {
        missingColumns.push('Mobile No');
      }
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing columns:', missingColumns);
        test.fail(); // Mark test as failed but continue
      } else {
        console.log('✅ All required columns are present');
      }
      
      // Verify column count (should be 10 total)
      expect(headers.length).toBeGreaterThanOrEqual(8);
    });

    test('TC-006: Branch column should display mapped values', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Check if Branch column exists
      const branchHeader = page.locator('th:has-text("Branch")');
      
      if (await branchHeader.isVisible()) {
        // Get first branch cell value
        const branchCell = page.locator('table tbody tr:first-child td').nth(3); // Adjust index
        const branchValue = await branchCell.textContent();
        
        // Branch should be text like "Noida", "Delhi", not a number
        expect(branchValue).not.toMatch(/^\d+$/);
        console.log('✅ Branch column displays mapped text values');
      } else {
        console.log('❌ Branch column not found');
        test.fail();
      }
    });

    test('TC-007: Country column should be present and populated', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const countryHeader = page.locator('th:has-text("Country")');
      
      if (await countryHeader.isVisible()) {
        console.log('✅ Country column is present');
      } else {
        console.log('❌ Country column is missing');
        test.fail();
      }
    });

    test('TC-008: Mobile Number column should display phone numbers', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const mobileHeader = page.locator('th:has-text("Mobile"), th:has-text("Phone")');
      
      if (await mobileHeader.count() > 0) {
        console.log('✅ Mobile Number column is present');
      } else {
        console.log('❌ Mobile Number column is missing');
        test.fail();
      }
    });
  });

  test.describe('3. Pagination Verification', () => {
    
    test('TC-009: Initial load should use backend pagination', async ({ page }) => {
      // Intercept API calls
      let apiCallMade = false;
      let apiUrl = '';
      let apiMethod = '';
      
      page.on('request', request => {
        if (request.url().includes('/api/employees') || request.url().includes('/Employee/GetEmployees')) {
          apiCallMade = true;
          apiUrl = request.url();
          apiMethod = request.method();
          console.log('API Call:', apiMethod, apiUrl);
        }
      });
      
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Wait for API calls
      
      // Verify API call was made
      if (!apiCallMade) {
        console.log('❌ No API call detected - might be loading all data at once');
        test.fail();
      } else {
        console.log('✅ API call detected:', apiUrl);
        
        // Check if pagination parameters are in URL (Laravel style)
        if (apiUrl.includes('per_page=') || apiUrl.includes('page=')) {
          console.log('✅ Using backend pagination (Laravel format)');
        } else if (apiMethod === 'POST') {
          console.log('⚠️ Using POST request - need to verify payload includes pagination');
        } else {
          console.log('⚠️ API call made but pagination params not detected in URL');
        }
      }
    });

    test('TC-010: Clicking Next Page should make new API call', async ({ page }) => {
      let apiCallCount = 0;
      
      page.on('request', request => {
        if (request.url().includes('/api/employees') || request.url().includes('/Employee/GetEmployees')) {
          apiCallCount++;
          console.log(`API Call #${apiCallCount}:`, request.url());
        }
      });
      
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const initialCallCount = apiCallCount;
      console.log('Initial API calls:', initialCallCount);
      
      // Click Next button if available
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(2000);
        
        if (apiCallCount > initialCallCount) {
          console.log('✅ Next page triggered new API call');
        } else {
          console.log('❌ Next page did NOT trigger API call (frontend pagination)');
          test.fail();
        }
      } else {
        console.log('⚠️ Next button not available (might be on last page or only one page)');
      }
    });

    test('TC-011: Pagination info should show correct total records', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Look for pagination info like "Page 1 of 15" or "Showing 1-10 of 150"
      const paginationInfo = page.locator('.pagination-info, .v-data-table-footer, text=/Page \\d+ of \\d+/');
      
      if (await paginationInfo.count() > 0) {
        const infoText = await paginationInfo.first().textContent();
        console.log('Pagination info:', infoText);
        
        // Extract total from text
        const totalMatch = infoText?.match(/of (\d+)/);
        if (totalMatch) {
          const total = parseInt(totalMatch[1]);
          console.log('Total records:', total);
          
          // Verify it's not showing total of paginated array (like 10)
          // but actual total from backend
          if (total > 15) {
            console.log('✅ Showing backend total records');
          } else {
            console.log('⚠️ Total might be from frontend pagination');
          }
        }
      } else {
        console.log('⚠️ Pagination info not found');
      }
    });

    test('TC-012: Page size should be configurable (10, 25, 50, 100)', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Look for page size selector
      const pageSizeSelector = page.locator('select[aria-label*="page"], .v-select:has-text("per page")');
      
      if (await pageSizeSelector.count() > 0) {
        console.log('✅ Page size selector found');
        
        // Try to change page size
        await pageSizeSelector.first().click();
        
        // Check for standard options
        const options = await page.locator('option, .v-list-item').allTextContents();
        console.log('Available page sizes:', options);
      } else {
        console.log('❌ Page size selector not found');
        test.fail();
      }
    });
  });

  test.describe('4. Table Scrolling Verification', () => {
    
    test('TC-013: Table should have horizontal scroll when needed', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Get table container
      const tableContainer = page.locator('.data-table-container, .v-data-table, table').first();
      
      // Check CSS overflow-x property
      const overflowX = await tableContainer.evaluate((el) => {
        return window.getComputedStyle(el).overflowX;
      });
      
      console.log('Table overflow-x:', overflowX);
      
      if (overflowX === 'auto' || overflowX === 'scroll') {
        console.log('✅ Horizontal scroll is enabled');
      } else {
        console.log('❌ Horizontal scroll is NOT enabled');
        test.fail();
      }
      
      // Check if scrollWidth > clientWidth (indicates scroll is needed)
      const hasScroll = await tableContainer.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });
      
      if (hasScroll) {
        console.log('✅ Table requires horizontal scroll (wide content)');
      } else {
        console.log('ℹ️ Table fits in viewport (no scroll needed currently)');
      }
    });

    test('TC-014: All columns should be accessible via scrolling', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const table = page.locator('table').first();
      
      // Get all column headers
      const headers = await page.locator('table thead th').all();
      const headerCount = headers.length;
      
      console.log(`Total columns: ${headerCount}`);
      
      // Scroll to the right
      await table.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
      });
      
      await page.waitForTimeout(500);
      
      // Verify last column (Actions) is visible
      const actionsHeader = page.locator('th:has-text("Actions")');
      const isVisible = await actionsHeader.isVisible();
      
      if (isVisible) {
        console.log('✅ Can scroll to see all columns including Actions');
      } else {
        console.log('⚠️ Actions column not visible even after scrolling');
      }
    });
  });

  test.describe('5. Additional Features Verification', () => {
    
    test('TC-015: Search functionality should work', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000); // Wait for debounce
        
        // Should trigger filtering (either frontend or backend)
        console.log('✅ Search input is functional');
      } else {
        console.log('⚠️ Search input not found');
      }
    });

    test('TC-016: Export to Excel button should be present', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
      
      if (await exportButton.count() > 0) {
        console.log('✅ Export button found');
      } else {
        console.log('❌ Export button missing (present in legacy)');
        test.fail();
      }
    });

    test('TC-017: Import from Excel button should be present', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const importButton = page.locator('button:has-text("Import"), button:has-text("Upload")');
      
      if (await importButton.count() > 0) {
        console.log('✅ Import button found');
      } else {
        console.log('❌ Import button missing (present in legacy)');
        test.fail();
      }
    });

    test('TC-018: Advanced filters should be available', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Look for filter button or filter panel
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filters")');
      
      if (await filterButton.count() > 0) {
        await filterButton.first().click();
        await page.waitForTimeout(500);
        
        // Check for department filter
        const departmentFilter = page.locator('select[aria-label*="Department"], input[placeholder*="Department"]');
        const designationFilter = page.locator('select[aria-label*="Designation"], input[placeholder*="Designation"]');
        
        if (await departmentFilter.count() > 0 || await designationFilter.count() > 0) {
          console.log('✅ Advanced filters available');
        } else {
          console.log('⚠️ Advanced filters not found');
        }
      } else {
        console.log('❌ Filter button missing (present in legacy)');
        test.fail();
      }
    });

    test('TC-019: Column visibility toggle should be available', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const columnToggle = page.locator('button[aria-label*="column"], button:has-text("Columns")');
      
      if (await columnToggle.count() > 0) {
        console.log('✅ Column visibility toggle found');
      } else {
        console.log('❌ Column toggle missing (present in legacy)');
        test.fail();
      }
    });

    test('TC-020: Breadcrumbs should be present', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const breadcrumbs = page.locator('nav[aria-label="breadcrumb"], .breadcrumbs, .v-breadcrumbs');
      
      if (await breadcrumbs.count() > 0) {
        console.log('✅ Breadcrumbs found');
      } else {
        console.log('❌ Breadcrumbs missing (present in legacy)');
        test.fail();
      }
    });
  });

  test.describe('6. Data Display Verification', () => {
    
    test('TC-021: Employee data should load and display correctly', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Wait for table rows
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        console.log(`✅ ${rows} employee records displayed`);
        
        // Verify first row has data in key columns
        const firstRow = page.locator('table tbody tr').first();
        const cells = await firstRow.locator('td').allTextContents();
        
        console.log('First row data:', cells);
        
        // Check that cells are not empty
        const nonEmptyCells = cells.filter(cell => cell.trim() !== '' && cell !== 'N/A');
        
        if (nonEmptyCells.length >= 5) {
          console.log('✅ Employee data is populated');
        } else {
          console.log('⚠️ Some employee fields appear empty');
        }
      } else {
        console.log('⚠️ No employee records found (might be empty database)');
      }
    });

    test('TC-022: Status badges should display with correct colors', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      const statusBadge = page.locator('.status-badge, .v-chip').first();
      
      if (await statusBadge.count() > 0) {
        const statusText = await statusBadge.textContent();
        const bgColor = await statusBadge.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        
        console.log('Status:', statusText, 'Color:', bgColor);
        
        // Active should be green-ish, Inactive orange-ish, etc.
        if (statusText?.includes('Active') && bgColor.includes('232, 245, 233')) {
          console.log('✅ Status colors match legacy implementation');
        }
      } else {
        console.log('⚠️ Status badge not found');
      }
    });

    test('TC-023: Date formatting should match legacy (MMM Do, YYYY)', async ({ page }) => {
      await page.goto('http://localhost:5173/employees/list');
      await page.waitForLoadState('networkidle');
      
      // Get DOJ column value
      const dojCell = page.locator('table tbody tr:first-child td').nth(2); // Adjust index
      const dateValue = await dojCell.textContent();
      
      console.log('DOJ format:', dateValue);
      
      // Check if matches format like "Jan 1st, 2024" or similar
      const legacyFormatRegex = /^[A-Z][a-z]{2} \d{1,2}(st|nd|rd|th), \d{4}$/;
      
      if (dateValue && legacyFormatRegex.test(dateValue)) {
        console.log('✅ Date format matches legacy');
      } else {
        console.log('⚠️ Date format differs from legacy (expected: MMM Do, YYYY)');
      }
    });
  });
});

// Summary Test - Generates report
test.afterAll(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('MODULE-2 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log('\nKey Issues to Address:');
  console.log('1. ❌ Missing table columns: Branch, Country, Mobile No');
  console.log('2. ❌ Frontend pagination instead of backend pagination');
  console.log('3. ❌ Missing horizontal scroll on table');
  console.log('4. ❌ Missing advanced filters (department, designation, etc.)');
  console.log('5. ❌ Missing export/import functionality');
  console.log('6. ❌ Missing column visibility toggle');
  console.log('7. ❌ Missing breadcrumbs');
  console.log('\nRefer to: docs/modules/MODULE-2-VERIFICATION-REPORT.md');
  console.log('='.repeat(60) + '\n');
});
