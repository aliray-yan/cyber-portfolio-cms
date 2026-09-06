import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import ChatMessage from "./ChatMessage";
import type { PortfolioUIMessage } from "@/lib/ai/message-types";

/**
 * ChatMessage renders every part type a message can carry: plain text
 * (user and assistant), tool-* parts (delegated to ToolPart — see
 * SkillsRadarPart.test.tsx for that half), and the "nothing has arrived
 * yet" thinking state. Queries go through role/label/text, matching the
 * brief: renaming a class here shouldn't be able to break these.
 */

const noopAddToolResult = vi.fn() as unknown as ComponentProps<typeof ChatMessage>["addToolResult"];

function userMessage(text: string): PortfolioUIMessage {
  return {
    id: "user-1",
    role: "user",
    parts: [{ type: "text", text }],
  } as PortfolioUIMessage;
}

function assistantMessage(text: string): PortfolioUIMessage {
  return {
    id: "assistant-1",
    role: "assistant",
    parts: [{ type: "text", text }],
  } as PortfolioUIMessage;
}

describe("ChatMessage", () => {
  it("renders a visitor's own message text", () => {
    render(
      <ChatMessage
        message={userMessage("What has Ali built with Wazuh?")}
        showThinking={false}
        addToolResult={noopAddToolResult}
      />,
    );

    expect(screen.getByText("What has Ali built with Wazuh?")).toBeInTheDocument();
  });

  it("renders the assistant's reply text", () => {
    render(
      <ChatMessage
        message={assistantMessage("He's built several Wazuh detection rules.")}
        showThinking={false}
        addToolResult={noopAddToolResult}
      />,
    );

    expect(screen.getByText("He's built several Wazuh detection rules.")).toBeInTheDocument();
  });

  it("shows an accessible 'responding' status while nothing has streamed in yet", () => {
    const emptyAssistantMessage: PortfolioUIMessage = {
      id: "assistant-2",
      role: "assistant",
      parts: [],
    } as unknown as PortfolioUIMessage;

    render(
      <ChatMessage
        message={emptyAssistantMessage}
        showThinking
        addToolResult={noopAddToolResult}
      />,
    );

    expect(screen.getByRole("status", { name: /assistant is responding/i })).toBeInTheDocument();
  });

  it("does not render an empty bubble for a text part with no content yet", () => {
    // A text part can arrive with an empty string before its first delta —
    // ChatMessage explicitly skips rendering a bubble for it (see the
    // `if (!part.text) return null` guard) so a blank box never flashes in.
    const streamingMessage: PortfolioUIMessage = {
      id: "assistant-3",
      role: "assistant",
      parts: [{ type: "text", text: "" }],
    } as unknown as PortfolioUIMessage;

    const { container } = render(
      <ChatMessage message={streamingMessage} showThinking={false} addToolResult={noopAddToolResult} />,
    );

    // Nothing but the outer flex wrapper should be present.
    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  it("routes a tool-* part to ToolPart instead of treating it as text", () => {
    const toolMessage: PortfolioUIMessage = {
      id: "assistant-4",
      role: "assistant",
      parts: [
        {
          type: "tool-getSkillsRadar",
          toolCallId: "call-1",
          state: "output-available",
          input: {},
          output: {
            categories: [
              { title: "SOC & SIEM", skills: [{ name: "Wazuh", level: "Advanced", score: 3, maxScore: 3 }] },
            ],
          },
        },
      ],
    } as unknown as PortfolioUIMessage;

    render(<ChatMessage message={toolMessage} showThinking={false} addToolResult={noopAddToolResult} />);

    expect(screen.getByText(/get_skills_radar/i)).toBeInTheDocument();
    expect(screen.getByText("Wazuh")).toBeInTheDocument();
  });
});
