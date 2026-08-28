import { defineConfig, devices } from "@playwright/test";

/**
 * E2E against the static export in out/, served by a plain file server.
 * No dev server: this tests the artefact that actually deploys.
 */
/**
 * Some CI images ship a Chromium that does not match the version Playwright
 * expects. Point PLAYWRIGHT_CHROMIUM_PATH at it rather than pinning the
 * package to whatever a given image happens to carry. Unset on a normal
 * machine, where `npx playwright install` provides the right build.
 */
const launchOptions = process.env.PLAYWRIGHT_CHROMIUM_PATH
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 5"], launchOptions } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npx http-server out -p 4321 -s --silent",
        url: "http://127.0.0.1:4321",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
