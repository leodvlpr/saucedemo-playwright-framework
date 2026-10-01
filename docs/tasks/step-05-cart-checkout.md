# Step 5 — Cart, Checkout, Fixtures & Data Layer

## Context

Playwright + TypeScript framework against saucedemo.com, layered architecture
(pages/components/fixtures). Already implemented and passing:

- src/pages/base.page.ts (abstract BasePage)
- src/components/header.component.ts
- src/pages/login.page.ts
- src/pages/inventory.page.ts (already uses HeaderComponent)
- tests/auth/login.spec.ts (passing)

## Patterns to follow exactly

- Pages extend BasePage, use `this.locator()` for their own elements.
- Components that appear ONCE on screen (like Header) receive `Page` in the
  constructor. Components that repeat (like each product in the inventory list)
  receive a root `Locator` and resolve everything relative to that container.
- Selectors based on `data-test` attributes (saucedemo exposes them on almost
  everything).
- Action methods (click, fill) and `expectX()` assertion methods — don't mix both
  in the same method.

## Before writing any selector

Use Playwright MCP to navigate to https://www.saucedemo.com/, log in with
standard_user/secret_sauce, and inspect the real DOM of the inventory page, product
detail page, cart page, and the checkout flow (3 steps: info, overview, complete).
Do not assume or invent data-test attributes — confirm them by navigating.

## Build

1. `src/components/product-card.component.ts`
   - Constructor receives a root Locator (a single card inside `.inventory_item`)
   - Exposes: name, price, add-to-cart/remove button (same button changes state),
     a method to click the name (navigates to detail)
   - `isInCart(): boolean` based on the button's
