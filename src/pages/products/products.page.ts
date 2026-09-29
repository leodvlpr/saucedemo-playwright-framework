import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { HeaderComponent } from '../../components/header.component';
import { ProductCardComponent } from '../../components/product-card.component';
import { SortOption } from '../../data/products.data';
import { parsePrice } from '../../utils/price.util';
import { PRODUCT_NAME_SELECTOR, PRODUCT_PRICE_SELECTOR, productNameIs } from '../../utils/selectors.util';

export class ProductsPage extends BasePage {
  readonly header: HeaderComponent;
  readonly productList: Locator;
  readonly productItems: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.productList = this.locator('[data-test="inventory-list"]');
    this.productItems = this.locator('[data-test="inventory-item"]');
    this.sortDropdown = this.locator('[data-test="product-sort-container"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  card(index: number): ProductCardComponent {
    return new ProductCardComponent(this.productItems.nth(index));
  }

  cardByName(name: string): ProductCardComponent {
    return new ProductCardComponent(
      this.productItems.filter({ has: this.page.locator(productNameIs(name)) }),
    );
  }

  async getItemCount(): Promise<number> {
    return this.productItems.count();
  }

  async getProductNames(): Promise<string[]> {
    return this.productItems.locator(PRODUCT_NAME_SELECTOR).allInnerTexts();
  }

  async getProductPrices(): Promise<number[]> {
    const prices = await this.productItems.locator(PRODUCT_PRICE_SELECTOR).allInnerTexts();
    return prices.map(parsePrice);
  }

  async addToCart(name: string): Promise<void> {
    await this.cardByName(name).addToCart();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.cardByName(name).removeFromCart();
  }

  async addAllToCart(names: string[]): Promise<void> {
    for (const name of names) {
      await this.addToCart(name);
    }
  }

  async openDetail(name: string): Promise<void> {
    await this.cardByName(name).openDetail();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.productItems).toHaveCount(count);
  }

  async expectProductNames(names: string[]): Promise<void> {
    await expect(this.productItems.locator(PRODUCT_NAME_SELECTOR)).toHaveText(names);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.productList).toBeVisible();
  }
}
