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
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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
