import { Page, Locator } from '@playwright/test';

/**
 * Selector definitions for the Wallet page.
 *
 * Centralises all locator strategies for the `/wallet` route so that
 * selectors can be maintained independently of page interaction logic.
 */
export class WalletPageSelectors {
  /** Playwright page instance used for browser interactions. */
  readonly page: Page;
  /** Locator for the "Add Bank Details" button that opens the bank-details modal. */
  readonly addBankDetailsButton: Locator;
  /** Locator for the bank-details modal dialog (test-id: `bank-details-modal`). */
  readonly bankModal: Locator;
  /** Locator for the bank name input field (auto-filled after entering a SWIFT code). */
  readonly bankNameInput: Locator;
  /** Locator for the account number input field. */
  readonly accountNumberInput: Locator;
  /** Locator for the account holder name input field. */
  readonly accountHolderInput: Locator;
  /** Locator for the SWIFT / BIC code input field. */
  readonly swiftCodeInput: Locator;
  /** Locator for the currency dropdown select element. */
  readonly currencySelect: Locator;
  /** Locator for the form submit button. */
  readonly submitButton: Locator;
  /** Locator for the list of previously saved bank details (test-id: `bank-details-list`). */
  readonly bankDetailsList: Locator;
  /** Locator for validation / error message elements displayed on form errors. */
  readonly errorMessages: Locator;

  /**
   * Creates an instance of WalletPageSelectors and initialises all locators.
   * @param page - The Playwright {@link Page} instance to derive locators from.
   */
  constructor(page: Page) {
    this.page = page;
    this.addBankDetailsButton = page.getByRole('button', { name: 'Add Bank Details' });
    this.bankModal = page.getByTestId('bank-details-modal');
    this.bankNameInput = page.getByLabel('Bank Name');
    this.accountNumberInput = page.getByLabel('Account Number');
    this.accountHolderInput = page.getByLabel('Account Holder Name');
    this.swiftCodeInput = page.getByLabel('SWIFT Code');
    this.currencySelect = page.getByLabel('Currency');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.bankDetailsList = page.getByTestId('bank-details-list');
    this.errorMessages = page.locator('.error-message');
  }
}
