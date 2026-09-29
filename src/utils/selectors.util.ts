export const PRODUCT_NAME_SELECTOR = '[data-test="inventory-item-name"]';
export const PRODUCT_PRICE_SELECTOR = '[data-test="inventory-item-price"]';

/**
 * Exact-text match for a product name. `filter({ hasText })` is a substring match,
 * which would let one product name match another; `:text-is()` does not.
 */
export function productNameIs(name: string): string {
  return `${PRODUCT_NAME_SELECTOR}:text-is(${JSON.stringify(name)})`;
}
