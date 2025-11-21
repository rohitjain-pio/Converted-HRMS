import { test, expect } from '@playwright/test';

test.describe('Employment Details Page - Comprehensive Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/internal-login');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to profile
    await page.goto('http://localhost:5173/profile');
    await page.waitForLoadState('networkidle');
    
    // Click Employment Details tab
    await page.click('text=Employment Details');
    await page.waitForTimeout(2000);
  });

  test('Analyze page structure and layout', async ({ page }) => {
    console.log('\n=== EMPLOYMENT DETAILS PAGE ANALYSIS ===\n');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/employment-details-initial.png', fullPage: true });
    console.log('✓ Screenshot saved: employment-details-initial.png');
    
    // Check page sections
    const sections = await page.locator('.details-card, .v-card').all();
    console.log(`\nFound ${sections.length} card sections`);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const header = await section.locator('.section-header, .v-card-title').first().textContent();
      console.log(`  Section ${i + 1}: ${header?.trim()}`);
    }
  });

  test('Check Current Employment Details section', async ({ page }) => {
    console.log('\n=== CURRENT EMPLOYMENT DETAILS ===\n');
    
    const currentEmploymentCard = page.locator('.details-card').first();
    
    // Check visible fields
    const fields = await currentEmploymentCard.locator('.info-field label').allTextContents();
    console.log('Visible fields:');
    fields.forEach(field => console.log(`  - ${field}`));
    
    // Check field values
    console.log('\nField values:');
    for (const field of fields) {
      const label = currentEmploymentCard.locator(`.info-field:has(label:text("${field}"))`);
      const value = await label.locator('.value').textContent();
      console.log(`  ${field}: ${value?.trim()}`);
    }
  });

  test('Check Previous Employment History section', async ({ page }) => {
    console.log('\n=== PREVIOUS EMPLOYMENT HISTORY ===\n');
    
    const previousEmploymentCard = page.locator('.details-card').filter({ hasText: 'Previous Employment History' });
    
    // Check if Add button exists
    const addButton = previousEmploymentCard.locator('button:has-text("Add Previous Employer")');
    const addButtonExists = await addButton.count() > 0;
    console.log(`Add Previous Employer button exists: ${addButtonExists}`);
    
    if (addButtonExists) {
      const isVisible = await addButton.isVisible();
      const isEnabled = await addButton.isEnabled();
      console.log(`  - Visible: ${isVisible}`);
      console.log(`  - Enabled: ${isEnabled}`);
    }
    
    // Check if any previous employers are listed
    const employerCards = await previousEmploymentCard.locator('.v-card[variant="outlined"]').count();
    console.log(`\nNumber of previous employers listed: ${employerCards}`);
    
    // Check for empty state message
    const emptyMessage = await previousEmploymentCard.locator('text=/no previous employment/i').count();
    if (emptyMessage > 0) {
      console.log('Empty state message displayed');
    }
  });

  test('Test Add Previous Employer functionality', async ({ page }) => {
    console.log('\n=== TESTING ADD PREVIOUS EMPLOYER ===\n');
    
    const addButton = page.locator('button:has-text("Add Previous Employer")');
    
    if (await addButton.count() === 0) {
      console.log('❌ Add Previous Employer button NOT FOUND');
      return;
    }
    
    console.log('✓ Add button found, attempting to click...');
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Check if dialog opened
    const dialog = page.locator('.v-dialog:visible, [role="dialog"]:visible');
    const dialogVisible = await dialog.count() > 0;
    console.log(`Dialog opened: ${dialogVisible}`);
    
    if (dialogVisible) {
      // Check dialog title
      const title = await page.locator('.v-card-title, .v-dialog .v-card h1, .v-dialog .v-card h2').first().textContent();
      console.log(`Dialog title: ${title?.trim()}`);
      
      // Check form fields
      console.log('\nForm fields present:');
      const labels = await page.locator('.v-dialog label, .v-dialog .v-label').allTextContents();
      labels.forEach(label => {
        if (label.trim()) console.log(`  - ${label.trim()}`);
      });
      
      // Take screenshot of form
      await page.screenshot({ path: 'test-results/previous-employer-form.png', fullPage: true });
      console.log('\n✓ Form screenshot saved: previous-employer-form.png');
      
      // Try to fill form
      console.log('\nAttempting to fill form...');
      try {
        // Wait for form to be ready
        await page.waitForSelector('input[label="Company Name"], .v-text-field:has-text("Company Name") input', { timeout: 2000 });
        
        // Get all input fields
        const inputs = await page.locator('.v-dialog input[type="text"], .v-dialog input[type="date"], .v-dialog textarea').all();
        console.log(`Found ${inputs.length} input fields`);
        
        // Try to fill Company Name
        const companyInput = page.locator('.v-dialog').locator('input').first();
        await companyInput.fill('Test Company Ltd');
        console.log('✓ Filled Company Name');
        
        await page.waitForTimeout(500);
        
      } catch (error: any) {
        console.log(`❌ Error filling form: ${error.message}`);
      }
      
      // Check buttons
      const buttons = await page.locator('.v-dialog button').allTextContents();
      console.log('\nDialog buttons:');
      buttons.forEach(btn => {
        if (btn.trim()) console.log(`  - ${btn.trim()}`);
      });
      
    } else {
      console.log('❌ Dialog did NOT open after clicking button');
      
      // Check console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`Browser console error: ${msg.text()}`);
        }
      });
      
      // Check if there's an error message
      await page.waitForTimeout(1000);
      const errorText = await page.locator('.v-alert, .error, [role="alert"]').allTextContents();
      if (errorText.length > 0) {
        console.log('Error messages found:', errorText);
      }
    }
  });

  test('Check UI/UX issues', async ({ page }) => {
    console.log('\n=== UI/UX ANALYSIS ===\n');
    
    // Check spacing and layout
    const cards = await page.locator('.details-card').all();
    console.log(`Number of cards: ${cards.length}`);
    
    // Check if cards have proper spacing
    for (let i = 0; i < cards.length; i++) {
      const box = await cards[i].boundingBox();
      if (box) {
        console.log(`Card ${i + 1} - Height: ${box.height}px, Width: ${box.width}px`);
      }
    }
    
    // Check form sections
    const formSections = await page.locator('.form-section').count();
    console.log(`\nForm sections: ${formSections}`);
    
    // Check info fields
    const infoFields = await page.locator('.info-field').count();
    console.log(`Info fields: ${infoFields}`);
    
    // Check if values are properly aligned
    console.log('\nChecking field alignment...');
    const labels = await page.locator('.info-field label').all();
    const values = await page.locator('.info-field .value').all();
    console.log(`Labels: ${labels.length}, Values: ${values.length}`);
    
    // Check for any overflow or cut-off text
    const overflowElements = await page.locator('[style*="overflow: hidden"]').count();
    console.log(`Elements with overflow hidden: ${overflowElements}`);
  });

  test('Compare with expected structure', async ({ page }) => {
    console.log('\n=== EXPECTED VS ACTUAL STRUCTURE ===\n');
    
    const expectedFields = {
      'Current Employment': [
        'Employee Code',
        'Official Email',
        'Joining Date',
        'Department',
        'Designation',
        'Team',
        'Reporting Manager',
        'Employment Status',
        'Job Type',
        'Total Experience',
        'Relevant Experience',
        'Time Doctor User ID',
        'Probation Period'
      ],
      'Background Verification': [
        'Background Verification Status',
        'Criminal Verification'
      ],
      'Previous Employment': [
        'Company Name',
        'Designation',
        'From Date',
        'To Date',
        'Duration',
        'Reason for Leaving'
      ]
    };
    
    console.log('Expected fields in Current Employment:');
    expectedFields['Current Employment'].forEach(field => console.log(`  - ${field}`));
    
    // Check which fields are present
    const currentFields = await page.locator('.details-card').first().locator('.info-field label').allTextContents();
    
    console.log('\nActual fields found:');
    currentFields.forEach(field => console.log(`  - ${field.trim()}`));
    
    console.log('\nMissing fields:');
    expectedFields['Current Employment'].forEach(expected => {
      const found = currentFields.some(actual => actual.trim().toLowerCase() === expected.toLowerCase());
      if (!found) {
        console.log(`  ❌ ${expected}`);
      }
    });
  });

  test('Check API calls and data loading', async ({ page }) => {
    console.log('\n=== API CALLS ANALYSIS ===\n');
    
    const apiCalls: string[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/') && url.includes('employee')) {
        apiCalls.push(`${response.status()} - ${url}`);
      }
    });
    
    // Reload the page to capture API calls
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('text=Employment Details');
    await page.waitForTimeout(2000);
    
    console.log('API calls made:');
    apiCalls.forEach(call => console.log(`  ${call}`));
    
    // Check if previous employers API is called
    const previousEmployerCall = apiCalls.find(call => call.includes('previous-employer'));
    if (previousEmployerCall) {
      console.log(`\n✓ Previous employers API called: ${previousEmployerCall}`);
    } else {
      console.log('\n❌ Previous employers API NOT called');
    }
  });

  test('Test form validation', async ({ page }) => {
    console.log('\n=== FORM VALIDATION TEST ===\n');
    
    const addButton = page.locator('button:has-text("Add Previous Employer")');
    
    if (await addButton.count() === 0) {
      console.log('❌ Cannot test validation - button not found');
      return;
    }
    
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Try to submit empty form
    const submitButton = page.locator('.v-dialog button:has-text("Add Previous Employer"), .v-dialog button[type="submit"]');
    if (await submitButton.count() > 0) {
      console.log('Attempting to submit empty form...');
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Check for validation errors
      const errors = await page.locator('.v-messages__message, .error--text, .v-input--error').allTextContents();
      if (errors.length > 0) {
        console.log('✓ Validation errors shown:');
        errors.forEach(err => {
          if (err.trim()) console.log(`  - ${err.trim()}`);
        });
      } else {
        console.log('❌ No validation errors shown for empty form');
      }
    }
  });
});
