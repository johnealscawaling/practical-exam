import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model representing the Wallet page.
 * Provides locators and actions for managing bank details,
 * including adding new bank accounts, filling in bank information, and submitting forms.
 */
export class WalletPage {
  readonly page: Page;
  readonly addBankDetailsButton: Locator;
  readonly bankModal: Locator;
  readonly bankNameInput: Locator;
  readonly accountNumberInput: Locator;
  readonly accountHolderInput: Locator;
  readonly swiftCodeInput: Locator;
  readonly currencySelect: Locator;
  readonly submitButton: Locator;
  readonly bankDetailsList: Locator;
  readonly errorMessages: Locator;

  /**
   * Creates an instance of the WalletPage.
   * Initializes all locators for bank detail form elements, modal, and error display.
   * @param {Page} page - The Playwright Page instance to operate on.
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

  /**
   * Navigates the browser directly to the wallet page via URL.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.page.goto('/wallet');
  }

  /**
   * Opens the bank details modal by clicking the "Add Bank Details" button
   * and waits for the modal to become visible.
   * @returns {Promise<void>}
   */
  async openBankDetailsModal() {
    await this.addBankDetailsButton.click();
    await this.bankModal.waitFor({ state: 'visible' });
  }

  /**
   * Fills in the bank details form within the modal.
   * Enters the SWIFT code first and waits for the bank name to auto-populate,
   * then fills in the remaining account details and selects the currency.
   * @param {object} details - The bank account details to fill in.
   * @param {string} details.accountNumber - The bank account number.
   * @param {string} details.accountHolder - The name of the account holder.
   * @param {string} details.swiftCode - The SWIFT/BIC code of the bank.
   * @param {string} details.currency - The currency to select for the account.
   * @returns {Promise<void>}
   */
  async fillBankDetails(details: {
    accountNumber: string;
    accountHolder: string;
    swiftCode: string;
    currency: string;
  }) {
    await this.swiftCodeInput.fill(details.swiftCode);
    // Wait for SWIFT autofill to fill in bank name
    await this.bankNameInput.waitFor({ state: 'visible' });
    await this.accountNumberInput.fill(details.accountNumber);
    await this.accountHolderInput.fill(details.accountHolder);
    await this.currencySelect.selectOption(details.currency);
  }

  /**
   * Submits the bank details form by clicking the "Submit" button.
   * @returns {Promise<void>}
   */
  async submit() {
    await this.submitButton.click();
  }
}
