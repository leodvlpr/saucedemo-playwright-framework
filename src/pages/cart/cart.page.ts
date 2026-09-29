import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { HeaderComponent } from '../../components/header.component';
import { ProductCardComponent } from '../../components/product-card.component';
import { PRODUCT_NAME_SELECTOR, productNameIs } from '../../utils/selectors.util';

export class CartPage extends BasePage {
  readonly header: HeaderComponent;
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartList = this.locator('[data-test="cart-list"]');
    this.cartItems = this.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = this.locator('[data-test="continue-shopping"]');
    this.checkoutButton = this.locator('[data-test="checkout"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  /** Cart rows reuse the inventory-item markup, so they share ProductCardComponent. */
  item(index: number): ProductCardComponent {
    return new ProductCardComponent(this.cartItems.nth(index));
  }

  itemByName(name: string): ProductCardComponent {
    return new ProductCardComponent(
      this.cartItems.filter({ has: this.page.locator(productNameIs(name)) }),
    );
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator(PRODUCT_NAME_SELECTOR).allInnerTexts();
  }

  async getQuantity(name: string): Promise<number> {
    const row = this.cartItems.filter({ has: this.page.locator(productNameIs(name)) });
    return Number((await row.locator('[data-test="item-quantity"]').innerText()).trim());
  }

  async removeItem(name: string): Promise<void> {
    await this.itemByName(name).removeFromCart();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectItemNames(names: string[]): Promise<void> {
    await expect(this.cartItems.locator(PRODUCT_NAME_SELECTOR)).toHaveText(names);
  }

  async expectEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }
}
