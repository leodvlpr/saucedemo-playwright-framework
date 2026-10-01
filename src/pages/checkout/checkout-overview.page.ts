import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { HeaderComponent } from '../../components/header.component';
import { ProductCardComponent } from '../../components/product-card.component';
import { calculateTax, calculateTotal, parseLabelledPrice, sum } from '../../utils/price.util';

/** Checkout step two (`/checkout-step-two.html`) — order summary and totals. */
export class CheckoutOverviewPage extends BasePage {
  readonly header: HeaderComponent;
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartList = this.locator('[data-test="cart-list"]');
    this.cartItems = this.locator('[data-test="inventory-item"]');
    this.paymentInfo = this.locator('[data-test="payment-info-value"]');
    this.shippingInfo = this.locator('[data-test="shipping-info-value"]');
    this.subtotalLabel = this.locator('[data-test="subtotal-label"]');
    this.taxLabel = this.locator('[data-test="tax-label"]');
    this.totalLabel = this.locator('[data-test="total-label"]');
    this.finishButton = this.locator('[data-test="finish"]');
    this.cancelButton = this.locator('[data-test="cancel"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout-step-two.html');
  }

  item(index: number): ProductCardComponent {
    return new ProductCardComponent(this.cartItems.nth(index));
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator('[data-test="inventory-item-name"]').allInnerTexts();
  }

  /** Sums the line-item prices shown in the summary. */
  async getLineItemTotal(): Promise<number> {
    const prices = await this.cartItems.locator('[data-test="inventory-item-price"]').allInnerTexts();
    return sum(prices.map(parseLabelledPrice));
  }

  /** "Item total: $29.99" -> 29.99 */
  async getSubtotal(): Promise<number> {
    return parseLabelledPrice(await this.subtotalLabel.innerText());
  }

  async getTax(): Promise<number> {
    return parseLabelledPrice(await this.taxLabel.innerText());
  }

  async getTotal(): Promise<number> {
    return parseLabelledPrice(await this.totalLabel.innerText());
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectItemNames(names: string[]): Promise<void> {
    await expect(this.cartItems.locator('[data-test="inventory-item-name"]')).toHaveText(names);
  }

  async expectPaymentInfo(value: string): Promise<void> {
    await expect(this.paymentInfo).toHaveText(value);
  }

  async expectShippingInfo(value: string): Promise<void> {
    await expect(this.shippingInfo).toHaveText(value);
  }

  async expectSubtotal(subtotal: number): Promise<void> {
    await expect(this.subtotalLabel).toHaveText(`Item total: $${subtotal.toFixed(2)}`);
  }

  /** Checks subtotal, tax and total against the expected line-item prices. */
  async expectTotals(prices: number[]): Promise<void> {
    const subtotal = sum(prices);
    await this.expectSubtotal(subtotal);
    await expect(this.taxLabel).toHaveText(`Tax: $${calculateTax(subtotal).toFixed(2)}`);
    await expect(this.totalLabel).toHaveText(`Total: $${calculateTotal(subtotal).toFixed(2)}`);
  }
}
