import { test, expect } from '@playwright/test';

const LEGACY_BASE_URL = 'http://localhost:5173';  // Update with actual legacy URL
const MIGRATED_BASE_URL = 'http://localhost:5174'; // Update with actual migrated URL

const TEST_CREDENTIALS = {
  email: 'admin@company.com',
  password: 'password'
};

// Test employee ID - use an existing employee in your system
const TEST_EMPLOYEE_ID = 1; // Update with actual employee ID

test.describe('Employee Edit Page - Field Population Comparison', () => {
  
  test('Legacy: Check employee edit page API response and field population', async ({ page }) => {
    // Listen for API calls
    const apiResponses: any[] = [];
    
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/UserProfile/GetPersonalDetailsById') || 
          url.includes('/EmploymentDetail/GetEmploymentDetailById') ||
          url.includes('/GetPersonalProfileByIdAsync')) {
        try {
          const json = await response.json();
          apiResponses.push({
            url: url,
            data: json
          });
        } catch (e) {
          // ignore non-JSON responses
        }
      }
    });

    // Login to legacy app
    await page.goto(LEGACY_BASE_URL);
    await page.fill('input[type="email"], input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard/redirect
    await page.waitForLoadState('networkidle');
    
    // Navigate to employee edit page
    // The exact path may vary - adjust based on legacy app routing
    await page.goto(`${LEGACY_BASE_URL}/employees/${TEST_EMPLOYEE_ID}/edit`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== LEGACY APP - API RESPONSES ===');
    apiResponses.forEach((resp, idx) => {
      console.log(`\nAPI Call ${idx + 1}:`);
      console.log('URL:', resp.url);
      console.log('Data:', JSON.stringify(resp.data, null, 2));
    });
    
    // Check specific form fields and log their values
    console.log('\n=== LEGACY APP - FORM FIELD VALUES ===');
    
    const fields = [
      { label: 'First Name', selector: 'input[name="firstName"]' },
      { label: 'Middle Name', selector: 'input[name="middleName"]' },
      { label: 'Last Name', selector: 'input[name="lastName"]' },
      { label: 'Email', selector: 'input[name="email"]' },
      { label: 'Employee Code', selector: 'input[name="employeeCode"]' },
      { label: 'Joining Date', selector: 'input[name="joiningDate"]' },
    ];
    
    for (const field of fields) {
      try {
        const element = await page.locator(field.selector).first();
        const value = await element.inputValue();
        console.log(`${field.label}: "${value}"`);
      } catch (e) {
        console.log(`${field.label}: [Field not found or error]`);
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/legacy-employee-edit.png', fullPage: true });
  });

  test('Migrated: Check employee edit page API response and field population', async ({ page }) => {
    // Listen for API calls
    const apiResponses: any[] = [];
    
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/employees/')) {
        try {
          const json = await response.json();
          apiResponses.push({
            url: url,
            data: json
          });
        } catch (e) {
          // ignore non-JSON responses
        }
      }
    });

    // Login to migrated app
    await page.goto(`${MIGRATED_BASE_URL}/internal-login`);
    await page.fill('input[type="email"], input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard/redirect
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Navigate to employee edit page
    await page.goto(`${MIGRATED_BASE_URL}/employees/${TEST_EMPLOYEE_ID}/edit`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== MIGRATED APP - API RESPONSES ===');
    apiResponses.forEach((resp, idx) => {
      console.log(`\nAPI Call ${idx + 1}:`);
      console.log('URL:', resp.url);
      console.log('Data:', JSON.stringify(resp.data, null, 2));
    });
    
    // Check specific form fields and log their values
    console.log('\n=== MIGRATED APP - FORM FIELD VALUES ===');
    
    const fields = [
      { label: 'First Name', selector: 'input[type="text"]:has-text("first"), input[name="first_name"]' },
      { label: 'Middle Name', selector: 'input[name="middle_name"]' },
      { label: 'Last Name', selector: 'input[name="last_name"]' },
      { label: 'Email', selector: 'input[type="email"][name="email"]' },
      { label: 'Employee Code', selector: 'input[name="employee_code"]' },
      { label: 'Mobile Number', selector: 'input[name="mobile_number"]' },
      { label: 'PAN Number', selector: 'input[name="pan_no"]' },
      { label: 'Aadhaar Number', selector: 'input[name="aadhaar_no"]' },
    ];
    
    for (const field of fields) {
      try {
        // Try multiple approaches to find the field
        const byName = page.locator(`input[name="${field.selector}"]`);
        const count = await byName.count();
        
        if (count > 0) {
          const value = await byName.first().inputValue();
          console.log(`${field.label}: "${value}"`);
        } else {
          console.log(`${field.label}: [Field not found]`);
        }
      } catch (e) {
        console.log(`${field.label}: [Error: ${e}]`);
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/migrated-employee-edit.png', fullPage: true });
  });

  test('Direct comparison: Check specific employee data', async ({ page, context }) => {
    console.log('\n=== DIRECT EMPLOYEE DATA COMPARISON ===');
    
    // Open migrated app
    await page.goto(`${MIGRATED_BASE_URL}/internal-login`);
    await page.fill('input[type="email"], input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Intercept the API call
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/employees/${TEST_EMPLOYEE_ID}`) && response.status() === 200
    );
    
    await page.goto(`${MIGRATED_BASE_URL}/employees/${TEST_EMPLOYEE_ID}/edit`);
    
    const apiResponse = await apiResponsePromise;
    const employeeData = await apiResponse.json();
    
    console.log('\nFull Employee API Response:');
    console.log(JSON.stringify(employeeData, null, 2));
    
    // Wait for form to populate
    await page.waitForTimeout(2000);
    
    // Check if employment_detail data exists
    if (employeeData.data && employeeData.data.employment_detail) {
      console.log('\n employment_detail found in response:');
      console.log(JSON.stringify(employeeData.data.employment_detail, null, 2));
    }
    
    // Check form fields after Object.assign
    const firstNameValue = await page.locator('input').filter({ hasAttribute: 'v-model', has: page.locator('text=/first.name/i') }).first().inputValue().catch(() => 'NOT FOUND');
    console.log('\nFirst Name field value:', firstNameValue);
    
    // Log the structure mismatch
    console.log('\n=== FIELD NAME MAPPING ISSUES ===');
    console.log('API returns "phone" but form expects "mobile_number"');
    console.log('API returns "pan_number" but form expects "pan_no"');
    console.log('API returns "adhar_number" but form expects "aadhaar_no"');
    console.log('API returns "emergency_contact_person" but form expects "emergency_contact_name"');
    console.log('API returns "emergency_contact_no" but form expects "emergency_contact_number"');
    console.log('API returns nested "employment_detail" but form expects flat structure');
  });
});
