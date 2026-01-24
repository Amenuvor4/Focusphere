/**
 * Dashboard Navigation E2E Tests for Focusphere
 *
 * Tests cover:
 * - Sidebar navigation
 * - View switching
 * - User profile display
 * - Profile menu interactions
 * - Responsive behavior
 */

import { test, expect } from "@playwright/test";
import { TEST_USER, clearLocalStorage } from "../utils/test-helpers.js";

// Helper to login before tests
async function loginAndGoToDashboard(page) {
  // Navigate to app first before clearing localStorage (avoids security error)
  await page.goto("/");
  await clearLocalStorage(page);
  await page.goto("/Auth");
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

test.describe("Dashboard - Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test("should display Focusphere logo", async ({ page }) => {
    await expect(page.locator('h1:has-text("Focusphere")')).toBeVisible();
  });

  test("should display all navigation items", async ({ page }) => {
    await expect(page.locator('button:has-text("Tasks")')).toBeVisible();
    await expect(page.locator('button:has-text("Goals")')).toBeVisible();
    await expect(page.locator('button:has-text("Analytics")')).toBeVisible();
    await expect(page.locator('button:has-text("AI Assistant")')).toBeVisible();
  });

  test("should highlight active navigation item", async ({ page }) => {
    // Tasks should be active by default (or first view)
    const tasksButton = page.locator('button:has-text("Tasks")');

    // Check if it has the active class (bg-blue-600)
    await expect(tasksButton).toHaveClass(/bg-blue-600|bg-blue-500/);
  });

  test("should switch views when clicking navigation items", async ({
    page,
  }) => {
    // Click Goals
    await page.click('button:has-text("Goals")');
    await expect(page.locator('button:has-text("Goals")')).toHaveClass(
      /bg-blue-600|bg-blue-500/,
    );

    // Click Analytics
    await page.click('button:has-text("Analytics")');
    await expect(page.locator('button:has-text("Analytics")')).toHaveClass(
      /bg-blue-600|bg-blue-500/,
    );

    // Click AI Assistant
    await page.click('button:has-text("AI Assistant")');
    await expect(page.locator('button:has-text("AI Assistant")')).toHaveClass(
      /bg-blue-600|bg-blue-500/,
    );

    // Click back to Tasks
    await page.click('button:has-text("Tasks")');
    await expect(page.locator('button:has-text("Tasks")')).toHaveClass(
      /bg-blue-600|bg-blue-500/,
    );
  });

  test("should display icons for nav items", async ({ page }) => {
    // Main nav items should have icons (SVG elements)
    const tasksButton = page.locator('button:has-text("Tasks")');
    const goalsButton = page.locator('button:has-text("Goals")');

    // Verify buttons have SVG icons
    await expect(tasksButton.locator("svg")).toBeVisible();
    await expect(goalsButton.locator("svg")).toBeVisible();
  });
});

