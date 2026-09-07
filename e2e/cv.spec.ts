import { test, expect } from "@playwright/test";

// Quill's audit specifically flagged CV worker loading as unverified: PDF.js
// loads its parsing/rendering work off the main thread via a separate worker
// script, which is the kind of thing that looks fine in source but silently
// fails at runtime (wrong worker URL, version mismatch between pdfjs-dist
// and react-pdf, CSP blocking the worker) without a real browser check.
test.describe("CV viewer", () => {
  test("renders the PDF via its worker, with no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/cv");

    // react-pdf renders each page as a <canvas> once PDF.js's worker has
    // parsed and rasterized it — this only appears on a genuinely working
    // worker pipeline, not on a stuck loading state.
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    const canvasHasContent = await canvas.evaluate((el) => {
      const c = el as HTMLCanvasElement;
      return c.width > 0 && c.height > 0;
    });
    expect(canvasHasContent).toBe(true);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("download link points at a real endpoint that serves a PDF", async ({ page, request }) => {
    await page.goto("/cv");
    const downloadLink = page.locator('a[href*="/cv/download"]');
    const href = await downloadLink.getAttribute("href");
    expect(href).toBeTruthy();

    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
  });
});
