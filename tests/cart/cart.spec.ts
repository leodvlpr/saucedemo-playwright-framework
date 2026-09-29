import { test, expect } from '../../src/fixtures/pages.fixture';
import { PRODUCTS } from '../../src/data/products.data';

test.describe('Cart', () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('a product added from the inventory appears in the cart', async ({ productsPage, cartPage }) => {
    await productsPage.addToCart(PRODUCTS.backpack.name);
    await productsPage.header.expectCartCount(1);

    await productsPage.header.openCart();

    await cartPage.expectItemNames([PRODUCTS.backpack.name]);
    expect(await cartPage.getQuantity(PRODUCTS.backpack.name)).toBe(1);
  });

  test('the badge counts every product added', async ({ productsPage, cartPage }) => {
    const names = [PRODUCTS.backpack.name, PRODUCTS.onesie.name, PRODUCTS.boltTShirt.name];
    await productsPage.addAllToCart(names);
    await productsPage.header.expectCartCount(names.length);

    await cartPage.goto();

    await cartPage.expectItemCount(names.length);
    expect((await cartPage.getItemNames()).sort()).toEqual([...names].sort());
  });

  test('removing the last product empties the cart', async ({ productsPage, cartPage }) => {
    await productsPage.addToCart(PRODUCTS.bikeLight.name);
    await cartPage.goto();

    await cartPage.removeItem(PRODUCTS.bikeLight.name);

    await cartPage.expectEmpty();
    await cartPage.header.expectCartCount(0);
  });

  test('continue shopping returns to the inventory', async ({ productsPage, cartPage }) => {
    await cartPage.goto();

    await cartPage.continueShopping();

    await productsPage.expectUrlToContain('inventory.html');
    await productsPage.expectLoaded();
  });
});
