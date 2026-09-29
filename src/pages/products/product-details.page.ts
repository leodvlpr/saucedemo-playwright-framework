import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { HeaderComponent } from '../../components/header.component';
import { parsePrice } from '../../utils/price.util';

/**
 * Product detail page (`/inventory-item.html?id=<n>`). Reached by clicking a card's
 * name on the inventory page. Its add/remove button uses the unsuffixed
 * `add-to-cart` / `remove` data-test, unlike the per-slug buttons on the list.
 *
 * SauceDemo is a client-side-routed React app: the URL flips to
 * `/inventory-item.html` while the inventory list is still mounted, so a bare
 * `[data-test="inventory-item-name"]` briefly matches all six list entries and
 * trips strict mode. Everything here is therefore scoped to
 * `.inventory_details_container`, which only exists once the detail view has
 * rendered — that makes Playwright's auto-retry wait out the transition.
 */
export class ProductDetailsPage extends BasePage {
  readonly header: HeaderComponent;
  private readonly root: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.root = this.locator('.inventory_details_container');
    this.name = this.root.locator('[data-test="inventory-item-name"]');
    this.description = this.root.locator('[data-test="inventory-item-desc"]');
    this.price = this.root.locator('[data-test="inventory-item-price"]');
    this.addToCartButton = this.root.locator('[data-test="add-to-cart"]');
    this.removeButton = this.root.locator('[data-test="remove"]');
    this.backToProductsButton = this.locator('[data-test="back-to-products"]');
  }

  async goto(id: number): Promise<void> {
    await this.page.goto(`/inventory-item.html?id=${id}`);
  }

  /** Waits for the detail view to replace the inventory list. */
  async expectLoaded(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async getName(): Promise<string> {
    return (await this.name.innerText()).trim();
  }

  async getPrice(): Promise<number> {
    return parsePrice(await this.price.innerText());
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }

  async expectName(name: string): Promise<void> {
    await expect(this.name).toHaveText(name);
  }

  async expectPrice(price: string): Promise<void> {
    await expect(this.price).toHaveText(price);
  }

  async expectInCart(): Promise<void> {
    await expect(this.removeButton).toBeVisible();
  }

  async expectNotInCart(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible();
  }
}
