import { expect, test } from "@playwright/test";

test("private routes redirect unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/people");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("login page is public", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
