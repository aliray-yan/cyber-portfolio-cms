/**
 * lib/data/skills.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live skill reads, backed by Postgres via Prisma. See the note at the top
 * of lib/data/projects.ts for why this uses a relative import for lib/db
 * and a hand-written row shape instead of importing generated Prisma
 * types.
 */
import { prisma } from "../db.ts";

export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Skill {
  name: string;
  level: ProficiencyLevel;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

interface SkillCategoryRow {
  title: string;
  skills: { name: string; level: string }[];
}

function toSkillCategory(row: SkillCategoryRow): SkillCategory {
  return {
    title: row.title,
    skills: row.skills.map((skill) => ({
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
