/** Sales tax rate saucedemo applies on the checkout overview step. */
export const TAX_RATE = 0.08;

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sum(prices: number[]): number {
  return round(prices.reduce((total, price) => total + price, 0));
}

export function calculateTax(subtotal: number): number {
  return round(subtotal * TAX_RATE);
}

export function calculateTotal(subtotal: number): number {
  return round(subtotal + calculateTax(subtotal));
}

/** "$29.99" -> 29.99 */
export function parsePrice(text: string): number {
  return Number(text.replace(/[^0-9.]/g, ''));
}

/** "Item total: $29.99" -> 29.99 */
export function parseLabelledPrice(text: string): number {
  return parsePrice(text.split('$')[1] ?? '');
}
