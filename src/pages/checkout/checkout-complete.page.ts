import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { HeaderComponent } from '../../components/header.component';
import { COMPLETE_MESSAGES } from '../../data/checkout.data';

/** Checkout confirmation (`/checkout-complete.html`). */
export class CheckoutCompletePage extends BasePage {
  readonly header: HeaderComponent;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly ponyExpressImage: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.completeHeader = this.locator('[data-test="complete-header"]');
    this.completeText = this.locator('[data-test="complete-text"]');
    this.ponyExpressImage = this.locator('[data-test="pony-express"]');
    this.backToProductsButton = this.locator('[data-test="back-to-products"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout-complete.html');
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.completeHeader).toHaveText(COMPLETE_MESSAGES.header);
    await expect(this.completeText).toHaveText(COMPLETE_MESSAGES.text);
    await expect(this.ponyExpressImage).toBeVisible();
  }
}
