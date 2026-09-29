import { test, expect } from '../../src/fixtures/pages.fixture';
import { PRODUCTS } from '../../src/data/products.data';
import { CHECKOUT_ERRORS, CHECKOUT_OVERVIEW, INCOMPLETE_CUSTOMERS, VALID_CUSTOMER } from '../../src/data/checkout.data';

test.describe('Checkout', () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('completes an order end to end', async ({
    productsPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await productsPage.addToCart(PRODUCTS.backpack.name);
    await productsPage.header.openCart();
    await cartPage.checkout();

    await checkoutInformationPage.submit(VALID_CUSTOMER);

    await checkoutOverviewPage.expectItemNames([PRODUCTS.backpack.name]);
    await checkoutOverviewPage.finish();

    await checkoutCompletePage.expectUrlToContain('checkout-complete.html');
    await checkoutCompletePage.expectOrderComplete();
    await checkoutCompletePage.header.expectCartCount(0);
  });

  test('the overview shows payment, shipping and correct totals', async ({
    productsPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    const ordered = [PRODUCTS.backpack, PRODUCTS.onesie];
    await productsPage.addAllToCart(ordered.map((p) => p.name));
    await cartPage.goto();
    await cartPage.checkout();
    await checkoutInformationPage.submit(VALID_CUSTOMER);

    await checkoutOverviewPage.expectPaymentInfo(CHECKOUT_OVERVIEW.paymentInfo);
    await checkoutOverviewPage.expectShippingInfo(CHECKOUT_OVERVIEW.shippingInfo);
    await checkoutOverviewPage.expectTotals(ordered.map((p) => p.price));

    expect(await checkoutOverviewPage.getLineItemTotal()).toBe(await checkoutOverviewPage.getSubtotal());
  });

  test('step one requires the first name', async ({ cartPage, checkoutInformationPage }) => {
    await cartPage.goto();
    await cartPage.checkout();

    await checkoutInformationPage.submit(INCOMPLETE_CUSTOMERS.missingFirstName);

    await checkoutInformationPage.expectErrorMessage(CHECKOUT_ERRORS.firstNameRequired);
    await checkoutInformationPage.expectUrlToContain('checkout-step-one.html');
  });

  test('step one requires the postal code', async ({ cartPage, checkoutInformationPage }) => {
    await cartPage.goto();
    await cartPage.checkout();

    await checkoutInformationPage.submit(INCOMPLETE_CUSTOMERS.missingPostalCode);

    await checkoutInformationPage.expectErrorMessage(CHECKOUT_ERRORS.postalCodeRequired);
  });

  test('cancelling the overview returns to the inventory', async ({
    productsPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    await productsPage.addToCart(PRODUCTS.onesie.name);
    await cartPage.goto();
    await cartPage.checkout();
    await checkoutInformationPage.submit(VALID_CUSTOMER);

    await checkoutOverviewPage.cancel();

    await productsPage.expectUrlToContain('inventory.html');
    await productsPage.expectLoaded();
  });
});
