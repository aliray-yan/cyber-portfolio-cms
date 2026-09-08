import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllProjects } from "@/lib/data/projects";
import { getAllBlogPosts } from "@/lib/data/blog";

/**
 * app/sitemap.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Next.js serves this at /sitemap.xml automatically. Dynamic project and
 * blog routes are pulled from the live database (Phase 3/5) rather than
 * hardcoded, so a project or post added through the CMS shows up here on
 * its next crawl without a code change or redeploy — same reasoning as
 * app/(public)/layout.tsx's `force-dynamic`.
 */
const STATIC_ROUTES = ["/", "/about", "/projects", "/certifications", "/skills", "/blog", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getAllProjects(), getAllBlogPosts()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: new URL(`/projects/${project.slug}`, SITE_URL).toString(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: new URL(`/blog/${post.slug}`, SITE_URL).toString(),
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...projectEntries, ...postEntries];
}
