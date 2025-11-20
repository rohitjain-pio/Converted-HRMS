import { test, expect } from '@playwright/test';

test.describe('Exit Management Module', () => {
  test('Resignation list loads and displays items', async ({ page }) => {
    await page.goto('/exit-management');
    await expect(page.locator('h2')).toHaveText('Resignation Requests');
    await expect(page.locator('table')).toBeVisible();
    // Simulate API response if needed
  });

  test('Resignation detail view loads', async ({ page }) => {
    await page.goto('/exit-management');
    // Click first view button
    await page.locator('button', { hasText: 'View' }).first().click();
    await expect(page.locator('h2')).toHaveText('Resignation Details');
    await expect(page.locator('.resignation-detail')).toBeVisible();
  });
});
