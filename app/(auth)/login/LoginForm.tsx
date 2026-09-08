"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authenticate } from "./actions";

/**
 * app/(auth)/login/LoginForm.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Split from page.tsx because useActionState/useFormStatus need a Client
 * Component — the page itself stays a Server Component so it can redirect
 * an already-signed-in visitor straight to /dashboard without a client
 * round-trip (see page.tsx).
 */

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? "Signing in…" : "Log In"}
    </Button>
  );
}

export default function LoginForm() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        tone="inset"
        required
        autoComplete="email"
        autoFocus
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        tone="inset"
        required
        autoComplete="current-password"
      />

      <SubmitButton />

      {errorMessage && (
        <p role="alert" className="text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
