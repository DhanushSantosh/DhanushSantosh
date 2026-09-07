import { test, expect } from "@playwright/test";

// Two different failure modes get conflated if you only test one of them:
// scripting genuinely disabled (covered by <noscript> in layout.tsx), and JS
// enabled but the bundle failing to execute (which <noscript> can't reach at
// all, since <noscript> only activates when scripting is off). This file
// covers the first, real no-JS case directly; Reveal.tsx's initial={false}
// fix (c9f2d69) is what makes core content visible-by-default regardless of
// which failure mode applies, verified here via a genuine no-JS browser
// context rather than by reasoning about the source alone.
test.describe("no-JS degradation", () => {
  test.use({ javaScriptEnabled: false });

  test("hero heading, nav, and primary CTAs are visible with JS disabled", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "View Work", exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact", exact: true }).first()).toBeVisible();
  });

  test("sections below the fold render at full opacity, not stuck hidden by Reveal", async ({ page }) => {
    await page.goto("/");

    const revealed = page.locator(".will-change-transform").first();
    await expect(revealed).toBeVisible();
    const opacity = await revealed.evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
  });

  test("the skip-navigation link and main landmark are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#main-content")).toBeAttached();
    await expect(page.locator('a[href="#main-content"]')).toBeAttached();
  });
});
