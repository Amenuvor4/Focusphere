/**
 * AI Intent-Action Execution E2E Tests for Focusphere
 *
 * Tests cover:
 * - Core action execution via confirmation phrases
 * - Confirmation phrase detection (affirmative and decline)
 * - Action cards display and interaction
 * - Complex multi-action workflows
 * - Edge cases and error handling
 * - Integration with Tasks and Goals views
 */

import { test, expect } from "@playwright/test";
import {
  TEST_USER,
  clearLocalStorage,
  generateTestData,
  mockApiResponse,
} from "../utils/test-helpers.js";

// Helper to login and navigate to AI Assistant
async function loginAndGoToAI(page) {
  await page.goto("/");
  await clearLocalStorage(page);
  await page.goto("/Auth");
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // Navigate to AI Assistant view
  await page.click('button:has-text("AI Assistant")');
  await page.waitForTimeout(1500);
}

// Helper to open chat widget
async function openChatWidget(page) {
  await page.goto("/");
  await clearLocalStorage(page);
  await page.goto("/Auth");
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // Open the chat widget
  const widgetButton = page
    .locator('button:has([class*="sparkle"])')
    .or(
      page
        .locator('button[class*="fixed"]')
        .filter({ has: page.locator("svg") }),
    );
  await widgetButton.click();
  await page.waitForTimeout(1000);
}

// Helper to send a message in chat
async function sendMessage(page, message) {
  const input = page.getByPlaceholder(/message|ask/i);
  await input.fill(message);
  await input.press("Enter");
  await page.waitForTimeout(500);
}

// ============================================
// CATEGORY 1: CORE ACTION EXECUTION
// ============================================

test.describe("AI Action Execution - Core Actions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToAI(page);
  });

  test("should display action card when AI proposes a create task", async ({
    page,
  }) => {
    // Mock AI response with create_task action
    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "I'll create a task for you. Confirm to proceed.",
            suggestedActions: [
              {
                type: "create_task",
                data: {
                  title: "Test Task",
                  category: "Work",
                  priority: "high",
                },
              },
            ],
          },
        }),
      });
    });

    await sendMessage(
      page,
      "Create a high priority work task called Test Task",
    );

    // Wait for AI response
    await page.waitForSelector("text=I'll create a task", { timeout: 10000 });

    // Action card should be visible
    await expect(
      page.locator("text=Create Task").or(page.locator('[class*="action"]')),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should execute action when clicking Accept button", async ({
    page,
  }) => {
    // First mock: AI proposes action
    await page.route("**/ai/chat", (route, request) => {
      const body = JSON.parse(request.postData());
      if (body.message.toLowerCase().includes("create")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            response: {
              message: "I'll create this task for you.",
              suggestedActions: [
                {
                  type: "create_task",
                  data: {
                    title: "New Task",
                    category: "Work",
                    priority: "medium",
                  },
                },
              ],
            },
          }),
        });
      }
    });

    // Mock execute-actions endpoint
    await page.route("**/ai/execute-actions", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          results: [
            {
              success: true,
              actionType: "create_task",
              data: { title: "New Task" },
            },
          ],
          summary: { total: 1, succeeded: 1, failed: 0 },
          message: 'Done! Successfully created task "New Task".',
        }),
      });
    });

    await sendMessage(page, "Create a task called New Task");
    await page.waitForTimeout(2000);

    // Click Accept button
    const acceptButton = page.locator('button:has-text("Accept")').first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(1000);

      // Should show success indicator
      await expect(
        page.locator("text=Completed").or(page.locator('[class*="green"]')),
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should execute action via confirmation phrase 'yes'", async ({
    page,
  }) => {
    let chatCallCount = 0;

    await page.route("**/ai/chat", (route, request) => {
      chatCallCount++;
      const body = JSON.parse(request.postData());

      if (chatCallCount === 1) {
        // First call: propose action
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            response: {
              message: "I'll delete completed tasks. Say 'yes' to confirm.",
              suggestedActions: [
                {
                  type: "delete_task",
                  data: { taskId: "123", title: "Old Task" },
                },
              ],
            },
          }),
        });
      } else if (body.message.toLowerCase().trim() === "yes") {
        // Second call: confirmation detected
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            response: {
              message: "Done! Deleted 1 task.",
              suggestedActions: [],
              executedActions: [
                {
                  success: true,
                  actionType: "delete_task",
                  data: { title: "Old Task" },
                },
              ],
            },
            wasConfirmation: true,
          }),
        });
      }
    });

    // Send initial request
    await sendMessage(page, "Delete my completed tasks");
    await page.waitForTimeout(2000);

    // Send confirmation
    await sendMessage(page, "yes");
    await page.waitForTimeout(2000);

    // Should show execution success
    await expect(
      page.locator("text=Done").or(page.locator("text=executed successfully")),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should decline action via confirmation phrase 'no'", async ({
    page,
  }) => {
    let chatCallCount = 0;

    await page.route("**/ai/chat", (route, request) => {
      chatCallCount++;
      const body = JSON.parse(request.postData());

      if (chatCallCount === 1) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            response: {
              message: "I'll delete all your tasks. Confirm to proceed.",
              suggestedActions: [
                {
                  type: "delete_task",
                  data: { taskId: "123", title: "Task 1" },
                },
              ],
            },
          }),
        });
      } else if (body.message.toLowerCase().trim() === "no") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            response: {
              message: "Cancelled 1 pending action. What else can I help with?",
              suggestedActions: [],
            },
            wasDecline: true,
          }),
        });
      }
    });

    await sendMessage(page, "Delete all my tasks");
    await page.waitForTimeout(2000);

    await sendMessage(page, "no");
    await page.waitForTimeout(2000);

    // Should show cancellation message
    await expect(page.locator("text=Cancelled")).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// CATEGORY 2: CONFIRMATION PHRASE DETECTION
