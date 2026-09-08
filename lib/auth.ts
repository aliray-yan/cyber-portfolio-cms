/**
 * lib/auth.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Phase 4 — Auth.js (next-auth v5), single-admin Credentials login.
 *
 * WHY NO USER TABLE
 * ------------------
 * This CMS has exactly one legitimate user: Ali. A `users` table, a
 * signup flow, and password-reset email all solve a multi-tenant problem
 * this app doesn't have — they'd be surface area to secure and maintain
 * for no real benefit. Instead, the one admin's credentials live in two
 * environment variables:
 *
 *   ADMIN_EMAIL           the login email, plain text
 *   ADMIN_PASSWORD_HASH   a bcrypt hash of the password — never the raw
 *                          password itself, in this file or in .env.*
 *
 * Generate the hash with:
 *   npm run hash-password -- "your-new-password"
 * (see scripts/hash-password.mjs). Changing the admin password is then
 * just replacing ADMIN_PASSWORD_HASH in .env.local (and in Vercel's
 * project env vars for production) — no migration, no code change.
 *
 * If this project ever legitimately needs more than one admin, swapping
 * this file's authorize() for a Prisma-backed User table is the
 * documented Auth.js Credentials + database pattern — nothing about the
 * rest of the app (middleware.ts, the (dashboard) route group, the login
 * form) would need to change.
 *
 * SESSION STRATEGY
 * ------------------
 * JWT, not database sessions — see auth.config.ts. There's no `Session`
 * table in prisma/schema.prisma on purpose; a signed cookie is the entire
 * session store, which is all a single-admin login needs.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : undefined;
        const password = typeof credentials?.password === "string" ? credentials.password : undefined;

        if (!email || !password) return null;

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) {
          // Misconfigured env, not a wrong password — worth a clear server
          // log so this doesn't look like a silent "bad credentials" to
          // whoever's debugging a broken deploy.
          console.error(
            "[auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not set — every login attempt will fail until both are configured.",
          );
          return null;
        }

        if (email !== adminEmail) return null;

        const passwordMatches = await bcrypt.compare(password, adminPasswordHash);
        if (!passwordMatches) return null;

        // The object returned here becomes `token` on first sign-in (see
        // the default jwt callback Auth.js applies when none is
        // overridden) and, from there, `session.user` on every request.
        return { id: "admin", email: adminEmail, name: "Ali Rayyan" };
      },
    }),
  ],
});
