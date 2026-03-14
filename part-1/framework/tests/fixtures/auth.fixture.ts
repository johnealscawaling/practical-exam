import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { WalletPage } from '../pages/wallet.page';
import { DashboardPage } from '../pages/dashboard.page';

// Test credentials — use environment variables in real projects
const TEST_EMAIL = process.env.TEST_EMAIL || 'qa-test@kilde.sg';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

// Custom fixtures that any test can use
type Fixtures = {
  loginPage: LoginPage;
  walletPage: WalletPage;
  dashboardPage: DashboardPage;
  loggedInPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  // Provides a LoginPage ready to use
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  // Provides a WalletPage ready to use
  walletPage: async ({ page }, use) => {
    const walletPage = new WalletPage(page);
    await walletPage.goto();
    await use(walletPage);
  },

  // Provides a DashboardPage ready to use
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await use(dashboardPage);
  },

  // Provides a page that is already logged in
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect } from '@playwright/test';
