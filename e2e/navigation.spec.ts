import { test, expect } from "@playwright/test";

// ScrollReset used to force scroll-to-top unconditionally on every mount,
// which broke both of these real navigation paths — landing directly on a
// URL with a hash fragment, and the browser Back button restoring scroll
// position. See ScrollReset.tsx's own comment for the fix; this exercises
// the actual behavior in a real browser rather than re-reading the source.
test.describe("navigation", () => {
  test("landing directly on a hash URL scrolls to that section, not the top", async ({ page }) => {
    await page.goto("/about#experience");
    const experienceSection = page.locator("#experience");
    await expect(experienceSection).toBeInViewport({ timeout: 5000 });
  });

  test("clicking an anchor nav link updates the URL hash and scrolls to it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Contact", exact: true }).first().click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport({ timeout: 5000 });
  });

  test("browser Back restores the previous scroll position instead of jumping to top", async ({ page }) => {
    // Deliberately scroll by raw pixels rather than via a hash link, so this
    // exercises the navigationEntry.type === "back_forward" guard on its
    // own — separately from the hash-guard covered by the tests above.
    await page.goto("/");
    // HomepageIntroLoader locks body scroll (overflow: hidden) for its
    // ~3-7s sequence; scrolling has to wait for it to finish, same as a
    // real visitor would.
    await page.locator("#homepage-intro-loader").waitFor({ state: "detached", timeout: 10_000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "auto" }));
    await page.waitForTimeout(200);
    const scrollYBeforeLeaving = await page.evaluate(() => window.scrollY);
    expect(scrollYBeforeLeaving).toBeGreaterThan(400);

    await page.goto("/about");
    await expect(page.locator("h1")).toBeVisible();

    await page.goBack();
    await page.waitForLoadState("load");
    await page.waitForTimeout(300);
    const scrollYAfterBack = await page.evaluate(() => window.scrollY);
    // Not asserting an exact pixel match (layout can shift slightly between
    // runs) — just that Back genuinely restored a scrolled position rather
    // than resetting to 0, which is what the unconditional-reset bug did.
    expect(scrollYAfterBack).toBeGreaterThan(300);
  });
});