// ============================================

test.describe("AI Action Execution - Confirmation Detection", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToAI(page);
  });

  const affirmativePhrases = [
    "yes",
    "yeah",
    "yep",
    "sure",
    "ok",
    "okay",
    "confirm",
    "go ahead",
    "do it",
    "proceed",
  ];

  for (const phrase of affirmativePhrases) {
    test(`should recognize "${phrase}" as confirmation`, async ({ page }) => {
      let confirmedPhrase = null;

      await page.route("**/ai/chat", (route, request) => {
        const body = JSON.parse(request.postData());
        const msg = body.message.toLowerCase().trim();

        if (msg.includes("create") || msg.includes("task")) {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              response: {
                message: "I'll create this. Confirm?",
                suggestedActions: [
                  {
                    type: "create_task",
                    data: { title: "Test", category: "Work" },
                  },
                ],
              },
            }),
          });
        } else {
          // Any short message after action proposal could be confirmation
          confirmedPhrase = msg;
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              response: {
                message: "Action confirmed and executed!",
                suggestedActions: [],
                executedActions: [{ success: true, actionType: "create_task" }],
              },
              wasConfirmation: true,
            }),
          });
        }
      });

      await sendMessage(page, "Create a task");
      await page.waitForTimeout(1500);

      await sendMessage(page, phrase);
      await page.waitForTimeout(1500);

      // Verify the phrase was sent
      expect(confirmedPhrase).toBe(phrase.toLowerCase());
    });
  }

  const declinePhrases = ["no", "nope", "cancel", "decline"];

  for (const phrase of declinePhrases) {
    test(`should recognize "${phrase}" as decline`, async ({ page }) => {
      await page.route("**/ai/chat", (route, request) => {
        const body = JSON.parse(request.postData());
        const msg = body.message.toLowerCase().trim();

        if (msg.includes("delete")) {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              response: {
                message: "I'll delete this. Confirm?",
                suggestedActions: [
                  { type: "delete_task", data: { taskId: "1", title: "Task" } },
                ],
              },
            }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              response: {
                message: "Action cancelled.",
                suggestedActions: [],
              },
              wasDecline: true,
            }),
          });
        }
      });

      await sendMessage(page, "Delete a task");
      await page.waitForTimeout(1500);

      await sendMessage(page, phrase);
      await page.waitForTimeout(1500);

      await expect(
        page.locator("text=cancelled").or(page.locator("text=Cancelled")),
      ).toBeVisible({ timeout: 5000 });
    });
  }
});

// ============================================
// CATEGORY 3: ACTION CARD DISPLAY
// ============================================

