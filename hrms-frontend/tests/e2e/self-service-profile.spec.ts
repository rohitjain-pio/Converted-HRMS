import { test, expect } from '@playwright/test';

test.describe('Self-Service Profile Editing', () => {
  test('should login and check permissions', async ({ page }) => {
    // Navigate to internal login
    await page.goto('http://localhost:5175/internal-login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'rohit.jain@programmers.io');
    await page.fill('input[type="password"]', 'password');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Check localStorage for token and permissions
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const permissions = await page.evaluate(() => localStorage.getItem('permissions'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    
    console.log('Token:', token ? token.substring(0, 50) + '...' : 'null');
    console.log('User:', user);
    console.log('Permissions:', permissions);
    
    // Parse and check if self-service permissions exist
    if (permissions) {
      const permList = JSON.parse(permissions);
      const hasReadOwn = permList.includes('Read.OwnProfile');
      const hasEditOwn = permList.includes('Edit.OwnProfile');
      
      console.log('Has Read.OwnProfile:', hasReadOwn);
      console.log('Has Edit.OwnProfile:', hasEditOwn);
      
      expect(hasReadOwn).toBeTruthy();
      expect(hasEditOwn).toBeTruthy();
    }
  });

  test('should be able to view own profile', async ({ page, request }) => {
    // Login first
    const loginResponse = await request.post('http://localhost:8000/api/auth/login', {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'hrms-secure-api-key-change-in-production',
      },
      data: {
        email: 'rohit.jain@programmers.io',
        password: 'password',
      },
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    const token = loginData.data.token;
    const employeeId = loginData.data.employee_id;
    
    console.log('Employee ID:', employeeId);
    console.log('Permissions count:', loginData.data.permissions.length);
    console.log('Has Read.OwnProfile:', loginData.data.permissions.includes('Read.OwnProfile'));
    console.log('Has Edit.OwnProfile:', loginData.data.permissions.includes('Edit.OwnProfile'));
    
    // Try to get own profile
    const profileResponse = await request.get(`http://localhost:8000/api/employees/${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    console.log('Profile response status:', profileResponse.status());
    const profileData = await profileResponse.json();
    console.log('Profile response:', JSON.stringify(profileData, null, 2));
    
    if (profileResponse.status() === 403) {
      console.log('❌ PERMISSION DENIED - Cannot view own profile');
    } else if (profileResponse.ok()) {
      console.log('✅ SUCCESS - Can view own profile');
    }
  });

  test('should be able to edit own profile', async ({ page, request }) => {
    // Login first
    const loginResponse = await request.post('http://localhost:8000/api/auth/login', {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'hrms-secure-api-key-change-in-production',
      },
      data: {
        email: 'rohit.jain@programmers.io',
        password: 'password',
      },
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    
    const token = loginData.data.token;
    const employeeId = loginData.data.employee_id;
    
    // Try to update own profile
    const updateResponse = await request.put(`http://localhost:8000/api/employees/${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        first_name: 'Rohit',
        last_name: 'Jain',
        phone: '1234567890',
      },
    });
    
    console.log('Update response status:', updateResponse.status());
    const updateData = await updateResponse.json();
    console.log('Update response:', JSON.stringify(updateData, null, 2));
    
    if (updateResponse.status() === 403) {
      console.log('❌ PERMISSION DENIED - Cannot edit own profile');
      console.log('Required permission:', updateData.required_permission);
    } else if (updateResponse.ok()) {
      console.log('✅ SUCCESS - Can edit own profile');
    }
  });
});
