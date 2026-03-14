import { Page, Locator } from '@playwright/test';

/**
 * Selector definitions for the Login page.
 *
 * Centralises all locator strategies for the `/login` route so that
 * selectors can be maintained independently of page interaction logic.
 */
export class LoginPageSelectors {
  /** Playwright page instance used for browser interactions. */
  readonly page: Page;
  /** Locator for the email input field (labelled "Email"). */
  readonly emailInput: Locator;
  /** Locator for the password input field (labelled "Password"). */
  readonly passwordInput: Locator;
  /** Locator for the "Log In" submit button. */
  readonly loginButton: Locator;
  /** Locator for the error message element displayed on failed login attempts. */
  readonly errorMessage: Locator;

  /**
   * Creates an instance of LoginPageSelectors and initialises all locators.
   * @param page - The Playwright {@link Page} instance to derive locators from.
   */
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.errorMessage = page.locator('.error-message');
  }
}
