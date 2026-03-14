import { test, expect } from '@playwright/test';
import { WalletPage } from '../pages/wallet.page';
import { getCsvRow } from '../utils/csv-reader';

type WalletData = {
  testCase: string;
  accountNumber: string;
  accountHolder: string;
  swiftCode: string;
  currency: string;
  expectedResult: string;
};

test.describe('Wallet — Add Bank Details', () => {

  test('happy path: add bank details successfully', async ({ page }) => {
    const data = getCsvRow<WalletData>('wallet-data.csv', 'happyPath');
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.fillBankDetails({
      accountNumber: data.accountNumber,
      accountHolder: data.accountHolder,
      swiftCode: data.swiftCode,
      currency: data.currency,
    });
    await wallet.submit();

    // Modal closes and bank details show up in the list
    await expect(wallet.bankModal).toBeHidden();
    await expect(wallet.bankDetailsList).toContainText(data.swiftCode);
    await expect(wallet.bankDetailsList).toContainText(data.accountNumber);
  });

  test('validation: submit with empty fields shows errors', async ({ page }) => {
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.submit();

    // Error messages should show up for required fields
    await expect(wallet.errorMessages.first()).toBeVisible();
    const errorCount = await wallet.errorMessages.count();
    expect(errorCount).toBeGreaterThanOrEqual(3);
  });

  test('SWIFT autofill: bank name fills in from SWIFT code', async ({ page }) => {
    const data = getCsvRow<WalletData>('wallet-data.csv', 'swiftAutofill');
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.swiftCodeInput.fill(data.swiftCode);

    // Bank name should fill in automatically
    await expect(wallet.bankNameInput).not.toBeEmpty();
    await expect(wallet.bankNameInput).toHaveValue(/DBS/i);
  });

  test('validation: invalid SWIFT code shows error', async ({ page }) => {
    const data = getCsvRow<WalletData>('wallet-data.csv', 'invalidSwift');
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.swiftCodeInput.fill(data.swiftCode);

    // Should show an error for invalid SWIFT code
    await expect(wallet.errorMessages.first()).toBeVisible();
    // Bank name should NOT autofill
    await expect(wallet.bankNameInput).toBeEmpty();
  });

  test('modal can be closed without saving', async ({ page }) => {
    const data = getCsvRow<WalletData>('wallet-data.csv', 'closeModal');
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.fillBankDetails({
      accountNumber: data.accountNumber,
      accountHolder: data.accountHolder,
      swiftCode: data.swiftCode,
      currency: data.currency,
    });

    // Close modal without submitting (press Escape or click outside)
    await page.keyboard.press('Escape');

    // Modal should close and no bank details should be saved
    await expect(wallet.bankModal).toBeHidden();
    await expect(wallet.bankDetailsList).not.toContainText(data.accountNumber);
  });
});
