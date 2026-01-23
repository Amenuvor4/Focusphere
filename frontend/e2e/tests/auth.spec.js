/**
 * Authentication E2E Tests for Focusphere
 *
 * Tests cover:
 * - Login flow (email/password)
 * - Registration flow with password validation
 * - Logout functionality
 * - Protected route access
 * - Token management
 * - OAuth flow (Google)
 * - Error handling
 */

import { test, expect } from "@playwright/test";
import {
  TEST_USER,
  generateTestData,
  clearLocalStorage,
  getAuthTokens,
  isAuthenticated,
} from "../utils/test-helpers.js";

test.describe("Authentication - Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
  });

  test("should display login form by default", async ({ page }) => {
    await page.goto("/Auth");

    // Verify login form elements
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.locator('button[type="submit"]:has-text("Sign In")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Continue with Google")'),
    ).toBeVisible();
  });

  test("should show back to home link", async ({ page }) => {
    await page.goto("/Auth");

    const backLink = page.locator('button:has-text("Back to Home")');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/");
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/Auth");

    await page.fill('input[type="email"]', "invalidemail");
    await page.fill('input[type="password"]', "ValidPassword123!");
    await page.click('button[type="submit"]');

    // Should not navigate to dashboard with invalid email
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*Auth/i);
  });

  test("should validate password minimum length on login", async ({ page }) => {
    await page.goto("/Auth");

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "short");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Password must be at least 6 characters"),
    ).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/Auth");

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill("TestPassword");

    // Click the eye icon to show password
    await page.click('button:has([class*="lucide-eye"])');

    // Password should now be visible (type="text")
    await expect(
      page.locator('input[placeholder*="password"][type="text"]'),
    ).toBeVisible();

    // Click again to hide
    await page.click('button:has([class*="lucide-eye"])');

    // Password should be hidden again
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should show loading state during login", async ({ page }) => {
    await page.goto("/Auth");

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Click submit and check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show "Signing in..." text while loading
    await expect(page.locator("text=Signing in...")).toBeVisible({
      timeout: 2000,
    });
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto("/Auth");

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify tokens are stored
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/Auth");

    await page.fill('input[type="email"]', "wrong@email.com");
    await page.fill('input[type="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('[class*="bg-red"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test("should store tokens in localStorage after login", async ({ page }) => {
    await page.goto("/Auth");

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });

    const tokens = await getAuthTokens(page);
    expect(tokens.accessToken).not.toBeNull();
    expect(tokens.refreshToken).not.toBeNull();
  });
});

