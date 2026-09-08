/**
 * proxy.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Route protection for the (dashboard) route group. The actual allow/deny
 * decision lives in lib/auth.config.ts's `authorized` callback — this file
 * just wires that config into Next's request-interception layer and
 * decides which requests it runs on.
 *
 * Named proxy.ts, not middleware.ts — Next.js 16 deprecated the
 * "middleware" file convention in favor of "proxy" (same export shape,
 * same behavior, just a rename): https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Runs in the Edge runtime by default, which is exactly why auth.config.ts
 * (no bcryptjs, no Prisma) is what's imported here rather than the full
 * lib/auth.ts.
 */
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Runs on everything except: Next internals/static assets, common
  // static file extensions, and API routes. API routes (/api/chat,
  // /api/contact) intentionally aren't gated here — they don't serve
  // dashboard content, and /api/auth's own routes would otherwise be
  // gated by the very middleware that's supposed to let sign-in through.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
