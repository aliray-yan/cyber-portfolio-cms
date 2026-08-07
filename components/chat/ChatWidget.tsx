"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import ChatMessage from "./ChatMessage";
import { useAutoScroll } from "./useAutoScroll";
import Button from "@/components/ui/Button";

const SUGGESTED_PROMPTS = [
  "What projects has Ali built?",
  "What's Ali's SOC / blue team experience?",
  "What is a SIEM, in plain terms?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const { messages, sendMessage, status, stop, error, clearError } = useChat();
  const { containerRef, isPinned, handleScroll, scrollToBottom } =
    useAutoScroll(messages);

  const isBusy = status === "submitted" || status === "streaming";

  function submitMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const lastMessage = messages[messages.length - 1];

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        className="focus-ring fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 text-navy-950 shadow-lg shadow-cyan-400/30 transition-transform hover:scale-105"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12a8.96 8.96 0 0 1-1.05 4.22L21 21l-5.11-1.07A8.97 8.97 0 0 1 12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9Z"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex h-dvh w-dvw flex-col bg-navy-950 md:inset-auto md:bottom-24 md:right-6 md:h-[32rem] md:w-96 md:rounded-lg md:border md:border-navy-800 md:shadow-2xl">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-navy-800 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Ask about Ali
              </p>
              <p className="text-xs text-slate-400">
                Projects, skills &amp; cybersecurity Q&amp;A
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="focus-ring rounded p-1 text-slate-400 hover:text-slate-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Message list */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="relative flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Ask me anything about Ali&apos;s projects, skills, or
                  cybersecurity in general.
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => submitMessage(prompt)}
                      className="justify-start border border-navy-800 text-left font-normal hover:border-cyan-400"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const isLast = message.id === lastMessage?.id;
              const textContent = message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("");
              const showThinking =
                isLast &&
                message.role === "assistant" &&
                isBusy &&
                textContent.length === 0;

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  showThinking={showThinking}
                />
              );
            })}

            {error && (
              <div className="rounded-lg border border-coral-500/30 bg-navy-900 px-4 py-2.5 text-xs text-coral-500">
                Something went wrong reaching the assistant.{" "}
                <button
                  type="button"
                  onClick={() => clearError()}
                  className="underline"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Jump to latest */}
          {!isPinned && (
            <div className="flex shrink-0 justify-center border-t border-navy-800 bg-navy-950 py-1.5">
              <button
                type="button"
                onClick={scrollToBottom}
                className="focus-ring rounded-full border border-navy-800 bg-navy-900 px-3 py-1 text-xs text-cyan-400 shadow"
              >
                Jump to latest ↓
              </button>
            </div>
          )}

          {/* Input */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex shrink-0 items-end gap-2 border-t border-navy-800 p-3"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              className="focus-ring max-h-24 min-h-[2.5rem] flex-1 resize-none rounded border border-navy-800 bg-navy-900 px-3 py-2 text-slate-100 placeholder:text-slate-400"
              style={{ fontSize: "16px" }} // 16px avoids iOS Safari auto-zoom on focus
            />
            {isBusy ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => stop()}
                className="shrink-0"
              >
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={!input.trim()}
                className="shrink-0"
              >
                Send
              </Button>
            )}
          </form>
        </div>
      )}
    </>
  );
}