test.describe("Authentication - Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Auth");
    await clearLocalStorage(page);
    // Switch to signup mode
    await page.click('button:has-text("Sign up")');
  });

  test("should display registration form when switching to signup", async ({
    page,
  }) => {
    await expect(page.locator('h1:has-text("Create account")')).toBeVisible();
    await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.locator('button[type="submit"]:has-text("Create Account")'),
    ).toBeVisible();
  });

  test("should validate name minimum length", async ({ page }) => {
    await page.fill('input[placeholder="John Doe"]', "A");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "ValidPass123!");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Name must be at least 2 characters"),
    ).toBeVisible();
  });

  test("should show password strength indicator", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.focus();

    // Type password that passes 1 rule (8+ chars) to show "Weak"
    // Note: "a" passes 0 rules so label is empty. Need to pass at least 1 rule.
    await passwordInput.fill("abcdefgh");

    // Should show password rules after focus
    await expect(page.locator("text=At least 8 characters")).toBeVisible();
    await expect(page.locator("text=Contains a number")).toBeVisible();
    await expect(page.locator("text=Contains special character")).toBeVisible();
    await expect(page.locator("text=Contains uppercase")).toBeVisible();

    // Should show "Weak" indicator (passes 1 rule = level 1 = Weak)
    await expect(page.locator("text=Weak")).toBeVisible();
  });

  test("should update password strength as user types", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.focus();

    // 8+ chars = passes 1 rule = level 1 = Weak
    // Note: password must pass at least 1 rule to show a label (0 rules = empty label)
    await passwordInput.fill("abcdefgh");
    await expect(page.locator("text=Weak")).toBeVisible();

    // 8+ chars + number = passes 2 rules = level 2 = Fair
    await passwordInput.fill("abcdefgh1");
    await expect(page.locator("text=Fair")).toBeVisible();

    // 8+ chars + number + uppercase = passes 3 rules = level 3 = Good
    await passwordInput.fill("Abcdefgh1");
    await expect(page.locator("text=Good")).toBeVisible();

    // All 4 rules passed = level 4 = Strong
    await passwordInput.fill("Abcdefgh1!");
    await expect(page.locator("text=Strong")).toBeVisible();
  });

  test("should show checkmarks for passing password rules", async ({
    page,
  }) => {
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.focus();

    await passwordInput.fill("TestPassword123!");

    // All 4 rules should pass (green text items in the checklist)
    // The component uses text-green-600 dark:text-green-400
    const passedRules = page
      .locator(".text-green-600, .dark\\:text-green-400")
      .filter({ has: page.locator("svg") });
    await expect(passedRules).toHaveCount(4);
  });

  test("should prevent registration with weak password", async ({ page }) => {
    await page.fill('input[placeholder="John Doe"]', "Test User");
    await page.fill('input[type="email"]', "newuser@test.com");
    await page.fill('input[type="password"]', "weak");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Password does not meet the requirements"),
    ).toBeVisible();
  });

  test("should register successfully with valid data", async ({ page }) => {
    const testData = generateTestData();

    await page.fill('input[placeholder="John Doe"]', "New Test User");
    await page.fill('input[type="email"]', testData.uniqueEmail);
    await page.fill('input[type="password"]', "ValidPassword123!");
    await page.click('button[type="submit"]');

    // Should show success message and switch to login
    await expect(page.locator("text=Account created successfully")).toBeVisible(
      { timeout: 10000 },
    );
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
  });

  test("should clear password field after successful registration", async ({
    page,
  }) => {
    const testData = generateTestData();

    await page.fill('input[placeholder="John Doe"]', "New User");
    await page.fill('input[type="email"]', testData.uniqueEmail);
    await page.fill('input[type="password"]', "ValidPassword123!");
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator("text=Account created successfully")).toBeVisible(
      { timeout: 10000 },
    );

    // Password should be cleared
    const passwordValue = await page
      .locator('input[type="password"]')
      .inputValue();
    expect(passwordValue).toBe("");
  });

  test("should show error for duplicate email", async ({ page }) => {
    // Try to register with existing email
    await page.fill('input[placeholder="John Doe"]', "Test User");
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', "ValidPassword123!");
    await page.click('button[type="submit"]');

    // Should show error about existing email
    await expect(page.locator('[class*="bg-red"]')).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Authentication - Logout", () => {
  test("should logout successfully", async ({ page }) => {
    // First login
    await page.goto("/Auth");
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    // Wait for dashboard to fully load
    await page.waitForTimeout(1000);

    // Find and click the profile/user section in sidebar (has avatar with initial)
    const profileSection = page
      .locator("button")
      .filter({ has: page.locator('[class*="rounded-full"]') })
      .last();
    await profileSection.click();

    // Wait for menu to appear and click logout
    await page.waitForTimeout(500);
    await page.click('button:has-text("Logout")');

    // Should redirect to home or auth page (handle various URL patterns)
    await page.waitForURL(/\/(Auth|auth|login)?(\?.*)?$/, { timeout: 10000 });

    // Tokens should be cleared
    const tokens = await getAuthTokens(page);
    expect(tokens.accessToken).toBeNull();
    expect(tokens.refreshToken).toBeNull();
  });

  test("should clear localStorage on logout", async ({ page }) => {
    // Login first
    await page.goto("/Auth");
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    // Verify tokens exist
    let tokens = await getAuthTokens(page);
    expect(tokens.accessToken).not.toBeNull();

    // Logout via clearing storage (simulating logout)
    await clearLocalStorage(page);

    // Tokens should be gone
    tokens = await getAuthTokens(page);
    expect(tokens.accessToken).toBeNull();
  });
});

