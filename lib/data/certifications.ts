/**
 * lib/data/certifications.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live certification reads, backed by Postgres via Prisma. See the note at
 * the top of lib/data/projects.ts for why this uses a relative import for
 * lib/db and a hand-written row shape instead of importing generated
 * Prisma types.
 */
import { prisma } from "../db.ts";

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

interface CertificationRow {
  name: string;
  issuer: string;
  year: string;
  credentialUrl: string | null;
}

function toCertification(row: CertificationRow): Certification {
  return {
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
