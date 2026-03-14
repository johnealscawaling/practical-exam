import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model representing the Dashboard page.
 * Provides locators and actions for interacting with the main dashboard,
 * including navigation links, wallet balance, and portfolio sections.
 */
export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly walletBalance: Locator;
  readonly portfolioSection: Locator;
  readonly navWallet: Locator;
  readonly navInvestments: Locator;
  readonly navAutoInvestments: Locator;
  readonly navStatement: Locator;

  /**
   * Creates an instance of the DashboardPage.
   * Initializes all locators for dashboard elements and navigation links.
   * @param {Page} page - The Playwright Page instance to operate on.
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

  /**
   * Navigates the browser directly to the dashboard page via URL.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.page.goto('/dashboard');
  }

  /**
   * Navigates to the Wallet page by clicking the "Wallet" navigation link.
   * @returns {Promise<void>}
   */
  async navigateToWallet() {
    await this.navWallet.click();
  }

  /**
   * Navigates to the Investments page by clicking the "Investments" navigation link.
   * @returns {Promise<void>}
   */
  async navigateToInvestments() {
    await this.navInvestments.click();
  }

  /**
   * Navigates to the Auto-investments page by clicking the "Auto-investments" navigation link.
   * @returns {Promise<void>}
   */
  async navigateToAutoInvestments() {
    await this.navAutoInvestments.click();
  }
}
