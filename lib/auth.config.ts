/**
 * lib/auth.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The edge-safe half of the Auth.js setup. middleware.ts runs in the Edge
 * runtime by default, which can't load Node-only modules — `providers`
 * (which needs bcryptjs to check the password) lives in lib/auth.ts
 * instead, and is added on top of this config there. This file only holds
 * what's genuinely safe to run at the edge: routing decisions.
 *
 * This split is the pattern Auth.js's own docs recommend for Credentials
 * + middleware route protection — not something specific to this project.
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    // No database session table for a single-admin CMS — a signed JWT
    // cookie is the whole session store. See lib/auth.ts's authorize()
    // for what goes into it.
    strategy: "jwt",
  },
  callbacks: {
    /**
     * Runs on every request middleware.ts matches (see that file's
     * `matcher`). `auth` here is the decoded session, not a re-check
     * against a database — cheap enough to run on every request.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        // Returning false here makes Auth.js redirect to `pages.signIn`
        // above, with a callbackUrl back to where the visitor was headed.
        return isLoggedIn;
      }

      if (isLoggedIn && nextUrl.pathname === "/login") {
        // Already signed in — no reason to show the login form again.
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  // Populated in lib/auth.ts, which spreads this config and adds the
  // Credentials provider (needs bcryptjs — Node-only, can't run here).
  providers: [],
} satisfies NextAuthConfig;