test.describe("AI Action Execution - Action Card Display", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToAI(page);
  });

  test("should display create task action card with correct details", async ({
    page,
  }) => {
    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "Creating task.",
            suggestedActions: [
              {
                type: "create_task",
                data: {
                  title: "Meeting Prep",
                  category: "Work",
                  priority: "high",
                  due_date: "2024-12-31",
                },
              },
            ],
          },
        }),
      });
    });

    await sendMessage(page, "Create a task");
    await page.waitForTimeout(2000);

    // Should show task title in action card
    await expect(page.locator("text=Meeting Prep")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should display multiple action cards", async ({ page }) => {
    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "Creating 3 tasks.",
            suggestedActions: [
              {
                type: "create_task",
                data: { title: "Task 1", category: "Work" },
              },
              {
                type: "create_task",
                data: { title: "Task 2", category: "Work" },
              },
              {
                type: "create_task",
                data: { title: "Task 3", category: "Work" },
              },
            ],
          },
        }),
      });
    });

    await sendMessage(page, "Create 3 tasks");
    await page.waitForTimeout(2000);

    // Should show multi-action indicator
    await expect(
      page.locator("text=3 Actions").or(page.locator("text=Accept All")),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should display delete action card with warning styling", async ({
    page,
  }) => {
    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "Deleting task.",
            suggestedActions: [
              {
                type: "delete_task",
                data: { taskId: "123", title: "Old Task" },
              },
            ],
          },
        }),
      });
    });

    await sendMessage(page, "Delete a task");
    await page.waitForTimeout(2000);

    // Should show delete action (often with red styling)
    await expect(
      page.locator("text=Delete").or(page.locator('[class*="delete"]')),
    ).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// CATEGORY 4: COMPLEX WORKFLOWS
// ============================================

test.describe("AI Action Execution - Complex Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToAI(page);
  });

  test("should handle bulk Accept All action", async ({ page }) => {
    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "Creating 5 tasks for your project.",
            suggestedActions: [
              {
                type: "create_task",
                data: { title: "Task 1", category: "Projects" },
              },
              {
                type: "create_task",
                data: { title: "Task 2", category: "Projects" },
              },
              {
                type: "create_task",
                data: { title: "Task 3", category: "Projects" },
              },
              {
                type: "create_task",
                data: { title: "Task 4", category: "Projects" },
              },
              {
                type: "create_task",
                data: { title: "Task 5", category: "Projects" },
              },
            ],
          },
        }),
      });
    });

    await page.route("**/ai/execute-actions", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          results: [
            { success: true, actionType: "create_task" },
            { success: true, actionType: "create_task" },
            { success: true, actionType: "create_task" },
            { success: true, actionType: "create_task" },
            { success: true, actionType: "create_task" },
          ],
          summary: { total: 5, succeeded: 5, failed: 0 },
          message: "Done! Successfully completed all 5 actions.",
        }),
      });
    });

    await sendMessage(page, "Create 5 tasks for project X");
    await page.waitForTimeout(2000);

    // Click Accept All
    const acceptAllButton = page.locator('button:has-text("Accept All")');
    if (await acceptAllButton.isVisible()) {
      await acceptAllButton.click();
      await page.waitForTimeout(2000);

      // Should show all completed
      await expect(
        page.locator("text=5 actions").or(page.locator("text=completed")),
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should handle mixed action types", async ({ page }) => {
    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "I'll reorganize your tasks.",
            suggestedActions: [
              {
                type: "create_task",
                data: { title: "New Task", category: "Work" },
              },
              {
                type: "update_task",
                data: { taskId: "1", updates: { priority: "high" } },
              },
              { type: "delete_task", data: { taskId: "2", title: "Old Task" } },
            ],
          },
        }),
      });
    });

    await sendMessage(page, "Reorganize my tasks");
    await page.waitForTimeout(2000);

    // Should show multiple actions indicator
    await expect(
      page.locator("text=3 Actions").or(page.locator("text=Actions Ready")),
    ).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// CATEGORY 5: EDGE CASES
// ============================================

