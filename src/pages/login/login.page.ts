import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.locator('[data-test="username"]');
    this.passwordInput = this.locator('[data-test="password"]');
    this.loginButton = this.locator('[data-test="login-button"]');
    this.errorMessage = this.locator('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}