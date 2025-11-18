import { test, expect } from '@playwright/test';

test('check what page loads after login', async ({ page }) => {
    // Login using internal-login route
    await page.goto('http://localhost:5173/internal-login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'password');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for login to process
    await page.waitForTimeout(3000);
    
    // Try to navigate to employee report
    console.log('Current URL after login:', page.url());
    
    await page.goto('http://localhost:5173/attendance/employee-report');
    await page.waitForTimeout(3000);
    
    console.log('Current URL after navigation:', page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/debug-page.png', fullPage: true });
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Get page content
    const bodyText = await page.locator('body').textContent();
    console.log('Page content (first 500 chars):', bodyText?.substring(0, 500));
    
    // Check for any error messages
    const errorMsg = await page.locator('.v-alert, [role="alert"]').textContent().catch(() => 'No error');
    console.log('Error message:', errorMsg);
});
