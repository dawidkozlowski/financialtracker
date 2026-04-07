import { test, expect } from "@playwright/test";

test("dashboard renders core widgets", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.getByText("Fund Tracker")).toBeVisible();
  await expect(page.getByText("Saldo")).toBeVisible();
  await expect(page.getByText("Dodaj transakcję")).toBeVisible();
});
