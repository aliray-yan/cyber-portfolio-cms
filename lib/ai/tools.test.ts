/**
 * lib/ai/tools.test.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Covers the "return malformed JSON from a tool" sabotage step from the
 * Week 5 resilience brief — reframed for what's actually reachable here:
 * this session's sandbox can't route to openrouter.ai to make a live model
 * call, so there's no way to make the MODEL emit malformed tool-call
 * arguments end to end. What these tests pin down instead is the piece
 * that's actually ours to get right regardless of what the model sends:
 * getSkillsRadar given input that doesn't match anything real throws a
 * specific, friendly error rather than guessing or crashing — the same
 * property route.ts's onError depends on for the mid-stream case.
 *
 * These test the PURE filterProjects/selectSkillCategories helpers against
 * small fixtures, not the tools' execute() wrappers — execute() itself
 * just awaits a live Prisma read (getAllProjects/getSkillCategories) and
 * hands the result to these same functions, so exercising the DB call
 * here would only make this test slower and dependent on a real database
 * connection without covering any additional logic. Fixtures are
 * deliberately tiny and don't need to match prisma/seed-data/*.ts — they
 * only need to exercise the matching/error-throwing behavior below.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { filterProjects, selectSkillCategories } from "./tools.ts";
import type { Project } from "../data/projects.ts";
import type { SkillCategory } from "../data/skills.ts";

const FIXTURE_PROJECTS: Project[] = [
  {
    id: "fixture-1",
    slug: "secops-workbench",
    title: "SOC Workbench",
    description: "Alert triage and case management for a SOC team.",
    category: "Security",
    tags: ["React", "FastAPI"],
    githubUrl: "https://github.com/example/secops-workbench",
    featured: true,
  },
  {
    id: "fixture-2",
    slug: "threat-feed-automation",
    title: "Threat Feed Automation",
    description: "n8n pipeline that enriches and routes threat intel.",
    category: "Security",
    tags: ["n8n", "Automation"],
  },
  {
    id: "fixture-3",
    slug: "rag-mastery",
    title: "RAG Mastery",
    description: "Full-stack RAG learning platform with a playground.",
    category: "Development",
    tags: ["RAG", "React"],
  },
];

const FIXTURE_SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "fixture-cat-1",
    title: "SOC & SIEM",
    skills: [
      { id: "fixture-skill-1", name: "Wazuh", level: "Advanced" },
      { id: "fixture-skill-2", name: "Sentinel", level: "Intermediate" },
    ],
  },
  {
    id: "fixture-cat-2",
    title: "Recon & Assessment",
    skills: [{ id: "fixture-skill-3", name: "Nmap", level: "Advanced" }],
  },
  {
    id: "fixture-cat-3",
    title: "Automation & Development",
    skills: [{ id: "fixture-skill-4", name: "n8n", level: "Advanced" }],
  },
];

test("filterProjects: unmatched query returns an empty result, not an error", () => {
  const { allMatches, matches } = filterProjects(FIXTURE_PROJECTS, {
    query: "quantum blockchain nft metaverse",
  });
  assert.equal(allMatches.length, 0);
  assert.deepEqual(matches, []);
});

test("filterProjects: category filter only returns projects in that category", () => {
  const { matches } = filterProjects(FIXTURE_PROJECTS, { category: "Security" });
  assert.ok(matches.length > 0, "expected at least one Security project");
  assert.ok(matches.every((p) => p.category === "Security"));
});

test("filterProjects: limit caps the returned matches but not the total count", () => {
  const { allMatches, matches } = filterProjects(FIXTURE_PROJECTS, {
    category: "Security",
    limit: 1,
  });
  assert.equal(allMatches.length, 2);
  assert.equal(matches.length, 1);
});

test("selectSkillCategories: an unknown category throws a specific, friendly error (not a crash, not a silent empty result)", () => {
  assert.throws(
    () => selectSkillCategories(FIXTURE_SKILL_CATEGORIES, "Quantum Computing"),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      // Names the bad input back and lists the real options — this is
      // exactly the text that ends up in the output-error tool part's
      // errorText in SkillsRadarPart.tsx.
      assert.match(error.message, /Quantum Computing/);
      assert.match(error.message, /SOC & SIEM/);
      return true;
    },
  );
});

test("selectSkillCategories: a partial, differently-cased match still resolves (visitor phrasing shouldn't need to be exact)", () => {
  const selected = selectSkillCategories(FIXTURE_SKILL_CATEGORIES, "recon");
  assert.equal(selected.length, 1);
  assert.match(selected[0].title, /Recon/);
});

test("selectSkillCategories: omitting the category returns all three real categories", () => {
  const selected = selectSkillCategories(FIXTURE_SKILL_CATEGORIES, undefined);
  assert.equal(selected.length, 3);
});
