import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly walletBalance: Locator;
  readonly portfolioSection: Locator;
  readonly navWallet: Locator;
  readonly navInvestments: Locator;
  readonly navAutoInvestments: Locator;
  readonly navStatement: Locator;

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

  async goto() {
    await this.page.goto('/dashboard');
  }

  async navigateToWallet() {
    await this.navWallet.click();
  }

  async navigateToInvestments() {
    await this.navInvestments.click();
  }

  async navigateToAutoInvestments() {
    await this.navAutoInvestments.click();
  }
}
