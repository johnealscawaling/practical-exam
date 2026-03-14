import { Page, Locator } from '@playwright/test';

/**
 * Selector definitions for the Dashboard page.
 *
 * Centralises all locator strategies for the `/dashboard` route so that
 * selectors can be maintained independently of page interaction logic.
 */
export class DashboardPageSelectors {
  /** Playwright page instance used for browser interactions. */
  readonly page: Page;
  /** Locator for the "Welcome to Kilde" greeting displayed after login. */
  readonly welcomeMessage: Locator;
  /** Locator for the wallet balance widget (test-id: `wallet-balance`). */
  readonly walletBalance: Locator;
  /** Locator for the portfolio overview section (test-id: `portfolio-section`). */
  readonly portfolioSection: Locator;
  /** Navigation link to the Wallet page. */
  readonly navWallet: Locator;
  /** Navigation link to the Investments page. */
  readonly navInvestments: Locator;
  /** Navigation link to the Auto-investments page. */
  readonly navAutoInvestments: Locator;
  /** Navigation link to the Statement page. */
  readonly navStatement: Locator;

  /**
   * Creates an instance of DashboardPageSelectors and initialises all locators.
   * @param page - The Playwright {@link Page} instance to derive locators from.
   */
  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('text=Welcome to Kilde');
    this.walletBalance = page.getByTestId('wallet-balance');
    this.portfolioSection = page.getByTestId('portfolio-section');
    this.navWallet = page.getByRole('link', { name: 'Wallet' });
    this.navInvestments = page.getByRole('link', { name: 'Investments' });
    this.navAutoInvestments = page.getByRole('link', { name: 'Auto-investments' });
    this.navStatement = page.getByRole('link', { name: 'Statement' });
  }
}
