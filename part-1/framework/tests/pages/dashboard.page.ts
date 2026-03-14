import { Page } from '@playwright/test';
import { DashboardPageSelectors } from './dashboard.page.selector';

/**
 * Page Object Model for the Dashboard page.
 *
 * Extends {@link DashboardPageSelectors} with interaction methods for the
 * `/dashboard` route, including navigation helpers for moving to other sections
 * of the Kilde application.
 *
 * @example
 * ```ts
 * const dashboard = new DashboardPage(page);
 * await dashboard.goto();
 * await expect(dashboard.welcomeMessage).toBeVisible();
 * await dashboard.navigateToWallet();
 * ```
 */
export class DashboardPage extends DashboardPageSelectors {
  /**
   * Creates an instance of DashboardPage and initialises all locators.
   * @param page - The Playwright {@link Page} instance to operate on.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates the browser to the dashboard page (`/dashboard`).
   */
  async goto() {
    await this.page.goto('/dashboard');
  }

  /**
   * Clicks the Wallet navigation link to navigate to the Wallet page.
   */
  async navigateToWallet() {
    await this.navWallet.click();
  }

  /**
   * Clicks the Investments navigation link to navigate to the Investments page.
   */
  async navigateToInvestments() {
    await this.navInvestments.click();
  }

  /**
   * Clicks the Auto-investments navigation link to navigate to the Auto-investments page.
   */
  async navigateToAutoInvestments() {
    await this.navAutoInvestments.click();
  }
}
