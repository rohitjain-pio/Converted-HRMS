import { test, expect } from '@playwright/test';

test.describe('Attendance Config List - Debug', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get token using internal login
    const loginResponse = await request.post('http://localhost:8000/api/auth/internal-login', {
      data: {
        email: 'admin@company.com',
        password: 'password'
      }
    });
    
    if (loginResponse.ok()) {
      const data = await loginResponse.json();
      authToken = data.data?.token || data.token;
      console.log('Auth token obtained');
    }
  });

  test('Check attendance config list API response', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/attendance/get-attendance-config-list', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        sortColumnName: '',
        sortDirection: 'asc',
        startIndex: 0,
        pageSize: 10,
        filters: {}
      }
    });

    console.log('Response status:', response.status());
    
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    expect(response.ok()).toBeTruthy();

    if (responseData.success && responseData.data?.attendanceConfigList?.length > 0) {
      const firstEmployee = responseData.data.attendanceConfigList[0];
      console.log('\n=== First Employee Data ===');
      console.log('Employee Code:', firstEmployee.employeeCode);
      console.log('Employee Name:', firstEmployee.employeeName);
      console.log('Department:', firstEmployee.department);
      console.log('Designation:', firstEmployee.designation);
      console.log('Branch:', firstEmployee.branch);
      console.log('Country:', firstEmployee.country);
      console.log('=========================\n');

      // Check if fields are missing
      if (firstEmployee.department === 'N/A') {
        console.warn('⚠️ Department is N/A');
      }
      if (firstEmployee.designation === 'N/A') {
        console.warn('⚠️ Designation is N/A');
      }
      if (firstEmployee.branch === 'N/A') {
        console.warn('⚠️ Branch is N/A');
      }
    }
  });

  test('Check UI rendering', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    await page.goto('http://localhost:5173/attendance/config');
    await page.waitForTimeout(2000);

    // Check if table is loaded
    const tableVisible = await page.locator('.attendance-config-table').isVisible();
    console.log('Table visible:', tableVisible);

    // Get first row data
    const rows = page.locator('.v-data-table tbody tr');
    const rowCount = await rows.count();
    console.log('Number of rows:', rowCount);

    if (rowCount > 0) {
      const firstRow = rows.first();
      const cells = firstRow.locator('td');
      const cellCount = await cells.count();
      console.log('Number of cells in first row:', cellCount);

      // Log each cell content
      for (let i = 0; i < cellCount; i++) {
        const cellText = await cells.nth(i).textContent();
        console.log(`Cell ${i}:`, cellText?.trim());
      }
    }
  });
});
