/**
 * lib/data/blog.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Live blog post reads, backed by Postgres via Prisma. See the note at the
 * top of lib/data/projects.ts for why this uses a relative import for
 * lib/db and a hand-written row shape instead of importing generated
 * Prisma types.
 *
 * `content` is real now (read straight from the `blog_posts.content`
 * column) — it defaults to "" until a post is written through the CMS
 * editor (Phase 5). Pages that render a post should treat an empty
 * `content` as "not written yet," not as an error.
 */
import { prisma } from "../db.ts";

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO date, e.g. "2026-05-20"
  excerpt: string;
  content: string;
  tags: string[];
}

// Shape used by prisma/seed-data/blog.ts: everything a seed entry supplies
// up front, minus `content` (which starts empty and is written later
// through the CMS editor, never hand-authored as seed data).
export type BlogPostSeed = Omit<BlogPost, "content">;

interface BlogPostRow {
  slug: string;
  title: string;
  date: Date;
  excerpt: string;
  content: string;
  tags: string[];
}

function toBlogPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date.toISOString().slice(0, 10),
    excerpt: row.excerpt,
    content: row.content,
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
