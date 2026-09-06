// prisma.config.ts
// ───────────────────────────────────────────────────────────────────────────
// Prisma 7 moved all CLI configuration here from schema.prisma. Must live at
// the project root (next to package.json) — Prisma looks for it by that
// fixed location, not a path you configure elsewhere.
//
// The Prisma CLI runs standalone — it never goes through Next.js — so
// Next.js's automatic .env.local loading has no effect here. dotenv's
// config() is loaded explicitly instead, once per file, in the same
// priority Next.js itself uses: .env.local first, .env as a fallback.
// dotenv only fills in keys that aren't already set, so loading .env.local
// first means it always wins if both exist.
//
// Uses raw process.env.DATABASE_URL rather than the stricter env() helper
// Prisma's own docs show, deliberately: env() throws immediately if the
// variable is unset, which would break `prisma generate` (and therefore
// `npm ci`'s postinstall hook) in any environment that doesn't have a
// database yet — including CI's lint/test job, which never needs to open a
// real connection. generate only reads this schema; only `migrate`/`db seed`
// and the app itself need DATABASE_URL to actually be set.
import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: path.resolve(import.meta.dirname, ".env.local") });
config({ path: path.resolve(import.meta.dirname, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Reuses the same "run TS directly, no bundler" mechanism this project
    // already uses for lib/ai/*.test.ts (see package.json's test:unit
    // script), instead of adding tsx as a second, redundant way to do the
    // same thing.
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
