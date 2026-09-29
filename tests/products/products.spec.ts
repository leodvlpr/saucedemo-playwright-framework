import { test, expect } from '../../src/fixtures/pages.fixture';
import { PRODUCTS, PRODUCT_COUNT, SORT_OPTIONS } from '../../src/data/products.data';

test.describe('Products', () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('0005 [PRODUCTS] Validate catalog lists every product', async ({ productsPage }) => {
    await productsPage.expectItemCount(PRODUCT_COUNT);
  });

  test('0006 [PRODUCTS] Validate product card shows its name and price', async ({ productsPage }) => {
    const card = productsPage.cardByName(PRODUCTS.backpack.name);

    await card.expectName(PRODUCTS.backpack.name);
    expect(await card.getPrice()).toBe(PRODUCTS.backpack.price);
  });

  test('0007 [PRODUCTS] Validate add to cart button toggles to remove', async ({ productsPage }) => {
    const card = productsPage.cardByName(PRODUCTS.bikeLight.name);

    await card.expectNotInCart();
    expect(await card.isInCart()).toBe(false);

    await card.addToCart();
    await card.expectInCart();
    expect(await card.isInCart()).toBe(true);

    await card.removeFromCart();
    await card.expectNotInCart();
  });

  test('0008 [PRODUCTS] Validate product name opens the detail page', async ({ productsPage, productDetailsPage }) => {
    await productsPage.openDetail(PRODUCTS.fleeceJacket.name);

    await productDetailsPage.expectUrlToContain('inventory-item.html');
    await productDetailsPage.expectName(PRODUCTS.fleeceJacket.name);
    expect(await productDetailsPage.getPrice()).toBe(PRODUCTS.fleeceJacket.price);
  });

  test('0009 [PRODUCTS] Validate sorting by price ascending orders the list', async ({ productsPage }) => {
    await productsPage.sortBy(SORT_OPTIONS.priceAsc);

    const prices = await productsPage.getProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
