import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/specs',
  timeout: 60 * 1000,
  retries: 0,
  workers: 1,

  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],

  use: {
    baseURL: 'https://app.kilde.sg',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    headless: false,
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--no-sandbox',
          ],
        },
        viewport: { width: 1920, height: 1080 },
      },
    },
    // {
    //   name: 'Desktop Firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 14'] },
    // },
  ],
});
