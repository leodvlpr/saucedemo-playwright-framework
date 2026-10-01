import { test } from '../../src/fixtures/pages.fixture';
import { LOGIN_ERRORS, USERS } from '../../src/data/users.data';

test.describe('Login', () => {
  test('0001 [LOGIN] Validate standard user reaches the products page after signing in', async ({ loginPage, productsPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    await productsPage.expectUrlToContain('inventory.html');
    await productsPage.expectLoaded();
  });

  test('0002 [LOGIN] Validate locked out user is blocked with an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);

    await loginPage.expectErrorMessage(LOGIN_ERRORS.lockedOut);
  });

  test('0003 [LOGIN] Validate wrong password is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, 'not-the-password');

    await loginPage.expectErrorMessage(LOGIN_ERRORS.invalidCredentials);
    await loginPage.expectUrlToContain('saucedemo.com');
  });

  test('0004 [LOGIN] Validate missing username is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', USERS.standard.password);

    await loginPage.expectErrorMessage(LOGIN_ERRORS.usernameRequired);
  });
});
