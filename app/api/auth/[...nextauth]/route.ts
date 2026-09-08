/**
 * app/api/auth/[...nextauth]/route.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Standard Auth.js App Router wiring — handles the sign-in/sign-out/
 * session/callback requests the Credentials provider and the login form's
 * server action need under the hood. No custom logic belongs here; that
 * all lives in lib/auth.ts.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
