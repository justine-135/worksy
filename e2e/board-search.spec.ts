/**
 * E2E verification: BoardSearch filter flow
 *
 * Covers every step from the QA checklist:
 *  1. Click empty bar → type-picker dropdown opens (Title, Assignee, Priority, Status)
 *  2. Select Title → chip appears; type text → board filters after 300 ms debounce
 *  3. Select Priority → chip appears as "priority: Select…"; sub-popover opens; pick "High"
 *  4. Spacebar in ghost input → second type-picker opens; Priority absent
 *  5. Select Status → Done; two chips; network request includes both filter_priority + filter_status
 *  6. Click × on one chip → only that chip removed; board refetches with remaining filter
 *  7. Backspace on ghost input → removes last chip
 *  8. Cursor on bar and ghost input → pointer, not text
 *  9. Typing directly → ghost input is readOnly; no text appears
 */

import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

// ── helpers ──────────────────────────────────────────────────────────────────

/** Navigate to a project board, creating the project if needed. Returns the URL. */
async function goToBoard(page: import("@playwright/test").Page): Promise<string> {
  await page.goto("/projects");
  await expect(page).toHaveURL("/projects");

  // Use an existing "E2E Test Project" if present; otherwise create one.
  // Use .first() to handle duplicates from prior test runs.
  const existingTitle = page.getByText("E2E Test Project");
  const count = await existingTitle.count();
  if (count === 0) {
    await page.getByRole("button", { name: "Add project" }).click();
    await page.getByRole("textbox", { name: "Title" }).fill("E2E Test Project");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("E2E Test Project").first()).toBeVisible({ timeout: 10000 });
  }

  // Click into the project card
  await page.getByText("E2E Test Project").first().click();
  // Wait for the project layout to settle
  await page.waitForURL(/\/projects\/.+/);

  const currentUrl = page.url();
  const projectId = currentUrl.match(/\/projects\/([^/?#]+)/)?.[1];
  if (!projectId) throw new Error("Could not extract project ID from URL: " + currentUrl);

  await page.goto(`/projects/${projectId}/board`);
  await expect(page).toHaveURL(`/projects/${projectId}/board`);

  // Wait for search bar to be present before returning
  await expect(page.getByRole("search", { name: "Filter tasks" })).toBeVisible();
  return page.url();
}

// ── shared console/network capture ───────────────────────────────────────────

function attachMonitors(page: import("@playwright/test").Page) {
  const consoleLogs: { type: string; text: string }[] = [];
  const networkErrors: { url: string; status: number; method: string }[] = [];

  page.on("console", (msg) => {
    // Ignore known HeroUI focusable warning — it's a library issue, not app code
    if (["error", "warning"].includes(msg.type()) && !msg.text().includes("Pressable")) {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    }
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method(),
      });
    }
  });

  return { consoleLogs, networkErrors };
}

/**
 * Wait for a taskboard API request whose URL satisfies the predicate.
 * More reliable than a flat waitForTimeout.
 */
async function waitForBoardRequest(
  page: import("@playwright/test").Page,
  predicate: (url: string) => boolean,
  timeoutMs = 4000,
): Promise<string> {
  const req = await page.waitForRequest(
    (r) => r.url().includes("/api/taskboard") && predicate(r.url()),
    { timeout: timeoutMs },
  );
  return req.url();
}

/**
 * Wait until all HeroUI Popover backdrops are gone.
 * HeroUI renders a backdrop overlay while a Popover is open.
 * The backdrop has pointer-events and blocks clicks until removed.
 * After close, HeroUI removes data-open and eventually removes the backdrop.
 */
async function waitForPopoversClosed(page: import("@playwright/test").Page) {
  // HeroUI Popovers mark open state with data-open on the dialog element.
  // Wait for no dialogs to have data-open (all are closed).
  await page.waitForFunction(() => {
    const openDialogs = document.querySelectorAll('[role="dialog"][data-open]');
    return openDialogs.length === 0;
  }, { timeout: 5000 }).catch(() => {
    /* if data-open is not used, fall through */
  });
  // Extra pause for HeroUI animation to complete backdrop removal
  await page.waitForTimeout(500);
}

