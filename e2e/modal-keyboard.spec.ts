import { test, expect } from "@playwright/test";

// Covers Quill's Priority 0 finding: the project-preview modal needs a real
// WAI-ARIA dialog pattern (initial focus, Tab/Shift+Tab containment, Escape,
// focus restoration on close) — role="dialog"/aria-modal alone don't provide
// any of that behavior on their own. See VideoModal.tsx.
test.describe("project preview modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#projects");
  });

  test("opening the modal moves focus inside it, and Tab/Shift+Tab stay contained", async ({ page }) => {
    const trigger = page.locator("[data-project-preview]").first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const dialog = page.locator("[data-video-modal-root]");
    await expect(dialog).toBeVisible();

    // Initial focus lands inside the dialog, not abandoned on <body>.
    const closeButton = page.getByRole("button", { name: "Close preview modal" });
    await expect(closeButton).toBeFocused();

    // Shift+Tab from the first focusable element wraps to the last.
    const focusableInDialog = dialog.locator(
      'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusableInDialog.first();
    const last = focusableInDialog.last();

    await first.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();

    // Tab from the last focusable element wraps back to the first.
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
  });

  test("Escape closes the modal and restores focus to the trigger", async ({ page }) => {
    const trigger = page.locator("[data-project-preview]").first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const dialog = page.locator("[data-video-modal-root]");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("background content is inert while the modal is open", async ({ page }) => {
    const trigger = page.locator("[data-project-preview]").first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const dialog = page.locator("[data-video-modal-root]");
    await expect(dialog).toBeVisible();

    // Every top-level sibling of the modal's own portal root should be
    // inert (unreachable by keyboard/AT) while the dialog is open.
    const nonInertSiblingCount = await page.evaluate(() => {
      const modalRoot = document.querySelector("[data-video-modal-root]");
      return Array.from(document.body.children).filter(
        (el) => el !== modalRoot && !el.hasAttribute("inert") && el.tagName !== "SCRIPT" && el.tagName !== "NEXT-ROUTE-ANNOUNCER" && el.tagName !== "NOSCRIPT",
      ).length;
    });
    expect(nonInertSiblingCount).toBe(0);
  });
});
