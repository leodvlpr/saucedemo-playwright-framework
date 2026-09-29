import { Locator, expect } from '@playwright/test';

/**
 * A single product card. Repeats on screen, so it is scoped to a root Locator
 * rather than a Page: `[data-test="inventory-item"]` on the inventory page, and
 * the same data-test on cart / checkout-overview rows.
 *
 * The add/remove control is one button whose data-test flips between
 * `add-to-cart-<slug>` and `remove-<slug>` (plain `add-to-cart` / `remove` on the
 * product detail page), so it is located structurally within the card.
 */
export class ProductCardComponent {
  private readonly root: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly actionButton: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.name = this.root.locator('[data-test="inventory-item-name"]');
    this.description = this.root.locator('[data-test="inventory-item-desc"]');
    this.price = this.root.locator('[data-test="inventory-item-price"]');
    this.actionButton = this.root.locator('button');
  }

  async getName(): Promise<string> {
    return (await this.name.innerText()).trim();
  }

  async getPriceText(): Promise<string> {
    return (await this.price.innerText()).trim();
  }

  /** Price as a number, e.g. "$29.99" -> 29.99 */
  async getPrice(): Promise<number> {
    return Number((await this.getPriceText()).replace(/[^0-9.]/g, ''));
  }

  async isInCart(): Promise<boolean> {
    const state = await this.actionButton.getAttribute('data-test');
    return state?.startsWith('remove') ?? false;
  }

  async addToCart(): Promise<void> {
    await this.actionButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.actionButton.click();
  }

  /** Clicks the product name, navigating to the product detail page. */
  async openDetail(): Promise<void> {
    await this.name.click();
  }

  async expectName(name: string): Promise<void> {
    await expect(this.name).toHaveText(name);
  }

  async expectPrice(price: string): Promise<void> {
    await expect(this.price).toHaveText(price);
  }

  async expectInCart(): Promise<void> {
    await expect(this.actionButton).toHaveAttribute('data-test', /^remove/);
  }

  async expectNotInCart(): Promise<void> {
    await expect(this.actionButton).toHaveAttribute('data-test', /^add-to-cart/);
  }
}
