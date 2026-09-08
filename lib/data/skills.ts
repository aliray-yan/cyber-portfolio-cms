/**
 * lib/data/skills.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live skill reads, backed by Postgres via Prisma. See the note at the top
 * of lib/data/projects.ts for why this uses a relative import for lib/db,
 * a hand-written row shape instead of importing generated Prisma types,
 * and `id` fields (added in Phase 5 for the dashboard CRUD forms).
 */
import { prisma } from "../db.ts";

export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Skill {
  id: string;
  name: string;
  level: ProficiencyLevel;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
}

// Shape used by prisma/seed-data/skills.ts — ids are database-assigned.
export type SkillSeed = Omit<Skill, "id">;
export type SkillCategorySeed = Omit<SkillCategory, "id" | "skills"> & { skills: SkillSeed[] };

interface SkillCategoryRow {
  id: string;
  title: string;
  skills: { id: string; name: string; level: string }[];
}

function toSkillCategory(row: SkillCategoryRow): SkillCategory {
  return {
    id: row.id,
    title: row.title,
    skills: row.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      level: skill.level as ProficiencyLevel,
    })),
  };
}

export async function getSkillCategories(): Promise<SkillCategory[]> {
  const rows = await prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
    include: { skills: { orderBy: { order: "asc" } } },
  });
  return rows.map(toSkillCategory);
}

// Dashboard-only (Phase 5)
export async function getSkillCategoryById(id: string): Promise<SkillCategory | undefined> {
  const row = await prisma.skillCategory.findUnique({
    where: { id },
    include: { skills: { orderBy: { order: "asc" } } },
  });
  return row ? toSkillCategory(row) : undefined;
}
