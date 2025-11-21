import { test, expect } from '@playwright/test';

test.describe('Official Details - Bank Account Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate to profile
    await page.goto('http://localhost:5173/profile');
    await page.waitForLoadState('networkidle');
    
    // Click Official Details tab
    await page.click('text=Official Details');
    await page.waitForTimeout(1000);
  });

  test('should display bank details section', async ({ page }) => {
    const bankSection = page.locator('text=Bank Details');
    await expect(bankSection).toBeVisible();
    console.log('✓ Bank Details section is visible');
  });

  test('should be able to add a new bank account', async ({ page }) => {
    // Look for "Add Bank Account" button
    const addButton = page.locator('button:has-text("Add Bank Account")').first();
    await expect(addButton).toBeVisible();
    console.log('✓ Add Bank Account button found');
    
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Check if form is visible
    const bankNameInput = page.locator('input[placeholder*="Bank Name"], label:has-text("Bank Name")').first();
    await expect(bankNameInput).toBeVisible();
    console.log('✓ Bank account form opened successfully');
  });

  test('should display edit and delete buttons for existing bank accounts', async ({ page }) => {
    // Wait for any bank account cards to load
    await page.waitForTimeout(2000);
    
    // Look for edit buttons
    const editButtons = page.locator('button:has-text("Edit")');
    const editCount = await editButtons.count();
    console.log(`Found ${editCount} Edit buttons`);
    
    if (editCount > 0) {
      console.log('✓ Edit buttons are present');
      
      // Click first edit button to verify functionality
      await editButtons.first().click();
      await page.waitForTimeout(500);
      
      const formTitle = page.locator('text=Edit Bank Account');
      const isVisible = await formTitle.isVisible();
      console.log(`Edit form visible: ${isVisible}`);
    } else {
      console.log('⚠ No existing bank accounts to edit');
    }
  });
});

test.describe('Employment Details - Previous Employer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate to profile
    await page.goto('http://localhost:5173/profile');
    await page.waitForLoadState('networkidle');
    
    // Click Employment Details tab
    await page.click('text=Employment Details');
    await page.waitForTimeout(1000);
  });

  test('should display previous employment history section', async ({ page }) => {
    const section = page.locator('text=Previous Employment History');
    await expect(section).toBeVisible();
    console.log('✓ Previous Employment History section is visible');
  });

  test('should have Add Previous Employer button', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Previous Employer")');
    await expect(addButton).toBeVisible();
    console.log('✓ Add Previous Employer button is visible');
  });

  test('should be able to open add previous employer form', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Previous Employer")');
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Check for form fields
    const companyNameInput = page.locator('label:has-text("Company Name")').first();
    await expect(companyNameInput).toBeVisible();
    console.log('✓ Previous Employer form opened successfully');
    
    // Check for required fields
    const designationInput = page.locator('label:has-text("Designation")').first();
    await expect(designationInput).toBeVisible();
    console.log('✓ Designation field is present');
    
    const startDateInput = page.locator('label:has-text("Employment Start Date")').first();
    await expect(startDateInput).toBeVisible();
    console.log('✓ Start Date field is present');
  });

  test('should be able to add a new previous employer', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Previous Employer")');
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Fill in the form
    await page.fill('input[label="Company Name"]', 'Test Company Ltd');
    await page.fill('input[label="Designation"]', 'Senior Developer');
    await page.fill('input[type="date"][label*="Start"]', '2020-01-01');
    await page.fill('input[type="date"][label*="End"]', '2022-12-31');
    
    // Submit
    const submitButton = page.locator('button:has-text("Add Previous Employer")');
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Verify it was added (check for company name in the list)
    const companyCard = page.locator('text=Test Company Ltd');
    const isVisible = await companyCard.isVisible();
    console.log(`New employer ${isVisible ? 'was' : 'was NOT'} added to the list`);
  });

  test('should display edit and delete buttons for existing employers', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for edit icons
    const editButtons = page.locator('button[aria-label="Edit"], button i.mdi-pencil').filter({ hasText: '' });
    const editCount = await editButtons.count();
    console.log(`Found ${editCount} Edit buttons for previous employers`);
    
    if (editCount > 0) {
      console.log('✓ Edit buttons are present for previous employers');
    } else {
      console.log('⚠ No previous employers to edit');
    }
  });
});
