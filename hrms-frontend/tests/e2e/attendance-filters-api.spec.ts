import { test, expect } from '@playwright/test';

/**
 * Test API endpoints for attendance filter master data
 * Tests that departments and branches are loaded from APIs, not hardcoded
 */
test.describe('Attendance Filter Master Data APIs', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const loginResponse = await request.post('http://localhost:8000/api/auth/internal-login', {
      data: {
        email: 'admin@programmers.io',
        password: 'password'
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    token = loginData.data.token;
    console.log('✓ Authentication successful');
  });

  test('GET /api/master/departments should return departments from database', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/master/departments', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Departments API status:', response.status());
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('Departments response:', JSON.stringify(data, null, 2));
    
    // Verify response structure
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Verify we got actual departments from database
    expect(data.data.length).toBeGreaterThan(0);
    
    // Each department should have id and department_name
    if (data.data.length > 0) {
      const dept = data.data[0];
      expect(dept).toHaveProperty('id');
      expect(dept).toHaveProperty('department_name');
      console.log(`✓ Found ${data.data.length} departments in database`);
    }
  });

  test('GET /api/master/branches should return hardcoded branch enum', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/master/branches', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Branches API status:', response.status());
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('Branches response:', JSON.stringify(data, null, 2));
    
    // Verify response structure
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Should have exactly 3 branches matching legacy BranchLocation enum
    expect(data.data.length).toBe(3);
    
    // Verify exact branch structure matching legacy
    const branches = data.data;
    
    // Find each branch by ID
    const hyderabad = branches.find((b: any) => b.id === 1);
    const jaipur = branches.find((b: any) => b.id === 2);
    const pune = branches.find((b: any) => b.id === 3);
    
    expect(hyderabad).toBeDefined();
    expect(hyderabad.name).toBe('Hyderabad');
    
    expect(jaipur).toBeDefined();
    expect(jaipur.name).toBe('Jaipur');
    
    expect(pune).toBeDefined();
    expect(pune.name).toBe('Pune');
    
    console.log('✓ Branch enum matches legacy: Hyderabad=1, Jaipur=2, Pune=3');
    
    // Ensure no wrong cities are present
    const branchNames = branches.map((b: any) => b.name);
    expect(branchNames).not.toContain('Noida');
    expect(branchNames).not.toContain('Mumbai');
    expect(branchNames).not.toContain('Delhi');
    expect(branchNames).not.toContain('Bangalore');
    
    console.log('✓ No incorrect branch names present');
  });

  test('GET /api/master/all should include branches in response', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/master/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('All master data API status:', response.status());
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    // Verify response has branches key
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('branches');
    expect(Array.isArray(data.data.branches)).toBeTruthy();
    expect(data.data.branches.length).toBe(3);
    
    console.log('✓ getAllMasterData includes branches');
  });

  test('Branches API should NOT return IDs like 401, 402, 403', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/master/branches', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const branchIds = data.data.map((b: any) => b.id);
    
    // Ensure old wrong IDs are not present
    expect(branchIds).not.toContain(401);
    expect(branchIds).not.toContain(402);
    expect(branchIds).not.toContain(403);
    
    // Only valid IDs should be 1, 2, 3
    expect(branchIds).toEqual(expect.arrayContaining([1, 2, 3]));
    expect(branchIds.length).toBe(3);
    
    console.log('✓ Branch IDs are correct: 1, 2, 3 (not 401, 402, 403)');
  });
});

/**
 * Test that frontend components make API calls (not UI interaction tests)
 */
test.describe('Frontend Filter Component Integration', () => {
  test('AttendanceReportFilter should call /api/master/departments and /api/master/branches', async ({ page }) => {
    const apiCalls: string[] = [];
    
    // Intercept API requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/master/')) {
        apiCalls.push(url);
        console.log('API Call detected:', url);
      }
    });
    
    // Login first
    await page.goto('http://localhost:5173/internal-login');
    await page.waitForLoadState('domcontentloaded');
    
    // Check if already logged in or need to login
    const currentUrl = page.url();
    if (currentUrl.includes('internal-login')) {
      await page.fill('input[type="email"]', 'admin@programmers.io');
      await page.fill('input[type="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // Navigate to Employee Report page
    await page.goto('http://localhost:5173/attendance/employee-report');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Verify API calls were made
    const hasDepartmentsCall = apiCalls.some(url => url.includes('/api/master/departments'));
    const hasBranchesCall = apiCalls.some(url => url.includes('/api/master/branches'));
    
    console.log('API calls made:', apiCalls);
    console.log('Departments API called:', hasDepartmentsCall);
    console.log('Branches API called:', hasBranchesCall);
    
    expect(hasDepartmentsCall).toBeTruthy();
    expect(hasBranchesCall).toBeTruthy();
    
    console.log('✓ AttendanceReportFilter fetches departments and branches from APIs');
  });

  test('AttendanceConfigFilter should call /api/master/branches', async ({ page }) => {
    const apiCalls: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/master/branches')) {
        apiCalls.push(url);
        console.log('Branches API called:', url);
      }
    });
    
    // Login
    await page.goto('http://localhost:5173/internal-login');
    await page.waitForLoadState('domcontentloaded');
    
    const currentUrl = page.url();
    if (currentUrl.includes('internal-login')) {
      await page.fill('input[type="email"]', 'admin@programmers.io');
      await page.fill('input[type="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // Navigate to Attendance Config page
    await page.goto('http://localhost:5173/attendance/config');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const hasBranchesCall = apiCalls.length > 0;
    
    console.log('Branches API called:', hasBranchesCall);
    expect(hasBranchesCall).toBeTruthy();
    
    console.log('✓ AttendanceConfigFilter fetches branches from API');
  });
});
