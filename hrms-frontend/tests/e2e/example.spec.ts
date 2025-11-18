import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('/');
  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HRMS/);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  
  // Check if the page loads successfully
  await expect(page.locator('body')).toBeVisible();
});

test('login page is accessible', async ({ page }) => {
  await page.goto('/login');
  
  // Check if login page loads
  await expect(page.locator('body')).toBeVisible();
});
