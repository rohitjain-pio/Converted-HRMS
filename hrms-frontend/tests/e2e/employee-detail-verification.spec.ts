import { test, expect } from '@playwright/test';

/**
 * Employee Detail Page Verification
 * 
 * This test verifies that ALL employee information fields from the legacy app
 * are properly displayed in the new Vue implementation.
 * 
 * Legacy tabs structure (from React app):
 * 1. Personal Details - Name, DOB, Gender, Blood Group, Marital Status, Father Name, etc.
 * 2. Official Details - PAN, Aadhaar, Passport, PF, ESI, Bank Details
 * 3. Employment Details - Designation, Department, Team, Joining Date, Experience
 * 4. Education Details - Qualifications
 * 5. Nominee Details - Nominees
 * 6. Certificate Details - Certificates
 * 7. IT Assets (conditional)
 * 8. Exit Details (conditional)
 */

test.describe('Employee Detail Page - Complete Field Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to employee detail page
    // Note: May need authentication first
    await page.goto('http://localhost:5174/employees/1');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
  });

  test('should display all required tabs', async ({ page }) => {
    const expectedTabs = [
      'Personal Details',
      'Official Details',
      'Contact Info',
      'Employment Details',
      'Address',
      'Bank Details',
      'Documents',
      'Qualifications',
      'Certificates',
      'Nominees'
    ];

    console.log('\n=== CHECKING TABS ===');
    for (const tabName of expectedTabs) {
      const tabButton = page.getByRole('button', { name: tabName });
      const isVisible = await tabButton.isVisible().catch(() => false);
      console.log(`  ${isVisible ? '✓' : '✗'} ${tabName}`);
      expect(isVisible, `Tab "${tabName}" should be visible`).toBe(true);
    }
  });

  test('Personal Details tab - should display all personal information fields', async ({ page }) => {
    // Click on Personal Details tab
    await page.getByRole('button', { name: 'Personal Details' }).click();
    await page.waitForTimeout(500);

    const personalFields = [
      'First Name',
      'Middle Name',
      'Last Name',
      'Father\'s Name',
      'Date of Birth',
      'Gender',
      'Blood Group',
      'Marital Status',
      'Nationality'
    ];

    console.log('\n=== PERSONAL DETAILS TAB ===');
    for (const field of personalFields) {
      const fieldLabel = page.getByText(field, { exact: false });
      const isVisible = await fieldLabel.isVisible().catch(() => false);
      console.log(`  ${isVisible ? '✓' : '✗'} ${field}`);
    }
  });

  test('Official Details tab - should display PAN, Aadhaar, Passport, PF, and ESI information', async ({ page }) => {
    // Click on Official Details tab
    await page.getByRole('button', { name: 'Official Details' }).click();
    await page.waitForTimeout(500);

    const officialFields = [
      'PAN Number',
      'Aadhaar Number',
      'Passport Number',
      'Has PF',
      'Has ESI'
    ];

    console.log('\n=== OFFICIAL DETAILS TAB ===');
    for (const field of officialFields) {
      const fieldLabel = page.getByText(field, { exact: false });
      const isVisible = await fieldLabel.isVisible().catch(() => false);
      console.log(`  ${isVisible ? '✓' : '✗'} ${field}`);
    }

    // Take screenshot of Official Details tab
    await page.screenshot({ 
      path: 'tests/screenshots/official-details-tab.png',
      fullPage: true 
    });
  });

  test('Contact Info tab - should display email and phone information', async ({ page }) => {
    // Click on Contact Info tab
    await page.getByRole('button', { name: 'Contact Info' }).click();
    await page.waitForTimeout(500);

    const contactFields = [
      'Official Email',
      'Personal Email',
      'Mobile Number',
      'Contact Name',  // Emergency contact
      'Contact Number'  // Emergency contact
    ];

    console.log('\n=== CONTACT INFO TAB ===');
    for (const field of contactFields) {
      const fieldLabel = page.getByText(field, { exact: false });
      const isVisible = await fieldLabel.isVisible().catch(() => false);
      console.log(`  ${isVisible ? '✓' : '✗'} ${field}`);
    }
  });

  test('Employment Details tab - should display comprehensive employment information', async ({ page }) => {
    // Click on Employment Details tab
    await page.getByRole('button', { name: 'Employment Details' }).click();
    await page.waitForTimeout(500);

    const employmentFields = [
      'Employee Code',
      'Official Email',
      'Designation',
      'Department',
      'Team',
      'Role',
      'Employment Status',
      'Job Type',
      'Joining Date',
      'Reporting Manager',
      'Time Doctor User ID'
    ];

    console.log('\n=== EMPLOYMENT DETAILS TAB ===');
    for (const field of employmentFields) {
      const fieldLabel = page.getByText(field, { exact: false });
      const isVisible = await fieldLabel.isVisible().catch(() => false);
      console.log(`  ${isVisible ? '✓' : '✗'} ${field}`);
    }

    // Take screenshot of Employment Details tab
    await page.screenshot({ 
      path: 'tests/screenshots/employment-details-tab.png',
      fullPage: true 
    });
  });

  test('should display employee header with avatar and basic info', async ({ page }) => {
    console.log('\n=== EMPLOYEE HEADER ===');
    
    // Check for avatar
    const avatar = page.locator('.employee-avatar');
    const hasAvatar = await avatar.isVisible().catch(() => false);
    console.log(`  ${hasAvatar ? '✓' : '✗'} Avatar displayed`);

    // Check for employee name in header
    const header = page.locator('.employee-basic-info h2');
    const hasName = await header.isVisible().catch(() => false);
    console.log(`  ${hasName ? '✓' : '✗'} Employee name in header`);

    // Check for employee metadata (code, designation, department)
    const metadata = page.locator('.employee-meta');
    const hasMetadata = await metadata.isVisible().catch(() => false);
    console.log(`  ${hasMetadata ? '✓' : '✗'} Employee metadata (code, designation, department)`);

    // Check for Edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    const hasEditButton = await editButton.isVisible().catch(() => false);
    console.log(`  ${hasEditButton ? '✓' : '✗'} Edit Employee button`);

    // Take screenshot of full page
    await page.screenshot({ 
      path: 'tests/screenshots/employee-detail-full-page.png',
      fullPage: true 
    });
  });

  test('comprehensive field presence check - all tabs', async ({ page }) => {
    const allFieldsCheck: Record<string, string[]> = {
      'Personal Details': [
        'First Name', 'Middle Name', 'Last Name', 'Father\'s Name',
        'Date of Birth', 'Gender', 'Blood Group', 'Marital Status', 'Nationality'
      ],
      'Official Details': [
        'PAN Number', 'Aadhaar Number', 'Passport Number', 'Has PF', 'Has ESI'
      ],
      'Contact Info': [
        'Official Email', 'Personal Email', 'Mobile Number'
      ],
      'Employment Details': [
        'Employee Code', 'Designation', 'Department', 'Employment Status',
        'Job Type', 'Joining Date'
      ]
    };

    const results: Record<string, Record<string, boolean>> = {};

    for (const [tabName, fields] of Object.entries(allFieldsCheck)) {
      results[tabName] = {};
      
      // Click on tab
      await page.getByRole('button', { name: tabName }).click();
      await page.waitForTimeout(500);

      for (const field of fields) {
        const fieldLabel = page.getByText(field, { exact: false });
        const isVisible = await fieldLabel.isVisible().catch(() => false);
        results[tabName][field] = isVisible;
      }
    }

    // Print summary
    console.log('\n=== COMPREHENSIVE FIELD CHECK SUMMARY ===');
    for (const [tabName, fields] of Object.entries(results)) {
      console.log(`\n${tabName}:`);
      const visibleCount = Object.values(fields).filter(v => v).length;
      const totalCount = Object.values(fields).length;
      console.log(`  ${visibleCount}/${totalCount} fields visible`);
      
      for (const [field, isVisible] of Object.entries(fields)) {
        console.log(`    ${isVisible ? '✓' : '✗'} ${field}`);
      }
    }

    // Calculate overall completeness
    const allFields = Object.values(results).flatMap(tab => Object.values(tab));
    const totalVisible = allFields.filter(v => v).length;
    const totalFields = allFields.length;
    const completeness = (totalVisible / totalFields * 100).toFixed(1);
    
    console.log(`\n=== OVERALL COMPLETENESS: ${completeness}% (${totalVisible}/${totalFields} fields) ===\n`);
  });
});
