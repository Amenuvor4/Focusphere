/**
 * Authentication fixture for Playwright tests
 * Provides pre-authenticated page for tests that need login
 */
import { test as base, expect } from "@playwright/test";
import {
  TEST_USER,
  clearLocalStorage,
  waitForNetworkIdle,
} from "../utils/test-helpers.js";

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend({
  /**
   * Authenticated page - logs in before test and logs out after
   */
  authenticatedPage: async ({ page }, use) => {
    // Clear any existing auth state
    await page.goto("/");
    await clearLocalStorage(page);

    await page.goto("/Auth");
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);
    await use(page);

    // Cleanup: logout
    try {
      const profileButton = page
        .locator('button:has([class*="rounded-full"])')
        .first();
      if (await profileButton.isVisible()) {
        await profileButton.click();
        const logoutButton = page.locator('button:has-text("Logout")');
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  },

  /**
   * Page with mocked API responses for isolated testing
   */
  mockedPage: async ({ page }, use) => {
    await page.route("**/auth/profile", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-user-id",
            name: TEST_USER.name,
            email: TEST_USER.email,
          },
        }),
      });
    });

    await page.route("**/tasks", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        route.continue();
      }
    });

    await page.route("**/goals", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        route.continue();
      }
    });

    await use(page);
  },
});

export { expect };

/**
 * Login helper function for direct use in tests
 */
export async function login(
  page,
  email = TEST_USER.email,
  password = TEST_USER.password,
) {
  await page.goto("/Auth");
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

/**
 * Register helper function
 */
export async function register(page, name, email, password) {
  await page.goto("/Auth");

  // Switch to signup mode
  await page.click('button:has-text("Sign up")');
  await page.waitForSelector('input[placeholder="John Doe"]');
  await page.fill('input[placeholder="John Doe"]', name);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

/**
 * Logout helper function
 */
export async function logout(page) {
  // Open profile menu
  const profileButton = page
    .locator('button:has([class*="rounded-full"])')
    .first();
  await profileButton.click();
  await page.click('button:has-text("Logout")');

  // Wait for redirect to auth
  await page.waitForURL("**/Auth", { timeout: 10000 });
}
