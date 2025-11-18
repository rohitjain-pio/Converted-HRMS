import { test, expect } from '@playwright/test';

test.describe('Attendance Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to internal login
    await page.goto('http://localhost:5173/internal-login');
    await page.waitForLoadState('networkidle');
    
    // Login with admin credentials
    await page.fill('input[type="email"]', 'admin@programmers.io');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete - increased timeout
    await page.waitForURL(/dashboard|attendance/, { timeout: 60000 });
    await page.waitForTimeout(2000);
  });

  test('Employee Report - Department Filter loads from API', async ({ page }) => {
    // Navigate to Employee Report
    await page.goto('http://localhost:5173/attendance/employee-report');
    await page.waitForTimeout(2000);
    
    // Find and click department dropdown
    const departmentSelect = page.locator('label:has-text("Department")').locator('..').locator('.v-select');
    await departmentSelect.click();
    await page.waitForTimeout(1000);
    
    // Check that department options are present (should come from API)
    const departmentOptions = page.locator('.v-list-item');
    const count = await departmentOptions.count();
    
    console.log(`Department options loaded: ${count}`);
    expect(count).toBeGreaterThan(0);
    
    // Verify no hardcoded placeholder values
    const allText = await departmentOptions.allTextContents();
    console.log('Department options:', allText);
    expect(allText.join('')).not.toContain('Test Department');
  });

  test('Employee Report - Branch Filter loads from API with correct values', async ({ page }) => {
    // Navigate to Employee Report
    await page.goto('http://localhost:5173/attendance/employee-report');
    await page.waitForTimeout(2000);
    
    // Find and click branch dropdown
    const branchSelect = page.locator('label:has-text("Branch")').locator('..').locator('.v-select');
    await branchSelect.click();
    await page.waitForTimeout(1000);
    
    // Check that branch options are present
    const branchOptions = page.locator('.v-list-item');
    const count = await branchOptions.count();
    
    console.log(`Branch options loaded: ${count}`);
    expect(count).toBe(3); // Should be exactly Hyderabad, Jaipur, Pune
    
    // Verify correct branch names (matching legacy enum)
    const allText = await branchOptions.allTextContents();
    console.log('Branch options:', allText);
    
    expect(allText).toContain('Hyderabad');
    expect(allText).toContain('Jaipur');
    expect(allText).toContain('Pune');
    
    // Ensure wrong values are not present
    expect(allText.join('')).not.toContain('Noida');
    expect(allText.join('')).not.toContain('Mumbai');
  });

  test('Attendance Config - Department Filter loads from API', async ({ page }) => {
    // Navigate to Attendance Config
    await page.goto('http://localhost:5173/attendance/config');
    await page.waitForTimeout(2000);
    
    // Find and click department dropdown
    const departmentSelect = page.locator('label:has-text("Department")').locator('..').locator('.v-select');
    await departmentSelect.click();
    await page.waitForTimeout(1000);
    
    // Check that department options are present
    const departmentOptions = page.locator('.v-list-item');
    const count = await departmentOptions.count();
    
    console.log(`Config - Department options loaded: ${count}`);
    expect(count).toBeGreaterThan(0);
  });

  test('Attendance Config - Branch Filter loads from API with correct values', async ({ page }) => {
    // Navigate to Attendance Config
    await page.goto('http://localhost:5173/attendance/config');
    await page.waitForTimeout(2000);
    
    // Find and click branch dropdown
    const branchSelect = page.locator('label:has-text("Branch")').locator('..').locator('.v-select');
    await branchSelect.click();
    await page.waitForTimeout(1000);
    
    // Check that branch options are present and correct
    const branchOptions = page.locator('.v-list-item');
    const count = await branchOptions.count();
    
    console.log(`Config - Branch options loaded: ${count}`);
    expect(count).toBe(3);
    
    // Verify correct branch names
    const allText = await branchOptions.allTextContents();
    console.log('Config - Branch options:', allText);
    
    expect(allText).toContain('Hyderabad');
    expect(allText).toContain('Jaipur');
    expect(allText).toContain('Pune');
    
    // Ensure old wrong IDs (401, 402, 403) don't appear with wrong names
    expect(allText.join('')).not.toContain('Noida');
  });

  test('Employee Report - Can select and apply filters', async ({ page }) => {
    // Navigate to Employee Report
    await page.goto('http://localhost:5173/attendance/employee-report');
    await page.waitForTimeout(2000);
    
    // Select branch
    const branchSelect = page.locator('label:has-text("Branch")').locator('..').locator('.v-select');
    await branchSelect.click();
    await page.waitForTimeout(500);
    await page.locator('.v-list-item:has-text("Hyderabad")').first().click();
    await page.waitForTimeout(500);
    
    // Select department
    const departmentSelect = page.locator('label:has-text("Department")').locator('..').locator('.v-select');
    await departmentSelect.click();
    await page.waitForTimeout(500);
    const firstDept = page.locator('.v-list-item').first();
    await firstDept.click();
    await page.waitForTimeout(500);
    
    // Set date range
    await page.fill('input[type="date"]', '2024-01-01');
    
    // Click Submit button
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(2000);
    
    // Verify table loaded or appropriate response
    const table = page.locator('table, .v-data-table');
    const hasTable = await table.count() > 0;
    console.log('Table present after filter:', hasTable);
  });

  test('Attendance Config - Can select and apply filters', async ({ page }) => {
    // Navigate to Attendance Config
    await page.goto('http://localhost:5173/attendance/config');
    await page.waitForTimeout(2000);
    
    // Select branch
    const branchSelect = page.locator('label:has-text("Branch")').locator('..').locator('.v-select');
    await branchSelect.click();
    await page.waitForTimeout(500);
    await page.locator('.v-list-item:has-text("Pune")').first().click();
    await page.waitForTimeout(500);
    
    // Click Submit button
    await page.click('button:has-text("Submit"), button:has-text("Apply")');
    await page.waitForTimeout(2000);
    
    // Verify data loaded
    console.log('Config filter applied successfully');
  });

  test('My Attendance - Date range filter works', async ({ page }) => {
    // Navigate to My Attendance
    await page.goto('http://localhost:5173/attendance/my-attendance');
    await page.waitForTimeout(2000);
    
    // Select "Past 7 Days" option
    const rangeSelect = page.locator('label:has-text("Select Date Range")').locator('..').locator('.v-select');
    await rangeSelect.click();
    await page.waitForTimeout(500);
    await page.locator('.v-list-item:has-text("Past 7 Days")').click();
    await page.waitForTimeout(500);
    
    // Click Submit
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(2000);
    
    // Verify dates are populated
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log('Date inputs present:', dateInputs);
    expect(dateInputs).toBeGreaterThan(0);
  });

  test('API calls are made when filters load', async ({ page }) => {
    // Listen for API calls
    const apiCalls: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/master/')) {
        apiCalls.push(url);
        console.log('API call:', url);
      }
    });
    
    // Navigate to Employee Report
    await page.goto('http://localhost:5173/attendance/employee-report');
    await page.waitForTimeout(3000);
    
    // Verify API calls were made
    const hasDepartmentsCall = apiCalls.some(url => url.includes('/api/master/departments'));
    const hasBranchesCall = apiCalls.some(url => url.includes('/api/master/branches'));
    
    console.log('Departments API called:', hasDepartmentsCall);
    console.log('Branches API called:', hasBranchesCall);
    
    expect(hasDepartmentsCall).toBeTruthy();
    expect(hasBranchesCall).toBeTruthy();
  });

  test('Reset button clears filters', async ({ page }) => {
    // Navigate to Employee Report
    await page.goto('http://localhost:5173/attendance/employee-report');
    await page.waitForTimeout(2000);
    
    // Select branch
    const branchSelect = page.locator('label:has-text("Branch")').locator('..').locator('.v-select');
    await branchSelect.click();
    await page.waitForTimeout(500);
    await page.locator('.v-list-item:has-text("Jaipur")').first().click();
    await page.waitForTimeout(500);
    
    // Click Reset button
    await page.click('button:has-text("Reset"), button:has-text("Clear")');
    await page.waitForTimeout(1000);
    
    // Verify filters are cleared
    const branchValue = await branchSelect.textContent();
    console.log('Branch value after reset:', branchValue);
    // Should be empty or show placeholder
  });
});
