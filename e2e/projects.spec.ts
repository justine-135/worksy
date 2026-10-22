import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

test("authenticated user reaches /projects without redirect", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(page).toHaveURL("/projects");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
});

test("filter buttons are visible", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("button", { name: "All" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Owned" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Shared" })).toBeVisible();
});

test("clicking Add project opens the modal", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "Add project" }).click();
  await expect(
    page.getByRole("dialog", { name: "add project modal" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Title" })).toBeVisible();
});

test("can create a project", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "Add project" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill("E2E Test Project");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText("E2E Test Project")).toBeVisible();
});