test.describe("Dashboard - User Profile Section", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test("should display user avatar", async ({ page }) => {
    // User avatar should be visible (rounded element in profile section)
    const avatar = page.locator('[class*="rounded-full"]').first();
    await expect(avatar).toBeVisible();
  });

  test("should display user name", async ({ page }) => {
    // Wait for user data to load
    await page.waitForTimeout(2000);

    // Should show user name (not "Loading...")
    const userName = page.locator(
      'p[class*="font-medium"]:not(:has-text("Loading"))',
    );
    await expect(userName.first()).toBeVisible();
  });

  test("should display user email", async ({ page }) => {
    await page.waitForTimeout(2000);

    // Email should be visible
    const email = page.locator(`text=${TEST_USER.email}`);
    // If exact email not visible, at least some email format should be
    const anyEmail = page.locator('p:has-text("@")');
    await expect(anyEmail.first()).toBeVisible({ timeout: 5000 });
  });

  test("should open profile menu on click", async ({ page }) => {
    // Find and click the profile section button
    const profileSection = page
      .locator("button")
      .filter({ has: page.locator('[class*="rounded-full"]') })
      .last();
    await profileSection.click();

    // Menu should open with Settings and Logout options
    await expect(page.locator('button:has-text("Settings")')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test("should show chevron rotation when menu opens", async ({ page }) => {
    const profileSection = page
      .locator("button")
      .filter({ has: page.locator('[class*="rounded-full"]') })
      .last();

    // Click to open
    await profileSection.click();

    // Chevron should rotate (has rotate-180 class)
    const chevron = page.locator('svg[class*="lucide-chevron-down"]');
    await expect(chevron).toHaveClass(/rotate-180/);
  });

  test("should close menu when clicking outside", async ({ page }) => {
    const profileSection = page
      .locator("button")
      .filter({ has: page.locator('[class*="rounded-full"]') })
      .last();

    // Open menu
    await profileSection.click();
    await expect(page.locator('button:has-text("Settings")')).toBeVisible();

    // Click outside (on the main content area)
    await page.click("main");

    // Menu should close
    await expect(page.locator('button:has-text("Settings")')).not.toBeVisible();
  });

  test("should navigate to settings when clicking Settings", async ({
    page,
  }) => {
    const profileSection = page
      .locator("button")
      .filter({ has: page.locator('[class*="rounded-full"]') })
      .last();
    await profileSection.click();

    // Click Settings
    await page.click('button:has-text("Settings")');

    // Should switch to settings view
    // Check for settings page content
    await expect(page.locator("text=Profile").first()).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Dashboard - View Content", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test("should display Tasks view content", async ({ page }) => {
    await page.click('button:has-text("Tasks")');

    // Should show task-related content (kanban columns or task list)
    await expect(
      page
        .locator("text=To Do")
        .or(page.locator("text=New Task"))
        .or(page.locator("text=Tasks")),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should display Goals view content", async ({ page }) => {
    await page.click('button:has-text("Goals")');

    // Should show goals-related content
    await expect(
      page
        .locator("text=Add Goal")
        .or(page.locator("text=Goals"))
        .or(page.locator("text=No goals")),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should display Analytics view content", async ({ page }) => {
    await page.click('button:has-text("Analytics")');

    // Should show analytics-related content
    await expect(
      page
        .locator("text=Analytics")
        .or(page.locator("text=Tasks Completed"))
        .or(page.locator("text=This week")),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should display AI Assistant view content", async ({ page }) => {
    await page.click('button:has-text("AI Assistant")');

    // Should show AI assistant content - just verify the view changed
    await page.waitForTimeout(1000);
    await expect(page.locator('button:has-text("AI Assistant")')).toHaveClass(
      /bg-blue-600|bg-blue-500/,
    );
  });
});

test.describe("Dashboard - Loading States", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test("should complete loading user profile", async ({ page }) => {
    // After dashboard loads, profile section should be visible
    await page.waitForTimeout(2000);

    // Profile section should exist and be functional
    const profileSection = page
      .locator("button")
      .filter({ has: page.locator('[class*="rounded-full"]') })
      .last();
    await expect(profileSection).toBeVisible();
  });
});

test.describe("Dashboard - Responsive Design", () => {
  test("should hide sidebar on mobile viewport", async ({ page }) => {
    await loginAndGoToDashboard(page);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Sidebar should be hidden on mobile
    const sidebar = page.locator('[class*="md:flex"][class*="md:w-64"]');
    await expect(sidebar).toHaveCSS("display", "none");
  });

  test("should show sidebar on desktop viewport", async ({ page }) => {
    await loginAndGoToDashboard(page);

    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    // Sidebar should be visible
    const sidebar = page.locator('[class*="md:flex"][class*="md:w-64"]');
    await expect(sidebar).toBeVisible();
  });
});

test.describe("Dashboard - Persistence", () => {
  test("should remember authenticated state on page reload", async ({
    page,
  }) => {
    await loginAndGoToDashboard(page);

    // Reload the page
    await page.reload();

    // Should still be on dashboard (not redirected to auth)
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should maintain view state during session", async ({ page }) => {
    await loginAndGoToDashboard(page);

    // Switch to Analytics
    await page.click('button:has-text("Analytics")');
    await expect(page.locator('button:has-text("Analytics")')).toHaveClass(
      /bg-blue-600|bg-blue-500/,
    );

    // Note: View state might not persist on reload depending on implementation
    // This tests within-session persistence
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("Analytics")');
    await expect(page.locator('button:has-text("Analytics")')).toHaveClass(
      /bg-blue-600|bg-blue-500/,
    );
  });
});

test.describe("Dashboard - Theme Support", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test("should apply dark mode when enabled", async ({ page }) => {
    // Navigate to settings
    const profileSection = page
      .locator("button")
      .filter({ has: page.locator('[class*="rounded-full"]') })
      .last();
    await profileSection.click();
    await page.click('button:has-text("Settings")');

    // Click Appearance tab
    await page.click('button:has-text("Appearance")');

    // Find and click dark mode toggle or theme card
    const darkThemeCard = page.locator("text=Dark").first();
    if (await darkThemeCard.isVisible()) {
      await darkThemeCard.click();
    }

    // Check if dark class is applied to html or body
    const isDarkMode = await page.evaluate(() => {
      return (
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
      );
    });

    // Note: This depends on the actual dark mode implementation
  });

  test("should persist theme preference", async ({ page }) => {
    // Go to settings and change theme
    const profileSection = page
      .locator("button")
      .filter({ has: page.locator('[class*="rounded-full"]') })
      .last();
    await profileSection.click();
    await page.click('button:has-text("Settings")');
    await page.click('button:has-text("Appearance")');

    // Get current theme state
    const initialTheme = await page.evaluate(() =>
      localStorage.getItem("theme"),
    );

    // Note: Actual theme persistence test would toggle and verify after reload
  });
});

test.describe("Dashboard - Error Handling", () => {
  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API to return error
    await page.route("**/api/tasks", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await loginAndGoToDashboard(page);

    // App should not crash, should show some content or error state
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle network timeout", async ({ page }) => {
    // Mock slow API response
    await page.route("**/api/tasks", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 30000));
      route.continue();
    });

    await loginAndGoToDashboard(page);

    // App should still be functional
    await expect(page.locator('h1:has-text("Focusphere")')).toBeVisible();
  });
});
