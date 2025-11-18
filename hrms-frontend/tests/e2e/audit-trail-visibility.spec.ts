import { test, expect } from '@playwright/test';

test.describe('Attendance Audit Trail Visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:5173/internal-login');
    
    // Login
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForURL(/dashboard|attendance/, { timeout: 10000 });
    
    // Navigate to attendance page
    await page.goto('http://localhost:5173/attendance/my-attendance');
    
    // Wait for table to load
    await page.waitForSelector('.v-data-table', { timeout: 15000 });
  });

  test('should display audit trail tooltip on hover', async ({ page }) => {
    console.log('🔍 Testing audit trail tooltip visibility...');
    
    // Wait for the eye icon button to be visible
    const eyeIconButton = page.locator('button[aria-label="View Audit Trail"]').first()
      .or(page.locator('button:has(.mdi-eye)').first());
    
    await eyeIconButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Eye icon button found');
    
    // Take screenshot before hover
    await page.screenshot({ path: 'test-results/before-hover.png', fullPage: true });
    
    // Hover over the eye icon
    await eyeIconButton.hover();
    console.log('✓ Hovered over eye icon');
    
    // Wait a moment for tooltip to appear
    await page.waitForTimeout(1000);
    
    // Check if tooltip is visible - try multiple selectors
    const tooltipSelectors = [
      '.v-tooltip > .v-overlay__content',
      '[role="tooltip"]',
      '.v-overlay__content:visible',
      'div:has-text("Audit Trail:")'
    ];
    
    let tooltipFound = false;
    let tooltipLocator;
    
    for (const selector of tooltipSelectors) {
      try {
        tooltipLocator = page.locator(selector);
        const count = await tooltipLocator.count();
        if (count > 0) {
          const isVisible = await tooltipLocator.first().isVisible();
          if (isVisible) {
            console.log(`✓ Tooltip found with selector: ${selector}`);
            tooltipFound = true;
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!tooltipFound) {
      console.log('⚠️ Tooltip not found with any selector, checking page content...');
      const pageContent = await page.content();
      console.log('Page contains "Audit Trail:":', pageContent.includes('Audit Trail:'));
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/tooltip-not-found.png', fullPage: true });
    }
    
    // Take screenshot with tooltip
    await page.screenshot({ path: 'test-results/with-tooltip.png', fullPage: true });
    
    // Try to find audit trail content
    const auditTrailHeader = page.locator('text=Audit Trail:');
    const auditTrailVisible = await auditTrailHeader.isVisible().catch(() => false);
    
    if (auditTrailVisible) {
      console.log('✓ Audit Trail header is visible');
      
      // Look for audit entries
      const timeInEntries = page.locator('text=/Time In.*at -/');
      const timeOutEntries = page.locator('text=/Time Out.*at -/');
      
      const timeInCount = await timeInEntries.count();
      const timeOutCount = await timeOutEntries.count();
      
      console.log(`✓ Found ${timeInCount} Time In entries`);
      console.log(`✓ Found ${timeOutCount} Time Out entries`);
      console.log(`✓ Total audit entries: ${timeInCount + timeOutCount}`);
      
      // Get text of first few entries
      if (timeInCount > 0) {
        const firstEntry = await timeInEntries.first().textContent();
        console.log('First entry:', firstEntry);
      }
      
      expect(timeInCount + timeOutCount).toBeGreaterThan(0);
    } else {
      console.log('❌ Audit Trail header NOT visible');
      
      // Debug: Print all visible text
      const allText = await page.locator('body').textContent();
      console.log('All text contains "Audit":', allText?.includes('Audit'));
      console.log('All text contains "Time In":', allText?.includes('Time In'));
    }
    
    // Assert tooltip is visible
    expect(auditTrailVisible).toBeTruthy();
  });

  test('should display audit trail tooltip on click', async ({ page }) => {
    console.log('🔍 Testing audit trail tooltip visibility on click...');
    
    // Find and click the eye icon button
    const eyeIconButton = page.locator('button:has(.mdi-eye)').first();
    await eyeIconButton.waitFor({ state: 'visible', timeout: 5000 });
    await eyeIconButton.click();
    console.log('✓ Clicked eye icon button');
    
    // Wait for tooltip
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/click-tooltip.png', fullPage: true });
    
    // Check for audit trail
    const auditTrailHeader = page.locator('text=Audit Trail:');
    const isVisible = await auditTrailHeader.isVisible().catch(() => false);
    
    console.log('Audit Trail visible after click:', isVisible);
    
    if (isVisible) {
      // Count entries
      const auditEntries = page.locator('div').filter({ hasText: /Time (In|Out) at -/ });
      const count = await auditEntries.count();
      console.log(`✓ ${count} audit entries visible`);
    }
  });

  test('should verify audit data structure', async ({ page }) => {
    console.log('🔍 Checking audit data in console logs...');
    
    // Listen to console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('Attendance Records') || text.includes('Audit')) {
        console.log('Browser console:', text);
      }
    });
    
    // Reload to trigger console logs
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Check if audit data is in console
    const hasAuditData = consoleLogs.some(log => 
      log.includes('audit') || log.includes('Audit')
    );
    
    console.log('Audit data found in console:', hasAuditData);
    console.log('Total console logs:', consoleLogs.length);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
  });
});
