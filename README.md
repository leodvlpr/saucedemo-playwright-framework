# SauceDemo E2E Test Framework

A layered Playwright + TypeScript end-to-end test framework for
[saucedemo.com](https://www.saucedemo.com), with a CI pipeline that asks Claude Code to
diagnose its own failures and post the root cause on the pull request.

Built from scratch as a portfolio piece. The application under test is Sauce Labs' public
demo store — there is no client or employer code here, and nothing in this repository is
derived from private work. The repository contains **tests only**: the page-object layer,
the fixtures, and the pipeline that runs them.

[![E2E Tests](https://img.shields.io/github/actions/workflow/status/leodvlpr/saucedemo-playwright-framework/ci.yml?branch=main&label=E2E%20Tests&logo=githubactions&logoColor=white)](https://github.com/leodvlpr/saucedemo-playwright-framework/actions/workflows/ci.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**18 scenarios** across 4 spec files, run against **Chromium, Firefox and WebKit** —
**54 tests**, passing in ~20s locally and ~60s on a CI runner.

---

## Architecture

Three layers, each with one job. The point of the split is that a locator is written once
and a test never touches one directly.

### 1. Pages — one class per screen

Every page object extends `BasePage`, which holds the Playwright `Page` and exposes a
`protected locator()` helper plus shared waits and URL assertions. A page declares its
locators as `readonly` fields in the constructor, then exposes **action** methods and
**`expect*()` assertion** methods. No method does both: `addToCart()` clicks,
`expectInCart()` asserts.

Assertions living in the page object — rather than in the spec — means a changed
expectation is fixed in one place, and specs read as scenarios instead of locator soup.

### 2. Components — reusable fragments, scoped two ways

The distinction that makes the layer worth having:

- A fragment that appears **once per screen** takes a `Page`. `HeaderComponent` does.
- A fragment that **repeats** takes a **root `Locator`** and resolves everything relative
  to that container. `ProductCardComponent` does.

That second form is why one component covers three screens. The products grid, the cart
rows and the checkout-overview rows all render the same `[data-test="inventory-item"]`
markup, so the same class drives all of them instead of three near-identical page objects.

```ts
export class ProductsPage extends BasePage {
  readonly header: HeaderComponent;
  readonly productItems: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);          // once per screen -> Page
    this.productItems = this.locator('[data-test="inventory-item"]');
  }

  cardByName(name: string): ProductCardComponent {    // repeats -> root Locator
    return new ProductCardComponent(
      this.productItems.filter({ has: this.page.locator(productNameIs(name)) }),
    );
  }
}
```

### 3. Fixtures — composable setup

`src/fixtures/pages.fixture.ts` re-exports `test` and `expect` with every page object
already constructed, which removes the `new SomePage(page)` preamble from every spec. It
also provides `loginAs(user)` and a `loggedIn` fixture, so a spec that needs an
authenticated session asks for one instead of repeating the login steps:

```ts
test.beforeEach(async ({ loggedIn }) => {});

test('0011 [CART] Validate badge counts every product added', async ({ productsPage, cartPage }) => {
```

Supporting these three layers: `src/data/` holds users, products and checkout payloads so
a value is stated once; `src/utils/` holds price maths and an exact-match selector helper;
`src/config/env.ts` is the only module that reads `process.env`.

---

## Tech stack

| Tool | Role |
| --- | --- |
| [Playwright](https://playwright.dev) 1.63 | Test runner and browser automation across Chromium, Firefox and WebKit; supplies the auto-retrying assertions, fixtures, tracing and HTML report |
| [TypeScript](https://www.typescriptlang.org) 7.0 | `strict` mode across the page-object layer, so a renamed method or a wrong fixture is a compile error rather than a runtime failure |
| [GitHub Actions](https://github.com/features/actions) | Runs the full three-browser suite on every push to `main` and every pull request, and uploads the HTML report as an artifact |
| [claude-code-action](https://github.com/anthropics/claude-code-action) | Reads the report and job logs of a failed run and posts a root-cause analysis on the pull request |
| [dotenv](https://github.com/motdotla/dotenv) | Loads local configuration from `.env`; real environment variables win, so CI injects the same names from its secret store |

---

## AI-assisted CI

Most pipelines tell you *that* the suite went red. This one opens the report and tells you
*why*, before you click into the run.

**How it works.** `.github/workflows/ci.yml` defines two jobs. `test` installs browsers,
runs all three projects, and always uploads `playwright-report/` (14-day retention).
`analyze-failure` is gated on `if: failure() && github.event_name == 'pull_request'` — so
it costs nothing on a green run, and never fires on a plain push to `main`. When it does
run, it downloads the report artifact and hands
[`anthropics/claude-code-action@v1`](https://github.com/anthropics/claude-code-action) a
prompt asking it to identify which tests failed, classify the root cause — application
change vs. flaky timing vs. broken selector — and post one comment on the PR.

Claude gets a deliberately narrow tool grant: read-only inspection (`Read`, `Glob`,
`Grep`, and `ls`/`cat`/`head`/`find`), the CI MCP tools for pulling the failed job's logs,
and `gh pr comment` as the only command that can write anything. The job runs unattended
on a public repository, so an unrestricted shell would be the wrong trade.

**It has been verified end to end**, not just wired up. One assertion was deliberately
broken on [PR #1](https://github.com/leodvlpr/saucedemo-playwright-framework/pull/1) to
exercise the path. Claude
[posted this analysis](https://github.com/leodvlpr/saucedemo-playwright-framework/pull/1#issuecomment-5910370402):
it named the failing test, quoted the assertion diff, and ruled out the alternatives with
evidence — the selector had resolved 14 times so it wasn't broken, the text was stable for
the full timeout and failed on both retries so it wasn't flaky, and the app still returned
its usual message. It concluded the expected value was wrong and proposed the exact fix.
The break was then reverted.

### CI secrets

| Secret | Required | Purpose |
| --- | --- | --- |
| `USER_PASSWORD` | yes | Shared password for the demo accounts; the suite refuses to run without it |
| `ANTHROPIC_API_KEY` | for the analysis job | Credential for the model that writes the analysis |
| `ANTHROPIC_BASE_URL` | optional | Routes model calls through an Anthropic-compatible gateway instead of the public API |

---

## What's covered

18 scenarios, titled `XXXX [COMPONENT] Validate <assertion>` so a CI failure names a
stable id. Run one with `-g "0014"`, or a whole area with `-g "\[CHECKOUT\]"`.

**Authentication** — `tests/auth/login.spec.ts`
- `0001` standard user reaches the products page after signing in
- `0002` locked-out user is blocked with an error
- `0003` wrong password is rejected
- `0004` missing username is rejected

**Products catalog** — `tests/products/products.spec.ts`
- `0005` catalog lists every product
- `0006` product card shows its name and price
- `0007` add-to-cart button toggles to remove
- `0008` product name opens the detail page
- `0009` sorting by price ascending orders the list

**Cart** — `tests/cart/cart.spec.ts`
- `0010` product added from the products list appears in the cart
- `0011` badge counts every product added
- `0012` removing the last product empties the cart
- `0013` continue shopping returns to the products page

**Checkout** — `tests/checkout/checkout.spec.ts`
- `0014` order completes end to end
- `0015` overview shows payment, shipping and totals (subtotal, 8% tax and total are
  recomputed from the line items rather than hardcoded)
- `0016` missing first name is rejected
- `0017` missing postal code is rejected
- `0018` cancelling the overview returns to the products page

Every `data-test` attribute used was read off the live DOM rather than assumed.

---

## Getting started

```bash
git clone https://github.com/leodvlpr/saucedemo-playwright-framework.git
cd saucedemo-playwright-framework

npm install              # dependencies
npx playwright install   # browser binaries (one-time)

cp .env.example .env     # then fill in USER_PASSWORD
```

`USER_PASSWORD` is the only required variable and has **no default**: a hardcoded fallback
for a credential is the mistake this layer exists to prevent, so the suite fails
immediately with a pointer to `.env.example` rather than as a confusing login error. Sauce
Labs publishes the demo accounts and their shared password on its own login page.
`BASE_URL` and the usernames are not secrets and carry defaults. `.env` is git-ignored.

### Commands

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
npx playwright test -g "0002"                  # one scenario by id
npx playwright test -g "\[PRODUCTS\]"          # one component
npx playwright test --headed --debug           # Playwright Inspector
```

The suite runs against the live site, so it needs network access.

> **Artifacts carry credentials.** Playwright records `fill()` values, so the password
> appears in plaintext inside `trace.zip`. `test-results/`, `playwright-report/` and
> `blob-report/` are git-ignored for that reason — treat them as secret-bearing wherever
> CI uploads them.

---

## Project structure

```
src/
├── components/
│   ├── header.component.ts          takes a Page — appears once per screen
│   └── product-card.component.ts    takes a root Locator — repeats
├── config/
│   └── env.ts                       the only reader of process.env
├── data/
│   ├── checkout.data.ts
│   ├── products.data.ts
│   └── users.data.ts
├── fixtures/
│   └── pages.fixture.ts             page objects as Playwright fixtures
├── pages/
│   ├── base.page.ts                 abstract BasePage
│   ├── cart/
│   │   └── cart.page.ts
│   ├── checkout/
│   │   ├── checkout-complete.page.ts
│   │   ├── checkout-information.page.ts
│   │   └── checkout-overview.page.ts
│   ├── login/
│   │   └── login.page.ts
│   └── products/
│       ├── product-details.page.ts
│       └── products.page.ts
└── utils/
    ├── price.util.ts                tax/total maths, price parsing
    └── selectors.util.ts            exact-match product-name selector

tests/
├── auth/login.spec.ts
├── cart/cart.spec.ts
├── checkout/checkout.spec.ts
└── products/products.spec.ts
```

8 page objects, 2 components, 4 spec files.

---

## Why this project exists

I wanted a place to build test architecture the way I would on a real product, without
any of it depending on code I can't share. A public demo store is a small target, so the
interest is in the structure around it: layers that keep locators in one place, fixtures
that make setup composable, credentials that come from the environment, and a pipeline
that does something useful when it goes red.

The AI failure-analysis step is the part I'd most want to talk through. Getting it working
meant finding out that a plain-text prompt in automation mode starts with no tools at all,
and then deciding how much shell access an unattended job on a public repository should
actually get.

---

## License

[MIT](LICENSE) © Leonel Mujica
