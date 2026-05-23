import { expect, test } from "@playwright/test";

test("private routes redirect unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/people");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("admin route redirects unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("private media APIs reject unauthenticated visitors", async ({ request }) => {
  const approvedMedia = await request.get("/api/media/missing-media");
  const proposedMedia = await request.get("/api/proposal-media/missing-proposal");

  expect(approvedMedia.status()).toBe(401);
  expect(proposedMedia.status()).toBe(401);
});

test("login page is public", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
