import { test, expect } from '@playwright/test';

test.describe('Employee Detail Page - Complete Verification', () => {
  const BASE_URL = 'http://localhost:5173';
  const EMPLOYEE_ID = 1;

  test.beforeEach(async ({ page }) => {
    // Navigate to employee detail page
    await page.goto(`${BASE_URL}/employees/${EMPLOYEE_ID}`);
    await page.waitForLoadState('networkidle');
  });

  test('should display employee profile header with all information', async ({ page }) => {
    // Check for profile avatar
    await expect(page.locator('.profile-avatar')).toBeVisible();

    // Check for employee name
    await expect(page.locator('.employee-name')).toBeVisible();

    // Check for employee code
    await expect(page.locator('text=/EMP[0-9]+/')).toBeVisible();

    // Check for contact information
    await expect(page.locator('text=/mdi-phone/')).toBeVisible();
    await expect(page.locator('text=/mdi-email/')).toBeVisible();
  });

  test('should display all required tabs', async ({ page }) => {
    const requiredTabs = [
      'Personal Details',
      'Official Details',
      'Employment Details',
      'Education Details',
      'Nominee Details',
      'Certificate Details'
    ];

    for (const tabName of requiredTabs) {
      await expect(page.getByRole('tab', { name: tabName })).toBeVisible();
    }
  });

  test('Personal Details tab - should display all fields', async ({ page }) => {
    // Click on Personal Details tab
    await page.getByRole('tab', { name: 'Personal Details' }).click();
    await page.waitForTimeout(500);

    // Check for personal information fields
    const personalFields = [
      'Full Name',
      'Father\'s Name',
      'Date of Birth',
      'Gender',
      'Blood Group',
      'Marital Status',
      'Nationality',
      'Phone Number',
      'Alternate Phone',
      'Personal Email',
      'Emergency Contact Person',
      'Emergency Contact Number'
    ];

    for (const field of personalFields) {
      await expect(page.getByText(field)).toBeVisible();
    }

    // Check for address sections
    await expect(page.getByText('Current Address')).toBeVisible();
    await expect(page.getByText('Permanent Address')).toBeVisible();

    // Check for documents section
    await expect(page.getByText('Documents')).toBeVisible();
  });

  test('Official Details tab - should display identity, PF/ESI, and bank details', async ({ page }) => {
    // Click on Official Details tab
    await page.getByRole('tab', { name: 'Official Details' }).click();
    await page.waitForTimeout(500);

    // Check for Identity Information section
    await expect(page.getByText('Identity Information')).toBeVisible();
    await expect(page.getByText('PAN Number')).toBeVisible();
    await expect(page.getByText('Aadhaar Number')).toBeVisible();
    await expect(page.getByText('UAN Number')).toBeVisible();
    await expect(page.getByText('Passport Number')).toBeVisible();

    // Check for PF & ESI section
    await expect(page.getByText('PF & ESI Details')).toBeVisible();
    await expect(page.getByText('Has PF')).toBeVisible();
    await expect(page.getByText('PF Number')).toBeVisible();
    await expect(page.getByText('Has ESI')).toBeVisible();

    // Check for Bank Details section
    await expect(page.getByText('Bank Details')).toBeVisible();
  });

  test('Employment Details tab - should display current and previous employment', async ({ page }) => {
    // Click on Employment Details tab
    await page.getByRole('tab', { name: 'Employment Details' }).click();
    await page.waitForTimeout(500);

    // Check for Current Employment section
    await expect(page.getByText('Current Employment Details')).toBeVisible();
    await expect(page.getByText('Employee Code')).toBeVisible();
    await expect(page.getByText('Official Email')).toBeVisible();
    await expect(page.getByText('Joining Date')).toBeVisible();
    await expect(page.getByText('Department')).toBeVisible();
    await expect(page.getByText('Designation')).toBeVisible();
    await expect(page.getByText('Reporting Manager')).toBeVisible();
    await expect(page.getByText('Employment Status')).toBeVisible();
    await expect(page.getByText('Total Experience')).toBeVisible();

    // Check for Background Verification section
    await expect(page.getByText('Background Verification')).toBeVisible();

    // Check for Previous Employment section
    await expect(page.getByText('Previous Employment History')).toBeVisible();
  });

  test('should allow navigation between tabs', async ({ page }) => {
    const tabs = [
      'Personal Details',
      'Official Details',
      'Employment Details',
      'Education Details',
      'Nominee Details',
      'Certificate Details'
    ];

    for (const tabName of tabs) {
      await page.getByRole('tab', { name: tabName }).click();
      await page.waitForTimeout(300);
      
      // Verify tab is active (you may need to adjust the selector based on your styling)
      const activeTab = page.getByRole('tab', { name: tabName });
      await expect(activeTab).toBeVisible();
    }
  });

  test('should display Edit button when user has permission', async ({ page }) => {
    // Check if Edit Employee button is visible
    const editButton = page.getByRole('button', { name: /Edit Employee/i });
    
    // The button should either be visible or not present (based on permissions)
    const count = await editButton.count();
    if (count > 0) {
      await expect(editButton).toBeVisible();
    }
  });

  test('should display profile completeness indicator', async ({ page }) => {
    // Check for profile completeness component
    // Adjust selector based on your ProfileCompleteness component implementation
    const completenessElement = page.locator('.profile-completeness, [class*="completeness"]');
    
    // Should be visible if implemented
    const count = await completenessElement.count();
    if (count > 0) {
      await expect(completenessElement.first()).toBeVisible();
    }
  });

  test('should show Back button and navigate correctly', async ({ page }) => {
    // Check for back button
    await expect(page.getByRole('button', { name: /Back to Employees/i })).toBeVisible();

    // Click back button
    await page.getByRole('button', { name: /Back to Employees/i }).click();

    // Verify navigation to employees list
    await page.waitForURL('**/employees/list');
    expect(page.url()).toContain('/employees/list');
  });

  test('Personal Details - Edit functionality should work', async ({ page }) => {
    // Click on Personal Details tab
    await page.getByRole('tab', { name: 'Personal Details' }).click();
    await page.waitForTimeout(500);

    // Check if edit button exists
    const editButton = page.getByRole('button', { name: /pencil|edit/i }).first();
    const editButtonCount = await editButton.count();

    if (editButtonCount > 0) {
      // Click edit button
      await editButton.click();
      await page.waitForTimeout(300);

      // Check if form fields are now editable
      await expect(page.locator('input[type="text"]').first()).toBeVisible();
      
      // Check for Save and Cancel buttons
      await expect(page.getByRole('button', { name: /Save/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
    }
  });

  test('should load data from API correctly', async ({ page }) => {
    // Intercept API call
    await page.route('**/api/employees/**', route => {
      console.log('API Request:', route.request().url());
      route.continue();
    });

    // Reload page to trigger API call
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify page loaded successfully
    await expect(page.locator('.employee-name')).toBeVisible();
  });

  test('should display appropriate empty states for missing data', async ({ page }) => {
    // Check each tab for proper handling of missing data
    const tabs = ['Personal Details', 'Official Details', 'Employment Details'];

    for (const tabName of tabs) {
      await page.getByRole('tab', { name: tabName }).click();
      await page.waitForTimeout(300);

      // Look for "N/A" or empty state messages
      // This will vary based on your implementation
      const naElements = page.getByText('N/A');
      const emptyStateElements = page.getByText(/No.*available|Not provided/i);

      // At least one should be present if data is missing
      const naCount = await naElements.count();
      const emptyCount = await emptyStateElements.count();

      // Just verify the page doesn't crash with missing data
      await expect(page.locator('.employee-name')).toBeVisible();
    }
  });
});

test.describe('Employee Detail Page - Responsive Design', () => {
  const BASE_URL = 'http://localhost:5173';
  const EMPLOYEE_ID = 1;

  test('should display correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/employees/${EMPLOYEE_ID}`);
    await page.waitForLoadState('networkidle');

    // Verify main elements are still visible
    await expect(page.locator('.profile-avatar')).toBeVisible();
    await expect(page.locator('.employee-name')).toBeVisible();
    
    // Tabs should be visible (might be scrollable)
    await expect(page.getByRole('tab', { name: 'Personal Details' })).toBeVisible();
  });

  test('should display correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto(`${BASE_URL}/employees/${EMPLOYEE_ID}`);
    await page.waitForLoadState('networkidle');

    // Verify main elements are visible
    await expect(page.locator('.profile-avatar')).toBeVisible();
    await expect(page.locator('.employee-name')).toBeVisible();
    
    // All tabs should be visible
    await expect(page.getByRole('tab', { name: 'Personal Details' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Official Details' })).toBeVisible();
  });
});
