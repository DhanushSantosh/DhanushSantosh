import { test, expect, type Page } from "@playwright/test";

// Diagnosed directly, not guessed: a trivial `page.evaluate(() => 1 + 1)`
// round-trip on this homepage (hero sculpture mounted, WebGL rendering)
// measured 1-4+ seconds under load on the shared dev machine this was
// investigated on (load average ~7 on 4 cores) — the same page's /cv route,
// with no <Canvas>, round-trips in single-digit ms. That main-thread
// contention, not click interception (elementFromPoint resolved correctly
// to the link itself throughout), is what made Playwright's click
// actionability retries occasionally exceed the default 30s budget — GitHub
// Actions' own isolated runners don't carry this contention and pass this
// same suite reliably. Rather than just raising the timeout and hoping,
// this explicitly waits for the main thread to demonstrably be responsive
// before attempting the interaction, so the test still fails for real if
// the page genuinely never recovers.
async function waitForMainThreadResponsive(page: Page, { withinMs = 500, overallTimeoutMs = 20_000 } = {}) {
  const deadline = Date.now() + overallTimeoutMs;
  for (;;) {
    const start = Date.now();
    await page.evaluate(() => 1 + 1);
    if (Date.now() - start <= withinMs) return;
    if (Date.now() > deadline) return; // let the subsequent action fail on its own terms
  }
}

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
    // A single page.evaluate() round-trip itself can exceed several seconds
    // under the contention described above — waitForMainThreadResponsive's
    // own polling loop needs real budget to work with, not just the click
    // action. Bounded, not unlimited: this still fails for real if the page
    // never recovers within a minute and a half.
    test.setTimeout(90_000);
    await page.goto("/");
    // HomepageIntroLoader is a fullscreen fixed overlay (z-[9999]) for its
    // ~3-7s sequence before it unmounts — Quill's independent review saw
    // this exact click intermittently intercepted/timeout, most likely
    // Playwright's actionability retry racing that overlay closer to its
    // own default timeout than is reliable. Waiting for it to detach first,
    // like the Back-navigation test below already does, removes that race
    // instead of hoping the retry window is wide enough.
    await page.locator("#homepage-intro-loader").waitFor({ state: "detached", timeout: 10_000 }).catch(() => {});
    await waitForMainThreadResponsive(page);
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
