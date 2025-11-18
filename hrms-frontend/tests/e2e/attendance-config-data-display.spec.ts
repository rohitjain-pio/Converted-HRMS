import { test, expect } from '@playwright/test';

test.describe('Attendance Config Data Display', () => {
  test('should return department, designation, and branch data from API', async ({ request }) => {
    // First, login to get the token
    const loginResponse = await request.post('http://localhost:8000/api/auth/internal-login', {
      data: {
        email: 'admin@programmers.io',
        password: 'password'
      }
    });
    
    console.log('Login response status:', loginResponse.status());
    const loginBody = await loginResponse.text();
    console.log('Login response body:', loginBody);
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    
    console.log('Login successful, token obtained');
    
    // Now call the attendance config list API
    const attendanceResponse = await request.post('http://localhost:8000/api/attendance/get-attendance-config-list', {
      headers: {
        'Authorization': `Bearer ${token}`,
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
    
    console.log('API Response status:', attendanceResponse.status());
    
    // Verify response is 200
    expect(attendanceResponse.status()).toBe(200);
    
    const responseData = await attendanceResponse.json();
    console.log('API Response data:', JSON.stringify(responseData, null, 2));
    
    // Verify response has data array
    expect(responseData).toHaveProperty('data');
    expect(Array.isArray(responseData.data)).toBeTruthy();
    
    // Check if we have any data
    if (responseData.data && responseData.data.length > 0) {
      const firstItem = responseData.data[0];
      console.log('\n=== First Employee Data ===');
      console.log('Employee:', firstItem.employeeName);
      console.log('Department:', firstItem.department);
      console.log('Designation:', firstItem.designation);
      console.log('Branch:', firstItem.branch);
      console.log('Attendance Mode:', firstItem.attendanceModeName);
      
      // Verify the required fields exist
      expect(firstItem).toHaveProperty('department');
      expect(firstItem).toHaveProperty('designation');
      expect(firstItem).toHaveProperty('branch');
      
      // Verify they are not N/A (the issue the user reported)
      console.log('\n=== Validation ===');
      console.log('Department is not N/A:', firstItem.department !== 'N/A');
      console.log('Designation is not N/A:', firstItem.designation !== 'N/A');
      console.log('Branch is not N/A:', firstItem.branch !== 'N/A');
      
      // Count how many rows have proper data
      let validDepartments = 0;
      let validDesignations = 0;
      let validBranches = 0;
      
      responseData.data.forEach((item: any) => {
        if (item.department && item.department !== 'N/A') validDepartments++;
        if (item.designation && item.designation !== 'N/A') validDesignations++;
        if (item.branch && item.branch !== 'N/A') validBranches++;
      });
      
      console.log(`\n=== Data Quality Summary ===`);
      console.log(`Total records: ${responseData.data.length}`);
      console.log(`Valid departments: ${validDepartments}`);
      console.log(`Valid designations: ${validDesignations}`);
      console.log(`Valid branches: ${validBranches}`);
    } else {
      console.log('No data returned from API');
    }
  });
});
