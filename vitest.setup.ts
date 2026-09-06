import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL doesn't auto-unmount between tests under Vitest — without this,
// a component left mounted by one test can leak into the next test's
// screen.getByText() results.
afterEach(() => {
  cleanup();
});

// jsdom implements neither matchMedia nor Element.scrollTo. Both get
// touched indirectly by components under test (useStateTransition and
// SkillsRadarPart check prefers-reduced-motion before calling animejs;
// useAutoScroll calls scrollTo when "jump to latest" fires) — without
// these stubs those calls throw or print jsdom "not implemented" noise.
//
// Defaulting matchMedia's reduced-motion query to `true` is deliberate,
// not just a convenience shim: it makes animation-gated state changes
// (the tool-card crossfade, the skills bar chart filling in) apply
// synchronously instead of via animejs's rAF-driven tween, so assertions
// don't need arbitrary waitFor delays tied to animation duration.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

if (!window.Element.prototype.scrollTo) {
  window.Element.prototype.scrollTo = vi.fn();
}
