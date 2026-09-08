/**
 * lib/data/blog.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live blog post reads, backed by Postgres via Prisma. See the note at the
 * top of lib/data/projects.ts for why this uses a relative import for
 * lib/db, a hand-written row shape instead of importing generated Prisma
 * types, and an `id` field (added in Phase 5 for the dashboard CRUD
 * forms).
 *
 * `content` is real — read straight from the `blog_posts.content` column.
 * It defaults to "" until a post is written through the CMS editor.
 * Pages that render a post should treat an empty `content` as "not
 * written yet," not as an error.
 */
import { prisma } from "../db.ts";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string; // ISO date, e.g. "2026-05-20"
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
}

// Shape used by prisma/seed-data/blog.ts: everything a seed entry supplies
// up front, minus `id`/`content`/`coverImageUrl` (assigned by the database
// or written later through the CMS editor, never hand-authored as seed
// data).
export type BlogPostSeed = Omit<BlogPost, "id" | "content" | "coverImageUrl">;

interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  date: Date;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  tags: string[];
}

function toBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.date.toISOString().slice(0, 10),
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.coverImageUrl ?? undefined,
    tags: row.tags,
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({ orderBy: { date: "desc" } });
  return rows.map(toBlogPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  return row ? toBlogPost(row) : undefined;
}

// Dashboard-only (Phase 5)
export async function getPostById(id: string): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findUnique({ where: { id } });
  return row ? toBlogPost(row) : undefined;
}
