import { test as base, expect, Page } from '@playwright/test';

/**
 * Test user credentials
 */
export const TEST_USERS = {
  SUPER_ADMIN: {
    email: 'rohit.jain@programmers.io',
    password: 'password',
  },
  HR: {
    email: 'hr.user@programmers.io',
    password: 'password',
  },
  EMPLOYEE: {
    email: 'employee.user@programmers.io',
    password: 'password',
  },
};

/**
 * Authentication fixture
 */
type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to internal login
    await page.goto('/internal-login');
    await page.waitForLoadState('networkidle');

    // Fill credentials
    await page.fill('input[type="email"], input[name="email"]', TEST_USERS.SUPER_ADMIN.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USERS.SUPER_ADMIN.password);

    // Submit login
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForTimeout(1000); // Let auth settle

    await use(page);

    // Cleanup: logout (if needed)
    // await page.click('[data-testid="logout-button"]');
  },
});

export { expect };
