import { Page } from '@playwright/test';

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  constructor(private page: Page) {}

  // Selectors
  private get emailInput() {
    return this.page.locator('[data-testid="email"], input[type="email"]');
  }

  private get passwordInput() {
    return this.page.locator('[data-testid="password"], input[type="password"]');
  }

  private get loginButton() {
    return this.page.locator('[data-testid="login-button"], button[type="submit"]');
  }

  // Actions
  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isVisible() {
    return await this.emailInput.isVisible();
  }
}

/**
 * Page Object Model for Dashboard Page
 */
export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async isVisible() {
    // Adjust selector based on your actual dashboard
    return await this.page.locator('body').isVisible();
  }

  async getTitle() {
    return await this.page.title();
  }
}
