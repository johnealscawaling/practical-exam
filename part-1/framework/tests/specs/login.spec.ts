import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { getCsvRow } from '../utils/csv-reader';

type LoginData = {
  testCase: string;
  email: string;
  password: string;
  expectedResult: string;
};

test.describe('Login & Authentication', () => {

  test('happy path: login with valid credentials', async ({ page }) => {
    const data = getCsvRow<LoginData>('login-data.csv', 'valid');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(data.email, data.password);

    // Should redirect to dashboard after login
    await expect(page).toHaveURL(/dashboard/);
  });

  test('invalid credentials: shows error message', async ({ page }) => {
    const data = getCsvRow<LoginData>('login-data.csv', 'invalid');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(data.email, data.password);

    // Should show an error and stay on login page
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('empty email: shows validation error', async ({ page }) => {
    const data = getCsvRow<LoginData>('login-data.csv', 'emptyEmail');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(data.email, data.password);

    // Should show validation error for email
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('empty password: shows validation error', async ({ page }) => {
    const data = getCsvRow<LoginData>('login-data.csv', 'emptyPassword');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(data.email, data.password);

    // Should show validation error for password
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
