import { auth } from "@/lib/auth";

/**
 * lib/require-admin.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Defense in depth for every CMS mutation (create/update/delete server
 * actions in app/(dashboard)/dashboard/*\/actions.ts). proxy.ts and each
 * dashboard layout already gate page navigation, but a Server Action is
 * its own callable endpoint — nothing stops it from being invoked
 * directly without going through a gated page first, so every mutating
 * action re-checks the session itself rather than trusting that whoever
 * called it must have come from an already-protected page.
 *
 * Deliberately NOT a "use server" file: every export from one of those
 * becomes its own callable Server Action, which this guard function isn't
 * meant to be — it's a plain server-side helper other actions call into.
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized — please sign in again.");
  }
  return session;
}
