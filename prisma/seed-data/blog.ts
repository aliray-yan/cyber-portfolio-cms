/**
 * prisma/seed-data/blog.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Seed content for the `blog_posts` table. See the note at the top of
 * prisma/seed-data/projects.ts. `content` is intentionally omitted here
 * (defaults to "" per the schema) — full article bodies get written
 * through the CMS editor (Phase 5), not invented as placeholder text.
 */
import type { BlogPostSeed } from "../../lib/data/blog.ts";

export const BLOG_POSTS: BlogPostSeed[] = [
  {
    slug: "deploying-a-4-vm-wazuh-siem-lab",
    title: "Deploying a 4-VM Wazuh SIEM Lab: Detection Rules from Scratch",
    date: "2026-05-20",
    excerpt:
      "Notes from building a Wazuh 4.14 lab from the ground up, including custom MITRE-mapped rules and a 120-second brute-force detection threshold.",
    tags: ["SIEM", "Tutorial", "Wazuh"],
  },
  {
    slug: "investigating-a-phishing-campaign",
    title: "Investigating a Phishing Campaign: From Headers to IOCs",
    date: "2026-04-08",
    excerpt:
      "A walkthrough of analyzing phishing email headers, payloads, and sender patterns to extract indicators of compromise.",
    tags: ["Research", "Email Security"],
  },
];
