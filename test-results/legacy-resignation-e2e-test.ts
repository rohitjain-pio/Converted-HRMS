/**
 * Legacy HRMS - Resignation/Exit Flow E2E Test
 * 
 * This Playwright test script automates the testing of the resignation/exit flow
 * in the legacy HRMS application.
 * 
 * Prerequisites:
 * - Legacy frontend running on http://localhost:5173
 * - Legacy backend running on http://localhost:5281
 * - Valid test user credentials
 * - enableExitEmployee feature flag enabled
 * 
 * Test Coverage:
 * 1. Login flow
 * 2. Navigation to resignation form via profile menu
 * 3. Resignation status check
 * 4. Form submission
 * 5. Exit details page verification
 * 6. Tab visibility logic
 * 7. Dialog interactions
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const config = {
  baseUrl: 'http://localhost:5173',
  apiUrl: 'http://localhost:5281/api',
  screenshotDir: './test-results/resignation-flow-screenshots',
  testUser: {
    email: 'test.employee@company.com', // Update with actual test user
    password: 'TestPassword123', // Update with actual password
  }
};

// Utility to save screenshots
async function takeScreenshot(page: Page, name: string) {
  const screenshotPath = path.join(config.screenshotDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
}

// Utility to wait for network idle
async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}

test.describe('Legacy HRMS - Resignation/Exit Flow', () => {
  
  test.beforeAll(async () => {
    // Create screenshot directory if it doesn't exist
    if (!fs.existsSync(config.screenshotDir)) {
      fs.mkdirSync(config.screenshotDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(config.baseUrl);
    await takeScreenshot(page, '01-login-page');
  });

  test('Full Resignation Flow - First Time Resignation', async ({ page }) => {
    console.log('=== Step 1: Login ===');
    
    // Login with test credentials
    await page.fill('input[name="email"]', config.testUser.email);
    await page.fill('input[name="password"]', config.testUser.password);
    await takeScreenshot(page, '02-login-filled');
    
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);
    await takeScreenshot(page, '03-dashboard-after-login');
    
    console.log('=== Step 2: Navigate to Profile Menu ===');
    
    // Click on avatar/profile icon
    const profileButton = page.locator('[aria-label="profile"], .MuiAvatar-root, button[aria-controls*="profile"]').first();
    await profileButton.waitFor({ state: 'visible' });
    await takeScreenshot(page, '04-before-click-avatar');
    
    await profileButton.click();
    await page.waitForTimeout(500); // Wait for dropdown animation
    await takeScreenshot(page, '05-profile-menu-open');
    
    console.log('=== Step 3: Verify Menu Items ===');
    
    // Verify menu items exist
    const profileMenuItem = page.getByText('Profile', { exact: true });
    const exitPortalMenuItem = page.getByText('Exit Portal', { exact: true });
    const logoutMenuItem = page.getByText('Logout', { exact: true });
    
    await expect(profileMenuItem).toBeVisible();
    await expect(exitPortalMenuItem).toBeVisible();
    await expect(logoutMenuItem).toBeVisible();
    
    console.log('=== Step 4: Click Exit Portal ===');
    
    // Setup network interception to capture API call
    const resignationStatusPromise = page.waitForResponse(
      response => response.url().includes('/resignation/active-status') && response.status() === 200
    );
    
    await exitPortalMenuItem.click();
    const resignationStatusResponse = await resignationStatusPromise;
    const resignationStatusData = await resignationStatusResponse.json();
    
    console.log('Resignation Status API Response:', JSON.stringify(resignationStatusData, null, 2));
    await takeScreenshot(page, '06-after-click-exit-portal');
    
    console.log('=== Step 5: Handle Resignation Status Check ===');
    
    // Check if confirmation dialog appears
    const confirmationDialog = page.locator('div[role="dialog"]');
    const dialogVisible = await confirmationDialog.isVisible().catch(() => false);
    
    if (dialogVisible) {
      console.log('Confirmation dialog appeared - No active resignation');
      await takeScreenshot(page, '07-confirmation-dialog');
      
      // Verify dialog content
      await expect(page.getByText('Are you sure you want to resign?')).toBeVisible();
      await expect(page.getByText(/exit process.*notice period/i)).toBeVisible();
      
      // Click Confirm button
      const confirmButton = page.getByRole('button', { name: /confirm/i });
      await confirmButton.click();
      await waitForNetworkIdle(page);
      
      console.log('=== Step 6: Resignation Form Page ===');
      
      // Should navigate to resignation form
      await expect(page).toHaveURL(/\/resignation-form/);
      await takeScreenshot(page, '08-resignation-form-page');
      
      // Verify form fields
      await expect(page.getByLabel(/employee name/i)).toBeVisible();
      await expect(page.getByLabel(/department/i)).toBeVisible();
      await expect(page.getByLabel(/reporting manager/i)).toBeVisible();
      await expect(page.getByLabel(/resignation reason/i)).toBeVisible();
      
      // Verify read-only fields are disabled
      await expect(page.getByLabel(/employee name/i)).toBeDisabled();
      await expect(page.getByLabel(/department/i)).toBeDisabled();
      await expect(page.getByLabel(/reporting manager/i)).toBeDisabled();
      
      console.log('=== Step 7: Fill and Submit Resignation Form ===');
      
      // Fill resignation reason
      const resignationReason = 'I am resigning to pursue better opportunities and career growth. I appreciate the time spent at this company.';
      await page.getByLabel(/resignation reason/i).fill(resignationReason);
      await takeScreenshot(page, '09-form-filled');
      
      // Setup network interception for submission
      const submitPromise = page.waitForResponse(
        response => response.url().includes('/resignation') && 
                   response.request().method() === 'POST' && 
                   response.status() === 200
      );
      
      // Click Submit button
      await page.getByRole('button', { name: /submit/i }).click();
      const submitResponse = await submitPromise;
      const submitData = await submitResponse.json();
      
      console.log('Resignation Submission Response:', JSON.stringify(submitData, null, 2));
      await page.waitForTimeout(1000); // Wait for success dialog
      await takeScreenshot(page, '10-success-dialog');
      
      console.log('=== Step 8: Verify Success Dialog ===');
      
      // Verify success dialog content
      const successDialog = page.locator('div[role="dialog"]');
      await expect(successDialog).toBeVisible();
      await expect(page.getByText(/resignation.*submitted successfully/i)).toBeVisible();
      await expect(page.getByText(/last working day/i)).toBeVisible();
      
      // Click OK button
      await page.getByRole('button', { name: /ok/i }).click();
      await waitForNetworkIdle(page);
      
      console.log('=== Step 9: Exit Details Page ===');
      
      // Should navigate to exit details
      await expect(page).toHaveURL(/\/profile\/exit-details/);
      await takeScreenshot(page, '11-exit-details-page');
      
    } else {
      console.log('No confirmation dialog - Active resignation exists');
      
      // Should navigate directly to exit details
      await waitForNetworkIdle(page);
      await expect(page).toHaveURL(/\/profile\/exit-details/);
      await takeScreenshot(page, '07-exit-details-direct');
    }
    
    console.log('=== Step 10: Verify Exit Details Page Content ===');
    
    // Verify exit details content
    await expect(page.getByText('Exit Details')).toBeVisible();
    
    // Check for key fields
    const fieldChecks = [
      /name:/i,
      /department:/i,
      /reporting manager:/i,
      /resignation date:/i,
      /last working day:/i,
      /resignation reason:/i,
      /resignation status:/i
    ];
    
    for (const field of fieldChecks) {
      await expect(page.getByText(field)).toBeVisible();
    }
    
    await takeScreenshot(page, '12-exit-details-full-view');
    
    console.log('=== Step 11: Test View Resignation Reason ===');
    
    // Find and click the view icon for resignation reason
    const viewReasonButton = page.locator('button[aria-label*="view"], button').filter({ 
      has: page.locator('svg[data-testid="VisibilityIcon"]') 
    }).first();
    
    if (await viewReasonButton.isVisible()) {
      await viewReasonButton.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '13-resignation-reason-dialog');
      
      // Close dialog
      await page.getByRole('button', { name: /close/i }).click();
    }
    
    console.log('=== Step 12: Check Action Buttons ===');
    
    // Check if Revoke button exists
    const revokeButton = page.getByRole('button', { name: /revoke/i });
    const revokeVisible = await revokeButton.isVisible().catch(() => false);
    
    if (revokeVisible) {
      console.log('Revoke button is visible');
      await takeScreenshot(page, '14-revoke-button-visible');
    }
    
    // Check if Request Early Release button exists
    const earlyReleaseButton = page.getByRole('button', { name: /request early release/i });
    const earlyReleaseVisible = await earlyReleaseButton.isVisible().catch(() => false);
    
    if (earlyReleaseVisible) {
      console.log('Request Early Release button is visible');
      await takeScreenshot(page, '15-early-release-button-visible');
    }
    
    console.log('=== Step 13: Verify Profile Tab Visibility ===');
    
    // Navigate to profile page to check tab visibility
    await page.goto(`${config.baseUrl}/profile/personal-details`);
    await waitForNetworkIdle(page);
    await takeScreenshot(page, '16-profile-page-tabs');
    
    // Verify Exit Details tab is visible
    const exitDetailsTab = page.getByRole('tab', { name: /exit details/i });
    await expect(exitDetailsTab).toBeVisible();
    
    // Click on Exit Details tab
    await exitDetailsTab.click();
    await waitForNetworkIdle(page);
    await takeScreenshot(page, '17-exit-details-tab-active');
    
    console.log('=== Test Complete ===');
  });

  test('Test Revoke Resignation Flow', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', config.testUser.email);
    await page.fill('input[name="password"]', config.testUser.password);
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);
    
    // Navigate to exit details
    await page.goto(`${config.baseUrl}/profile/exit-details`);
    await waitForNetworkIdle(page);
    await takeScreenshot(page, '18-before-revoke');
    
    // Check if Revoke button exists
    const revokeButton = page.getByRole('button', { name: /revoke/i });
    const revokeVisible = await revokeButton.isVisible().catch(() => false);
    
    if (revokeVisible) {
      console.log('=== Testing Revoke Flow ===');
      
      // Click Revoke button
      await revokeButton.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '19-revoke-confirmation-dialog');
      
      // Verify revoke dialog
      await expect(page.getByText(/revoke resignation/i)).toBeVisible();
      await expect(page.getByText(/terminate.*resignation process/i)).toBeVisible();
      
      // Note: Don't actually confirm revoke in automated test
      // Click Cancel to close dialog
      await page.getByRole('button', { name: /cancel/i }).click();
      await takeScreenshot(page, '20-revoke-cancelled');
      
      console.log('Revoke flow tested (cancelled)');
    } else {
      console.log('Revoke button not available - skipping revoke test');
    }
  });

  test('Test Early Release Request Flow', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', config.testUser.email);
    await page.fill('input[name="password"]', config.testUser.password);
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);
    
    // Navigate to exit details
    await page.goto(`${config.baseUrl}/profile/exit-details`);
    await waitForNetworkIdle(page);
    await takeScreenshot(page, '21-before-early-release');
    
    // Check if Request Early Release button exists
    const earlyReleaseButton = page.getByRole('button', { name: /request early release/i });
    const earlyReleaseVisible = await earlyReleaseButton.isVisible().catch(() => false);
    
    if (earlyReleaseVisible) {
      console.log('=== Testing Early Release Flow ===');
      
      // Click Request Early Release button
      await earlyReleaseButton.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '22-early-release-dialog');
      
      // Verify dialog fields
      await expect(page.getByText(/early release date/i)).toBeVisible();
      await expect(page.getByLabel(/reason/i)).toBeVisible();
      
      // Note: Don't actually submit in automated test
      // Click Cancel to close dialog
      await page.getByRole('button', { name: /cancel/i }).click();
      await takeScreenshot(page, '23-early-release-cancelled');
      
      console.log('Early Release flow tested (cancelled)');
    } else {
      console.log('Early Release button not available - skipping early release test');
    }
  });

  test('Test Profile Menu Navigation Paths', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', config.testUser.email);
    await page.fill('input[name="password"]', config.testUser.password);
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);
    
    console.log('=== Testing Alternative Navigation Paths ===');
    
    // Method 1: Via Profile Page Personal Details
    await page.goto(`${config.baseUrl}/profile/personal-details`);
    await waitForNetworkIdle(page);
    await takeScreenshot(page, '24-personal-details-page');
    
    // Look for resignation form link
    const resignationLink = page.getByText(/get resignation form/i);
    const linkVisible = await resignationLink.isVisible().catch(() => false);
    
    if (linkVisible) {
      console.log('Found resignation form link on Personal Details page');
      await takeScreenshot(page, '25-resignation-link-highlighted');
    }
    
    console.log('Navigation paths test complete');
  });

  test('API Response Analysis', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', config.testUser.email);
    await page.fill('input[name="password"]', config.testUser.password);
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);
    
    console.log('=== Capturing API Calls ===');
    
    const apiCalls: any[] = [];
    
    // Intercept all API calls
    page.on('response', async (response) => {
      if (response.url().includes(config.apiUrl)) {
        try {
          const data = await response.json();
          apiCalls.push({
            url: response.url(),
            method: response.request().method(),
            status: response.status(),
            data: data
          });
        } catch (e) {
          // Not JSON response
        }
      }
    });
    
    // Navigate to profile menu and click Exit Portal
    const profileButton = page.locator('[aria-label="profile"], .MuiAvatar-root').first();
    await profileButton.click();
    await page.waitForTimeout(500);
    
    const exitPortalMenuItem = page.getByText('Exit Portal', { exact: true });
    await exitPortalMenuItem.click();
    await page.waitForTimeout(2000);
    
    // Log all captured API calls
    console.log('=== API Calls Captured ===');
    console.log(JSON.stringify(apiCalls, null, 2));
    
    // Save to file
    const apiLogPath = path.join(config.screenshotDir, 'api-calls.json');
    fs.writeFileSync(apiLogPath, JSON.stringify(apiCalls, null, 2));
    console.log(`API calls saved to: ${apiLogPath}`);
  });
});

// Export test report generation
test.afterAll(async () => {
  console.log('\n=== Test Execution Complete ===');
  console.log(`Screenshots saved to: ${config.screenshotDir}`);
  console.log('\nNext Steps:');
  console.log('1. Review screenshots in test-results/resignation-flow-screenshots/');
  console.log('2. Check api-calls.json for API interactions');
  console.log('3. Compare with converted app implementation');
});