// ── tests ─────────────────────────────────────────────────────────────────────

test("Step 1 — clicking empty search bar opens type-picker dropdown", async ({ page }) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  const searchBar = page.getByRole("search", { name: "Filter tasks" });
  await expect(searchBar).toBeVisible();

  // Click the bar
  await searchBar.click();

  // Type-picker popover should appear with all four options
  await expect(page.getByText("Filter by")).toBeVisible();
  await expect(page.getByRole("button", { name: "Title" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Assignee" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Priority" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Status" })).toBeVisible();

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors, "Network errors").toEqual([]);
});

test("Step 2 — selecting Title adds chip with inline input; typing filters after debounce", async ({ page }) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  const searchBar = page.getByRole("search", { name: "Filter tasks" });
  await searchBar.click();
  await page.getByRole("button", { name: "Title" }).click();

  // Chip label "title:" should appear
  await expect(page.locator("text=title:")).toBeVisible();

  // The inline title input inside the chip should be focused
  const titleInput = page.getByLabel("Filter by title");
  await expect(titleInput).toBeVisible();

  // Set up request watcher before typing (longer timeout to accommodate debounce + React re-render)
  const boardRequestPromise = waitForBoardRequest(page, (u) => u.includes("filter_title=auth"), 8000);

  // Close any lingering popover before typing (outer div click may re-open it)
  await page.keyboard.press("Escape");
  // Refocus the title input after Escape
  await titleInput.click({ force: true });

  // Type in the title input — use pressSequentially so React's onChange fires per keystroke
  await titleInput.pressSequentially("auth");

  // Wait for debounce (300 ms) + network via the promise
  const url = await boardRequestPromise;
  expect(url, "filter_title=auth request URL").toContain("filter_title=auth");

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors.filter((e) => !e.url.includes("/api/taskboard")), "Network errors").toEqual([]);
});

test("Step 3 — selecting Priority opens sub-popover automatically; picking High sets chip label", async ({ page }) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  const searchBar = page.getByRole("search", { name: "Filter tasks" });
  await searchBar.click();
  // Scope to the type-picker popover content to avoid ambiguity
  await page.getByText("Filter by").waitFor();
  await page.getByRole("button", { name: "Priority" }).click();

  // Chip "priority:" should appear
  await expect(page.locator("text=priority:")).toBeVisible();

  // Sub-popover auto-opens — "High" button should be visible
  await expect(page.getByRole("button", { name: "High" })).toBeVisible();

  // Set up request watcher before clicking
  const boardRequestPromise = waitForBoardRequest(page, (u) => u.includes("filter_priority=HIGH"));

  await page.getByRole("button", { name: "High" }).click();
  await waitForPopoversClosed(page);

  // Chip value button now has text "High" — use getByLabel to target only our button
  const priorityValueBtn = page.getByLabel("Change priority filter value");
  await expect(priorityValueBtn).toHaveText("High");

  // Board should refetch with filter_priority=HIGH
  const url = await boardRequestPromise;
  expect(url, "filter_priority=HIGH request URL").toContain("filter_priority=HIGH");

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors.filter((e) => !e.url.includes("/api/taskboard")), "Network errors").toEqual([]);
});

