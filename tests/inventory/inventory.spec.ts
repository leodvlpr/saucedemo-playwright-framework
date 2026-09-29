import { test, expect } from '../../src/fixtures/pages.fixture';
import { PRODUCTS, PRODUCT_COUNT, SORT_OPTIONS } from '../../src/data/products.data';

test.describe('Inventory', () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('lists every product in the catalog', async ({ productsPage }) => {
    await productsPage.expectItemCount(PRODUCT_COUNT);
  });

  test('a card exposes its name and price', async ({ productsPage }) => {
    const card = productsPage.cardByName(PRODUCTS.backpack.name);

    await card.expectName(PRODUCTS.backpack.name);
    expect(await card.getPrice()).toBe(PRODUCTS.backpack.price);
  });

  test('the add-to-cart button toggles to remove', async ({ productsPage }) => {
    const card = productsPage.cardByName(PRODUCTS.bikeLight.name);

    await card.expectNotInCart();
    expect(await card.isInCart()).toBe(false);

    await card.addToCart();
    await card.expectInCart();
    expect(await card.isInCart()).toBe(true);

    await card.removeFromCart();
    await card.expectNotInCart();
  });

  test('clicking a product name opens its detail page', async ({ productsPage, productDetailsPage }) => {
    await productsPage.openDetail(PRODUCTS.fleeceJacket.name);

    await productDetailsPage.expectUrlToContain('inventory-item.html');
    await productDetailsPage.expectName(PRODUCTS.fleeceJacket.name);
    expect(await productDetailsPage.getPrice()).toBe(PRODUCTS.fleeceJacket.price);
  });

  test('sorting by price ascending reorders the list', async ({ productsPage }) => {
    await productsPage.sortBy(SORT_OPTIONS.priceAsc);

    const prices = await productsPage.getProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
