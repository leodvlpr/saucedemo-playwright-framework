# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Playwright + TypeScript UI test framework targeting the public demo site https://www.saucedemo.com (set as `baseURL`, so page objects navigate with relative paths like `/inventory.html`). There is no application source here — only tests and the page-object layer that drives that external site.

`README.md` is the human-facing guide and restates some of what follows — the commands,
the environment variables and the test-id ranges. Update both when any of those change.

## Commands

```bash
npx playwright install   # one-time: download browsers
npm test                 # all specs, all 3 browser projects
npm run test:chromium    # single browser (fastest feedback loop)
npm run test:headed      # headed run
npm run test:ui          # Playwright UI mode
npm run report           # open the last HTML report
npm run typecheck        # tsc --noEmit (no build step; Playwright transpiles specs itself)
```

Narrowing a run needs Playwright's own flags:

```bash
npx playwright test tests/auth/login.spec.ts   # one file
npx playwright test -g "0002"                  # one test by id
npx playwright test -g "\[PRODUCTS\]"          # every test for one component
npx playwright test --headed --debug           # Playwright Inspector
```

There is no linter configured.

## Environment

Configuration and credentials come from the environment, never from literals in the
repo. `src/config/env.ts` is the only module that reads `process.env`; everything
else imports the typed `env` object from it.

```bash
cp .env.example .env    # then fill in USER_PASSWORD
```

- `.env` is git-ignored and must never be committed. `.env.example` is the committed
  template and holds no real secret.
- Real environment variables take precedence over `.env` (dotenv `override: false`),
  so CI injects the same names from its secret store and ships no file.
- `USER_PASSWORD` is `required()` — absent, the suite fails immediately with a
  pointer to `.env.example`. Secrets deliberately have **no** default. Usernames and
  `BASE_URL` are not secrets, so they use `optional()` with defaults.
- Point the suite at another environment with `BASE_URL`, which feeds
  `playwright.config.ts`.

**Artifacts carry credentials.** Playwright records `fill()` values, so the password
appears in plaintext inside `trace.zip` (and in videos/screenshots of a filled form).
`test-results/`, `playwright-report/` and `blob-report/` are git-ignored for that
reason — treat them as secret-bearing, and restrict retention/access when CI uploads
them. Against a real app, the durable fix is to authenticate once in a setup project
and reuse `storageState`, so the password is typed in one place instead of every test.

## Architecture

Page Object Model split across two top-level trees.

- `src/` — the reusable driver layer, never contains tests.
  - `src/pages/base.page.ts` — abstract `BasePage`. Holds the `Page`, exposes the `protected locator()` helper that every subclass uses to build its locators, plus shared waits/assertions (`waitForLoad`, `expectUrlToContain`). All page objects extend it.
  - `src/pages/<feature>/<name>.page.ts` — one class per page: `login/login.page.ts`, `products/products.page.ts` (inventory list) and `products/product-details.page.ts`, `cart/cart.page.ts`, and `checkout/checkout-{information,overview,complete}.page.ts` for the three checkout steps. Convention: declare `readonly` `Locator` fields in the constructor via `this.locator(...)`, expose a `goto()`, then action methods and `expect*()` assertion methods.
  - `src/components/` — `header.component.ts` appears once per screen so it takes a `Page`; `product-card.component.ts` repeats, so it takes a **root `Locator`** and resolves everything relative to that container. Follow that split for new components. Components do not extend `BasePage`; pages compose them as public fields (`ProductsPage.header`).
  - `src/fixtures/pages.fixture.ts` — `test`/`expect` re-exported with every page object as a fixture, plus `loginAs(user)` and a `loggedIn` auto-login-as-standard_user fixture.
  - `src/config/env.ts` — the only reader of `process.env`; see Environment above.
  - `src/data/` — `users.data.ts` (env-backed credentials + login error strings), `products.data.ts` (names, prices, sort values), `checkout.data.ts` (customer payloads, expected error/confirmation strings).
  - `src/utils/` — `price.util.ts` (tax/total math, price parsing) and `selectors.util.ts`.
