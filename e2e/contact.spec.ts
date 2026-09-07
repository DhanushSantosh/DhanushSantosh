import { test, expect } from "@playwright/test";

// EmailTemplateButton was rewritten this audit from a UA-sniffing
// Gmail-forcing button with an invalid <a>-nested-in-<button> to a plain
// mailto: link plus a separate, real copy button — this exercises both
// halves against a real browser rather than just reading the source.
test.describe("contact", () => {
  test("uses a real mailto: link, not a forced webmail redirect", async ({ page }) => {
    await page.goto("/#contact");
    const mailLink = page.locator('a[href^="mailto:"]').first();
    await expect(mailLink).toBeVisible();
    const href = await mailLink.getAttribute("href");
    expect(href).toMatch(/^mailto:[^?]+\?subject=/);
  });

  test("the copy button copies the email address to the clipboard", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Clipboard permissions API is Chromium-only in Playwright");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/#contact");

    const copyButton = page.getByRole("button", { name: /copy email address/i });
    await copyButton.scrollIntoViewIfNeeded();
    await copyButton.click();

    await expect(page.getByRole("button", { name: "Email address copied" })).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("@");
  });
});
