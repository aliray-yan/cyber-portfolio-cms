import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWidget from "./ChatWidget";
import { mockStreamResponse, textReplyChunks } from "@/test/support/mockChatStream";

/**
 * ChatWidget.test.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * This is the network-level half of "chat component tested across
 * pending, streaming, and error states" — it drives the REAL useChat hook
 * through a mocked global.fetch (never the real OpenRouter API), using
 * the exact SSE wire format app/api/chat/route.ts sends (see
 * test/support/mockChatStream.ts). Component-only states (a single
 * tool-part's own lifecycle) are covered separately in
 * tool-parts/SkillsRadarPart.test.tsx.
 *
 * Everything here is queried the way a visitor would find it: button
 * text, placeholder text, and the alert role — never a class or test id.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

async function openWidgetAndSend(text: string) {
  const user = userEvent.setup();
  render(<ChatWidget />);

  await user.click(screen.getByRole("button", { name: /open ai assistant/i }));
  await user.type(screen.getByRole("textbox"), text);
  await user.click(screen.getByRole("button", { name: /^send$/i }));
  return user;
}

describe("ChatWidget", () => {
  it("shows suggested prompts before any message has been sent", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole("button", { name: /open ai assistant/i }));

    expect(screen.getByText(/show me his security projects/i)).toBeInTheDocument();
  });

  it("pending/streaming: disables input and shows Stop while waiting on a reply", async () => {
    let resolveFetch!: (response: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );

    await openWidgetAndSend("What has Ali built with Wazuh?");

    // The request is still in flight — sendMessage flips status to
    // "submitted" synchronously, well before the mocked fetch above ever
    // resolves, so this is a genuine assertion of the busy state and not
    // a race against real network timing.
    expect(await screen.findByRole("button", { name: /^stop$/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/waiting for response/i)).toBeInTheDocument();

    // Let the in-flight request resolve so it doesn't leak into the next test.
    resolveFetch(mockStreamResponse(textReplyChunks("He's built several Wazuh detection rules.")));
    expect(await screen.findByText(/he's built several wazuh detection rules/i)).toBeInTheDocument();
  });

  it("on a completed reply: shows the assistant's text and returns to the ready state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => mockStreamResponse(textReplyChunks("He's built several Wazuh detection rules."))),
    );

    await openWidgetAndSend("What has Ali built with Wazuh?");

    expect(await screen.findByText(/he's built several wazuh detection rules/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^send$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^stop$/i })).not.toBeInTheDocument();
  });

  it("error: shows the server's own message as an accessible alert, with Retry and Dismiss", async () => {
    // Mirrors app/api/chat/route.ts's real setup-failure path: a plain
    // non-2xx response whose body text becomes error.message verbatim.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("No message to respond to.", { status: 400 })),
    );

    await openWidgetAndSend("hello");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/no message to respond to/i);
    expect(screen.getByRole("button", { name: /^retry$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
  });

  it("dismissing an error clears the alert", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("No message to respond to.", { status: 400 })),
    );

    const user = await openWidgetAndSend("hello");
    await screen.findByRole("alert");

    await user.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
