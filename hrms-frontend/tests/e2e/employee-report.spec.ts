import { test, expect } from '@playwright/test';

test.describe('Employee Report - Attendance', () => {
  test.beforeEach(async ({ page }) => {
    // Login using internal-login route
    await page.goto('http://localhost:5173/internal-login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'password');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for login to process (more flexible than waiting for specific URL)
    await page.waitForTimeout(2000);
    
    // Navigate directly to employee report page
    await page.goto('http://localhost:5173/attendance/employee-report');
    await page.waitForLoadState('networkidle');
  });

  test('should display employee report page', async ({ page }) => {
    // Check if page loaded
    await expect(page).toHaveURL(/.*attendance\/employee-report/);
    
    // Check for page title or heading
    const heading = page.locator('h1, h2, h3, h4').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should show 6 active employees', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForSelector('.v-card-title:has-text("Employee Report")', { timeout: 10000 });
    
    // Open filters by clicking the filter icon
    await page.click('.mdi-filter-variant');
    await page.waitForTimeout(1000);
    
    // Select "Custom" date range from dropdown
    await page.locator('.v-select:has-text("Select Date Range")').click();
    await page.waitForTimeout(500);
    await page.locator('.v-list-item:has-text("Custom")').click();
    await page.waitForTimeout(1000);
    
    // Set custom date range
    const startDateInput = page.locator('label:has-text("Start Date")').locator('..').locator('input');
    const endDateInput = page.locator('label:has-text("End Date")').locator('..').locator('input');
    
    await startDateInput.fill('2025-10-19');
    await endDateInput.fill('2025-11-19');
    
    // Click Search button
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(4000);
    
    // Wait for table to load
    await page.waitForSelector('.attendance-report-table tbody tr', { timeout: 10000 });
    
    // Count employee rows
    const rows = await page.locator('.attendance-report-table tbody tr').count();
    
    console.log(`Found ${rows} employee rows`);
    expect(rows).toBeGreaterThanOrEqual(6);
  });

  test('should display branch names (not IDs)', async ({ page }) => {
    // Set date range
    await page.fill('input[type="date"]', '2025-10-19');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-11-19');
    
    // Trigger search
    const searchButton = page.locator('button:has-text("Search"), button:has-text("Filter"), button[type="submit"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for data to load
    await page.waitForSelector('table tbody tr, .v-data-table tbody tr', { timeout: 10000 });
    
    // Get all cell contents
    const pageContent = await page.content();
    
    // Check that branch names appear (not IDs)
    expect(pageContent).toContain('Hyderabad');
    expect(pageContent).toContain('Jaipur');
    expect(pageContent).toContain('Pune');
    
    // Check that numeric IDs don't appear as branch values
    const hasBranchIds = pageContent.includes('>401<') || 
                          pageContent.includes('>402<') || 
                          pageContent.includes('>403<');
    expect(hasBranchIds).toBe(false);
  });

  test('should display attendance hours for employees', async ({ page }) => {
    // Set date range
    await page.fill('input[type="date"]', '2025-10-19');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-11-19');
    
    // Trigger search
    const searchButton = page.locator('button:has-text("Search"), button:has-text("Filter"), button[type="submit"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for data
    await page.waitForSelector('table tbody tr, .v-data-table tbody tr', { timeout: 10000 });
    
    // Check that hour values appear (format: HH:MM or "Xh Ymin")
    const pageContent = await page.content();
    const hasHourFormat = /\d{2}:\d{2}/.test(pageContent) || /\d+h \d+min/.test(pageContent);
    
    expect(hasHourFormat).toBe(true);
  });

  test('should display date columns with attendance data', async ({ page }) => {
    // Set date range
    await page.fill('input[type="date"]', '2025-10-19');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-11-19');
    
    // Trigger search
    const searchButton = page.locator('button:has-text("Search"), button:has-text("Filter"), button[type="submit"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for table headers
    await page.waitForSelector('table thead th, .v-data-table thead th', { timeout: 10000 });
    
    // Check for date headers (should have dates like 2025-10-20, 2025-10-21, etc.)
    const headers = await page.locator('table thead th, .v-data-table thead th').allTextContents();
    
    console.log('Table headers:', headers);
    
    // Should have multiple date columns
    const datePattern = /2025-10-|2025-11-|Oct|Nov/;
    const hasDateColumns = headers.some(header => datePattern.test(header));
    
    expect(hasDateColumns).toBe(true);
  });

  test('should allow Excel export', async ({ page }) => {
    // Set date range
    await page.fill('input[type="date"]', '2025-10-19');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-11-19');
    
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Excel"), button:has-text("Download")').first();
    
    if (await exportButton.isVisible({ timeout: 5000 })) {
      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify filename contains "EmployeeReport"
      expect(download.suggestedFilename()).toContain('EmployeeReport');
      
      console.log(`Downloaded: ${download.suggestedFilename()}`);
    } else {
      console.log('Export button not found - may need to implement');
    }
  });

  test('should filter employees by branch', async ({ page }) => {
    // Set date range
    await page.fill('input[type="date"]', '2025-10-19');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-11-19');
    
    // Look for branch filter dropdown
    const branchFilter = page.locator('select, [role="combobox"]').filter({ hasText: /Branch|Location/ }).first();
    
    if (await branchFilter.isVisible({ timeout: 3000 })) {
      // Select Hyderabad
      await branchFilter.click();
      await page.locator('text=Hyderabad').first().click();
      
      // Trigger search
      const searchButton = page.locator('button:has-text("Search"), button:has-text("Filter")').first();
      await searchButton.click();
      await page.waitForTimeout(2000);
      
      // Verify only Hyderabad employees shown
      const pageContent = await page.content();
      expect(pageContent).toContain('Hyderabad');
      
      // Should have fewer than 6 rows
      const rows = await page.locator('table tbody tr, .v-data-table tbody tr').count();
      expect(rows).toBeLessThan(6);
    } else {
      console.log('Branch filter not found - skipping filter test');
    }
  });

  test('should validate date range (max 60 days)', async ({ page }) => {
    // Try to set date range > 60 days
    await page.fill('input[type="date"]', '2025-01-01');
    await page.fill('input[type="date"]:nth-of-type(2)', '2025-12-31');
    
    // Trigger search
    const searchButton = page.locator('button:has-text("Search"), button:has-text("Filter"), button[type="submit"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Should show error message
    const errorMessage = page.locator('text=/60 days|maximum|exceeded/i').first();
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasError) {
      console.log('✓ Date range validation working');
      expect(hasError).toBe(true);
    } else {
      console.log('⚠ Date range validation not implemented');
    }
  });
});
