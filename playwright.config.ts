import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

// In CI this boots a real production build (matching Quill's audit note to
// "measure normal URLs" — the actual served app, not a dev-only artifact)
// and reuses nothing, so every run starts clean. Locally it reuses whatever
// dev server is already running on this port for fast iteration; start one
// with `npm run dev -- --port 3100` before `npm run test:e2e` if none is up
// (Playwright will also start one itself on demand otherwise).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI ? `npm run build && npm run start -- --port ${PORT}` : `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
