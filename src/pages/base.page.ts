import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async expectUrlToContain(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(path));
  }
}