- `tests/<feature>/*.spec.ts` — specs only, under `auth`, `products`, `cart`, `checkout`.

Key conventions:

- **Specs import `test`/`expect` from `src/fixtures/pages.fixture`, not from `@playwright/test`.** Get authentication with `test.beforeEach(async ({ loggedIn }) => {})`.
- Assertions live in the page/component objects; specs call `expect*()` methods rather than raw `expect` on locators.
- Never mix an action and an assertion in the same method — `addToCart()` clicks, `expectInCart()` asserts.

### Test naming

Every test title follows:

```
XXXX [COMPONENT] Validate <main scenario assertion>
```

```ts
test('0007 [PRODUCTS] Validate add to cart button toggles to remove', async ({ productsPage }) => {
```

- `XXXX` — a zero-padded four-digit id, unique across the whole suite. Ids are
  **append-only**: a new test takes the next free number, and existing ids are never
  renumbered or reused, so a failure in CI always refers to the same scenario.
- `[COMPONENT]` — the area under test, upper-case in square brackets. Current values:
  `LOGIN`, `PRODUCTS`, `CART`, `CHECKOUT`. The tag matches the `tests/<feature>/` directory
  and the page object it drives (`PRODUCTS` -> `tests/products/`, `ProductsPage`), not the
  site's own URL for that page (`/inventory.html`). Add a new one only with a new `tests/<feature>/`
  directory.
- The title proper starts with **`Validate`** and then states the assertion the test
  makes — the expected outcome, not the steps taken. Prefer "Validate missing username
  is rejected" over "Validate the user types nothing and clicks login".

The prefix makes both selectors below work, which is the point of the scheme:
`-g "0014"` for one scenario, `-g "\[PRODUCTS\]"` for a component.

Ids in use: `0001`-`0004` LOGIN, `0005`-`0009` PRODUCTS, `0010`-`0013` CART,
`0014`-`0018` CHECKOUT. Next free id: **`0019`**.

### Locator strategy

Use SauceDemo's `data-test` attributes (verified against the live DOM — do not guess them; drive the site with the `playwright` MCP server to confirm). Notable shapes:

- Product cards on the inventory page, cart rows, and checkout-overview rows all use `[data-test="inventory-item"]` with the same inner `inventory-item-{name,desc,price}` attributes — that is why one `ProductCardComponent` serves all three.
- The add/remove control is a single `<button>` whose `data-test` flips between `add-to-cart-<slug>` and `remove-<slug>` (bare `add-to-cart`/`remove` on the detail page). Locate it structurally (`root.locator('button')`) and read state from the attribute prefix, not from a hardcoded slug.
- `filter({ hasText })` is a substring match and can match the wrong product; use `productNameIs()` from `selectors.util.ts`, which builds an exact `:text-is()` match.
- Conditionally-rendered elements (the cart badge) need a `count() === 0` guard before reading text — see `HeaderComponent.getCartCount`.

### Config notes

- `playwright.config.ts` runs chromium/firefox/webkit, `fullyParallel`, with traces/screenshots/video captured only on failure or first retry. CI (`process.env.CI`) switches to 1 worker, 2 retries, and `forbidOnly`.
- The suite runs against the live site (`BASE_URL`), so it needs network access.
- SauceDemo is a client-side-routed React app: the URL changes before the old view
  unmounts. Page objects for a route reached by an in-app click must scope their
  locators to a container unique to that view — see the `.inventory_details_container`
  root in `product-details.page.ts` — or a shared `data-test` will briefly match the
  previous page's elements and trip strict mode.
- `tsconfig.json` declares `@pages/*`, `@components/*`, `@fixtures/*`, `@data/*`, `@utils/*` aliases but **no `baseUrl`**, and existing code uses relative imports. Add `"baseUrl": "."` before switching imports over to the aliases, or the resolution will break.
