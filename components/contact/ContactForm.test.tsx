import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "./ContactForm";

/**
 * The one "validated form" the brief asks for. Everything here goes
 * through the same fields a visitor sees and types into (role + label),
 * never a CSS selector or test id — renaming .space-y-5 or any Tailwind
 * class in ContactForm.tsx cannot break a single assertion below.
 */

function fillValidForm() {
  return {
    name: /name/i,
    email: /email/i,
    subject: /subject/i,
    message: /message/i,
  };
}

describe("ContactForm", () => {
  beforeEach(() => {
    // jsdom throws "Not implemented: navigation" if something actually
    // tries to follow window.location.href — replace the whole object so
    // the successful path can assert the mailto: link without a real
    // navigation attempt. configurable:true is required here — jsdom's
    // own location descriptor is configurable, but a plain re-assignment
    // (`window.location = ...`) is rejected by jsdom itself.
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { href: "" },
    });
  });

  it("shows a validation error for each required field left empty on submit", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a subject/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a message/i)).toBeInTheDocument();

    // Nothing should have been sent anywhere.
    expect(window.location.href).toBe("");
  });

  it("flags a malformed email address specifically, distinct from a missing one", async () => {
    const user = userEvent.setup();
    const fields = fillValidForm();
    render(<ContactForm />);

    await user.type(screen.getByRole("textbox", { name: fields.name }), "Jordan Rivera");
    await user.type(screen.getByRole("textbox", { name: fields.email }), "not-an-email");
    await user.type(screen.getByRole("textbox", { name: fields.subject }), "Quick question");
    await user.type(screen.getByRole("textbox", { name: fields.message }), "Loved your SOC writeups!");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.queryByText(/enter your email address/i)).not.toBeInTheDocument();
  });

  it("rejects a message that's too short to be useful, even though it's non-empty", async () => {
    const user = userEvent.setup();
    const fields = fillValidForm();
    render(<ContactForm />);

    await user.type(screen.getByRole("textbox", { name: fields.name }), "Jordan Rivera");
    await user.type(screen.getByRole("textbox", { name: fields.email }), "jordan@example.com");
    await user.type(screen.getByRole("textbox", { name: fields.subject }), "Hi");
    await user.type(screen.getByRole("textbox", { name: fields.message }), "Hey!");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/say a little more/i)).toBeInTheDocument();
  });

  it("on a fully valid submission, hands off to the visitor's email client and confirms it", async () => {
    const user = userEvent.setup();
    const fields = fillValidForm();
    render(<ContactForm />);

    await user.type(screen.getByRole("textbox", { name: fields.name }), "Jordan Rivera");
    await user.type(screen.getByRole("textbox", { name: fields.email }), "jordan@example.com");
    await user.type(screen.getByRole("textbox", { name: fields.subject }), "SOC Analyst role");
    await user.type(
      screen.getByRole("textbox", { name: fields.message }),
      "I'd love to chat about a SOC analyst opening on our team.",
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.queryByText(/enter your name/i)).not.toBeInTheDocument();
    expect(window.location.href).toMatch(/^mailto:/);
    expect(window.location.href).toContain(encodeURIComponent("SOC Analyst role"));
    expect(await screen.findByRole("status")).toHaveTextContent(/opened your email client/i);
  });
});
