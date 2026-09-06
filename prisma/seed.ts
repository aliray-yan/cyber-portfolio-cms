/**
 * prisma/seed.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Populates a fresh database with exactly what the site already shows via
 * the static lib/data/*.ts arrays — run this once after the first migration
 * so the DB-backed site looks identical to today's static one, not empty.
 *
 * Imports the real lib/data modules directly rather than duplicating their
 * content here, so there is exactly one place that content can drift out of
 * sync from (there isn't one — this file always seeds whatever's currently
 * in lib/data).
 *
 * Idempotent by design: safe to run again later (e.g. after editing the
 * static arrays, before lib/data/*.ts is switched over to real queries) —
 * every table is fully reset before insert rather than appended to, so
 * re-running never produces duplicates.
 *
 * Run directly, per prisma.config.ts's migrations.seed:
 *   npx prisma db seed
 *
 * Uses relative imports with explicit .ts extensions (not the @/ alias) —
 * this runs under Node's native --experimental-strip-types, which resolves
 * modules the way Node itself does, not the way Next.js's bundler does. The
 * same constraint already applies to lib/ai/*.test.ts (see package.json's
 * test:unit script).
 */
import path from "node:path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PROJECTS } from "../lib/data/projects.ts";
import { SKILL_CATEGORIES } from "../lib/data/skills.ts";
import { CERTIFICATIONS } from "../lib/data/certifications.ts";
import { BLOG_POSTS } from "../lib/data/blog.ts";
import { EXPERIENCE } from "../lib/data/experience.ts";

// When Prisma spawns this via `prisma db seed`, DATABASE_URL is already in
// the environment (inherited from prisma.config.ts's own loading). This
// makes the script work standalone too — `node --experimental-strip-types
// prisma/seed.ts` directly — without depending on that inheritance.
// dotenv's config() only fills in a key if it isn't already set, so this
// never overrides a value the parent process already provided.
config({ path: path.resolve(import.meta.dirname, "..", ".env.local") });
config({ path: path.resolve(import.meta.dirname, "..", ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
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
