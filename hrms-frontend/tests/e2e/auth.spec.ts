import { test, expect } from '../fixtures';
import { LoginPage } from '../pages';

test.describe('Authentication Tests', () => {
  test('login page loads correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    expect(await loginPage.isVisible()).toBeTruthy();
  });

  // Uncomment and modify when authentication is implemented
  // test('user can login with valid credentials', async ({ page }) => {
  //   const loginPage = new LoginPage(page);
  //   await loginPage.goto();
  //   await loginPage.login('test@example.com', 'password123');
  //   
  //   // Verify redirect to dashboard
  //   await expect(page).toHaveURL(/dashboard/);
  // });

  // test('user cannot login with invalid credentials', async ({ page }) => {
  //   const loginPage = new LoginPage(page);
  //   await loginPage.goto();
  //   await loginPage.login('invalid@example.com', 'wrongpassword');
  //   
  //   // Verify error message is shown
  //   await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  // });
});
