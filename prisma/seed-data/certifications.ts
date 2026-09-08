/**
 * prisma/seed-data/certifications.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Seed content for the `certifications` table. See the note at the top of
 * prisma/seed-data/projects.ts.
 */
import type { CertificationSeed } from "../../lib/data/certifications.ts";

export const CERTIFICATIONS: CertificationSeed[] = [
  {
    name: "Cybersecurity Analyst Professional Certificate",
    issuer: "IBM",
    year: "2025",
  },
  {
    name: "SOC Level 1",
    issuer: "TryHackMe",
    year: "2025",
  },
  {
    name: "Cybersecurity Fundamentals, Volume 1",
    issuer: "Independent Study",
    year: "2024",
  },
];
