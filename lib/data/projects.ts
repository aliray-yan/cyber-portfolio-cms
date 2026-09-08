/**
 * lib/data/projects.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live project reads, backed by Postgres via Prisma (see lib/db.ts). This
 * is Phase 3's promised drop-in swap — the shape below is unchanged from
 * the old static-array version except for `id` (added in Phase 5 so the
 * dashboard CRUD forms/actions can address a specific row — public pages
 * still route by `slug` and simply ignore it). The original static
 * content now seeds the database instead of serving it directly — see
 * prisma/seed-data/projects.ts and prisma/seed.ts.
 *
 * Relative import for lib/db.ts (not the "@/" alias) — this module is
 * imported by lib/ai/tools.ts, which itself is loaded two ways: through
 * Next's bundler (understands "@/") and directly by Node for
 * tools.test.ts (which only understands real relative paths). Matching
 * that constraint here keeps this module usable from both.
 */
import { prisma } from "../db.ts";

export type ProjectCategory = "Security" | "Development" | "Research";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  githubUrl?: string;
  imageUrl?: string;
  featured?: boolean;
}

// Shape used by prisma/seed-data/projects.ts: everything a seed entry
// supplies up front, minus `id` (database-assigned) and `imageUrl`
// (uploaded later through the CMS, never hand-authored as seed data).
export type ProjectSeed = Omit<Project, "id" | "imageUrl">;

// Written out explicitly rather than imported from "@prisma/client" so this
// file has no hard dependency on the generated client's types existing —
// only the calls below that actually touch `prisma.project.*` do.
interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  githubUrl: string | null;
  imageUrl: string | null;
  featured: boolean;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category as ProjectCategory,
    tags: row.tags,
    githubUrl: row.githubUrl ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    featured: row.featured,
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({ orderBy: { order: "asc" } });
  return rows.map(toProject);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { featured: true },
    orderBy: { order: "asc" },
    take: limit,
  });
  return rows.map(toProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const row = await prisma.project.findUnique({ where: { slug } });
  return row ? toProject(row) : undefined;
}

// Dashboard-only (Phase 5) — edit/delete forms address a project by id,
// not slug, since a CMS edit may itself change the slug.
export async function getProjectById(id: string): Promise<Project | undefined> {
  const row = await prisma.project.findUnique({ where: { id } });
  return row ? toProject(row) : undefined;
}
