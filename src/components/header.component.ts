import { Page, Locator, expect } from '@playwright/test';

export class HeaderComponent {
  private readonly root: Locator;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly burgerMenuButton: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.root = page.locator('.primary_header');
    this.cartIcon = this.root.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = this.root.locator('[data-test="shopping-cart-badge"]');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.title = this.root.locator('.title');
  }

  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async getCartCount(): Promise<number> {
    if (await this.cartBadge.count() === 0) return 0;
    const text = await this.cartBadge.textContent();
    return Number(text ?? '0');
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async openBurgerMenu(): Promise<void> {
    await this.burgerMenuButton.click();
  }
}