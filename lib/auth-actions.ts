"use server";

import { signOut } from "@/lib/auth";

/**
 * lib/auth-actions.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Kept separate from lib/auth.ts because everything exported from a
 * "use server" file becomes a callable Server Action — bundling this in
 * with auth(), signIn(), etc. would turn all of those into Server Actions
 * too, which they aren't meant to be. For the same reason, requireAdminSession()
 * (used inside other server actions, never called from a form itself)
 * lives in lib/require-admin.ts instead — a plain module, not a
 * "use server" file, so it doesn't become its own callable action.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
