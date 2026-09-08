/**
 * prisma/seed.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Populates a fresh database from the static content in prisma/seed-data/
 * — run this once after the first migration so the DB-backed site has real
 * content instead of empty tables. That content used to live directly in
 * lib/data/*.ts; it moved to prisma/seed-data/ once those modules switched
 * to live Prisma queries (Phase 3) — lib/data no longer holds any static
 * arrays for this script to import.
 *
 * Idempotent by design: safe to run again later (e.g. to reset back to
 * "factory" content after testing CMS edits) — every table is fully reset
 * before insert rather than appended to, so re-running never produces
 * duplicates. Note: re-seeding does NOT touch blog_posts.content or the
 * imageUrl/coverImageUrl columns on projects/blog_posts — those are
 * written only through the CMS (Phase 5's forms and Cloudinary upload),
 * never by this script, so re-seeding never wipes authored content or an
 * uploaded image.
 *
 * Run directly, per prisma.config.ts's migrations.seed:
 *   npx prisma db seed
 *
 * Uses relative imports with explicit .ts extensions (not the @/ alias) —
 * this runs under Node's native --experimental-strip-types, which resolves
 * modules the way Node itself does, not the way Next.js's bundler does. The
 * same constraint already applies to lib/ai/*.test.ts (see package.json's
 * test:unit script). For the same reason, @prisma/client is imported as a
 * default import below rather than a named one — see lib/db.ts's comment
 * on this for why.
 */
import path from "node:path";
import { config } from "dotenv";
import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PROJECTS } from "./seed-data/projects.ts";
import { SKILL_CATEGORIES } from "./seed-data/skills.ts";
import { CERTIFICATIONS } from "./seed-data/certifications.ts";
import { BLOG_POSTS } from "./seed-data/blog.ts";
import { EXPERIENCE } from "./seed-data/experience.ts";

// When Prisma spawns this via `prisma db seed`, DATABASE_URL is already in
// the environment (inherited from prisma.config.ts's own loading). This
// makes the script work standalone too — `node --experimental-strip-types
// prisma/seed.ts` directly — without depending on that inheritance.
// dotenv's config() only fills in a key if it isn't already set, so this
// never overrides a value the parent process already provided.
config({ path: path.resolve(import.meta.dirname, "..", ".env.local") });
config({ path: path.resolve(import.meta.dirname, "..", ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function seedProjects() {
  for (const [index, project] of PROJECTS.entries()) {
    const data = {
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags,
      githubUrl: project.githubUrl ?? null,
      featured: project.featured ?? false,
      order: index,
    };
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: data,
      create: { slug: project.slug, ...data },
    });
  }
  console.log(`  projects: ${PROJECTS.length}`);
}

async function seedSkills() {
  for (const [categoryIndex, category] of SKILL_CATEGORIES.entries()) {
    const skillsCreate = category.skills.map((skill, skillIndex) => ({
      name: skill.name,
      level: skill.level,
      order: skillIndex,
    }));

    // Nested writes only apply on create, not update — so a re-run resets
    // each category's skills explicitly rather than silently accumulating
    // duplicates every time this script runs.
    await prisma.skillCategory.upsert({
      where: { title: category.title },
      update: {
        order: categoryIndex,
        skills: { deleteMany: {}, create: skillsCreate },
      },
      create: {
        title: category.title,
        order: categoryIndex,
        skills: { create: skillsCreate },
      },
    });
  }
  const skillCount = SKILL_CATEGORIES.reduce((sum, c) => sum + c.skills.length, 0);
  console.log(`  skill categories: ${SKILL_CATEGORIES.length} (${skillCount} skills)`);
}

async function seedCertifications() {
  // No natural unique key on this data (no slug/id in the static shape) —
  // wipe and recreate is the simplest correct way to keep this idempotent.
  await prisma.certification.deleteMany();
  await prisma.certification.createMany({
    data: CERTIFICATIONS.map((cert, index) => ({
      name: cert.name,
      issuer: cert.issuer,
      year: cert.year,
      credentialUrl: cert.credentialUrl ?? null,
      order: index,
    })),
  });
  console.log(`  certifications: ${CERTIFICATIONS.length}`);
}

async function seedBlogPosts() {
  for (const post of BLOG_POSTS) {
    const data = {
      title: post.title,
      date: new Date(post.date),
      excerpt: post.excerpt,
      tags: post.tags,
    };
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: data,
      create: { slug: post.slug, ...data },
    });
  }
  console.log(`  blog posts: ${BLOG_POSTS.length}`);
}

async function seedExperience() {
  // Same reasoning as certifications: no natural unique key, so reset and
  // recreate rather than upsert.
  await prisma.experienceEntry.deleteMany();
  await prisma.experienceEntry.createMany({
    data: EXPERIENCE.map((entry, index) => ({
      role: entry.role,
      organization: entry.organization,
      period: entry.period,
      description: entry.description,
      order: index,
    })),
  });
  console.log(`  experience entries: ${EXPERIENCE.length}`);
}

async function main() {
  console.log("Seeding database from lib/data/*.ts...");
  await seedProjects();
  await seedSkills();
  await seedCertifications();
  await seedBlogPosts();
  await seedExperience();
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
