"use client";

import { useState, type FormEvent } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { SITE_EMAIL } from "@/lib/constants";

/**
 * components/contact/ContactForm.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * The contact page's form was previously a permanently-`disabled` stub
 * with no client-side logic at all ("Form submission coming in a future
 * phase") — there was nothing here for a test to meaningfully exercise.
 *
 * Real backend delivery (an API route, a mailer) is still Phase 3+ work —
 * this doesn't jump ahead of that. What it adds now is the one piece that
 * doesn't need a backend: client-side validation, plus the same
 * no-server-yet pattern already established elsewhere in this app
 * (components/chat/tool-parts/IntroEmailPart.tsx) — open the visitor's own
 * email client via a mailto: link, pre-filled, once the fields validate.
 * Nothing is sent from a server; nothing pretends to be sent automatically.
 */

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) errors.name = "Enter your name.";

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.subject.trim()) errors.subject = "Enter a subject.";

  if (!values.message.trim()) {
    errors.message = "Enter a message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Say a little more — at least 10 characters.";
  }

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);

  function updateField(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSent(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSent(false);
      return;
    }

    const body = `From: ${values.name} (${values.email})\n\n${values.message}`;
    const mailto = `mailto:${SITE_EMAIL}?subject=${encodeURIComponent(
      values.subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  }

  return (
    <form className="mt-10 space-y-5" onSubmit={handleSubmit} noValidate>
      <Input
        id="name"
        name="name"
        type="text"
        label="Name"
        placeholder="Your name"
        value={values.name}
        onChange={(event) => updateField("name", event.target.value)}
        aria-invalid={Boolean(errors.name)}
        aria-describedby={errors.name ? "name-error" : undefined}
      />
      {errors.name && (
        <p id="name-error" className="-mt-3 text-xs text-destructive">
          {errors.name}
        </p>
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(event) => updateField("email", event.target.value)}
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? "email-error" : undefined}
      />
      {errors.email && (
        <p id="email-error" className="-mt-3 text-xs text-destructive">
          {errors.email}
        </p>
      )}

      <Input
        id="subject"
        name="subject"
        type="text"
        label="Subject"
        placeholder="What's this about?"
        value={values.subject}
        onChange={(event) => updateField("subject", event.target.value)}
        aria-invalid={Boolean(errors.subject)}
        aria-describedby={errors.subject ? "subject-error" : undefined}
      />
      {errors.subject && (
        <p id="subject-error" className="-mt-3 text-xs text-destructive">
          {errors.subject}
        </p>
      )}

      <Textarea
        id="message"
        name="message"
        label="Message"
        rows={5}
        placeholder="Your message"
        value={values.message}
        onChange={(event) => updateField("message", event.target.value)}
        aria-invalid={Boolean(errors.message)}
        aria-describedby={errors.message ? "message-error" : undefined}
      />
      {errors.message && (
        <p id="message-error" className="-mt-3 text-xs text-destructive">
          {errors.message}
        </p>
      )}

      <Button type="submit" fullWidth className="md:w-auto">
        Send Message
      </Button>

      {sent && (
        <p role="status" className="text-xs text-primary">
          Opened your email client with this message pre-filled — nothing sends automatically.
        </p>
      )}
    </form>
  );
}
