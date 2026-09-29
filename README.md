# SauceDemo Playwright Framework

End-to-end UI test framework for [saucedemo.com](https://www.saucedemo.com), built with
[Playwright](https://playwright.dev) and TypeScript using the Page Object Model.

18 scenarios covering login, the products catalog, the cart and the full three-step
checkout, run across Chromium, Firefox and WebKit — 54 tests in total.

> This repository contains **tests only**. The application under test is the public
> SauceDemo demo site; there is no product source code here.

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | >= 20 (required by Playwright) |
| npm | bundled with Node |

Playwright 1.63 · TypeScript 7.0

## Setup

```bash
git clone https://github.com/leodvlpr/saucedemo-playwright-framework.git
cd saucedemo-playwright-framework

npm install              # dependencies
npx playwright install   # browser binaries (one-time)

cp .env.example .env     # then fill in USER_PASSWORD — see Configuration
```

The suite drives the live site, so it needs network access.

## Configuration

All configuration and credentials are read from the environment. `src/config/env.ts` is
the only module that touches `process.env`; everything else imports a typed `env` object
from it.

Copy `.env.example` to `.env` and fill it in. **`.env` is git-ignored and must never be
committed** — `.env.example` is the committed template and contains no real values.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `USER_PASSWORD` | **yes** | _none_ | Shared password for the accounts under test |
| `BASE_URL` | no | `https://www.saucedemo.com` | Target environment |
| `STANDARD_USERNAME` | no | `standard_user` | Account used by most specs |
| `LOCKED_OUT_USERNAME` | no | `locked_out_user` | Account expected to be blocked |
| `PROBLEM_USERNAME` | no | `problem_user` | Reserved for future specs |
| `PERFORMANCE_GLITCH_USERNAME` | no | `performance_glitch_user` | Reserved for future specs |
| `ERROR_USERNAME` | no | `error_user` | Reserved for future specs |
| `VISUAL_USERNAME` | no | `visual_user` | Reserved for future specs |

`USER_PASSWORD` has **no default on purpose**: a hardcoded fallback for a credential is
exactly the mistake this layer prevents. Without it the suite fails immediately with a
pointer to `.env.example`, instead of failing later as a confusing login error.

SauceDemo publishes its own demo accounts and their shared password on its login page —
read the value there. Usernames are not secrets, so they carry defaults; the password
does not.

Real environment variables take precedence over `.env` (dotenv runs with
`override: false`), so CI injects the same names from its secret store and ships no file.

## Running the tests

```bash
npm test                 # all specs, all three browsers
npm run test:chromium    # single browser — fastest feedback loop
npm run test:headed      # headed run
npm run test:ui          # Playwright UI mode
npm run report           # open the last HTML report
npm run typecheck        # tsc --noEmit
```

Narrowing a run uses Playwright's own flags:

```bash
npx playwright test tests/auth/login.spec.ts   # one file
npx playwright test -g "0002"                  # one test by id
npx playwright test -g "\[PRODUCTS\]"          # every test for one component
npx playwright test --headed --debug           # Playwright Inspector
```

## Test naming

Every test title follows:

```
XXXX [COMPONENT] Validate <main scenario assertion>
```

```ts
test('0007 [PRODUCTS] Validate add to cart button toggles to remove', async ({ productsPage }) => {
```

- `XXXX` — zero-padded four-digit id, unique across the suite and **append-only**: new
  tests take the next free number, existing ids are never renumbered or reused, so a CI
  failure always refers to the same scenario.
- `[COMPONENT]` — the area under test. `LOGIN`, `PRODUCTS`, `CART`, `CHECKOUT`.
- The title then starts with `Validate` and states the assertion — the expected outcome,
  not the steps taken.

| Ids | Component | Spec |
| --- | --- | --- |
| 0001–0004 | `LOGIN` | `tests/auth/login.spec.ts` |
| 0005–0009 | `PRODUCTS` | `tests/products/products.spec.ts` |
| 0010–0013 | `CART` | `tests/cart/cart.spec.ts` |
| 0014–0018 | `CHECKOUT` | `tests/checkout/checkout.spec.ts` |

## Project structure

```
src/
  config/env.ts          the only reader of process.env
  pages/
    base.page.ts         abstract BasePage: page handle, locator() helper, shared waits
    login/               login page
    products/            catalog list + product detail
    cart/                cart
    checkout/            information, overview and complete steps
  components/
    header.component.ts        appears once per screen -> takes a Page
    product-card.component.ts  repeats -> takes a root Locator
  fixtures/pages.fixture.ts    page objects as Playwright fixtures
  data/                        users, products, checkout payloads and expected strings
  utils/                       price maths, exact-name selector helper
tests/
  auth/  products/  cart/  checkout/
```

### Conventions

- **Pages** extend `BasePage` and build locators through its `protected locator()` helper.
- **Components** do not extend `BasePage`. One that appears once per screen takes a
  `Page`; one that repeats takes a **root `Locator`** and resolves everything relative to
  that container. The same `ProductCardComponent` therefore serves the catalog, the cart
  and the checkout overview, which all render identical markup.
- **Assertions live in the page objects.** Specs call `expect*()` methods rather than
  asserting on locators directly, and no method both acts and asserts — `addToCart()`
  clicks, `expectInCart()` asserts.
- **Specs import `test` and `expect` from `src/fixtures/pages.fixture`**, not from
  `@playwright/test`. A spec starts authenticated by requesting the `loggedIn` fixture.
- **Selectors use the site's `data-test` attributes**, verified against the live DOM.

## Reports and artifacts

An HTML report is written to `playwright-report/` on every run (`npm run report` opens
it). Traces are captured on first retry, and screenshots and video on failure, into
`test-results/`.

> **Treat these artifacts as secret-bearing.** Playwright records `fill()` values, so the
> password appears in plaintext inside `trace.zip`, and a screenshot can capture a filled
> form. `test-results/`, `playwright-report/` and `blob-report/` are git-ignored for this
> reason — restrict retention and access wherever CI uploads them.

## Continuous integration

`playwright.config.ts` reacts to the `CI` environment variable: one worker, two retries,
and `forbidOnly` so a stray `test.only` fails the build instead of silently skipping the
suite.

Provide the same variables listed under [Configuration](#configuration) through the
pipeline's secret store. Do not commit a `.env`.
