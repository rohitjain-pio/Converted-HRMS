import { test, expect } from '@playwright/test';

test('Employee Edit - Quick Field Check', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5174/internal-login');
  await page.fill('input[type="email"]', 'admin@company.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  console.log('\n=== LOGGING IN ===\n');
  
  // Go to employee list
  await page.goto('http://localhost:5174/employees/list');
  await page.waitForTimeout(2000);
  
  console.log('=== NAVIGATING TO EMPLOYEE LIST ===\n');
  
  // Click first edit button
  const editButton = page.locator('button').filter({ hasText: /edit/i }).first();
  await editButton.click();
  await page.waitForTimeout(3000);
  
  console.log('=== CLICKED EDIT BUTTON ===\n');
  console.log('Current URL:', page.url());
  
  // Wait for form to load
  await page.waitForSelector('input', { timeout: 10000 });
  
  // Get all input values
  const inputs = await page.locator('input').all();
  console.log('\n=== FORM FIELD VALUES (Step 1 - Personal Info) ===\n');
  
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const value = await input.inputValue().catch(() => '');
    const placeholder = await input.getAttribute('placeholder');
    
    if (value) {
      console.log(`[${type}] ${placeholder || 'unknown'}: "${value}"`);
    }
  }
  
  // Check selects
  const selects = await page.locator('select').all();
  console.log('\n=== SELECT FIELD VALUES ===\n');
  
  for (const select of selects) {
    const value = await select.inputValue().catch(() => '');
    if (value) {
      console.log(`Select value: "${value}"`);
    }
  }
  
  // Move to step 2
  console.log('\n=== MOVING TO STEP 2 (Contact Info) ===\n');
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(1000);
  
  const inputs2 = await page.locator('input').all();
  console.log('\n=== FORM FIELD VALUES (Step 2) ===\n');
  
  for (const input of inputs2) {
    const type = await input.getAttribute('type');
    const value = await input.inputValue().catch(() => '');
    const placeholder = await input.getAttribute('placeholder');
    
    if (value) {
      console.log(`[${type}] ${placeholder || 'unknown'}: "${value}"`);
    }
  }
  
  // Move to step 3
  console.log('\n=== MOVING TO STEP 3 (Employment Details) ===\n');
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(1000);
  
  const inputs3 = await page.locator('input').all();
  console.log('\n=== FORM FIELD VALUES (Step 3) ===\n');
  
  for (const input of inputs3) {
    const type = await input.getAttribute('type');
    const value = await input.inputValue().catch(() => '');
    const placeholder = await input.getAttribute('placeholder');
    
    if (value) {
      console.log(`[${type}] ${placeholder || 'unknown'}: "${value}"`);
    }
  }
  
  const selects3 = await page.locator('select').all();
  console.log('\n=== SELECT FIELD VALUES (Step 3) ===\n');
  
  for (const select of selects3) {
    const value = await select.inputValue().catch(() => '');
    const name = await select.getAttribute('name');
    if (value) {
      console.log(`Select [${name}]: "${value}"`);
    }
  }
  
  console.log('\n=== TEST COMPLETE ===\n');
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/employee-edit-simple-test.png', fullPage: true });
});
