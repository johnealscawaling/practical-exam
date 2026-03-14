import { Page } from '@playwright/test';
import { LoginPageSelectors } from './login.page.selector';

/**
 * Page Object Model for the Login page.
 *
 * Extends {@link LoginPageSelectors} with interaction methods for the `/login`
 * route, including entering credentials and submitting the login form.
 *
 * @example
 * ```ts
 * const loginPage = new LoginPage(page);
 * await loginPage.goto();
 * await loginPage.login('user@example.com', 'password123');
 * ```
 */
export class LoginPage extends LoginPageSelectors {
  /**
   * Creates an instance of LoginPage and initialises all locators.
   * @param page - The Playwright {@link Page} instance to operate on.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates the browser to the login page (`/login`).
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Fills in the email and password fields and clicks the login button.
   * @param email - The user's email address.
   * @param password - The user's password.
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
