import { test, expect } from '@playwright/test';

test.describe('Employee Exit - Dropdown Options Verification', () => {
  
  test('Verify dropdown options are populated', async ({ page }) => {
    test.setTimeout(60000);

    // Login
    await page.goto('http://localhost:5173/internal-login');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Navigate
    await page.goto('http://localhost:5173/employees/employee-exit');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click show filters
    await page.locator('button:has-text("SHOW FILTERS")').click();
    await page.waitForTimeout(3000); // Give time for API calls to complete

    console.log('=== CHECKING FILTER OPTIONS ===\n');

    // Check Department filter state
    console.log('Department Filter:');
    const deptContainer = page.locator('label:text-is("Department")').locator('..');
    const deptSelect = deptContainer.locator('.v-select');
    
    // Get the value/placeholder using evaluate
    const deptState = await deptSelect.evaluate((el: any) => {
      const input = el.querySelector('input');
      return {
        hasInput: !!input,
        placeholder: input?.placeholder || '',
        value: input?.value || '',
        disabled: el.classList.contains('v-input--disabled'),
        readonly: el.classList.contains('v-input--readonly')
      };
    });
    console.log(`  Input present: ${deptState.hasInput}`);
    console.log(`  Placeholder: "${deptState.placeholder}"`);
    console.log(`  Value: "${deptState.value}"`);
    console.log(`  Disabled: ${deptState.disabled}`);
    console.log(`  Readonly: ${deptState.readonly}`);

    // Check Branch filter state
    console.log('\nBranch Filter:');
    const branchContainer = page.locator('label:text-is("Branch")').locator('..');
    const branchSelect = branchContainer.locator('.v-select');
    
    const branchState = await branchSelect.evaluate((el: any) => {
      const input = el.querySelector('input');
      return {
        hasInput: !!input,
        placeholder: input?.placeholder || '',
        value: input?.value || '',
        disabled: el.classList.contains('v-input--disabled'),
        readonly: el.classList.contains('v-input--readonly')
      };
    });
    console.log(`  Input present: ${branchState.hasInput}`);
    console.log(`  Placeholder: "${branchState.placeholder}"`);
    console.log(`  Value: "${branchState.value}"`);
    console.log(`  Disabled: ${branchState.disabled}`);
    console.log(`  Readonly: ${branchState.readonly}`);

    // Try to extract Vue component data
    console.log('\n=== CHECKING VUE COMPONENT STATE ===');
    const vueData = await page.evaluate(() => {
      // Try to find Vue component instance
      const app = (window as any).__VUE_APP__;
      return {
        hasVueApp: !!app,
        windowKeys: Object.keys(window).filter(k => k.includes('vue') || k.includes('Vue'))
      };
    });
    console.log(`Vue app present: ${vueData.hasVueApp}`);
    console.log(`Vue-related window keys: ${vueData.windowKeys.join(', ')}`);

    // Take a full screenshot
    await page.screenshot({ path: 'test-results/dropdown-state-check.png', fullPage: true });

    // Try clicking department dropdown and checking overlay
    console.log('\n=== ATTEMPTING TO OPEN DEPARTMENT DROPDOWN ===');
    const deptInput = deptSelect.locator('input').first();
    await deptInput.click();
    await page.waitForTimeout(1000);

    // Check if overlay appeared
    const overlayExists = await page.locator('.v-overlay--active').count();
    console.log(`Active overlay count: ${overlayExists}`);

    if (overlayExists > 0) {
      const menuItems = await page.locator('.v-overlay--active .v-list-item-title').allTextContents();
      console.log(`Menu items found: ${menuItems.length}`);
      if (menuItems.length > 0) {
        console.log(`Options: ${menuItems.join(', ')}`);
      }
      await page.screenshot({ path: 'test-results/dept-dropdown-opened.png' });
    } else {
      console.log('No overlay appeared - dropdown did not open');
    }

    // Close overlay
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Try branch dropdown
    console.log('\n=== ATTEMPTING TO OPEN BRANCH DROPDOWN ===');
    const branchInput = branchSelect.locator('input').first();
    await branchInput.click();
    await page.waitForTimeout(1000);

    const branchOverlay = await page.locator('.v-overlay--active').count();
    console.log(`Active overlay count: ${branchOverlay}`);

    if (branchOverlay > 0) {
      const menuItems = await page.locator('.v-overlay--active .v-list-item-title').allTextContents();
      console.log(`Menu items found: ${menuItems.length}`);
      if (menuItems.length > 0) {
        console.log(`Options: ${menuItems.join(', ')}`);
      }
      await page.screenshot({ path: 'test-results/branch-dropdown-opened.png' });
    } else {
      console.log('No overlay appeared - dropdown did not open');
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('Check screenshots in test-results/ folder');
  });

});
