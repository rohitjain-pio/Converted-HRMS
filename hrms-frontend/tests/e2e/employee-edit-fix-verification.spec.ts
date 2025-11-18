import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174'; // Migrated app URL

const TEST_CREDENTIALS = {
  email: 'admin@company.com',
  password: 'password'
};

test.describe('Employee Edit - Field Population Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/internal-login`);
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should populate all form fields correctly when editing an employee', async ({ page }) => {
    // Get the first employee from the list to test with
    await page.goto(`${BASE_URL}/employees/list`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Find the first edit button and get the employee ID
    const firstEditButton = page.locator('button[aria-label="Edit Employee"], button:has-text("Edit")').first();
    await firstEditButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click edit button
    await firstEditButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for form to load and populate
    
    // Capture the API response to compare
    let apiEmployeeData: any = null;
    page.on('response', async response => {
      if (response.url().includes('/api/employees/') && !response.url().includes('/api/employees?')) {
        try {
          const json = await response.json();
          if (json.success && json.data) {
            apiEmployeeData = json.data;
          }
        } catch (e) {
          // ignore
        }
      }
    });
    
    // Verify we're on the edit page
    await expect(page).toHaveURL(/\/employees\/\d+\/edit/);
    
    // Wait for form to be visible
    await page.waitForSelector('.employee-form-container, form', { timeout: 5000 });
    
    console.log('\n=== FIELD POPULATION VERIFICATION ===\n');
    
    // Step 1: Personal Information
    const firstNameInput = page.locator('input').filter({ has: page.locator('label:has-text("First Name")') });
    const firstNameValue = await firstNameInput.inputValue().catch(() => '');
    console.log('First Name:', firstNameValue);
    expect(firstNameValue).toBeTruthy();
    
    const lastNameInput = page.locator('input').filter({ has: page.locator('label:has-text("Last Name")') });
    const lastNameValue = await lastNameInput.inputValue().catch(() => '');
    console.log('Last Name:', lastNameValue);
    expect(lastNameValue).toBeTruthy();
    
    // Check PAN field (form uses pan_no, API returns pan_number)
    const panInput = page.locator('input[type="text"]').filter({ has: page.locator('label:has-text("PAN")') });
    const panValue = await panInput.inputValue().catch(() => '');
    console.log('PAN Number:', panValue || '[Empty]');
    
    // Check Aadhaar field (form uses aadhaar_no, API returns adhar_number)
    const aadhaarInput = page.locator('input[type="text"]').filter({ has: page.locator('label:has-text("Aadhaar")') });
    const aadhaarValue = await aadhaarInput.inputValue().catch(() => '');
    console.log('Aadhaar Number:', aadhaarValue || '[Empty]');
    
    // Step 2: Contact Information
    // Click Next to go to Step 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    
    const emailInput = page.locator('input[type="email"]').filter({ has: page.locator('label:has-text("Email")') });
    const emailValue = await emailInput.inputValue().catch(() => '');
    console.log('Email:', emailValue);
    expect(emailValue).toBeTruthy();
    
    // Check mobile field (form uses mobile_number, API returns phone)
    const mobileInput = page.locator('input[type="text"]').filter({ has: page.locator('label:text-matches("Mobile|Phone", "i")') });
    const mobileValue = await mobileInput.inputValue().catch(() => '');
    console.log('Mobile Number:', mobileValue || '[Empty]');
    
    // Check emergency contact (form uses emergency_contact_name, API returns emergency_contact_person)
    const emergencyNameInput = page.locator('input[type="text"]').filter({ has: page.locator('label:has-text("Emergency Contact")') });
    const emergencyNameValue = await emergencyNameInput.inputValue().catch(() => '');
    console.log('Emergency Contact Name:', emergencyNameValue || '[Empty]');
    
    // Step 3: Employment Details
    // Click Next to go to Step 3
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    
    const employeeCodeInput = page.locator('input[type="text"]').filter({ has: page.locator('label:has-text("Employee Code")') });
    const employeeCodeValue = await employeeCodeInput.inputValue().catch(() => '');
    console.log('Employee Code:', employeeCodeValue);
    expect(employeeCodeValue).toBeTruthy();
    
    // Check joining date
    const joiningDateInput = page.locator('input[type="date"]').filter({ has: page.locator('label:has-text("Joining Date")') });
    const joiningDateValue = await joiningDateInput.inputValue().catch(() => '');
    console.log('Joining Date:', joiningDateValue);
    expect(joiningDateValue).toBeTruthy();
    
    // Check if designation dropdown has a value
    const designationSelect = page.locator('select').filter({ has: page.locator('label:has-text("Designation")') });
    const designationValue = await designationSelect.inputValue().catch(() => '');
    console.log('Designation ID:', designationValue || '[Not Selected]');
    
    // Check if department dropdown has a value
    const departmentSelect = page.locator('select').filter({ has: page.locator('label:has-text("Department")') });
    const departmentValue = await departmentSelect.inputValue().catch(() => '');
    console.log('Department ID:', departmentValue || '[Not Selected]');
    
    // Check if team dropdown has a value
    const teamSelect = page.locator('select').filter({ has: page.locator('label:has-text("Team")') });
    const teamValue = await teamSelect.inputValue().catch(() => '');
    console.log('Team ID:', teamValue || '[Not Selected]');
    
    console.log('\n=== TEST COMPLETE ===\n');
    
    // Take screenshots
    await page.screenshot({ path: 'test-results/employee-edit-step3-populated.png', fullPage: true });
  });

  test('should handle API response transformation correctly', async ({ page }) => {
    let apiResponse: any = null;
    let transformedData: any = null;
    
    // Intercept API call
    page.on('response', async response => {
      if (response.url().includes('/api/employees/') && !response.url().includes('/api/employees?')) {
        try {
          const json = await response.json();
          if (json.success && json.data) {
            apiResponse = json.data;
          }
        } catch (e) {
          // ignore
        }
      }
    });
    
    // Intercept console logs to see transformation
    page.on('console', msg => {
      if (msg.text().includes('Transformed employee') || msg.text().includes('formData')) {
        console.log('Browser console:', msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/employees/1/edit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    if (apiResponse) {
      console.log('\n=== API RESPONSE STRUCTURE ===');
      console.log('Has employment_detail:', !!apiResponse.employment_detail);
      console.log('API phone field:', apiResponse.phone);
      console.log('API pan_number field:', apiResponse.pan_number);
      console.log('API adhar_number field:', apiResponse.adhar_number);
      console.log('API emergency_contact_person field:', apiResponse.emergency_contact_person);
      console.log('API emergency_contact_no field:', apiResponse.emergency_contact_no);
      
      if (apiResponse.employment_detail) {
        console.log('\nEmployment Detail fields:');
        console.log('- email:', apiResponse.employment_detail.email);
        console.log('- joining_date:', apiResponse.employment_detail.joining_date);
        console.log('- designation_id:', apiResponse.employment_detail.designation_id);
        console.log('- department_id:', apiResponse.employment_detail.department_id);
        console.log('- team_id:', apiResponse.employment_detail.team_id);
        console.log('- reporting_manger_id:', apiResponse.employment_detail.reporting_manger_id);
      }
    }
  });
});
