import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import SkillsRadarPart from "./SkillsRadarPart";

/**
 * The chat brief's "one tool-result component" pick, and also where the
 * "pending, streaming, and error states" evaluation criterion is covered:
 * getSkillsRadar is the one tool in lib/ai/tools.ts that can genuinely
 * fail (an unknown skill category throws), so it's the tool with a real,
 * reproducible output-error path rather than a simulated one.
 *
 * Every case builds the exact part shape ToolPart hands down for that
 * lifecycle state (see lib/ai/message-types.ts / the AI SDK's tool part
 * union) rather than going through the network — this is a component
 * test, not an integration test; ChatWidget.test.tsx covers the
 * network-level version of these same four states.
 */

function toolCallId() {
  return "call-skills-1";
}

describe("SkillsRadarPart", () => {
  it("input-streaming: shows the tool is being called with what's known of the input so far", () => {
    render(
      <SkillsRadarPart
        part={{
          type: "tool-getSkillsRadar",
          toolCallId: toolCallId(),
          state: "input-streaming",
          input: { category: "SOC & SIEM" },
        }}
      />,
    );

    expect(screen.getByText(/get_skills_radar/i)).toBeInTheDocument();
    expect(screen.getByText(/category: soc & siem/i)).toBeInTheDocument();
  });

  it("input-available (pending): announces it's running, as an accessible status", () => {
    render(
      <SkillsRadarPart
        part={{
          type: "tool-getSkillsRadar",
          toolCallId: toolCallId(),
          state: "input-available",
          input: { category: "SOC & SIEM" },
        }}
      />,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/get_skills_radar/i);
    expect(status).toHaveTextContent(/running/i);
  });

  it("output-available (success): renders proficiency for every skill in every category", () => {
    render(
      <SkillsRadarPart
        part={{
          type: "tool-getSkillsRadar",
          toolCallId: toolCallId(),
          state: "output-available",
          input: { category: "SOC & SIEM" },
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
        }}
      />,
    );

    expect(screen.getByText("Wazuh")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.getByText("Microsoft Sentinel")).toBeInTheDocument();
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
  });

  it("output-error: surfaces the real thrown message as an accessible alert", () => {
    render(
      <SkillsRadarPart
        part={{
          type: "tool-getSkillsRadar",
          toolCallId: toolCallId(),
          state: "output-error",
          input: { category: "Cloud" },
          errorText:
            'No skill category matches "Cloud". Ali\'s real categories are: SOC & SIEM, Recon & Assessment, Automation & Development.',
        }}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/failed/i);
    expect(alert).toHaveTextContent(/no skill category matches "cloud"/i);
  });

  it("falls back to a generic message when an error state has no errorText", () => {
    render(
      <SkillsRadarPart
        part={{
          type: "tool-getSkillsRadar",
          toolCallId: toolCallId(),
          state: "output-error",
          input: {},
          errorText: "",
        }}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/doesn't match anything in ali's portfolio/i);
  });
});
