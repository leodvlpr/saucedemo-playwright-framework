export interface CustomerInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly postalCode: string;
}

export const VALID_CUSTOMER: CustomerInfo = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: '12345',
};

/** Partial payloads used to assert the step-one required-field errors. */
export const INCOMPLETE_CUSTOMERS = {
  missingFirstName: { firstName: '', lastName: 'Lovelace', postalCode: '12345' },
  missingLastName: { firstName: 'Ada', lastName: '', postalCode: '12345' },
  missingPostalCode: { firstName: 'Ada', lastName: 'Lovelace', postalCode: '' },
} as const satisfies Record<string, CustomerInfo>;

export const CHECKOUT_ERRORS = {
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
} as const;

/** Static values the overview step always shows. */
export const CHECKOUT_OVERVIEW = {
  paymentInfo: 'SauceCard #31337',
  shippingInfo: 'Free Pony Express Delivery!',
} as const;

export const COMPLETE_MESSAGES = {
  header: 'Thank you for your order!',
  text: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
} as const;
