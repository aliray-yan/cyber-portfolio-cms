/**
 * lib/data/experience.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live experience-entry reads, backed by Postgres via Prisma. See the note
 * at the top of lib/data/projects.ts for why this uses a relative import
 * for lib/db and a hand-written row shape instead of importing generated
 * Prisma types.
 */
import { prisma } from "../db.ts";

export interface ExperienceEntry {
  role: string;
  organization: string;
  period: string;
  description: string;
}

interface ExperienceRow {
  role: string;
  organization: string;
  period: string;
  description: string;
}

function toExperienceEntry(row: ExperienceRow): ExperienceEntry {
  return {
    role: row.role,
    organization: row.organization,
    period: row.period,
    description: row.description,
  };
}

export async function getExperience(): Promise<ExperienceEntry[]> {
  const rows = await prisma.experienceEntry.findMany({ orderBy: { order: "asc" } });
  return rows.map(toExperienceEntry);
}
