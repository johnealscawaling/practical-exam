import { Page, Locator } from '@playwright/test';

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

  async goto() {
    await this.page.goto('/wallet');
  }

  async openBankDetailsModal() {
    await this.addBankDetailsButton.click();
    await this.bankModal.waitFor({ state: 'visible' });
  }

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

  async submit() {
    await this.submitButton.click();
  }
}
