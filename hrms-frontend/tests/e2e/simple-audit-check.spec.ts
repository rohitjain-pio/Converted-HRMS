import { test, expect } from '@playwright/test';

test('Simple audit trail check', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5173/internal-login');
  await page.fill('input[type="email"]', 'admin@company.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // Navigate to attendance
  await page.goto('http://localhost:5173/attendance/my-attendance');
  await page.waitForTimeout(3000);
  
  // Take full page screenshot
  await page.screenshot({ path: 'test-results/attendance-page-full.png', fullPage: true });
  
  // Check if table exists
  const table = await page.locator('.v-data-table').count();
  console.log('Table found:', table > 0);
  
  // Check if eye icon exists
  const eyeIcon = await page.locator('.mdi-eye').count();
  console.log('Eye icons found:', eyeIcon);
  
  // Check for buttons in actions column
  const actionButtons = await page.locator('td button').count();
  console.log('Total action buttons:', actionButtons);
  
  // Get page HTML
  const html = await page.content();
  console.log('HTML contains "mdi-eye":', html.includes('mdi-eye'));
  console.log('HTML contains "audit":', html.includes('audit'));
  console.log('HTML contains "Actions":', html.includes('Actions'));
  console.log('HTML contains "TEST":', html.includes('TEST'));
  
  // Check for TEST text
  const testText = await page.locator('text=TEST').count();
  console.log('TEST text found:', testText);
  
  // Check how many rows in table
  const tableRows = await page.locator('tbody tr').count();
  console.log('Table rows:', tableRows);
  
  // Check if data is loaded
  const noDataText = await page.locator('text=No Data Found').count();
  console.log('No Data Found:', noDataText > 0);
  
  // Listen to network requests
  const responses: string[] = [];
  page.on('response', async (response) => {
    if (response.url().includes('/attendance/')) {
      console.log('API Response:', response.status(), response.url());
      try {
        const json = await response.json();
        console.log('Response data:', JSON.stringify(json).slice(0, 200));
      } catch (e) {
        // Not JSON
      }
    }
  });
  
  // Reload to trigger API calls
  await page.reload();
  await page.waitForTimeout(3000);
  
  // Try to find any button in the table
  await page.screenshot({ path: 'test-results/before-interaction.png', fullPage: true });
  
  // Wait and try to see if any tooltips or overlays appear
  await page.waitForTimeout(2000);
});
