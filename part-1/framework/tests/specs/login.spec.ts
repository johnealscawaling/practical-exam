import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { environmentConfig } from '../configs/environmentConfig';

const { validUser, invalidUser } = environmentConfig;

test.describe('Login & Authentication', () => {

  test('happy path: login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);

    // Should redirect to dashboard after login
    await expect(page).toHaveURL(/dashboard/);
  });

  test('invalid credentials: shows error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(invalidUser.email, invalidUser.password);

    // Should show an error and stay on login page
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('empty email: shows validation error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', validUser.password);

    // Should show validation error for email
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('empty password: shows validation error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUser.email, '');

    // Should show validation error for password
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