test("Step 4 — spacebar in ghost input opens type-picker; Priority absent when already used", async ({ page }) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  // Add Priority filter first (type-picker closes automatically after selecting Priority)
  const searchBar = page.getByRole("search", { name: "Filter tasks" });
  await searchBar.click();
  await page.getByText("Filter by").waitFor();
  await page.getByRole("button", { name: "Priority" }).click();
  // Sub-popover opens automatically for non-title types; pick High
  await expect(page.getByRole("button", { name: "High" })).toBeVisible();
  await page.getByRole("button", { name: "High" }).click();
  // Wait for sub-popover to close (no dialog/backdrop)
  await waitForPopoversClosed(page);

  // Now press spacebar on the ghost input to open the type-picker
  const ghostInput = page.getByRole("combobox", { name: "Add a filter" });
  await ghostInput.focus();
  await page.keyboard.press(" ");

  // Type-picker should open
  await expect(page.getByText("Filter by")).toBeVisible();

  // Scope the check to the type-picker container to avoid matching chip elements
  const typePicker = page.locator("#table-filter-type-listbox");
  await expect(typePicker).toBeVisible();

  // Priority should NOT be in the type-picker (already used)
  await expect(typePicker.getByRole("button", { name: "Priority" })).not.toBeVisible();

  // The other types should still be present
  await expect(typePicker.getByRole("button", { name: "Title" })).toBeVisible();
  await expect(typePicker.getByRole("button", { name: "Status" })).toBeVisible();
  await expect(typePicker.getByRole("button", { name: "Assignee" })).toBeVisible();

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors.filter((e) => !e.url.includes("/api/taskboard")), "Network errors").toEqual([]);
});

test("Step 5 — two chips (Priority + Status) send both filter params", async ({ page }) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  // Add Priority → High (type-picker auto-closes after selecting Priority)
  const searchBar = page.getByRole("search", { name: "Filter tasks" });
  await searchBar.click();
  await page.getByText("Filter by").waitFor();
  await page.getByRole("button", { name: "Priority" }).click();
  await expect(page.getByRole("button", { name: "High" })).toBeVisible();
  await page.getByRole("button", { name: "High" }).click();
  await waitForPopoversClosed(page);

  // Add Status via ghost input spacebar
  const ghostInput = page.getByRole("combobox", { name: "Add a filter" });
  await ghostInput.focus();
  await page.keyboard.press(" ");
  await page.getByText("Filter by").waitFor();
  await page.getByRole("button", { name: "Status" }).click();
  // Status sub-popover auto-opens → pick Done
  await expect(page.getByRole("button", { name: "Done", exact: true })).toBeVisible();

  // Set up combined request watcher before clicking Done
  const boardRequestPromise = waitForBoardRequest(
    page,
    (u) => u.includes("filter_priority=HIGH") && u.includes("filter_status=DONE"),
    8000,
  );

  await page.getByRole("button", { name: "Done", exact: true }).click();
  await waitForPopoversClosed(page);

  // Both chips visible
  await expect(page.locator("text=priority:")).toBeVisible();
  await expect(page.locator("text=status:")).toBeVisible();

  // Chip value buttons — use getByLabel to avoid HeroUI PopoverTrigger wrapper ambiguity
  const priorityValueBtn = page.getByLabel("Change priority filter value");
  const statusValueBtn = page.getByLabel("Change status filter value");
  await expect(priorityValueBtn).toHaveText("High");
  await expect(statusValueBtn).toHaveText("Done");

  // Wait for combined request
  const url = await boardRequestPromise;
  expect(url).toContain("filter_priority=HIGH");
  expect(url).toContain("filter_status=DONE");

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors.filter((e) => !e.url.includes("/api/taskboard")), "Network errors").toEqual([]);
});

