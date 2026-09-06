import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7's client + the pg driver adapter don't bundle reliably under
  // Turbopack (Next.js 16's default bundler) — Turbopack's module hashing
  // loses track of Prisma's generated runtime during SSR, surfacing as
  // "Cannot find module '.prisma/client/default'". Marking them external
  // tells Next.js to load both from node_modules at runtime instead of
  // trying to bundle them, which is the documented fix. See lib/db.ts and
  // prisma/schema.prisma for the other two parts of this same fix
  // (the pg-based driver adapter, and staying on the prisma-client-js
  // generator rather than Prisma 7's newer prisma-client one).
  serverExternalPackages: ["@prisma/client", "pg"],
};

export default nextConfig;
