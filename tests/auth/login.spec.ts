import { test } from '../../src/fixtures/pages.fixture';
import { LOGIN_ERRORS, USERS } from '../../src/data/users.data';

test.describe('Login', () => {
  test('standard_user logs in successfully', async ({ loginPage, productsPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    await productsPage.expectUrlToContain('inventory.html');
    await productsPage.expectLoaded();
  });

  test('locked_out_user sees an error message', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);

    await loginPage.expectErrorMessage(LOGIN_ERRORS.lockedOut);
  });

  test('a wrong password is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, 'not-the-password');

    await loginPage.expectErrorMessage(LOGIN_ERRORS.invalidCredentials);
    await loginPage.expectUrlToContain('saucedemo.com');
  });

  test('the username is required', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', USERS.standard.password);

    await loginPage.expectErrorMessage(LOGIN_ERRORS.usernameRequired);
  });
});