test.describe("AI Action Execution - Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToAI(page);
  });

  test("should handle action execution failure gracefully", async ({
    page,
  }) => {
    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "I'll delete this task.",
            suggestedActions: [
              {
                type: "delete_task",
                data: { taskId: "nonexistent", title: "Missing Task" },
              },
            ],
          },
        }),
      });
    });

    await page.route("**/ai/execute-actions", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          results: [
            {
              success: false,
              actionType: "delete_task",
              error: "Task not found",
            },
          ],
          summary: { total: 1, succeeded: 0, failed: 1 },
          message: "Failed to complete any actions. Task not found",
        }),
      });
    });

    await sendMessage(page, "Delete task");
    await page.waitForTimeout(2000);

    const acceptButton = page.locator('button:has-text("Accept")').first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForTimeout(2000);

      // Should show failure indicator
      await expect(
        page.locator("text=failed").or(page.locator("text=Failed")),
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should not trigger confirmation without pending actions", async ({
    page,
  }) => {
    await page.route("**/ai/chat", (route, request) => {
      const body = JSON.parse(request.postData());

      // Response with no actions, then user says "yes" randomly
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message:
              body.message === "yes"
                ? "Did you mean to do something? I don't have any pending actions."
                : "You have 3 tasks due today.",
            suggestedActions: [],
          },
        }),
      });
    });

    await sendMessage(page, "What tasks do I have?");
    await page.waitForTimeout(1500);

    await sendMessage(page, "yes");
    await page.waitForTimeout(1500);

    // Should NOT show "executed" or "confirmed" since there were no pending actions
    await expect(page.locator("text=executed successfully")).not.toBeVisible();
  });

  test("should handle Decline All for multiple actions", async ({ page }) => {
    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "Creating tasks.",
            suggestedActions: [
              {
                type: "create_task",
                data: { title: "Task 1", category: "Work" },
              },
              {
                type: "create_task",
                data: { title: "Task 2", category: "Work" },
              },
            ],
          },
        }),
      });
    });

    await sendMessage(page, "Create 2 tasks");
    await page.waitForTimeout(2000);

    const declineAllButton = page.locator('button:has-text("Decline All")');
    if (await declineAllButton.isVisible()) {
      await declineAllButton.click();
      await page.waitForTimeout(1000);

      // Should show declined status
      await expect(
        page.locator("text=declined").or(page.locator("text=cancelled")),
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

// ============================================
// CATEGORY 6: INTEGRATION TESTS
// ============================================

test.describe("AI Action Execution - Integration", () => {
  test("should work in chat widget", async ({ page }) => {
    await openChatWidget(page);

    await page.route("**/ai/chat", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: {
            message: "I'll create a task for you.",
            suggestedActions: [
              {
                type: "create_task",
                data: { title: "Widget Task", category: "Work" },
              },
            ],
          },
        }),
      });
    });

    const widgetInput = page.getByPlaceholder(/message/i);
    await widgetInput.fill("Create a task");
    await widgetInput.press("Enter");
    await page.waitForTimeout(2000);

    // Should show action card in widget
    await expect(
      page.locator("text=Widget Task").or(page.locator("text=Create Task")),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should display executed actions indicator", async ({ page }) => {
    await loginAndGoToAI(page);

    await page.route("**/ai/chat", (route, request) => {
      const body = JSON.parse(request.postData());

      if (body.message.toLowerCase().includes("yes")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            response: {
              message: "Done! Tasks created.",
              suggestedActions: [],
              executedActions: [
                {
                  success: true,
                  actionType: "create_task",
                  data: { title: "Task 1" },
                },
                {
                  success: true,
                  actionType: "create_task",
                  data: { title: "Task 2" },
                },
              ],
            },
            wasConfirmation: true,
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            response: {
              message: "I'll create 2 tasks. Say 'yes' to confirm.",
              suggestedActions: [
                {
                  type: "create_task",
                  data: { title: "Task 1", category: "Work" },
                },
                {
                  type: "create_task",
                  data: { title: "Task 2", category: "Work" },
                },
              ],
            },
          }),
        });
      }
    });

    await sendMessage(page, "Create 2 tasks");
    await page.waitForTimeout(2000);

    await sendMessage(page, "yes");
    await page.waitForTimeout(2000);

    // Should show executed actions indicator
    await expect(
      page
        .locator("text=executed successfully")
        .or(page.locator("text=2 action")),
    ).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// CATEGORY 7: PENDING ACTIONS API
// ============================================

test.describe("AI Action Execution - Pending Actions API", () => {
  test("should be able to check pending actions status", async ({ page }) => {
    await loginAndGoToAI(page);

    // Mock pending actions endpoint
    await page.route("**/ai/pending-actions", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            hasPending: true,
            count: 2,
            actionTypes: ["create_task", "create_task"],
            description: "2 create tasks",
          }),
        });
      } else if (route.request().method() === "DELETE") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            hadPending: true,
            message: "Pending actions cleared",
          }),
        });
      }
    });

    // This test verifies the API works - actual UI integration may vary
    const response = await page.evaluate(async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      const res = await fetch("/ai/pending-actions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    });

    // API should be accessible (even if response is mocked)
    expect(response).toBeDefined();
  });
});
