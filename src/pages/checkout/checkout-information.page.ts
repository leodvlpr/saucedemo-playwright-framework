import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { HeaderComponent } from '../../components/header.component';
import { CustomerInfo } from '../../data/checkout.data';

/** Checkout step one (`/checkout-step-one.html`) — customer information form. */
export class CheckoutInformationPage extends BasePage {
  readonly header: HeaderComponent;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.firstNameInput = this.locator('[data-test="firstName"]');
    this.lastNameInput = this.locator('[data-test="lastName"]');
    this.postalCodeInput = this.locator('[data-test="postalCode"]');
    this.continueButton = this.locator('[data-test="continue"]');
    this.cancelButton = this.locator('[data-test="cancel"]');
    this.errorMessage = this.locator('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout-step-one.html');
  }

  async fillInformation(customer: CustomerInfo): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /** Fills the form and submits it in one step. */
  async submit(customer: CustomerInfo): Promise<void> {
    await this.fillInformation(customer);
    await this.continue();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectNoError(): Promise<void> {
    await expect(this.errorMessage).toHaveCount(0);
  }
}
