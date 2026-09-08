/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The one Prisma Client instance for the whole app. Import { prisma } from
 * "@/lib/db" anywhere a query is needed — never `new PrismaClient()` again
 * elsewhere, or Next.js's dev-mode hot reload will spin up a fresh client
 * (and a fresh connection pool) on every file save until the DB connection
 * limit is exhausted.
 *
 * Prisma 7 removed the built-in Rust query engine — PrismaClient now MUST be
 * constructed with a driver adapter, there's no bare `new PrismaClient()`
 * fallback anymore. @prisma/adapter-pg + pg is the standard choice for any
 * plain Postgres connection string, which is exactly what Neon (or Supabase)
 * gives you — nothing Neon-specific is needed here, so switching providers
 * later, if that's ever wanted, wouldn't touch this file.
 *
 * Default import, not `import { PrismaClient } from "@prisma/client"` —
 * the generated client's CJS output re-exports via `{ ...require(...) }`,
 * a spread pattern Node's ESM loader can't statically see named exports
 * through. Bundlers (Next.js's webpack/Turbopack) execute the module and
 * don't care, so a named import works fine through the app — but this
 * file is also reached by lib/ai/tools.test.ts under the plain
 * `node --experimental-strip-types` test runner (see lib/data/projects.ts
 * for why), which does care. The default-import form below is what Node's
 * own error message recommends for exactly this situation, and works
 * identically either way.
 */
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const { PrismaClient } = pkg;

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
  pool: Pool | undefined;
};

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = prisma;
}

export default prisma;
