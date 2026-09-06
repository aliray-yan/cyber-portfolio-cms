import { defineConfig, devices } from "@playwright/test";

/**
 * playwright.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * webServer runs a real production build (`next build && next start`),
 * not `next dev` — closer to what's actually deployed on Vercel, and
 * avoids dev-mode compile-on-first-request making the very first test
 * flaky on a cold start. reuseExistingServer locally means `npm run dev`
 * already running on :3000 is used as-is instead of spawning a second one.
 *
 * No test here ever reaches the real AI provider — see e2e/primary-flow.spec.ts,
 * which mocks /api/chat at the network layer before it can leave the browser.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
