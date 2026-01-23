// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * Playwright configuration for Focusphere E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "e2e-report" }],
    ["list"],
  ],
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: "http://localhost:3000",
    // Collect trace when retrying the failed test
    trace: "on-first-retry",
    // Screenshot on failure
    screenshot: "only-on-failure",
    // Video on failure
    video: "on-first-retry",
    // Timeout for each action
    actionTimeout: 10000,
    // Navigation timeout
    navigationTimeout: 30000,
  },
  // Global timeout for each test
  timeout: 60000,
  // Expect timeout
  expect: {
    timeout: 10000,
  },
  // Configure projects for different browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
    // Mobile testing
    // {
    //   name: "Mobile Chrome",
    //   use: { ...devices["Pixel 5"] },
    // },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: "npm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
