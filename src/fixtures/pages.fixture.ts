import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login/login.page';
import { ProductsPage } from '../pages/products/products.page';
import { ProductDetailsPage } from '../pages/products/product-details.page';
import { CartPage } from '../pages/cart/cart.page';
import { CheckoutInformationPage } from '../pages/checkout/checkout-information.page';
import { CheckoutOverviewPage } from '../pages/checkout/checkout-overview.page';
import { CheckoutCompletePage } from '../pages/checkout/checkout-complete.page';
import { USERS, UserCredentials } from '../data/users.data';

export interface PageFixtures {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Logs in as an arbitrary user and leaves the browser on the inventory page. */
  loginAs: (user: UserCredentials) => Promise<void>;
  /** Auto-login as standard_user. Request it to start a test already authenticated. */
  loggedIn: void;
}

/**
 * Replaces the per-test `new SomePage(page)` boilerplate. Import `test` and
 * `expect` from here instead of from `@playwright/test` in specs.
 */
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  loginAs: async ({ loginPage, productsPage }, use) => {
    await use(async (user: UserCredentials) => {
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await productsPage.expectLoaded();
    });
  },
  loggedIn: async ({ loginAs }, use) => {
    await loginAs(USERS.standard);
    await use();
  },
});

export { expect } from '@playwright/test';
