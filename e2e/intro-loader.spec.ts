import { test, expect } from "@playwright/test";

const LOADER = "#homepage-intro-loader";

// The intro used to replay on every homepage mount — including client-side
// navigation back from /about or a case study — locking scroll for ~4s each
// time. It now plays once per tab session (see src/lib/intro-loader.ts).
test.describe("homepage intro loader", () => {
  test("plays on the first homepage visit of a session", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(LOADER)).toBeAttached();
    await page.locator(LOADER).waitFor({ state: "detached", timeout: 15_000 });
  });

  test("does not replay on client-side navigation back to the homepage", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    await page.locator(LOADER).waitFor({ state: "detached", timeout: 15_000 });

    await page.goto("/about");
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#hero")).toBeVisible();
    await expect(page.locator(LOADER)).toHaveCount(0);
  });

  test("a full reload in the same session never paints the overlay", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    await page.locator(LOADER).waitFor({ state: "detached", timeout: 15_000 });

    await page.reload();
    // The server still sends the overlay markup; the <head> script must have
    // hidden it before first paint, and hydration then removes it.
    const display = await page.evaluate((selector) => {
      const node = document.querySelector(selector);
      return node ? getComputedStyle(node).display : "removed";
    }, LOADER);
    expect(["none", "removed"]).toContain(display);
    await expect(page.locator(LOADER)).toHaveCount(0);
  });
});
