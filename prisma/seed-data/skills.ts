/**
 * prisma/seed-data/skills.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Seed content for the `skill_categories` / `skills` tables. See the note
 * at the top of prisma/seed-data/projects.ts — same deal, moved out of
 * lib/data/skills.ts now that that module reads live from the database.
 */
import type { SkillCategory } from "../../lib/data/skills.ts";

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "SOC & SIEM",
    skills: [
      { name: "Wazuh", level: "Advanced" },
      { name: "Microsoft Sentinel", level: "Intermediate" },
      { name: "Elastic SIEM", level: "Intermediate" },
      { name: "Suricata", level: "Intermediate" },
      { name: "Sumo Logic", level: "Intermediate" },
    ],
  },
  {
    title: "Recon & Assessment",
    skills: [
      { name: "Nmap", level: "Advanced" },
      { name: "Nessus", level: "Intermediate" },
      { name: "Shodan", level: "Intermediate" },
      { name: "SpiderFoot", level: "Beginner" },
    ],
  },
  {
    title: "Automation & Development",
    skills: [
      { name: "n8n", level: "Advanced" },
      { name: "Tines", level: "Intermediate" },
      { name: "TypeScript / JavaScript", level: "Advanced" },
      { name: "React / Next.js", level: "Intermediate" },
      { name: "Python", level: "Intermediate" },
    ],
  },
];
