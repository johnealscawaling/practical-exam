import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model representing the Login page.
 * Provides locators and actions for authenticating users,
 * including email/password input fields, the login button, and error messages.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  /**
   * Creates an instance of the LoginPage.
   * Initializes all locators for login form elements and error display.
   * @param {Page} page - The Playwright Page instance to operate on.
   */
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.errorMessage = page.locator('.error-message');
  }

  /**
   * Navigates the browser directly to the login page via URL.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Performs a complete login action by filling in the email and password fields,
   * then clicking the login button.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<void>}
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
