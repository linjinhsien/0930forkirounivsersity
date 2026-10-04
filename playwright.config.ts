import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Azure AZ-900 Card Clash E2E tests
 *
 * Key settings:
 * - Timeout: 30 seconds for actions, 60 seconds for tests
 * - Retries: 2 attempts in CI, 1 in local development
 * - Screenshots and traces captured on failures
 * - Video recording on first retry for debugging
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Run tests in parallel for faster execution
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env['CI'],

  // Retry failed tests for reliability
  retries: process.env['CI'] ? 2 : 1,

  // Limit workers in CI for stability
  workers: process.env['CI'] ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env['CI'] ? [['github'] as const] : []),
  ],

  // Timeout settings
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:3000',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
    },
  ],

  // Development server configuration
  // package.json starts Vite on port 3000.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
