import { test, expect } from '@playwright/test';

test.describe('Official Details Page - Bank & Employment Survey', () => {
  test('Survey bank account and employment details functionality', async ({ page }) => {
    console.log('=== OFFICIAL DETAILS PAGE SURVEY ===\n');
    
    // Step 1: Login
    console.log('Step 1: Logging in...');
    await page.goto('http://localhost:5173/internal-login');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✓ Login successful\n');
    
    // Step 2: Navigate to profile
    console.log('Step 2: Navigating to profile...');
    await page.goto('http://localhost:5173/profile');
    await page.waitForTimeout(2000);
    console.log('✓ Navigated to profile\n');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/profile-initial.png', fullPage: true });
    
    // Step 3: Check for tabs
    console.log('Step 3: Checking available tabs...');
    const tabs = await page.locator('[role="tab"], .v-tab').allTextContents();
    console.log('Available tabs:');
    tabs.forEach((tab, index) => {
      if (tab.trim()) console.log(`  ${index + 1}. ${tab.trim()}`);
    });
    console.log('');
    
    // Step 4: Click on Official Details tab
    console.log('Step 4: Clicking Official Details tab...');
    const officialTab = page.locator('[role="tab"]:has-text("Official Details"), .v-tab:has-text("Official Details")');
    if (await officialTab.isVisible()) {
      await officialTab.click();
      await page.waitForTimeout(2000);
      console.log('✓ Clicked Official Details tab\n');
      
      await page.screenshot({ path: 'test-results/official-details-tab.png', fullPage: true });
      
      // Check for sections
      console.log('Step 5: Checking sections in Official Details...');
      const headers = await page.locator('h3, h4, h5, .text-h5, .text-h6, .v-card-title').allTextContents();
      console.log('Sections found:');
      headers.forEach((header, index) => {
        if (header.trim() && !header.includes('Employee Profile')) {
          console.log(`  ${index + 1}. ${header.trim()}`);
        }
      });
      console.log('');
      
      // Look for Bank Account section
      console.log('Step 6: Looking for Bank Account section...');
      const bankSection = page.locator('text=Bank Account Details, text=Bank Details').first();
      const bankSectionExists = await bankSection.count() > 0;
      console.log(`Bank Account section: ${bankSectionExists ? '✓ Found' : '✗ Not found'}`);
      
      if (bankSectionExists) {
        // Check for edit button in bank section
        console.log('\nChecking Bank Account edit functionality:');
        const bankEditBtn = page.locator('button:has-text("Edit"), button:has(svg.mdi-pencil)').first();
        const hasEditBtn = await bankEditBtn.count() > 0;
        console.log(`  Edit button: ${hasEditBtn ? '✓ Found' : '✗ Not found'}`);
        
        if (hasEditBtn && await bankEditBtn.isVisible()) {
          console.log('  Attempting to click edit button...');
          await bankEditBtn.click();
          await page.waitForTimeout(1000);
          
          // Check if dialog/form opened
          const dialog = page.locator('[role="dialog"], .v-dialog').first();
          const dialogVisible = await dialog.isVisible();
          console.log(`  Edit dialog opened: ${dialogVisible ? '✓ Yes' : '✗ No'}`);
          
          if (dialogVisible) {
            await page.screenshot({ path: 'test-results/bank-edit-dialog.png' });
            
            // Check form fields
            console.log('\n  Form fields in dialog:');
            const inputs = await dialog.locator('input, select, textarea').all();
            for (const input of inputs) {
              const label = await input.getAttribute('placeholder') || await input.getAttribute('name') || 'Unknown';
              const type = await input.getAttribute('type') || 'text';
              console.log(`    - ${label} (${type})`);
            }
            
            // Check for save button
            const saveBtn = dialog.locator('button:has-text("Save"), button:has-text("Update")');
            console.log(`  Save button: ${await saveBtn.count() > 0 ? '✓ Found' : '✗ Not found'}`);
            
            // Close dialog
            const closeBtn = dialog.locator('button:has-text("Cancel"), button:has-text("Close")').first();
            if (await closeBtn.isVisible()) {
              await closeBtn.click();
              await page.waitForTimeout(500);
            }
          } else {
            console.log('  ⚠ Edit button clicked but no dialog appeared');
          }
        }
      }
      console.log('');
      
      // Look for Employment Details section
      console.log('Step 7: Looking for Employment Details section...');
      const employmentSection = page.locator('text=Employment Details, text=Employment Information').first();
      const employmentExists = await employmentSection.count() > 0;
      console.log(`Employment Details section: ${employmentExists ? '✓ Found' : '✗ Not found'}`);
      
      if (employmentExists) {
        // Check for previous employer button
        console.log('\nChecking Previous Employer functionality:');
        const addPrevEmployerBtn = page.locator('button:has-text("Add Previous Employer"), button:has-text("Previous Employer"), button:has-text("Add Employer")');
        const hasPrevEmployerBtn = await addPrevEmployerBtn.count() > 0;
        console.log(`  Add Previous Employer button: ${hasPrevEmployerBtn ? '✓ Found' : '✗ Not found'}`);
        
        if (hasPrevEmployerBtn) {
          const btn = addPrevEmployerBtn.first();
          if (await btn.isVisible()) {
            console.log('  Attempting to click Add Previous Employer...');
            await btn.click();
            await page.waitForTimeout(1000);
            
            // Check if dialog opened
            const dialog = page.locator('[role="dialog"], .v-dialog').first();
            const dialogVisible = await dialog.isVisible();
            console.log(`  Previous Employer dialog opened: ${dialogVisible ? '✓ Yes' : '✗ No'}`);
            
            if (dialogVisible) {
              await page.screenshot({ path: 'test-results/previous-employer-dialog.png' });
              
              // Check form fields
              console.log('\n  Form fields in dialog:');
              const inputs = await dialog.locator('input, select, textarea').all();
              for (const input of inputs) {
                const label = await input.getAttribute('placeholder') || await input.getAttribute('name') || 'Unknown';
                console.log(`    - ${label}`);
              }
              
              // Close dialog
              const closeBtn = dialog.locator('button:has-text("Cancel"), button:has-text("Close")').first();
              if (await closeBtn.isVisible()) {
                await closeBtn.click();
              }
            } else {
              console.log('  ⚠ Button clicked but no dialog appeared');
            }
          }
        } else {
          // Check if there's a table or list of previous employers
          console.log('\n  Checking for previous employer list/table...');
          const prevEmployerTable = page.locator('table, .v-data-table').filter({ hasText: /Previous|Employer/ });
          const hasTable = await prevEmployerTable.count() > 0;
          console.log(`  Previous employer table: ${hasTable ? '✓ Found' : '✗ Not found'}`);
        }
      }
      console.log('');
      
      // Check for any visible errors
      console.log('Step 8: Checking for errors...');
      const errors = await page.locator('.error, [role="alert"], .v-messages__message').allTextContents();
      const visibleErrors = errors.filter(e => e.trim());
      if (visibleErrors.length > 0) {
        console.log('Errors found:');
        visibleErrors.forEach(err => console.log(`  ⚠ ${err.trim()}`));
      } else {
        console.log('✓ No errors found');
      }
      console.log('');
      
    } else {
      console.log('✗ Official Details tab not found\n');
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/official-details-final.png', fullPage: true });
    
    console.log('=== SURVEY COMPLETE ===');
    console.log('Screenshots saved:');
    console.log('  - profile-initial.png');
    console.log('  - official-details-tab.png');
    console.log('  - bank-edit-dialog.png (if opened)');
    console.log('  - previous-employer-dialog.png (if opened)');
    console.log('  - official-details-final.png');
  });
});
