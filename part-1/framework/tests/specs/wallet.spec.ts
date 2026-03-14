import { test, expect } from '@playwright/test';
import { WalletPage } from '../pages/wallet.page';

test.describe('Wallet — Add Bank Details', () => {

  test('happy path: add bank details successfully', async ({ page }) => {
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.fillBankDetails({
      accountNumber: '1234567890',
      accountHolder: 'John Doe',
      swiftCode: 'DBSSSGSG',
      currency: 'USD',
    });
    await wallet.submit();

    // Modal closes and bank details show up in the list
    await expect(wallet.bankModal).toBeHidden();
    await expect(wallet.bankDetailsList).toContainText('DBSSSGSG');
    await expect(wallet.bankDetailsList).toContainText('1234567890');
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
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.swiftCodeInput.fill('DBSSSGSG');

    // Bank name should fill in automatically
    await expect(wallet.bankNameInput).not.toBeEmpty();
    await expect(wallet.bankNameInput).toHaveValue(/DBS/i);
  });

  test('validation: invalid SWIFT code shows error', async ({ page }) => {
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.swiftCodeInput.fill('INVALID');

    // Should show an error for invalid SWIFT code
    await expect(wallet.errorMessages.first()).toBeVisible();
    // Bank name should NOT autofill
    await expect(wallet.bankNameInput).toBeEmpty();
  });

  test('modal can be closed without saving', async ({ page }) => {
    const wallet = new WalletPage(page);
    await wallet.goto();

    await wallet.openBankDetailsModal();
    await wallet.fillBankDetails({
      accountNumber: '9999999999',
      accountHolder: 'Jane Doe',
      swiftCode: 'DBSSSGSG',
      currency: 'USD',
    });

    // Close modal without submitting (press Escape or click outside)
    await page.keyboard.press('Escape');

    // Modal should close and no bank details should be saved
    await expect(wallet.bankModal).toBeHidden();
    await expect(wallet.bankDetailsList).not.toContainText('9999999999');
  });
});
