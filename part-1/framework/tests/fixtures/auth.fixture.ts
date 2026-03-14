import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { WalletPage } from '../pages/wallet.page';
import { DashboardPage } from '../pages/dashboard.page';
import { getCsvRow } from '../utils/csv-reader';

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
    const data = getCsvRow<{ testCase: string; email: string; password: string }>('login-data.csv', 'valid');
    await loginPage.login(data.email, data.password);
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect } from '@playwright/test';
