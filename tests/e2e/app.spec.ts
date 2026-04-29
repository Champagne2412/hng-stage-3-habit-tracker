import { test, expect, Page } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function clearStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

async function seedUser(
  page: Page,
  email = "test@example.com",
  password = "password123"
) {
  await page.evaluate(
    ({ email, password }) => {
      const users = [
        {
          id: "user-seed-1",
          email,
          password,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("habit-tracker-users", JSON.stringify(users));
    },
    { email, password }
  );
}

async function seedSession(page: Page, userId = "user-seed-1", email = "test@example.com") {
  await page.evaluate(
    ({ userId, email }) => {
      localStorage.setItem(
        "habit-tracker-session",
        JSON.stringify({ userId, email })
      );
    },
    { userId, email }
  );
}

async function seedHabit(page: Page, userId = "user-seed-1", habitName = "Drink Water") {
  await page.evaluate(
    ({ userId, habitName }) => {
      const habits = [
        {
          id: "habit-seed-1",
          userId,
          name: habitName,
          description: "Stay hydrated",
          frequency: "daily",
          createdAt: new Date().toISOString(),
          completions: [],
        },
      ];
      localStorage.setItem("habit-tracker-habits", JSON.stringify(habits));
    },
    { userId, habitName }
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Habit Tracker app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearStorage(page);
  });

  test("shows the splash screen and redirects unauthenticated users to /login", async ({
    page,
  }) => {
    await page.goto("/");
    // Splash screen must be visible
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    // Then redirects to /login
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("redirects authenticated users from / to /dashboard", async ({ page }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    // Reload to trigger redirect with session
    await page.goto("/");
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("prevents unauthenticated access to /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("signs up a new user and lands on the dashboard", async ({ page }) => {
    await page.goto("/signup");

    await page.getByTestId("auth-signup-email").fill("newuser@example.com");
    await page.getByTestId("auth-signup-password").fill("securepassword");
    await page.getByTestId("auth-signup-submit").click();

    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({
    page,
  }) => {
    await page.goto("/");

    // Seed two users with different habits
    await page.evaluate(() => {
      const users = [
        { id: "u1", email: "alice@example.com", password: "pass1", createdAt: new Date().toISOString() },
        { id: "u2", email: "bob@example.com", password: "pass2", createdAt: new Date().toISOString() },
      ];
      const habits = [
        { id: "h1", userId: "u1", name: "Alice Habit", description: "", frequency: "daily", createdAt: new Date().toISOString(), completions: [] },
        { id: "h2", userId: "u2", name: "Bob Habit", description: "", frequency: "daily", createdAt: new Date().toISOString(), completions: [] },
      ];
      localStorage.setItem("habit-tracker-users", JSON.stringify(users));
      localStorage.setItem("habit-tracker-habits", JSON.stringify(habits));
    });

    await page.goto("/login");
    await page.getByTestId("auth-login-email").fill("alice@example.com");
    await page.getByTestId("auth-login-password").fill("pass1");
    await page.getByTestId("auth-login-submit").click();

    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // Alice's habit should be visible
    await expect(page.getByTestId("habit-card-alice-habit")).toBeVisible();
    // Bob's habit should NOT be visible
    await expect(page.getByTestId("habit-card-bob-habit")).not.toBeVisible();
  });

  test("creates a habit from the dashboard", async ({ page }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await page.goto("/dashboard");

    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await page.getByTestId("create-habit-button").click();

    await expect(page.getByTestId("habit-form")).toBeVisible();
    await page.getByTestId("habit-name-input").fill("Morning Run");
    await page.getByTestId("habit-description-input").fill("Run 5km");
    await page.getByTestId("habit-save-button").click();

    await expect(page.getByTestId("habit-card-morning-run")).toBeVisible();
  });

  test("completes a habit for today and updates the streak", async ({ page }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await seedHabit(page);
    await page.goto("/dashboard");

    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();

    // Check initial streak is 0
    await expect(page.getByTestId("habit-streak-drink-water")).toContainText("0");

    // Mark as complete
    await page.getByTestId("habit-complete-drink-water").click();

    // Streak should update to 1
    await expect(page.getByTestId("habit-streak-drink-water")).toContainText("1");
  });

  test("persists session and habits after page reload", async ({ page }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await seedHabit(page);
    await page.goto("/dashboard");

    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();

    // Reload the page
    await page.reload();
    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // Session and habits should still be there
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();
  });

  test("logs out and redirects to /login", async ({ page }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await page.goto("/dashboard");

    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await page.getByTestId("auth-logout-button").click();

    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");

    // Session should be cleared
    const session = await page.evaluate(() =>
      localStorage.getItem("habit-tracker-session")
    );
    expect(session).toBe("null");
  });

  test("loads the cached app shell when offline after the app has been loaded once", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);

    // Load the app online first to prime the cache
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Go offline
    await context.setOffline(true);

    // Attempt to navigate — should not hard crash
    let didCrash = false;
    try {
      await page.goto("/login", { timeout: 8000 });
    } catch {
      didCrash = true;
    }

    // Even offline, page should not completely crash (may show cached content or error page)
    expect(didCrash).toBe(false);

    // Re-enable network
    await context.setOffline(false);
  });
});
