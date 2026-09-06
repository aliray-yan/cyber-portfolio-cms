/**
 * test/support/mockChatStream.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Builds a byte-accurate fake of the AI SDK v7 "UI message stream" wire
 * format — the same SSE protocol app/api/chat/route.ts sends via
 * createUIMessageStreamResponse(). Verified against node_modules/ai's own
 * source (JsonToSseTransformStream + UI_MESSAGE_STREAM_HEADERS): each
 * chunk is `data: ${JSON.stringify(chunk)}\n\n`, the stream ends with
 * `data: [DONE]\n\n`, and the response needs the
 * `x-vercel-ai-ui-message-stream: v1` header or useChat's transport won't
 * recognize it as a UI message stream at all.
 *
 * Used by both Vitest (mocking global.fetch — see ChatWidget.test.tsx) and
 * the Playwright e2e test (mocking the network route) so both suites drive
 * the exact same real client-side parser instead of a hand-rolled fake of
 * "what the widget probably does with a response."
 *
 * IMPORTANT: never call the real OpenRouter/AI SDK API in tests. Every
 * chat-related test in this project must go through one of the builders
 * below instead of a live network request.
 */

export const UI_MESSAGE_STREAM_HEADERS = {
  "content-type": "text/event-stream",
  "x-vercel-ai-ui-message-stream": "v1",
};

export function encodeUIMessageStream(chunks: unknown[]): string {
  const body = chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("");
  return `${body}data: [DONE]\n\n`;
}

/** A plain assistant text reply — no tool call. */
export function textReplyChunks(text: string, messageId = "msg-1") {
  const textId = "text-1";
  return [
    { type: "start", messageId },
    { type: "start-step" },
    { type: "text-start", id: textId },
    { type: "text-delta", id: textId, delta: text },
    { type: "text-end", id: textId },
    { type: "finish-step" },
    { type: "finish" },
  ];
}

/**
 * An assistant reply that calls getSkillsRadar and succeeds, matching the
 * real output shape from lib/ai/tools.ts (categories[].skills[].{name,
 * level, score, maxScore}).
 */
export function skillsRadarSuccessChunks({
  toolCallId = "call-1",
  messageId = "msg-1",
  summary = "Here's how his SOC & SIEM skills break down.",
}: { toolCallId?: string; messageId?: string; summary?: string } = {}) {
  const textId = "text-1";
  return [
    { type: "start", messageId },
    { type: "start-step" },
    {
      type: "tool-input-available",
      toolCallId,
      toolName: "getSkillsRadar",
      input: { category: "SOC & SIEM" },
    },
    {
      type: "tool-output-available",
      toolCallId,
      output: {
        categories: [
          {
            title: "SOC & SIEM",
            skills: [
              { name: "Wazuh", level: "Advanced", score: 3, maxScore: 3 },
              { name: "Microsoft Sentinel", level: "Intermediate", score: 2, maxScore: 3 },
            ],
          },
        ],
      },
    },
    { type: "finish-step" },
    { type: "start-step" },
    { type: "text-start", id: textId },
    { type: "text-delta", id: textId, delta: summary },
    { type: "text-end", id: textId },
    { type: "finish-step" },
    { type: "finish" },
  ];
}

/** A mid-stream provider failure — the "error" chunk onError maps to (see route.ts). */
export function midStreamErrorChunks(errorText: string, messageId = "msg-1") {
  return [{ type: "start", messageId }, { type: "start-step" }, { type: "error", errorText }];
}

/** A Response object ready to hand to a fetch mock (Vitest). */
export function mockStreamResponse(chunks: unknown[], init: ResponseInit = {}): Response {
  return new Response(encodeUIMessageStream(chunks), {
    status: 200,
    headers: UI_MESSAGE_STREAM_HEADERS,
    ...init,
  });
}
