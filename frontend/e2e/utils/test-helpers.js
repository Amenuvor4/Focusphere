/**
 * Test helper utilities for Focusphere E2E tests
 */

/**
 * Test user credentials
 * In a real scenario, these would come from environment variables or a secure vault
 */
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "test@focusphere.com",
  password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  name: process.env.TEST_USER_NAME || "Test User",
};

/**
 * Generate unique test data to avoid conflicts
 */
export const generateTestData = () => {
  const timestamp = Date.now();
  return {
    taskTitle: `Test Task ${timestamp}`,
    taskDescription: `Test description for task ${timestamp}`,
    goalTitle: `Test Goal ${timestamp}`,
    goalDescription: `Test description for goal ${timestamp}`,
    uniqueEmail: `test${timestamp}@focusphere.com`,
  };
};

/**
 * Wait for network to be idle (useful after form submissions)
 */
export const waitForNetworkIdle = async (page, timeout = 5000) => {
  await page.waitForLoadState("networkidle", { timeout });
};

/**
 * Clear local storage (useful for clean test state)
 */
export const clearLocalStorage = async (page) => {
  await page.evaluate(() => localStorage.clear());
};

/**
 * Set authentication tokens directly in localStorage
 * Useful for skipping login flow in tests that don't test auth
 */
export const setAuthTokens = async (page, accessToken, refreshToken) => {
  await page.evaluate(
    ({ access, refresh }) => {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
    },
    { access: accessToken, refresh: refreshToken }
  );
};

/**
 * Get current authentication tokens from localStorage
 */
export const getAuthTokens = async (page) => {
  return await page.evaluate(() => ({
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  }));
};

/**
 * Check if user is authenticated by checking localStorage
 */
export const isAuthenticated = async (page) => {
  const tokens = await getAuthTokens(page);
  return tokens.accessToken !== null && tokens.refreshToken !== null;
};

/**
 * Mock API responses for specific endpoints
 */
export const mockApiResponse = async (page, url, response, status = 200) => {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
};

/**
 * Wait for a toast/notification message to appear
 */
export const waitForToast = async (page, message, timeout = 5000) => {
  await page.waitForSelector(`text=${message}`, { timeout });
};

/**
 * Take a screenshot with timestamp
 */
export const takeTimestampedScreenshot = async (page, name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({ path: `e2e-screenshots/${name}-${timestamp}.png` });
};

/**
 * Wait for skeleton loaders to disappear
 */
export const waitForSkeletonsToDisappear = async (page, timeout = 10000) => {
  await page.waitForFunction(
    () => {
      const skeletons = document.querySelectorAll('[class*="skeleton"], [class*="animate-pulse"]');
      return skeletons.length === 0;
    },
    { timeout }
  );
};

/**
 * Scroll element into view and click
 */
export const scrollAndClick = async (page, selector) => {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
  await element.click();
};

/**
 * Fill form field with validation
 */
export const fillFormField = async (page, selector, value) => {
  const field = page.locator(selector);
  await field.clear();
  await field.fill(value);
  // Trigger blur to activate validation
  await field.blur();
};

/**
 * Wait for modal to be visible
 */
export const waitForModal = async (page, timeout = 5000) => {
  await page.waitForSelector('[role="dialog"], [class*="modal"]', { timeout });
};

/**
 * Close modal by clicking outside or close button
 */
export const closeModal = async (page) => {
  // Try close button first
  const closeButton = page.locator('button:has-text("Close"), button:has([class*="close"]), [aria-label="Close"]');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    return;
  }
  // Click outside modal
  await page.keyboard.press("Escape");
};

/**
 * Format date to match app's date format
 */
export const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Get tomorrow's date formatted
 */
export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

/**
 * Get next week's date formatted
 */
export const getNextWeekDate = () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return formatDate(nextWeek);
};

/**
 * Retry an action multiple times
 */
export const retryAction = async (action, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
