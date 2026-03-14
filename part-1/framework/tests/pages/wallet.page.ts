import { Page } from '@playwright/test';
import { WalletPageSelectors } from './wallet.page.selector';

/**
 * Page Object Model for the Wallet page.
 *
 * Extends {@link WalletPageSelectors} with interaction methods for the `/wallet`
 * route, including opening the bank-details modal, filling in bank information,
 * and submitting the form.
 *
 * @example
 * ```ts
 * const walletPage = new WalletPage(page);
 * await walletPage.goto();
 * await walletPage.openBankDetailsModal();
 * await walletPage.fillBankDetails({
 *   accountNumber: '1234567890',
 *   accountHolder: 'John Doe',
 *   swiftCode: 'ABCDEF12',
 *   currency: 'USD',
 * });
 * await walletPage.submit();
 * ```
 */
export class WalletPage extends WalletPageSelectors {
  /**
   * Creates an instance of WalletPage and initialises all locators.
   * @param page - The Playwright {@link Page} instance to operate on.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates the browser to the wallet page (`/wallet`).
   */
  async goto() {
    await this.page.goto('/wallet');
  }

  /**
   * Opens the bank-details modal by clicking the "Add Bank Details" button
   * and waits for the modal to become visible.
   */
  async openBankDetailsModal() {
    await this.addBankDetailsButton.click();
    await this.bankModal.waitFor({ state: 'visible' });
  }

  /**
   * Fills in the bank-details form inside the modal.
   *
   * The SWIFT code is entered first because it triggers an autofill that
   * populates the bank name field. The method then waits for the bank name
   * input to appear before filling the remaining fields.
   *
   * @param details - The bank details to enter.
   * @param details.accountNumber - The bank account number.
   * @param details.accountHolder - The name of the account holder.
   * @param details.swiftCode - The SWIFT / BIC code (triggers bank name autofill).
   * @param details.currency - The currency code to select (e.g., `"USD"`, `"SGD"`).
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
   * Clicks the submit button to save the bank details form.
   */
  async submit() {
    await this.submitButton.click();
  }
}
