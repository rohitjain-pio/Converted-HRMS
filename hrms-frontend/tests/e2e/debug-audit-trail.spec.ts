import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Audit Trail Debug', () => {
  test('debug audit trail visibility and functionality', async ({ page }) => {
    const logs: string[] = [];
    const errors: string[] = [];
    const networkRequests: any[] = [];

    // Capture console logs
    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(`[${msg.type()}] ${text}`);
      console.log(`[CONSOLE ${msg.type()}] ${text}`);
    });

    // Capture errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.log(`[PAGE ERROR] ${error.message}`);
    });

    // Capture network responses
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/attendance')) {
        try {
          const json = await response.json();
          networkRequests.push({
            url: url,
            status: response.status(),
            data: json
          });
          console.log(`[NETWORK] ${url} - Status: ${response.status()}`);
        } catch (e) {
          console.log(`[NETWORK] ${url} - Non-JSON response`);
        }
      }
    });

    // Step 1: Navigate to login page
    console.log('\n=== Step 1: Navigate to login page ===');
    await page.goto('http://localhost:5173/internal-login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/debug-01-login-page.png', fullPage: true });

    // Step 2: Login
    console.log('\n=== Step 2: Login ===');
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/debug-02-after-login.png', fullPage: true });

    // Step 3: Navigate to attendance page
    console.log('\n=== Step 3: Navigate to attendance page ===');
    await page.goto('http://localhost:5173/attendance/my-attendance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for data to load
    await page.screenshot({ path: 'test-results/debug-03-attendance-page.png', fullPage: true });

    // Step 4: Wait for table to load
    console.log('\n=== Step 4: Wait for attendance table ===');
    try {
      await page.waitForSelector('table', { timeout: 10000 });
      await page.waitForTimeout(2000);
      console.log('Table found and loaded');
    } catch (e) {
      console.log('Table not found within timeout, continuing anyway...');
      await page.waitForTimeout(2000);
    }

    // Step 5: Check console logs for specific messages
    console.log('\n=== Step 5: Console Logs Analysis ===');
    const attendanceRecordsLog = logs.find(log => log.includes('Attendance Records:'));
    const firstRecordAuditLog = logs.find(log => log.includes('First Record Audit:'));
    const errorLogs = logs.filter(log => log.includes('[error]') || log.includes('[warning]'));
    
    console.log('Attendance Records Log:', attendanceRecordsLog || 'NOT FOUND');
    console.log('First Record Audit Log:', firstRecordAuditLog || 'NOT FOUND');
    console.log('Error Logs:', errorLogs.length > 0 ? errorLogs : 'NONE');

    // Check page content first
    const pageContent = await page.content();
    const hasTable = pageContent.includes('<table');
    const hasAttendanceText = pageContent.includes('attendance') || pageContent.includes('Attendance');
    console.log('Page has table tag:', hasTable);
    console.log('Page has attendance text:', hasAttendanceText);
    
    // Get page title and main content
    const pageTitle = await page.title();
    const mainContent = await page.evaluate(() => {
      const main = document.querySelector('main') || document.querySelector('#app') || document.body;
      return {
        textContent: main.textContent?.substring(0, 500) || '',
        innerHTML: main.innerHTML.substring(0, 1000)
      };
    });
    console.log('Page title:', pageTitle);
    console.log('Main content text:', mainContent.textContent);
    console.log('Main content HTML (first 1000 chars):', mainContent.innerHTML);
    
    // Check for any error messages
    const errorElements = await page.locator('.error, .alert, [role="alert"]').count();
    console.log('Error elements found:', errorElements);
    if (errorElements > 0) {
      const errorText = await page.locator('.error, .alert, [role="alert"]').first().textContent();
      console.log('Error text:', errorText);
    }
    
    // Step 6-7: Locate and inspect eye icon
    console.log('\n=== Step 6-7: Locate eye icon ===');
    const eyeIcons = await page.locator('.mdi-eye').count();
    console.log(`Found ${eyeIcons} eye icons`);

    if (eyeIcons > 0) {
      await page.screenshot({ path: 'test-results/debug-04-eye-icons-found.png', fullPage: true });
      
      // Get the first eye icon
      const firstEyeIcon = page.locator('.mdi-eye').first();
      
      // Check if visible
      const isVisible = await firstEyeIcon.isVisible();
      console.log('First eye icon visible:', isVisible);
      
      // Get parent button
      const eyeButton = firstEyeIcon.locator('..').first();
      const buttonHTML = await eyeButton.evaluate(el => el.outerHTML);
      console.log('Eye button HTML:', buttonHTML);
      
      // Try to hover
      console.log('\n=== Step 8: Hover over eye icon ===');
      await eyeButton.hover();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/debug-05-eye-hover.png', fullPage: true });
      
      // Check for tooltip
      const tooltips = await page.locator('[role="tooltip"], .v-tooltip__content, .v-overlay__content').count();
      console.log(`Tooltips found after hover: ${tooltips}`);
      
      if (tooltips > 0) {
        const tooltipText = await page.locator('[role="tooltip"], .v-tooltip__content, .v-overlay__content').first().textContent();
        console.log('Tooltip text:', tooltipText);
      }
      
      // Try to click
      console.log('\n=== Step 7: Click eye icon ===');
      await eyeButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/debug-06-after-click.png', fullPage: true });
      
      // Check for tooltip after click
      const tooltipsAfterClick = await page.locator('[role="tooltip"], .v-tooltip__content, .v-overlay__content').count();
      console.log(`Tooltips found after click: ${tooltipsAfterClick}`);
      
      if (tooltipsAfterClick > 0) {
        const tooltipContent = await page.locator('[role="tooltip"], .v-tooltip__content, .v-overlay__content').first().textContent();
        console.log('Tooltip content:', tooltipContent);
        await page.screenshot({ path: 'test-results/debug-07-tooltip-visible.png', fullPage: true });
      }
    } else {
      console.log('No eye icons found in the page!');
    }

    // Step 9: Inspect DOM structure
    console.log('\n=== Step 9: DOM Structure Inspection ===');
    
    // Get all audit data from items
    const auditData = await page.evaluate(() => {
      const results: any[] = [];
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach((row, index) => {
        const actionsCell = row.querySelector('td:last-child');
        results.push({
          rowIndex: index,
          actionsCellHTML: actionsCell?.outerHTML || 'NOT FOUND',
          actionsCellText: actionsCell?.textContent || '',
          hasEyeIcon: actionsCell?.querySelector('.mdi-eye') !== null
        });
      });
      return results;
    });
    
    console.log('Rows found:', auditData.length);
    auditData.slice(0, 3).forEach((row, idx) => {
      console.log(`\nRow ${idx}:`);
      console.log('Has eye icon:', row.hasEyeIcon);
      console.log('Actions cell HTML:', row.actionsCellHTML);
    });

    // Step 10: Capture Actions column HTML
    console.log('\n=== Step 10: Actions Column HTML ===');
    const actionsColumnHTML = await page.evaluate(() => {
      const firstRow = document.querySelector('tbody tr');
      const actionsCell = firstRow?.querySelector('td:last-child');
      return {
        outerHTML: actionsCell?.outerHTML || 'NOT FOUND',
        innerHTML: actionsCell?.innerHTML || 'NOT FOUND',
        textContent: actionsCell?.textContent || ''
      };
    });
    console.log('Actions column outer HTML:', actionsColumnHTML.outerHTML);
    console.log('Actions column inner HTML:', actionsColumnHTML.innerHTML);

    // Check for v-tooltip elements
    const vTooltipElements = await page.evaluate(() => {
      const tooltips = document.querySelectorAll('[data-v-tooltip], .v-tooltip, [aria-describedby]');
      return Array.from(tooltips).map(el => ({
        tag: el.tagName,
        classes: el.className,
        html: el.outerHTML.substring(0, 200)
      }));
    });
    console.log('V-Tooltip elements found:', vTooltipElements.length);
    vTooltipElements.forEach((el, idx) => {
      console.log(`Tooltip ${idx}:`, el);
    });

    // Step 11: Network response analysis
    console.log('\n=== Step 11: Network Response Analysis ===');
    console.log(`Total attendance API calls: ${networkRequests.length}`);
    
    if (networkRequests.length > 0) {
      const latestRequest = networkRequests[networkRequests.length - 1];
      console.log('\nLatest API Response:');
      console.log('URL:', latestRequest.url);
      console.log('Status:', latestRequest.status);
      
      // Check response structure
      const data = latestRequest.data;
      if (data) {
        console.log('\nResponse structure:');
        console.log('- Has data property:', 'data' in data);
        console.log('- Has records property:', 'records' in data);
        console.log('- Data type:', typeof data);
        
        const records = data.data || data.records || data;
        if (Array.isArray(records)) {
          console.log(`- Number of records: ${records.length}`);
          
          if (records.length > 0) {
            const firstRecord = records[0];
            console.log('\nFirst record structure:');
            console.log('- Keys:', Object.keys(firstRecord));
            console.log('- Has audit property:', 'audit' in firstRecord);
            console.log('- Has audit_trail property:', 'audit_trail' in firstRecord);
            console.log('- Has auditTrail property:', 'auditTrail' in firstRecord);
            
            // Log audit data if exists
            const auditField = firstRecord.audit || firstRecord.audit_trail || firstRecord.auditTrail;
            if (auditField) {
              console.log('\nAudit data found:');
              console.log('- Type:', typeof auditField);
              console.log('- Is Array:', Array.isArray(auditField));
              console.log('- Content:', JSON.stringify(auditField, null, 2).substring(0, 500));
            } else {
              console.log('\nNo audit data found in first record');
              console.log('First record full data:', JSON.stringify(firstRecord, null, 2).substring(0, 800));
            }
          }
        }
      }
    }

    // Step 12: Take final screenshots
    console.log('\n=== Step 12: Final Screenshots ===');
    await page.screenshot({ path: 'test-results/debug-08-final-table.png', fullPage: true });
    
    // Screenshot of browser console (DevTools)
    // Note: We can't directly screenshot DevTools, but we've captured all console output

    // Generate summary report
    console.log('\n=== SUMMARY REPORT ===');
    const report = {
      timestamp: new Date().toISOString(),
      consoleLogs: logs,
      errors: errors,
      networkRequests: networkRequests.map(req => ({
        url: req.url,
        status: req.status,
        hasData: !!req.data
      })),
      eyeIconsFound: eyeIcons,
      auditDataStructure: networkRequests.length > 0 ? networkRequests[networkRequests.length - 1].data : null,
      domInspection: {
        rowsFound: auditData.length,
        firstRowActions: auditData[0],
        actionsColumnHTML: actionsColumnHTML
      }
    };

    // Write report to file
    const reportPath = 'test-results/debug-audit-trail-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);

    // Print key findings
    console.log('\n=== KEY FINDINGS ===');
    console.log('1. Eye icons visible:', eyeIcons > 0);
    console.log('2. Attendance records loaded:', networkRequests.length > 0);
    console.log('3. Console errors found:', errors.length);
    console.log('4. API response received:', networkRequests.length > 0);
    
    if (networkRequests.length > 0) {
      const latestRequest = networkRequests[networkRequests.length - 1];
      const data = latestRequest.data;
      const records = data?.data || data?.records || data;
      if (Array.isArray(records) && records.length > 0) {
        const firstRecord = records[0];
        const hasAudit = 'audit' in firstRecord || 'audit_trail' in firstRecord || 'auditTrail' in firstRecord;
        console.log('5. Audit data in API response:', hasAudit);
      }
    }
  });
});
