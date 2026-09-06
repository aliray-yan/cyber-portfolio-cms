import { test, expect } from "@playwright/test";
import {
  encodeUIMessageStream,
  skillsRadarSuccessChunks,
  UI_MESSAGE_STREAM_HEADERS,
} from "../test/support/mockChatStream";

/**
 * e2e/primary-flow.spec.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The flow a recruiter or hiring manager actually takes on this site:
 * land on the homepage, ask the AI assistant a real question about Ali's
 * skills (this portfolio's headline feature), see it answer with a tool
 * call, then move on to browse the project list.
 *
 * /api/chat is mocked at the browser network layer via page.route — the
 * real OpenRouter API is never reached. The mocked body is the same
 * verified SSE fixture used by the Vitest suite (test/support/mockChatStream.ts),
 * so this test and ChatWidget.test.tsx are asserting on the same real
 * client-side parser, just from two different vantage points.
 */

test("visitor asks the AI assistant a question, then browses to Projects", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      headers: UI_MESSAGE_STREAM_HEADERS,
      body: encodeUIMessageStream(skillsRadarSuccessChunks()),
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /cybersecurity student/i })).toBeVisible();

  await page.getByRole("button", { name: /open ai assistant/i }).click();

  await page.getByRole("textbox").fill("What are Ali's SOC & SIEM skills?");
  await page.getByRole("button", { name: /^send$/i }).click();

  // The tool card and the assistant's follow-up text both render from the
  // mocked stream above.
  await expect(page.getByText("Wazuh")).toBeVisible();
  await expect(page.getByText(/here's how his soc & siem skills break down/i)).toBeVisible();

  await page.getByRole("button", { name: /close ai assistant/i }).click();

  await page.getByRole("link", { name: /view my projects/i }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { name: /^projects$/i })).toBeVisible();
});
