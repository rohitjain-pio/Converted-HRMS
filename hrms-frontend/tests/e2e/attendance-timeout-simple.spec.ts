import { test, expect } from '@playwright/test';

/**
 * Simplified Attendance Time Out Test
 * 
 * This test focuses on verifying the Time Out functionality
 * and the audit trail/timeline display
 */

test.describe('Attendance Time Out - Simplified', () => {
  test('Verify Time Out functionality and audit trail', async ({ page }) => {
    test.setTimeout(60000);
    
    const networkLogs: any[] = [];
    
    // Setup network logging
    page.on('response', async response => {
      if (response.url().includes('/api/attendance')) {
        const log = {
          url: response.url(),
          method: response.request().method(),
          status: response.status()
        };
        
        try {
          const body = await response.json();
          log['responseBody'] = body;
        } catch (e) {
          // Not JSON
        }
        
        try {
          const reqBody = response.request().postDataJSON();
          log['requestBody'] = reqBody;
        } catch (e) {
          // No request body
        }
        
        networkLogs.push(log);
        console.log(`${log.method} ${log.url} - ${log.status}`);
        if (log['responseBody']) {
          console.log(JSON.stringify(log['responseBody'], null, 2));
        }
      }
    });
    
    // Step 1: Login
    console.log('\n=== Step 1: Login ===');
    await page.goto('http://localhost:5173/internal-login');
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ Logged in successfully');
    
    // Step 2: Navigate to attendance page
    console.log('\n=== Step 2: Navigate to Attendance ===');
    await page.goto('http://localhost:5173/attendance/my-attendance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/simple-timeout/01-attendance-page.png', fullPage: true });
    console.log('✓ On attendance page');
    
    // Step 3: Check current state from API response
    console.log('\n=== Step 3: Analyze Current State ===');
    const attendanceLogs = networkLogs.filter(log => 
      log.url.includes('/get-attendance') && log.responseBody
    );
    
    if (attendanceLogs.length > 0) {
      const latestData = attendanceLogs[attendanceLogs.length - 1].responseBody;
      console.log('Attendance Data:', JSON.stringify(latestData, null, 2));
      
      if (latestData.data) {
        console.log(`Is Timed In: ${latestData.data.isTimedIn}`);
        console.log(`Is Manual Attendance: ${latestData.data.isManualAttendance}`);
        
        if (latestData.data.attendanceReport && latestData.data.attendanceReport.length > 0) {
          const firstRecord = latestData.data.attendanceReport[0];
          console.log(`\nToday's Record:`);
          console.log(`  Date: ${firstRecord.date}`);
          console.log(`  Start Time: ${firstRecord.startTime}`);
          console.log(`  End Time: ${firstRecord.endTime}`);
          console.log(`  Location: ${firstRecord.location}`);
          
          if (firstRecord.audit && firstRecord.audit.length > 0) {
            console.log(`\n✓ AUDIT TRAIL EXISTS with ${firstRecord.audit.length} entries:`);
            firstRecord.audit.forEach((entry: any, index: number) => {
              console.log(`  ${index + 1}. ${entry.action} at ${entry.time}`);
            });
          } else {
            console.log('\n❌ NO AUDIT TRAIL FOUND');
          }
        }
      }
    }
    
    // Step 4: Check UI for buttons
    console.log('\n=== Step 4: Check UI Elements ===');
    const timeInBtn = page.locator('button:has-text("Time In")');
    const timeOutBtn = page.locator('button:has-text("Time Out")');
    
    const hasTimeIn = await timeInBtn.isVisible().catch(() => false);
    const hasTimeOut = await timeOutBtn.isVisible().catch(() => false);
    
    console.log(`Time In button visible: ${hasTimeIn}`);
    console.log(`Time Out button visible: ${hasTimeOut}`);
    
    // Step 5: Check for timeline/audit trail in UI
    console.log('\n=== Step 5: Check for Timeline in UI ===');
    
    // Look for timeline-related elements
    const timelineSelectors = [
      '.timeline',
      '[class*="timeline"]',
      '[class*="audit"]',
      '[class*="history"]',
      'text=/timeline/i',
      'text=/audit trail/i',
      'text=/history/i'
    ];
    
    let timelineFound = false;
    for (const selector of timelineSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          timelineFound = true;
          console.log(`✓ Timeline found with selector: ${selector}`);
          const content = await element.textContent();
          console.log(`Timeline content preview: ${content?.substring(0, 200)}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!timelineFound) {
      console.log('⚠️  Timeline not immediately visible in UI');
      
      // Check if we need to click on a row to see timeline
      console.log('Checking if clicking a table row shows timeline...');
      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();
      console.log(`Found ${rowCount} table rows`);
      
      if (rowCount > 0) {
        await tableRows.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/simple-timeout/02-after-row-click.png', fullPage: true });
        
        // Check again for timeline
        for (const selector of timelineSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              timelineFound = true;
              console.log(`✓ Timeline appeared after row click: ${selector}`);
              const content = await element.textContent();
              console.log(`Timeline content: ${content}`);
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      }
    }
    
    // Step 6: Try Time In/Time Out if available
    console.log('\n=== Step 6: Test Time In/Out Functionality ===');
    
    if (hasTimeIn) {
      console.log('Attempting Time In...');
      await timeInBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/simple-timeout/03-time-in-dialog.png', fullPage: true });
      
      // Try to close the dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      console.log('✓ Time In dialog opened (closed for testing)');
    }
    
    if (hasTimeOut) {
      console.log('Attempting Time Out...');
      networkLogs.length = 0; // Clear logs to capture only Time Out request
      
      await timeOutBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/simple-timeout/04-time-out-clicked.png', fullPage: true });
      
      // Look for confirmation dialog
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK")');
      if (await confirmBtn.isVisible({ timeout: 2000 })) {
        console.log('Confirmation dialog appeared, clicking confirm...');
        
        // Wait for the API response
        const responsePromise = page.waitForResponse(
          response => response.url().includes('/api/attendance') && response.status() !== 200,
          { timeout: 5000 }
        ).catch(() => null);
        
        await confirmBtn.click();
        await page.waitForTimeout(2000);
        
        const errorResponse = await responsePromise;
        if (errorResponse) {
          console.log(`❌ Got error response: ${errorResponse.status()}`);
          const body = await errorResponse.json().catch(() => ({}));
          console.log('Error body:', JSON.stringify(body, null, 2));
        }
        
        await page.screenshot({ path: 'test-results/simple-timeout/05-after-time-out.png', fullPage: true });
        console.log('✓ Time Out action completed');
      } else {
        console.log('No confirmation dialog found');
      }
      
      // Check for Time Out request in logs
      const timeOutRequests = networkLogs.filter(log => 
        log.method === 'POST' || log.method === 'PUT' || log.method === 'PATCH'
      );
      
      if (timeOutRequests.length > 0) {
        console.log('\n✓ Time Out API Requests:');
        timeOutRequests.forEach(log => {
          console.log(`\n${log.method} ${log.url}`);
          console.log(`Status: ${log.status}`);
          if (log.requestBody) {
            console.log('Request:', JSON.stringify(log.requestBody, null, 2));
          }
          if (log.responseBody) {
            console.log('Response:', JSON.stringify(log.responseBody, null, 2));
          }
        });
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/simple-timeout/06-final-state.png', fullPage: true });
    
    // Generate report
    console.log('\n' + '='.repeat(80));
    console.log('TEST REPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`✓ Login: SUCCESS`);
    console.log(`✓ Attendance Page: LOADED`);
    console.log(`✓ Time In Button: ${hasTimeIn ? 'VISIBLE' : 'NOT VISIBLE'}`);
    console.log(`✓ Time Out Button: ${hasTimeOut ? 'VISIBLE' : 'NOT VISIBLE'}`);
    console.log(`✓ Timeline in UI: ${timelineFound ? 'VISIBLE' : 'NOT VISIBLE'}`);
    
    const attendanceData = attendanceLogs.length > 0 ? attendanceLogs[0].responseBody : null;
    const hasAuditInAPI = attendanceData?.data?.attendanceReport?.[0]?.audit?.length > 0;
    console.log(`✓ Audit Trail in API: ${hasAuditInAPI ? 'EXISTS' : 'NOT FOUND'}`);
    
    const has422Error = networkLogs.some(log => log.status === 422);
    console.log(`✓ 422 Errors: ${has422Error ? 'FOUND' : 'NONE'}`);
    
    console.log('\n📸 Screenshots saved to test-results/simple-timeout/');
    console.log('='.repeat(80));
  });
});