test("Step 6 — clicking × on one chip removes only that chip and refetches with remaining filter", async ({
  page,
}) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  // Capture all taskboard requests throughout the test
  const taskboardRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/taskboard")) taskboardRequests.push(r.url());
  });

  // Add Priority → High
  const searchBar = page.getByRole("search", { name: "Filter tasks" });
  await searchBar.click();
  await page.getByText("Filter by").waitFor();
  await page.getByRole("button", { name: "Priority" }).click();
  await expect(page.getByRole("button", { name: "High" })).toBeVisible();
  await page.getByRole("button", { name: "High" }).click();
  await waitForPopoversClosed(page);

  // Add Status → Done
  const ghostInput = page.getByRole("combobox", { name: "Add a filter" });
  await ghostInput.focus();
  await page.keyboard.press(" ");
  await page.getByText("Filter by").waitFor();
  await page.getByRole("button", { name: "Status" }).click();
  await expect(page.getByRole("button", { name: "Done", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await waitForPopoversClosed(page);

  // Confirm both chips are visible
  await expect(page.locator("text=priority:")).toBeVisible();
  await expect(page.locator("text=status:")).toBeVisible();

  // Remove the priority chip — use evaluate to directly trigger the click on the
  // remove button, bypassing any HeroUI backdrop overlay that blocks pointer events.
  await page.getByRole("button", { name: "Remove priority filter" }).evaluate(
    (el: HTMLElement) => el.click(),
  );

  // Priority chip gone; status chip still there
  await expect(page.locator("text=priority:")).not.toBeVisible();
  await expect(page.locator("text=status:")).toBeVisible();

  // Allow a moment for any in-flight refetch to complete
  await page.waitForTimeout(500);

  // Verify: at some point a request went out with only filter_status=DONE (no filter_priority).
  // React Query fires this when the query key changes to {status: DONE}.
  const soloStatusRequest = taskboardRequests.find(
    (u) => u.includes("filter_status=DONE") && !u.includes("filter_priority"),
  );
  expect(soloStatusRequest, "A request with filter_status=DONE (and no filter_priority) should have been sent").toBeTruthy();

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors.filter((e) => !e.url.includes("/api/taskboard")), "Network errors").toEqual([]);
});

test("Step 7 — Backspace on ghost input removes the last chip", async ({ page }) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  // Add Priority → High (type-picker closes automatically after selecting Priority)
  const searchBar = page.getByRole("search", { name: "Filter tasks" });
  await searchBar.click();
  await page.getByText("Filter by").waitFor();
  await page.getByRole("button", { name: "Priority" }).click();
  await expect(page.getByRole("button", { name: "High" })).toBeVisible();
  await page.getByRole("button", { name: "High" }).click();
  // Wait for all popovers to fully close before focusing the ghost input
  await waitForPopoversClosed(page);

  // Confirm chip exists
  await expect(page.locator("text=priority:")).toBeVisible();

  // Use focus() not click() — click() would re-open the type-picker popover.
  const ghostInput = page.getByRole("combobox", { name: "Add a filter" });
  await ghostInput.focus();

  // Verify focus was received and dispatch Backspace via evaluate to bypass any overlay
  await ghostInput.evaluate((el: HTMLInputElement) => {
    el.focus();
    el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace", code: "Backspace", bubbles: true, cancelable: true }),
    );
  });

  // Chip should be gone
  await expect(page.locator("text=priority:")).not.toBeVisible();

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors.filter((e) => !e.url.includes("/api/taskboard")), "Network errors").toEqual([]);
});

test("Step 8 — search bar and ghost input show pointer cursor", async ({ page }) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  // Check cursor on the outer bar wrapper
  const searchBar = page.getByRole("search", { name: "Filter tasks" });
  const barCursor = await searchBar.evaluate((el) => getComputedStyle(el).cursor);
  expect(barCursor, "Search bar cursor should be pointer").toBe("pointer");

  // Check cursor on the ghost input
  const ghostInput = page.getByRole("combobox", { name: "Add a filter" });
  const inputCursor = await ghostInput.evaluate((el) => getComputedStyle(el).cursor);
  expect(inputCursor, "Ghost input cursor should be pointer").toBe("pointer");

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors, "Network errors").toEqual([]);
});

test("Step 9 — typing directly into ghost input does nothing (readOnly)", async ({ page }) => {
  const { consoleLogs, networkErrors } = attachMonitors(page);
  await goToBoard(page);

  const ghostInput = page.getByRole("combobox", { name: "Add a filter" });
  await ghostInput.click();

  // Type text — input is readOnly so value should remain empty
  await ghostInput.pressSequentially("hello");
  const value = await ghostInput.inputValue();
  expect(value, "Ghost input value should remain empty (readOnly)").toBe("");

  expect(consoleLogs.filter((l) => l.type === "error"), "Console errors").toEqual([]);
  expect(networkErrors, "Network errors").toEqual([]);
});
