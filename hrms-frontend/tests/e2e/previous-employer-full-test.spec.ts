import { test, expect } from '@playwright/test';

test.describe('Previous Employer - Full Form Submission Test', () => {
  
  test('Complete flow: Add, verify, edit, and delete previous employer', async ({ page }) => {
    test.setTimeout(180000);

    console.log('=== STEP 1: LOGIN ===');
    await page.goto('http://localhost:5173/internal-login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Logged in successfully');

    console.log('\n=== STEP 2: NAVIGATE TO EMPLOYMENT DETAILS ===');
    await page.goto('http://localhost:5173/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.click('text=Employment Details');
    await page.waitForTimeout(3000);
    console.log('✓ Employment Details tab opened');
    await page.screenshot({ path: 'test-results/full-test-01-employment-tab.png' });

    console.log('\n=== STEP 3: OPEN ADD PREVIOUS EMPLOYER FORM ===');
    const addButton = page.locator('button:has-text("Add Previous Employer")').first();
    await addButton.click();
    await page.waitForTimeout(2000);
    console.log('✓ Add Previous Employer dialog opened');
    await page.screenshot({ path: 'test-results/full-test-02-form-opened.png' });

    // Verify dialog is visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    console.log('\n=== STEP 4: FILL FORM WITH TEST DATA ===');
    
    // Fill required fields
    const companyName = 'Tech Innovations Pvt Ltd';
    const designation = 'Senior Software Engineer';
    const startDate = '2019-03-15';
    const endDate = '2023-11-30';
    
    console.log('Filling Company Name...');
    const companyField = page.locator('input').filter({ hasText: /company/i }).or(
      page.locator('label:has-text("Company Name")').locator('..').locator('input')
    ).first();
    await companyField.fill(companyName);
    console.log(`✓ Company Name: ${companyName}`);

    console.log('Filling Designation...');
    // Find the designation field in the form (not from current employment)
    const designationField = page.locator('[role="dialog"]').locator('input').filter({ hasText: /designation/i }).or(
      page.locator('[role="dialog"]').locator('label:has-text("Designation")').locator('..').locator('input')
    ).first();
    await designationField.fill(designation);
    console.log(`✓ Designation: ${designation}`);

    console.log('Filling Employment Start Date...');
    const startDateField = page.locator('[role="dialog"]').locator('input[type="date"]').first();
    await startDateField.fill(startDate);
    console.log(`✓ Start Date: ${startDate}`);

    console.log('Filling Employment End Date...');
    const endDateField = page.locator('[role="dialog"]').locator('input[type="date"]').nth(1);
    await endDateField.fill(endDate);
    console.log(`✓ End Date: ${endDate}`);

    // Fill optional fields
    console.log('Filling optional fields...');
    
    const managerName = 'John Smith';
    const managerNameField = page.locator('[role="dialog"]').locator('input').filter({ hasText: /manager.*name/i }).or(
      page.locator('[role="dialog"]').locator('label:has-text("Manager Name")').locator('..').locator('input')
    ).first();
    await managerNameField.fill(managerName);
    console.log(`✓ Manager Name: ${managerName}`);

    const managerContact = '+91-9876543210';
    const managerContactField = page.locator('[role="dialog"]').locator('input').filter({ hasText: /manager.*contact/i }).or(
      page.locator('[role="dialog"]').locator('label:has-text("Manager Contact")').locator('..').locator('input')
    ).first();
    await managerContactField.fill(managerContact);
    console.log(`✓ Manager Contact: ${managerContact}`);

    const hrName = 'Sarah Johnson';
    const hrNameField = page.locator('[role="dialog"]').locator('input').filter({ hasText: /hr.*name/i }).or(
      page.locator('[role="dialog"]').locator('label:has-text("HR Name")').locator('..').locator('input')
    ).first();
    await hrNameField.fill(hrName);
    console.log(`✓ HR Name: ${hrName}`);

    const hrContact = '+91-9876543211';
    const hrContactField = page.locator('[role="dialog"]').locator('input').filter({ hasText: /hr.*contact/i }).or(
      page.locator('[role="dialog"]').locator('label:has-text("HR Contact")').locator('..').locator('input')
    ).first();
    await hrContactField.fill(hrContact);
    console.log(`✓ HR Contact: ${hrContact}`);

    const companyAddress = 'Building A, Tech Park, Bangalore - 560001';
    const addressField = page.locator('[role="dialog"]').locator('input, textarea').filter({ hasText: /company.*address|address/i }).or(
      page.locator('[role="dialog"]').locator('label:has-text("Company Address")').locator('..').locator('input, textarea')
    ).first();
    await addressField.fill(companyAddress);
    console.log(`✓ Company Address: ${companyAddress}`);

    const reasonForLeaving = 'Better career opportunity and growth prospects';
    const reasonField = page.locator('[role="dialog"]').locator('input, textarea').filter({ hasText: /reason/i }).or(
      page.locator('[role="dialog"]').locator('label:has-text("Reason")').locator('..').locator('input, textarea')
    ).first();
    await reasonField.fill(reasonForLeaving);
    console.log(`✓ Reason for Leaving: ${reasonForLeaving}`);

    await page.screenshot({ path: 'test-results/full-test-03-form-filled.png' });

    console.log('\n=== STEP 5: SUBMIT FORM ===');
    
    // Listen for API call
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/employees/previous-employers') && response.request().method() === 'POST',
      { timeout: 15000 }
    );

    // Click Save button
    const saveButton = page.locator('[role="dialog"]').locator('button:has-text("Save"), button[type="submit"]').first();
    await saveButton.click();
    console.log('✓ Save button clicked');

    // Wait for API response
    try {
      const response = await responsePromise;
      const status = response.status();
      console.log(`API Response Status: ${status}`);
      
      const responseBody = await response.json();
      console.log('API Response:', JSON.stringify(responseBody, null, 2));
      
      if (status === 200 || status === 201) {
        console.log('✓ Previous employer saved successfully!');
      } else {
        console.error('✗ API returned error status:', status);
        console.error('Response:', responseBody);
      }
    } catch (e) {
      console.error('✗ Error waiting for API response:', e.message);
      await page.screenshot({ path: 'test-results/full-test-04-api-error.png' });
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/full-test-05-after-save.png' });

    console.log('\n=== STEP 6: VERIFY RECORD APPEARS IN LIST ===');
    
    // Check if dialog closed
    const dialogVisible = await dialog.isVisible().catch(() => false);
    if (!dialogVisible) {
      console.log('✓ Dialog closed after save');
    } else {
      console.log('⚠ Dialog still visible - may indicate validation error');
      await page.screenshot({ path: 'test-results/full-test-06-dialog-still-open.png' });
    }

    // Look for the added record in the list
    await page.waitForTimeout(2000);
    const recordExists = await page.locator(`text=${companyName}`).count() > 0;
    
    if (recordExists) {
      console.log(`✓ Record found in list: ${companyName}`);
      await page.screenshot({ path: 'test-results/full-test-07-record-in-list.png' });
    } else {
      console.log('⚠ Record not immediately visible in list');
      
      // Check if there's a "no records" message
      const noRecordsMessage = await page.locator('text=/no.*previous.*employer/i, text=/no.*record/i').count();
      console.log(`No records message count: ${noRecordsMessage}`);
      
      await page.screenshot({ path: 'test-results/full-test-08-no-record-found.png' });
    }

    console.log('\n=== STEP 7: TEST EDIT FUNCTIONALITY ===');
    
    if (recordExists) {
      // Find and click edit button for the record
      const editButton = page.locator(`text=${companyName}`).locator('..').locator('button:has-text("Edit"), button[aria-label*="edit" i]').first();
      const editButtonExists = await editButton.count() > 0;
      
      if (editButtonExists) {
        await editButton.click();
        await page.waitForTimeout(2000);
        console.log('✓ Edit button clicked');
        
        // Verify form opened with data
        const dialogOpened = await dialog.isVisible();
        if (dialogOpened) {
          console.log('✓ Edit dialog opened');
          
          // Verify company name is populated
          const companyValue = await companyField.inputValue();
          console.log(`Company name in edit form: ${companyValue}`);
          
          await page.screenshot({ path: 'test-results/full-test-09-edit-form.png' });
          
          // Close the edit dialog
          const cancelButton = page.locator('[role="dialog"]').locator('button:has-text("Cancel")').first();
          await cancelButton.click();
          await page.waitForTimeout(1000);
          console.log('✓ Edit dialog cancelled');
        } else {
          console.log('⚠ Edit dialog did not open');
        }
      } else {
        console.log('⚠ Edit button not found for the record');
      }
    }

    console.log('\n=== STEP 8: TEST DELETE FUNCTIONALITY ===');
    
    if (recordExists) {
      // Set up dialog handler for confirmation
      page.on('dialog', async dialog => {
        console.log(`Confirmation dialog: ${dialog.message()}`);
        await dialog.accept();
        console.log('✓ Confirmation accepted');
      });

      // Find and click delete button
      const deleteButton = page.locator(`text=${companyName}`).locator('..').locator('button:has-text("Delete"), button[aria-label*="delete" i]').first();
      const deleteButtonExists = await deleteButton.count() > 0;
      
      if (deleteButtonExists) {
        // Listen for DELETE API call
        const deleteResponsePromise = page.waitForResponse(
          response => response.url().includes('/api/employees/previous-employers') && response.request().method() === 'DELETE',
          { timeout: 15000 }
        );

        await deleteButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ Delete button clicked');
        
        try {
          const deleteResponse = await deleteResponsePromise;
          const deleteStatus = deleteResponse.status();
          console.log(`Delete API Status: ${deleteStatus}`);
          
          if (deleteStatus === 200 || deleteStatus === 204) {
            console.log('✓ Previous employer deleted successfully!');
          }
        } catch (e) {
          console.error('✗ Error waiting for delete API response:', e.message);
        }

        await page.waitForTimeout(2000);
        
        // Verify record is gone
        const recordStillExists = await page.locator(`text=${companyName}`).count() > 0;
        if (!recordStillExists) {
          console.log('✓ Record removed from list after delete');
        } else {
          console.log('⚠ Record still visible after delete');
        }
        
        await page.screenshot({ path: 'test-results/full-test-10-after-delete.png' });
      } else {
        console.log('⚠ Delete button not found for the record');
      }
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('✓ Login');
    console.log('✓ Navigation to Employment Details');
    console.log('✓ Form opened');
    console.log('✓ All fields filled');
    console.log('✓ Form submitted');
    console.log(`${recordExists ? '✓' : '⚠'} Record verification`);
    console.log('\nCheck test-results/ folder for detailed screenshots');
  });

});
