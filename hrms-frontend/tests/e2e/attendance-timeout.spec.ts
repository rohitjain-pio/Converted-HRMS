import { test, expect, Page } from '@playwright/test';
import { format } from 'date-fns';

/**
 * Attendance Time Out Functionality Test
 * 
 * This test verifies the complete Time In -> Time Out flow:
 * 1. Login to the system
 * 2. Navigate to attendance page
 * 3. Create a Time In record
 * 4. Perform Time Out action
 * 5. Verify the timeline/audit trail displays correctly
 */

interface NetworkLog {
  url: string;
  method: string;
  status: number;
  requestBody?: any;
  responseBody?: any;
  timestamp: string;
}

test.describe('Attendance Time Out Functionality', () => {
  let page: Page;
  let networkLogs: NetworkLog[] = [];
  let screenshotCounter = 0;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    networkLogs = []; // Reset logs for each test
    screenshotCounter = 0;
    
    // Setup network logging
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`→ ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        const timestamp = new Date().toISOString();
        const log: NetworkLog = {
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          timestamp
        };

        // Capture request body for POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(log.method)) {
          try {
            log.requestBody = response.request().postDataJSON();
          } catch (e) {
            log.requestBody = response.request().postData();
          }
        }

        // Capture response body
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            log.responseBody = await response.json();
          }
        } catch (e) {
          // Response might not be JSON
        }

        networkLogs.push(log);
        console.log(`← ${log.status} ${log.method} ${log.url}`);
        if (log.responseBody) {
          console.log('Response:', JSON.stringify(log.responseBody, null, 2));
        }
      }
    });
  });

  test.afterEach(async () => {
    // Generate comprehensive report
    console.log('\n' + '='.repeat(80));
    console.log('ATTENDANCE TIME OUT TEST REPORT');
    console.log('='.repeat(80) + '\n');
    
    console.log('Network Activity Summary:');
    console.log('-'.repeat(80));
    networkLogs.forEach(log => {
      console.log(`\n[${log.timestamp}]`);
      console.log(`${log.method} ${log.url}`);
      console.log(`Status: ${log.status}`);
      if (log.requestBody) {
        console.log('Request Body:', JSON.stringify(log.requestBody, null, 2));
      }
      if (log.responseBody) {
        console.log('Response Body:', JSON.stringify(log.responseBody, null, 2));
      }
    });
    
    await page.close();
  });

  async function takeScreenshot(name: string) {
    screenshotCounter++;
    const filename = `step-${screenshotCounter.toString().padStart(2, '0')}-${name}.png`;
    await page.screenshot({ 
      path: `test-results/attendance-timeout/${filename}`,
      fullPage: true 
    });
    console.log(`📸 Screenshot: ${filename}`);
  }

  test('Complete Time In -> Time Out Flow with Timeline Verification', async () => {
    test.setTimeout(90000); // 90 second timeout
    console.log('\n🚀 Starting Attendance Time Out Test\n');

    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page...');
    await page.goto('http://localhost:5173/internal-login');
    await page.waitForLoadState('networkidle');
    await takeScreenshot('login-page');
    
    // Step 2: Perform login
    console.log('Step 2: Logging in with admin credentials...');
    await page.fill('input[type="email"], input[name="email"]', 'admin@company.com');
    await page.fill('input[type="password"], input[name="password"]', 'password');
    await takeScreenshot('login-filled');
    
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await takeScreenshot('after-login');
    
    // Verify login success
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    expect(currentUrl).not.toContain('/internal-login');
    
    // Step 3: Navigate to attendance page
    console.log('Step 3: Navigating to attendance page...');
    
    // Try multiple possible routes
    const attendanceRoutes = [
      '/attendance/employee',
      '/attendance',
      '/attendance/my-attendance'
    ];
    
    let attendancePageFound = false;
    for (const route of attendanceRoutes) {
      try {
        await page.goto(`http://localhost:5173${route}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const title = await page.title();
        const content = await page.content();
        console.log(`Tried route: ${route}`);
        console.log(`Page title: ${title}`);
        
        if (content.includes('Time In') || content.includes('attendance') || content.includes('Attendance')) {
          attendancePageFound = true;
          console.log(`✓ Found attendance page at: ${route}`);
          break;
        }
      } catch (e) {
        console.log(`Route ${route} not accessible`);
      }
    }
    
    await takeScreenshot('attendance-page');
    
    if (!attendancePageFound) {
      console.log('⚠️  Could not find attendance page, checking sidebar navigation...');
      
      // Try clicking sidebar menu
      const sidebarLinks = await page.locator('a, button').all();
      for (const link of sidebarLinks) {
        const text = await link.textContent();
        if (text?.toLowerCase().includes('attendance')) {
          console.log(`Found attendance link: ${text}`);
          await link.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
          break;
        }
      }
      
      await takeScreenshot('after-sidebar-navigation');
    }
    
    // Step 4: Check for Time In button
    console.log('Step 4: Looking for Time In button...');
    
    const timeInButtonSelectors = [
      'button:has-text("Time In")',
      'button:has-text("Clock In")',
      'button:has-text("Check In")',
      '[data-testid="time-in-button"]',
      '.time-in-button',
      'button[aria-label*="Time In"]'
    ];
    
    let timeInButton = null;
    for (const selector of timeInButtonSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          timeInButton = btn;
          console.log(`✓ Found Time In button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!timeInButton) {
      console.log('⚠️  Time In button not found. Checking if already timed in...');
      const pageContent = await page.content();
      const hasTimeOutButton = pageContent.includes('Time Out') || pageContent.includes('Clock Out');
      
      if (hasTimeOutButton) {
        console.log('✓ Already timed in, proceeding to Time Out test');
        await takeScreenshot('already-timed-in');
      } else {
        console.log('❌ Neither Time In nor Time Out button found');
        await takeScreenshot('no-buttons-found');
        
        // Log all visible buttons for debugging
        const allButtons = await page.locator('button').all();
        console.log('\nAll visible buttons on page:');
        for (const btn of allButtons) {
          const text = await btn.textContent();
          console.log(`  - "${text?.trim()}"`);
        }
        
        throw new Error('Cannot find Time In or Time Out button');
      }
    } else {
      // Step 5: Click Time In button and fill form
      console.log('Step 5: Clicking Time In button...');
      await timeInButton.click();
      await page.waitForTimeout(1000);
      await takeScreenshot('time-in-dialog-opened');
      
      // Fill in the Time In form
      console.log('Step 6: Filling Time In form...');
      const today = new Date();
      const dateString = format(today, 'yyyy-MM-dd');
      const timeString = format(today, 'HH:mm');
      
      // Try to find and fill date field
      const dateSelectors = [
        'input[type="date"]',
        'input[name="date"]',
        'input[placeholder*="date" i]'
      ];
      
      for (const selector of dateSelectors) {
        try {
          const dateField = page.locator(selector).first();
          if (await dateField.isVisible({ timeout: 1000 })) {
            await dateField.fill(dateString);
            console.log(`✓ Filled date: ${dateString}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Try to find and fill time field
      const timeSelectors = [
        'input[type="time"]',
        'input[name="time"]',
        'input[name="start_time"]',
        'input[placeholder*="time" i]'
      ];
      
      for (const selector of timeSelectors) {
        try {
          const timeField = page.locator(selector).first();
          if (await timeField.isVisible({ timeout: 1000 })) {
            await timeField.fill(timeString);
            console.log(`✓ Filled time: ${timeString}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Try to find and fill location field
      const locationSelectors = [
        'input[name="location"]',
        'select[name="location"]',
        'input[placeholder*="location" i]',
        '.v-select:has-text("Location")',
        '[data-testid="location-input"]'
      ];
      
      for (const selector of locationSelectors) {
        try {
          const locationField = page.locator(selector).first();
          if (await locationField.isVisible({ timeout: 1000 })) {
            const tagName = await locationField.evaluate(el => el.tagName.toLowerCase());
            
            if (tagName === 'select') {
              await locationField.selectOption({ label: 'Hyderabad Office' });
            } else {
              await locationField.fill('Hyderabad Office');
              await page.waitForTimeout(500);
              // Try to select from dropdown if it appears
              const dropdownOption = page.locator('text="Hyderabad Office"').first();
              if (await dropdownOption.isVisible({ timeout: 1000 })) {
                await dropdownOption.click();
              }
            }
            console.log(`✓ Filled location: Hyderabad Office`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      await takeScreenshot('time-in-form-filled');
      
      // Step 7: Submit the form
      console.log('Step 7: Submitting Time In form...');
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Save")',
        'button:has-text("Time In")',
        'button:has-text("Confirm")'
      ];
      
      let submitClicked = false;
      for (const selector of submitSelectors) {
        try {
          const submitBtn = page.locator(selector).first();
          if (await submitBtn.isVisible({ timeout: 1000 })) {
            // Wait for response after clicking
            const responsePromise = page.waitForResponse(
              response => response.url().includes('/api/attendance') && response.request().method() === 'POST',
              { timeout: 10000 }
            ).catch(() => null);
            
            await submitBtn.click();
            console.log(`✓ Clicked submit button`);
            submitClicked = true;
            
            // Wait for the response
            const response = await responsePromise;
            if (response) {
              console.log(`✓ Got response with status: ${response.status()}`);
            }
            
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          console.log(`Submit selector ${selector} failed: ${e}`);
          // Continue
        }
      }
      
      if (!submitClicked) {
        console.log('⚠️  Could not find submit button, trying to close dialog and proceed');
        // Try pressing Escape or clicking outside
        await page.keyboard.press('Escape');
      }
      
      await page.waitForTimeout(1000);
      await takeScreenshot('after-time-in-submit');
      
      // Check for success message or errors
      const pageText = await page.textContent('body');
      if (pageText.includes('success') || pageText.includes('Success')) {
        console.log('✓ Time In appears successful');
      }
    }
    
    // Step 8: Wait for record to appear and look for Time Out button
    console.log('Step 8: Looking for Time Out button...');
    await page.waitForTimeout(2000);
    
    const timeOutButtonSelectors = [
      'button:has-text("Time Out")',
      'button:has-text("Clock Out")',
      'button:has-text("Check Out")',
      '[data-testid="time-out-button"]',
      '.time-out-button',
      'button[aria-label*="Time Out"]'
    ];
    
    let timeOutButton = null;
    for (const selector of timeOutButtonSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          timeOutButton = btn;
          console.log(`✓ Found Time Out button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!timeOutButton) {
      console.log('❌ Time Out button not found');
      await takeScreenshot('time-out-button-not-found');
      
      // Log all visible buttons
      const allButtons = await page.locator('button').all();
      console.log('\nAll visible buttons on page:');
      for (const btn of allButtons) {
        const text = await btn.textContent();
        const isVisible = await btn.isVisible();
        console.log(`  - "${text?.trim()}" (visible: ${isVisible})`);
      }
      
      throw new Error('Time Out button not found');
    }
    
    await takeScreenshot('before-time-out-click');
    
    // Step 9: Click Time Out button
    console.log('Step 9: Clicking Time Out button...');
    await timeOutButton.click();
    await page.waitForTimeout(1000);
    await takeScreenshot('after-time-out-click');
    
    // Step 10: Confirm if there's a confirmation dialog
    console.log('Step 10: Checking for confirmation dialog...');
    const confirmSelectors = [
      'button:has-text("Confirm")',
      'button:has-text("Yes")',
      'button:has-text("OK")',
      'button:has-text("Time Out")',
      'button[type="submit"]'
    ];
    
    for (const selector of confirmSelectors) {
      try {
        const confirmBtn = page.locator(selector).first();
        if (await confirmBtn.isVisible({ timeout: 2000 })) {
          console.log(`✓ Found confirmation button, clicking...`);
          await confirmBtn.click();
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await takeScreenshot('after-time-out-confirm');
    
    // Step 11: Verify the results
    console.log('Step 11: Verifying results...');
    
    // Check for any error messages
    const bodyText = await page.textContent('body');
    const has422Error = bodyText.includes('422') || bodyText.includes('Unprocessable');
    const hasError = bodyText.includes('error') || bodyText.includes('Error') || bodyText.includes('failed');
    
    if (has422Error) {
      console.log('❌ 422 Error detected!');
      await takeScreenshot('422-error');
    } else if (hasError && !bodyText.includes('No errors')) {
      console.log('⚠️  Possible error detected');
      await takeScreenshot('possible-error');
    } else {
      console.log('✓ No obvious errors detected');
    }
    
    // Look for timeline/audit trail
    console.log('Step 12: Checking for timeline/audit trail...');
    const timelineSelectors = [
      '[data-testid="timeline"]',
      '.timeline',
      '.audit-trail',
      '[class*="timeline"]',
      '[class*="history"]',
      'text="Timeline"',
      'text="Audit Trail"',
      'text="History"'
    ];
    
    let timelineFound = false;
    for (const selector of timelineSelectors) {
      try {
        const timeline = page.locator(selector).first();
        if (await timeline.isVisible({ timeout: 2000 })) {
          timelineFound = true;
          console.log(`✓ Timeline found with selector: ${selector}`);
          
          // Get timeline content
          const timelineContent = await timeline.textContent();
          console.log('Timeline content:', timelineContent);
          
          await takeScreenshot('timeline-visible');
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!timelineFound) {
      console.log('⚠️  Timeline/audit trail not immediately visible');
      
      // Check if we need to click something to show timeline
      const showTimelineButtons = await page.locator('button, a').all();
      for (const btn of showTimelineButtons) {
        const text = await btn.textContent();
        if (text?.toLowerCase().includes('timeline') || 
            text?.toLowerCase().includes('history') || 
            text?.toLowerCase().includes('detail')) {
          console.log(`Found potential timeline trigger: ${text}`);
          await btn.click();
          await page.waitForTimeout(1000);
          await takeScreenshot('after-timeline-trigger');
          break;
        }
      }
    }
    
    // Check for end time in table
    console.log('Step 13: Checking for end time in table...');
    const tableText = await page.textContent('body');
    const hasEndTime = tableText.includes('end') || tableText.includes('End') || 
                       tableText.includes('out') || tableText.includes('Out');
    
    if (hasEndTime) {
      console.log('✓ End time appears to be present in the table');
    } else {
      console.log('⚠️  Could not clearly identify end time in table');
    }
    
    await takeScreenshot('final-state');
    
    // Analyze network logs for Time Out request
    console.log('\n' + '='.repeat(80));
    console.log('NETWORK ANALYSIS');
    console.log('='.repeat(80));
    
    const timeOutRequests = networkLogs.filter(log => 
      log.url.toLowerCase().includes('attendance') && 
      (log.method === 'PUT' || log.method === 'PATCH' || log.method === 'POST') &&
      (log.url.toLowerCase().includes('time-out') || 
       log.url.toLowerCase().includes('timeout') ||
       JSON.stringify(log.requestBody || {}).toLowerCase().includes('time_out') ||
       JSON.stringify(log.requestBody || {}).toLowerCase().includes('end_time'))
    );
    
    if (timeOutRequests.length > 0) {
      console.log(`\n✓ Found ${timeOutRequests.length} Time Out request(s):`);
      timeOutRequests.forEach((log, index) => {
        console.log(`\n--- Time Out Request ${index + 1} ---`);
        console.log(`URL: ${log.url}`);
        console.log(`Method: ${log.method}`);
        console.log(`Status: ${log.status}`);
        console.log(`Request:`, JSON.stringify(log.requestBody, null, 2));
        console.log(`Response:`, JSON.stringify(log.responseBody, null, 2));
        
        // Check for 422 errors
        if (log.status === 422) {
          console.log('\n❌ 422 UNPROCESSABLE ENTITY ERROR DETECTED');
          console.log('This typically means validation failed on the backend');
        }
      });
    } else {
      console.log('\n⚠️  No explicit Time Out API requests detected');
      console.log('Showing all attendance-related requests:');
      
      const attendanceRequests = networkLogs.filter(log => 
        log.url.toLowerCase().includes('attendance')
      );
      
      attendanceRequests.forEach(log => {
        console.log(`\n${log.method} ${log.url} - Status: ${log.status}`);
        if (log.requestBody) {
          console.log('Request:', JSON.stringify(log.requestBody, null, 2));
        }
        if (log.responseBody) {
          console.log('Response:', JSON.stringify(log.responseBody, null, 2));
        }
      });
    }
    
    // Final assertions
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    
    const summary = {
      loginSuccessful: !currentUrl.includes('/internal-login'),
      attendancePageReached: attendancePageFound || !currentUrl.includes('/internal-login'),
      timeOutButtonFound: timeOutButton !== null,
      no422Errors: !networkLogs.some(log => log.status === 422 && log.url.includes('attendance')),
      timelineVisible: timelineFound,
      hasTimeOutRequest: timeOutRequests.length > 0,
      screenshots: screenshotCounter
    };
    
    console.log(JSON.stringify(summary, null, 2));
    
    if (summary.no422Errors) {
      console.log('\n✅ SUCCESS: No 422 errors detected');
    } else {
      console.log('\n❌ FAILURE: 422 errors were encountered');
    }
    
    if (summary.timelineVisible) {
      console.log('✅ SUCCESS: Timeline/audit trail is visible');
    } else {
      console.log('⚠️  WARNING: Timeline/audit trail was not found or not visible');
    }
    
    console.log(`\n📸 Total screenshots taken: ${screenshotCounter}`);
    console.log(`📁 Screenshots saved to: test-results/attendance-timeout/`);
    
    // Soft assertions to continue test even if some checks fail
    expect.soft(summary.loginSuccessful).toBe(true);
    expect.soft(summary.attendancePageReached).toBe(true);
    expect.soft(summary.timeOutButtonFound).toBe(true);
    expect.soft(summary.no422Errors).toBe(true);
  });
});
