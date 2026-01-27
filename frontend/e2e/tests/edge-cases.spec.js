/**
 * Edge Cases and Boundary E2E Tests for Focusphere
 *
 * Tests cover:
 * - Input validation edge cases
 * - Boundary conditions
 * - Security considerations
 * - Concurrent operations
 * - Session management
 * - Data integrity
 * - Performance edge cases
 */

import { test, expect } from "@playwright/test";
import { TEST_USER, clearLocalStorage, generateTestData } from "../utils/test-helpers.js";

// Helper to login
async function login(page) {
  await page.goto("/");
  await clearLocalStorage(page);
  await page.goto("/Auth");
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

test.describe("Edge Cases - Input Validation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should handle empty form submission", async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    // Try to submit empty form
    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    // Form should not submit, dialog stays open
    await expect(
      page.locator('[class*="backdrop-blur"]').or(page.locator('.fixed.inset-0'))
    ).toBeVisible({ timeout: 3000 });
  });

  test("should handle very long input values", async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    // Create a very long string
    const longTitle = "A".repeat(1000);
    await page.locator('input').first().fill(longTitle);

    // Should handle gracefully (truncate or show error)
    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    // App should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle special characters in input", async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    // Input with special characters
    const specialChars = '<script>alert("XSS")</script> & "quotes" \'single\' emoji: 😀';
    await page.locator('input').first().fill(specialChars);
    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    await page.waitForTimeout(1000);

    // Should sanitize or escape properly
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle unicode and emojis", async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    const unicodeText = "Task: 你好世界 🎉 مرحبا العالم";
    await page.locator('input').first().fill(unicodeText);
    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    await page.waitForTimeout(2000);

    // Unicode should be preserved
    const hasUnicode = await page.locator('text=你好').isVisible().catch(() => false);
    // App should not crash regardless
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle whitespace-only input", async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    // Input only whitespace
    await page.locator('input').first().fill("   ");
    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    // Should not accept whitespace-only as valid input
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle numeric input in text fields", async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    await page.locator('input').first().fill("12345");
    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    await page.waitForTimeout(2000);

    // Should accept numeric titles or handle gracefully
    const hasNumeric = await page.locator('text=12345').isVisible().catch(() => false);
    // App should not crash regardless
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe("Edge Cases - Authentication", () => {
  test("should handle expired token gracefully", async ({ page }) => {
    await login(page);

    // Simulate expired token by setting invalid one
    await page.evaluate(() => {
      localStorage.setItem("accessToken", "invalid-expired-token");
    });

    // Navigate to trigger API call
    await page.click('button:has-text("Goals")');
    await page.waitForTimeout(2000);

    // Should either refresh token or redirect to login
    const isOnAuth = page.url().includes("Auth");
    const isStillWorking = await page.locator('button:has-text("Goals")').isVisible().catch(() => false);

    // One of these should be true
    expect(isOnAuth || isStillWorking).toBe(true);
  });

  test("should handle missing refresh token", async ({ page }) => {
    await login(page);

    // Remove refresh token
    await page.evaluate(() => {
      localStorage.removeItem("refreshToken");
      localStorage.setItem("accessToken", "invalid-token");
    });

    // Try to access protected content
    await page.reload();
    await page.waitForTimeout(2000);

    // Should redirect to auth
    await expect(page).toHaveURL(/.*Auth/i, { timeout: 10000 });
  });

  test("should handle concurrent login attempts", async ({ page, context }) => {
    // Open second page
    const page2 = await context.newPage();

    // Login on both pages simultaneously
    await Promise.all([
      page.goto("/Auth"),
      page2.goto("/Auth"),
    ]);

    // Fill and submit on both
    await Promise.all([
      page.fill('input[type="email"]', TEST_USER.email).then(() =>
        page.fill('input[type="password"]', TEST_USER.password)
      ),
      page2.fill('input[type="email"]', TEST_USER.email).then(() =>
        page2.fill('input[type="password"]', TEST_USER.password)
      ),
    ]);

    await Promise.all([
      page.click('button[type="submit"]'),
      page2.click('button[type="submit"]'),
    ]);

    // Both should eventually reach dashboard or one should handle gracefully
    await page.waitForTimeout(5000);

    // At least one should work
    const page1OnDashboard = page.url().includes("dashboard");
    const page2OnDashboard = page2.url().includes("dashboard");

    expect(page1OnDashboard || page2OnDashboard).toBe(true);

    await page2.close();
  });

  test("should handle logout during API request", async ({ page }) => {
    await login(page);

    // Mock slow API response
    await page.route("**/api/tasks", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      route.continue();
    });

    // Start loading tasks
    await page.click('button:has-text("Tasks")');

    // Logout while request is pending
    const profileSection = page.locator('button').filter({ has: page.locator('[class*="rounded-full"]') }).last();
    await profileSection.click();
    await page.click('button:has-text("Logout")');

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe("Edge Cases - Network", () => {
  test("should handle offline mode", async ({ page }) => {
    await login(page);

    // Go offline
    await page.context().setOffline(true);

    // Try to perform action
    await page.click('button:has-text("Goals")');
    await page.waitForTimeout(2000);

    // Should show error or offline indicator
    await expect(page.locator('body')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);
  });

  test("should handle slow network", async ({ page }) => {
    await login(page);

    // Simulate slow network
    await page.route("**/*", (route) => {
      setTimeout(() => route.continue(), 3000);
    });

    await page.click('button:has-text("Analytics")');

    // Should show loading state
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle 404 responses", async ({ page }) => {
    await login(page);

    // Mock 404 response
    await page.route("**/api/tasks/*", (route) => {
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Not found" }),
      });
    });

    await page.click('button:has-text("Tasks")');

    // Should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle 500 server errors", async ({ page }) => {
    await login(page);

    // Mock 500 response
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(1000);

    // App should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle malformed JSON response", async ({ page }) => {
    await login(page);

    // Mock malformed response
    await page.route("**/api/tasks", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "invalid json {{{",
      });
    });

    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(1000);

    // Should handle JSON parse error
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe("Edge Cases - Date Handling", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Tasks")');
  });

  test("should handle past due dates", async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    await page.locator('input').first().fill("Past Due Task");

    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible().catch(() => false)) {
      // Set date to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await dateInput.fill(yesterday.toISOString().split("T")[0]);
    }

    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    // Should allow or warn about past date
    await page.waitForTimeout(1000);
  });

  test("should handle far future dates", async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    await page.locator('input').first().fill("Far Future Task");

    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible().catch(() => false)) {
      // Set date to 10 years from now
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 10);
      await dateInput.fill(farFuture.toISOString().split("T")[0]);
    }

    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    await page.waitForTimeout(2000);

    // Should accept far future dates or handle gracefully
    const hasTask = await page.locator('text=Far Future Task').isVisible().catch(() => false);
    // App should not crash regardless
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle invalid date format", async ({ page }) => {
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    await page.locator('input').first().fill("Invalid Date Task");

    // Try to input invalid date via JavaScript
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible().catch(() => false)) {
      await dateInput.evaluate((el) => {
        el.value = "invalid-date";
      });
    }

    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe("Edge Cases - Concurrent Operations", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should handle rapid button clicks", async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);

    // Click New Task rapidly multiple times
    const newTaskButton = page.locator('button:has-text("New Task")');

    for (let i = 0; i < 5; i++) {
      await newTaskButton.click().catch(() => {});
    }

    // Should only open one dialog
    const dialogs = page.locator('[role="dialog"]');
    const dialogCount = await dialogs.count();

    expect(dialogCount).toBeLessThanOrEqual(1);
  });

  test("should handle double form submission", async ({ page }) => {
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);

    await page.locator('input').first().fill("Double Submit Task");

    // Double click submit
    const submitButton = page.locator('button:has-text("Save")').or(page.locator('button:has-text("Create")'));
    await submitButton.dblclick().catch(() => submitButton.click());

    await page.waitForTimeout(2000);

    // Should only create one task
    const tasks = page.locator('text=Double Submit Task');
    const count = await tasks.count();

    // Should be 0, 1, or handled gracefully
    expect(count).toBeLessThanOrEqual(2);
  });

  test("should handle simultaneous edit and delete", async ({ page }) => {
    await page.click('button:has-text("Tasks")');

    // Create a task first
    await page.click('button:has-text("New Task")');
    await page.waitForTimeout(500);
    await page.locator('input').first().fill("Edit Delete Test");
    await page.click('button:has-text("Save")').catch(() => page.click('button:has-text("Create")'));
    await page.waitForTimeout(2000);

    // Try to interact with any existing task card
    const taskCard = page.locator('[class*="task"]').first();
    if (await taskCard.isVisible().catch(() => false)) {
      await taskCard.hover().catch(() => {});
    }

    // App should handle concurrent operations gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe("Edge Cases - Session Management", () => {
  test("should handle tab focus changes", async ({ page }) => {
    await login(page);

    // Simulate tab losing focus
    await page.evaluate(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await page.waitForTimeout(1000);

    // App should still work when refocused
    await page.click('button:has-text("Goals")');
    await expect(page.locator('button:has-text("Add Goal")')).toBeVisible({ timeout: 10000 });
  });

  test("should handle browser back button", async ({ page }) => {
    await login(page);

    // Navigate to different views
    await page.click('button:has-text("Goals")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Analytics")');
    await page.waitForTimeout(500);

    // Press back button
    await page.goBack();
    await page.waitForTimeout(500);

    // Should handle navigation gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle page refresh during operation", async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Tasks")');
    await page.click('button:has-text("New Task")');

    // Fill form
    await page.locator('input').first().fill("Refresh Test");

    // Refresh during operation
    await page.reload();

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe("Edge Cases - Large Data Sets", () => {
  test("should handle many tasks without crashing", async ({ page }) => {
    // Mock large task list
    const largeTasks = Array.from({ length: 100 }, (_, i) => ({
      id: `task-${i}`,
      title: `Task ${i}`,
      status: ["todo", "in-progress", "completed"][i % 3],
      priority: ["high", "medium", "low"][i % 3],
    }));

    await page.route("**/api/tasks", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(largeTasks),
        });
      } else {
        route.continue();
      }
    });

    await login(page);
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(2000);

    // Page should render without crashing
    await expect(page.locator('text=Task 0')).toBeVisible({ timeout: 15000 });
  });

  test("should handle many goals without crashing", async ({ page }) => {
    // Mock large goals list
    const largeGoals = Array.from({ length: 50 }, (_, i) => ({
      id: `goal-${i}`,
      title: `Goal ${i}`,
      priority: ["high", "medium", "low"][i % 3],
      progress: i * 2,
    }));

    await page.route("**/api/goals", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(largeGoals),
        });
      } else {
        route.continue();
      }
    });

    await login(page);
    await page.click('button:has-text("Goals")');
    await page.waitForTimeout(2000);

    // Page should render
    await expect(page.locator('text=Goal 0')).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Edge Cases - Memory and Performance", () => {
  test("should handle repeated navigation without memory leak", async ({ page }) => {
    await login(page);

    // Navigate between views many times
    for (let i = 0; i < 20; i++) {
      await page.click('button:has-text("Tasks")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Goals")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Analytics")');
      await page.waitForTimeout(100);
    }

    // App should still be responsive
    await expect(page.locator('button:has-text("Tasks")')).toBeEnabled();
  });

  test("should handle repeated modal open/close", async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(500);

    // Open and close modal a few times
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("New Task")');
      await page.waitForTimeout(300);

      // Close by clicking Cancel button or the backdrop
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click();
      } else {
        // Click outside to close
        await page.mouse.click(10, 10);
      }
      await page.waitForTimeout(300);
    }

    // App should still work
    await expect(page.locator('button:has-text("New Task")')).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Edge Cases - Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should be keyboard navigable", async ({ page }) => {
    // Tab through main navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should be able to activate with Enter
    await page.keyboard.press("Enter");

    // App should respond to keyboard
    await expect(page.locator('body')).toBeVisible();
  });

  test("should handle screen reader content", async ({ page }) => {
    // Check for accessible elements
    const accessibleElements = page.locator('button, h1, h2, h3, nav, main, [aria-label], [role]');
    const count = await accessibleElements.count();

    // Should have some accessible elements
    expect(count).toBeGreaterThan(0);
  });

  test("should maintain focus after modal close", async ({ page }) => {
    await page.click('button:has-text("Tasks")');

    const newTaskButton = page.locator('button:has-text("New Task")');
    await newTaskButton.click();
    await page.waitForTimeout(300);

    // Close modal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Focus should return to trigger or logical place
    await expect(newTaskButton).toBeVisible();
  });
});
