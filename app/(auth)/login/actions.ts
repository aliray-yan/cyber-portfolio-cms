"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

/**
 * app/(auth)/login/actions.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The documented Auth.js v5 + App Router pattern: a server action that
 * calls signIn() and translates a thrown AuthError into a plain string
 * for the form to display via useActionState (see LoginForm.tsx).
 *
 * signIn() throws a Next.js redirect signal on *success* — that's not a
 * real error and must be re-thrown, not swallowed, or the redirect to
 * /dashboard silently never happens.
 */
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Incorrect email or password.";
        default:
          return "Something went wrong signing you in. Please try again.";
      }
    }
    throw error;
  }
}
