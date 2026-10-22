import { expect, test } from "@playwright/test";

test("unauthenticated user is redirected to /sign-in", async ({ page }) => {
  await page.goto("/projects");
  await expect(page).toHaveURL("/sign-in");
});

test("sign-in page renders both OAuth buttons", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
});
