import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * app/robots.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Next.js serves this at /robots.txt automatically. Dashboard/login/API
 * routes are kept out of the crawl entirely — belt-and-suspenders with
 * the `robots: { index: false }` metadata on those same routes (see
 * app/(dashboard)/layout.tsx and app/(auth)/login/page.tsx): this stops a
 * compliant crawler from requesting those pages at all, the meta tag
 * covers a crawler that fetches them anyway but respects the tag.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/login", "/api"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