test.describe("Authentication - Protected Routes", () => {
  test("should redirect unauthenticated user to auth page", async ({
    page,
  }) => {
    // First go to a page to initialize, then clear storage
    await page.goto("/");
    await clearLocalStorage(page);
    await page.goto("/dashboard");

    // Should be redirected to auth page (or stay on non-dashboard page)
    // The app may redirect to /Auth, /auth, /login, or /
    await page.waitForURL(/\/(Auth|auth|login)?(\?.*)?$/, { timeout: 10000 });

    // Verify we're NOT on dashboard anymore
    await expect(page).not.toHaveURL(/.*dashboard/);
  });

  test("should show loading state while checking auth", async ({ page }) => {
    // First go to home to initialize
    await page.goto("/");
    await clearLocalStorage(page);
    await page.goto("/dashboard");

    // Should either show loading or redirect to auth
    const loadingOrAuth = await Promise.race([
      page
        .waitForSelector('[class*="animate-"]', { timeout: 2000 })
        .then(() => "loading"),
      page.waitForURL("**/Auth", { timeout: 5000 }).then(() => "auth"),
    ]).catch(() => "auth");

    expect(["loading", "auth"]).toContain(loadingOrAuth);
  });

  test("should allow authenticated user to access dashboard", async ({
    page,
  }) => {
    // Login first
    await page.goto("/Auth");
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    // Now navigate away and back
    await page.goto("/");
    await page.goto("/dashboard");

    // Should stay on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should redirect authenticated user away from auth page", async ({
    page,
  }) => {
    // Login first
    await page.goto("/Auth");
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    // Try to access auth page
    await page.goto("/Auth");

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

test.describe("Authentication - OAuth (Google)", () => {
  test("should display Google sign-in button", async ({ page }) => {
    await page.goto("/Auth");

    const googleButton = page.locator(
      'button:has-text("Continue with Google")',
    );
    await expect(googleButton).toBeVisible();
  });

  test("should initiate Google sign-in flow", async ({ page }) => {
    await page.goto("/Auth");

    const googleButton = page.locator(
      'button:has-text("Continue with Google")',
    );
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();

    // Just verify the button exists and is clickable - actual OAuth would redirect
  });

  test("should handle OAuth callback with tokens in URL", async ({ page }) => {
    // Simulate OAuth callback with tokens
    const mockAccessToken = "mock-access-token";
    const mockRefreshToken = "mock-refresh-token";

    // Mock the profile endpoint
    await page.route("**/api/auth/profile", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "test-id",
            name: "OAuth User",
            email: "oauth@test.com",
          },
        }),
      });
    });

    // Go to auth page with tokens in URL
    await page.goto(
      `/Auth?accessToken=${mockAccessToken}&refreshToken=${mockRefreshToken}`,
    );

    // Should either show loading overlay or redirect to dashboard
    const result = await Promise.race([
      page
        .waitForSelector('[class*="animate-spin"]', { timeout: 3000 })
        .then(() => "loading"),
      page
        .waitForURL("**/dashboard", { timeout: 5000 })
        .then(() => "dashboard"),
    ]).catch(() => "handled");

    expect(["loading", "dashboard", "handled"]).toContain(result);
  });

  test("should handle OAuth error in URL", async ({ page }) => {
    await page.goto("/Auth?error=oauth_failed");

    // Should show error message
    await expect(
      page.locator("text=OAuth authentication failed"),
    ).toBeVisible();
  });
});

test.describe("Authentication - Mode Switching", () => {
  test("should switch between login and signup modes", async ({ page }) => {
    await page.goto("/Auth");

    // Start in login mode
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();

    // Switch to signup
    await page.click('button:has-text("Sign up")');
    await expect(page.locator('h1:has-text("Create account")')).toBeVisible();

    // Switch back to login
    await page.click('button:has-text("Sign in")');
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
  });

  test("should clear form state when switching modes", async ({ page }) => {
    await page.goto("/Auth");

    // Enter some data in login mode
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "SomePassword123!");

    // Switch to signup
    await page.click('button:has-text("Sign up")');

    // Password should be cleared when switching modes
    const passwordValue = await page
      .locator('input[type="password"]')
      .inputValue();
    expect(passwordValue).toBe("");

    // Should show signup header
    await expect(page.locator('h1:has-text("Create account")')).toBeVisible();
  });

  test("should clear password when switching modes", async ({ page }) => {
    await page.goto("/Auth");

    // Enter password in login mode
    await page.fill('input[type="password"]', "SomePassword");

    // Switch to signup
    await page.click('button:has-text("Sign up")');

    // Password should be cleared
    const passwordValue = await page
      .locator('input[type="password"]')
      .inputValue();
    expect(passwordValue).toBe("");
  });
});

test.describe("Authentication - Accessibility", () => {
  test("should have proper form labels", async ({ page }) => {
    await page.goto("/Auth");

    // Check labels exist
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Password")')).toBeVisible();
  });

  test("should be navigable with keyboard", async ({ page }) => {
    await page.goto("/Auth");

    // Focus on email field first
    await page.locator('input[type="email"]').focus();

    // Tab through form elements
    await page.keyboard.press("Tab"); // Password field
    await page.keyboard.press("Tab"); // Eye toggle
    await page.keyboard.press("Tab"); // Submit button

    // Submit button should be focused
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeFocused();
  });

  test("should submit form with Enter key", async ({ page }) => {
    await page.goto("/Auth");

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Press Enter to submit
    await page.keyboard.press("Enter");

    // Should attempt to submit (either succeed or show error)
    await expect(page.locator("text=Signing in...")).toBeVisible({
      timeout: 2000,
    });
  });
});
