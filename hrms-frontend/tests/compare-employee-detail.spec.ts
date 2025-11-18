import { test, expect } from '@playwright/test';

test.describe('Employee Detail Page Comparison', () => {
  const LEGACY_BASE_URL = 'http://localhost:3001';
  const NEW_BASE_URL = 'http://localhost:5173';
  const EMPLOYEE_ID = 1;

  test.beforeEach(async ({ page, context }) => {
    // You may need to login first - adjust based on your auth setup
    // For now, assuming session/token is available
  });

  test('Compare Legacy vs New Employee Detail Page', async ({ page, browser }) => {
    // Open legacy app
    const legacyPage = await browser.newPage();
    await legacyPage.goto(`${LEGACY_BASE_URL}/profile/personal-details?employeeId=${EMPLOYEE_ID}`);
    await legacyPage.waitForLoadState('networkidle');
    await legacyPage.waitForTimeout(2000);
    
    // Capture all text content from legacy page
    const legacyContent = await legacyPage.evaluate(() => {
      const sections: any = {
        personalInfo: {},
        employmentInfo: {},
        addressInfo: {},
        bankDetails: {},
        documents: [],
        tabs: []
      };
      
      // Get tab names
      const tabs = Array.from(document.querySelectorAll('[role="tab"], .MuiTab-root, button[role="tab"]'));
      sections.tabs = tabs.map(tab => (tab as HTMLElement).innerText);
      
      // Get all label-value pairs
      const labels = Array.from(document.querySelectorAll('label, .MuiFormLabel-root, [class*="label"]'));
      const labelTexts = labels.map(l => (l as HTMLElement).innerText);
      
      // Get profile picture
      const profileImg = document.querySelector('img[alt*="profile"], [class*="profile"]');
      sections.hasProfilePicture = !!profileImg;
      
      // Get employee name from header
      const nameHeader = document.querySelector('h1, h2, h3, [class*="name"], [class*="employee"]');
      sections.employeeName = nameHeader ? (nameHeader as HTMLElement).innerText : '';
      
      // Get all visible text
      sections.allText = document.body.innerText;
      
      return sections;
    });
    
    await legacyPage.screenshot({ path: 'test-results/legacy-employee-detail.png', fullPage: true });
    
    // Open new app
    await page.goto(`${NEW_BASE_URL}/employees/${EMPLOYEE_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const newContent = await page.evaluate(() => {
      const sections: any = {
        personalInfo: {},
        employmentInfo: {},
        addressInfo: {},
        bankDetails: {},
        documents: [],
        tabs: []
      };
      
      // Get tab names
      const tabs = Array.from(document.querySelectorAll('[class*="tab-button"], button[class*="tab"]'));
      sections.tabs = tabs.map(tab => (tab as HTMLElement).innerText);
      
      // Get all visible text
      sections.allText = document.body.innerText;
      
      // Check for profile picture
      const avatar = document.querySelector('[class*="avatar"], [class*="profile"]');
      sections.hasProfilePicture = !!avatar;
      
      // Get employee name from header
      const nameHeader = document.querySelector('h1, h2, h3');
      sections.employeeName = nameHeader ? (nameHeader as HTMLElement).innerText : '';
      
      return sections;
    });
    
    await page.screenshot({ path: 'test-results/new-employee-detail.png', fullPage: true });
    
    // Compare tabs
    console.log('Legacy Tabs:', legacyContent.tabs);
    console.log('New Tabs:', newContent.tabs);
    
    // Compare text content to find missing fields
    console.log('Employee Name - Legacy:', legacyContent.employeeName);
    console.log('Employee Name - New:', newContent.employeeName);
    
    console.log('Has Profile Picture - Legacy:', legacyContent.hasProfilePicture);
    console.log('Has Profile Picture - New:', newContent.hasProfilePicture);
    
    // List all fields in legacy that might not be in new
    const legacyFields = legacyContent.allText.split('\n').filter((line: string) => line.trim().length > 0);
    const newFields = newContent.allText.split('\n').filter((line: string) => line.trim().length > 0);
    
    console.log('\n=== LEGACY FIELDS ===');
    console.log(legacyFields.join('\n'));
    
    console.log('\n=== NEW FIELDS ===');
    console.log(newFields.join('\n'));
    
    // Find missing fields
    const missingFields = legacyFields.filter((field: string) => !newFields.includes(field));
    console.log('\n=== POTENTIALLY MISSING FIELDS ===');
    console.log(missingFields.join('\n'));
    
    await legacyPage.close();
  });
  
  test('Check API data structure', async ({ page }) => {
    // Intercept API calls to compare data structures
    const apiCalls: any[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/') && url.includes('employee') || url.includes('UserProfile')) {
        try {
          const data = await response.json();
          apiCalls.push({
            url,
            status: response.status(),
            data
          });
        } catch (e) {
          // Not JSON
        }
      }
    });
    
    await page.goto(`${NEW_BASE_URL}/employees/${EMPLOYEE_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n=== API CALLS ===');
    apiCalls.forEach(call => {
      console.log('\nURL:', call.url);
      console.log('Status:', call.status);
      console.log('Data:', JSON.stringify(call.data, null, 2));
    });
  });
});
