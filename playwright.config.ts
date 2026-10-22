import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './qa',
  testMatch: '**/*.pw.ts',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
