"use server";

import { signOut } from "@/lib/auth";

/**
 * lib/auth-actions.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Kept separate from lib/auth.ts because everything exported from a
 * "use server" file becomes a callable Server Action — bundling this in
 * with auth(), signIn(), etc. would turn all of those into Server Actions
 * too, which they aren't meant to be.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
