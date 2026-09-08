/**
 * lib/data/experience.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live experience-entry reads, backed by Postgres via Prisma. See the note
 * at the top of lib/data/projects.ts for why this uses a relative import
 * for lib/db, a hand-written row shape instead of importing generated
 * Prisma types, and an `id` field (added in Phase 5 for the dashboard CRUD
 * forms).
 */
import { prisma } from "../db.ts";

export interface ExperienceEntry {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
}

// Shape used by prisma/seed-data/experience.ts — id is database-assigned.
export type ExperienceEntrySeed = Omit<ExperienceEntry, "id">;

interface ExperienceRow {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
}

function toExperienceEntry(row: ExperienceRow): ExperienceEntry {
  return {
    id: row.id,
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

// Dashboard-only (Phase 5)
export async function getExperienceById(id: string): Promise<ExperienceEntry | undefined> {
  const row = await prisma.experienceEntry.findUnique({ where: { id } });
  return row ? toExperienceEntry(row) : undefined;
}
