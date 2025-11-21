import { test, expect } from '@playwright/test';

test.describe('Previous Employer Functionality Test', () => {
  
  test('Login and test Add Previous Employer button', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(120000);

    console.log('Step 1: Navigating to internal-login page...');
    await page.goto('http://localhost:5173/internal-login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/01-login-page.png' });
    console.log('Screenshot saved: 01-login-page.png');

    console.log('Step 2: Filling login credentials...');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    
    console.log('Step 3: Clicking submit button...');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      console.log('✓ Successfully logged in and redirected to dashboard');
    } catch (e) {
      console.error('✗ Failed to redirect to dashboard');
      await page.screenshot({ path: 'test-results/02-login-failed.png' });
      throw e;
    }

    await page.screenshot({ path: 'test-results/03-dashboard.png' });

    console.log('Step 4: Navigating to profile page...');
    await page.goto('http://localhost:5173/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/04-profile-page.png' });

    console.log('Step 5: Looking for Employment Details tab...');
    const employmentTab = page.locator('text=Employment Details');
    const tabExists = await employmentTab.count();
    console.log(`Employment Details tab count: ${tabExists}`);
    
    if (tabExists === 0) {
      console.error('✗ Employment Details tab not found');
      const allText = await page.locator('body').innerText();
      console.log('Page content:', allText.substring(0, 500));
      await page.screenshot({ path: 'test-results/05-no-employment-tab.png' });
      throw new Error('Employment Details tab not found');
    }

    console.log('Step 6: Clicking Employment Details tab...');
    await employmentTab.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/06-employment-details-tab.png' });

    console.log('Step 7: Looking for Add Previous Employer button...');
    
    // Try multiple selectors
    const buttonSelectors = [
      'button:has-text("Add Previous Employer")',
      'text=Add Previous Employer',
      '[aria-label="Add Previous Employer"]',
      'button >> text=/add.*previous.*employer/i'
    ];

    let addButton = null;
    for (const selector of buttonSelectors) {
      const button = page.locator(selector);
      const count = await button.count();
      console.log(`Selector "${selector}": found ${count} element(s)`);
      if (count > 0) {
        addButton = button.first();
        break;
      }
    }

    if (!addButton || (await addButton.count()) === 0) {
      console.error('✗ Add Previous Employer button not found');
      
      // Check if canEdit prop might be false
      console.log('\nChecking page content for clues...');
      const pageContent = await page.locator('body').innerText();
      console.log('Searching for "Previous" in page:', pageContent.includes('Previous'));
      console.log('Searching for "Employment" in page:', pageContent.includes('Employment'));
      
      // List all buttons on page
      const allButtons = await page.locator('button').all();
      console.log(`\nTotal buttons found: ${allButtons.length}`);
      for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
        const buttonText = await allButtons[i].innerText().catch(() => '');
        console.log(`  Button ${i + 1}: "${buttonText}"`);
      }
      
      await page.screenshot({ path: 'test-results/07-no-add-button.png' });
      throw new Error('Add Previous Employer button not found - user may not have edit permissions');
    }

    console.log('✓ Add Previous Employer button found');
    
    // Check if button is visible and enabled
    const isVisible = await addButton.isVisible();
    const isEnabled = await addButton.isEnabled();
    console.log(`Button visible: ${isVisible}, enabled: ${isEnabled}`);

    if (!isVisible || !isEnabled) {
      console.error('✗ Button exists but is not visible or enabled');
      await page.screenshot({ path: 'test-results/08-button-disabled.png' });
      throw new Error('Add Previous Employer button is not clickable');
    }

    console.log('Step 8: Clicking Add Previous Employer button...');
    await addButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/09-after-button-click.png' });

    console.log('Step 9: Checking if dialog opened...');
    
    // Check for dialog/form
    const dialogSelectors = [
      '[role="dialog"]',
      '.v-dialog',
      '.v-overlay',
      'form:has-text("Company Name")',
      'text=Company Name'
    ];

    let dialogFound = false;
    for (const selector of dialogSelectors) {
      const element = page.locator(selector);
      const count = await element.count();
      console.log(`Dialog selector "${selector}": found ${count} element(s)`);
      if (count > 0) {
        const isVisible = await element.first().isVisible();
        console.log(`  → Visible: ${isVisible}`);
        if (isVisible) {
          dialogFound = true;
          break;
        }
      }
    }

    if (!dialogFound) {
      console.error('✗ Dialog did not open after clicking button');
      
      // Check browser console for errors
      console.log('\nChecking for JavaScript errors...');
      page.on('console', msg => console.log('Browser console:', msg.text()));
      page.on('pageerror', error => console.error('Page error:', error));
      
      await page.screenshot({ path: 'test-results/10-dialog-not-opened.png' });
      throw new Error('Previous Employer form dialog did not open');
    }

    console.log('✓ Dialog opened successfully');
    await page.screenshot({ path: 'test-results/11-dialog-opened.png' });

    console.log('Step 10: Checking form fields...');
    
    // Check for form fields
    const formFields = [
      { label: 'Company Name', selector: 'input[label="Company Name"], input:near(:text("Company Name"))' },
      { label: 'Designation', selector: 'input[label="Designation"], input:near(:text("Designation"))' },
      { label: 'Employment Start Date', selector: 'input[type="date"]:first-of-type' },
      { label: 'Employment End Date', selector: 'input[type="date"]:last-of-type' }
    ];

    for (const field of formFields) {
      const element = page.locator(field.selector);
      const count = await element.count();
      console.log(`Field "${field.label}": found ${count} element(s)`);
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('✓ Login successful');
    console.log('✓ Navigation to Employment Details successful');
    console.log('✓ Add Previous Employer button found and clickable');
    console.log('✓ Dialog opened successfully');
    console.log('\nAll screenshots saved in test-results/ folder');
  });

});
