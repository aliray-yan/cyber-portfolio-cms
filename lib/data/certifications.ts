/**
 * lib/data/certifications.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live certification reads, backed by Postgres via Prisma. See the note at
 * the top of lib/data/projects.ts for why this uses a relative import for
 * lib/db, a hand-written row shape instead of importing generated Prisma
 * types, and an `id` field (added in Phase 5 for the dashboard CRUD forms).
 */
import { prisma } from "../db.ts";

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

// Shape used by prisma/seed-data/certifications.ts — id is database-assigned.
export type CertificationSeed = Omit<Certification, "id">;

interface CertificationRow {
  id: string;
  name: string;
  issuer: string;
  year: string;
  credentialUrl: string | null;
}

function toCertification(row: CertificationRow): Certification {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    year: row.year,
    credentialUrl: row.credentialUrl ?? undefined,
  };
}

export async function getAllCertifications(): Promise<Certification[]> {
  const rows = await prisma.certification.findMany({ orderBy: { order: "asc" } });
  return rows.map(toCertification);
}

// Dashboard-only (Phase 5)
export async function getCertificationById(id: string): Promise<Certification | undefined> {
  const row = await prisma.certification.findUnique({ where: { id } });
  return row ? toCertification(row) : undefined;
}
