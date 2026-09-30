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
  timeout: 60 * 1000, // 60 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  
  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:5173',
    
    // Capture trace on first retry for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on first retry
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 30 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
    
    // Viewport size (desktop default)
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors in local development
    ignoreHTTPSErrors: true,
  },
  
  // Browser projects for testing
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional chromium-specific settings
        launchOptions: {
          args: ['--disable-web-security'], // For local CORS testing
        },
      },
    },
    
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    // Mobile viewports for responsive testing
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  
  // Development server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000, // 2 minutes to start server
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
