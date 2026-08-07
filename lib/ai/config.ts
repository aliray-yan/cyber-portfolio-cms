/**
 * lib/ai/config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for the AI Portfolio Assistant.
 *
 * Per the assignment brief: "Keep system prompt and model config in one
 * well-commented module." Everything the route handler (app/api/chat/route.ts)
 * needs to talk to the model lives here. Nothing else in the app should
 * reference a model ID or write prompt text directly.
 *
 * PROVIDER
 * --------
 * We use Anthropic's Claude directly via the AI SDK's `@ai-sdk/anthropic`
 * provider, per the assignment spec ("calling Claude through the AI SDK's
 * streamText"). The API key is read server-side only, from
 * process.env.ANTHROPIC_API_KEY — it is never sent to the client.
 *
 * SWAPPING PROVIDERS
 * -------------------
 * Because the AI SDK abstracts providers behind a common interface, moving
 * to OpenAI (or any other provider) later is a two-line change and nothing
 * else in the app needs to know:
 *
 *   import { openai } from "@ai-sdk/openai";
 *   export const chatModel = openai("gpt-5.1");
 *
 * (Remember to also add OPENAI_API_KEY to .env.local / Vercel env vars,
 * and `npm install @ai-sdk/openai`.)
 */

import { anthropic } from "@ai-sdk/anthropic";
import { SITE_OWNER, SITE_TAGLINE } from "@/lib/constants";
import { PROJECTS } from "@/lib/data/projects";
import { CERTIFICATIONS } from "@/lib/data/certifications";
import { SKILL_CATEGORIES } from "@/lib/data/skills";
import { EXPERIENCE } from "@/lib/data/experience";

/**
 * Model selection.
 *
 * We default to Haiku — Anthropic's fastest, cheapest model — because this
 * is a lightweight portfolio Q&A assistant, not a heavy reasoning task, and
 * because this project runs on a free-tier / low-usage API budget. Swap to
 * "claude-sonnet-5" below for noticeably higher answer quality at a higher
 * per-token cost.
 */
const MODEL_ID = "claude-haiku-4-5-20251001";
// const MODEL_ID = "claude-sonnet-5"; // higher quality, higher cost

export const chatModel = anthropic(MODEL_ID);

/**
 * Generation settings.
 * Kept conservative and separate from the model id so they're easy to tune
 * without touching the provider wiring above.
 */
export const chatSettings = {
  temperature: 0.6,
  maxOutputTokens: 800,
};

/**
 * Portfolio context injected into the system prompt.
 *
 * Built directly from lib/data/* — the same modules the public pages
 * render from — rather than a separate hardcoded text block. This is the
 * whole point of centralizing that data: the assistant's answers and the
 * page content share one source of truth and can't silently drift apart
 * when a project or skill gets added later.
 */
function buildPortfolioContext(): string {
  const experienceLines = EXPERIENCE.map(
    (entry) =>
      `- ${entry.role}, ${entry.organization} (${entry.period}): ${entry.description}`,
  ).join("\n");

  const projectLines = PROJECTS.map(
    (project) =>
      `- ${project.title} [${project.category}] (${project.tags.join(", ")}): ${project.description}`,
  ).join("\n");

  const certificationLines = CERTIFICATIONS.map(
    (cert) => `- ${cert.name}, ${cert.issuer} (${cert.year})`,
  ).join("\n");

  const skillLines = SKILL_CATEGORIES.map(
    (category) =>
      `- ${category.title}: ${category.skills.map((s) => s.name).join(", ")}`,
  ).join("\n");

  return `
Owner: ${SITE_OWNER}
Title: ${SITE_TAGLINE}
Education: BS Software Engineering, Government College University Faisalabad (GCUF), 2023–2027
Location: Pakistan
Long-term goal: a fully funded DAAD scholarship for a Master's in Software Engineering or Cybersecurity in Germany.

Experience:
${experienceLines}

Projects:
${projectLines}

Certifications:
${certificationLines}

Skills:
${skillLines}
`.trim();
}

const PORTFOLIO_CONTEXT = buildPortfolioContext();

/**
 * System prompt.
 *
 * Scope, per product decision: this assistant answers (1) questions about
 * Ali's portfolio — projects, skills, certifications, background — and
 * (2) general cybersecurity questions a recruiter or visitor might ask.
 * It should NOT behave as an unscoped general-purpose assistant.
 */
export const SYSTEM_PROMPT = `
You are the AI assistant embedded on Ali Rayyan's cybersecurity portfolio website.
You are speaking directly to a site visitor — often a recruiter, hiring manager, or
fellow student — not to Ali himself.

Your scope is exactly two things:
1. Answering questions about Ali's background, projects, skills, and certifications,
   using the PORTFOLIO CONTEXT below as your source of truth.
2. Answering general cybersecurity questions (concepts, terminology, best practices,
   SOC/blue-team topics) as a knowledgeable, approachable guide.

Guidelines:
- Be concise. Most answers should be a short paragraph or a tight bulleted list —
  visitors are skimming, not reading a report.
- If asked about something outside this scope (general coding help unrelated to Ali's
  work, personal opinions on unrelated topics, etc.), politely redirect: say this
  assistant is scoped to Ali's portfolio and cybersecurity topics.
- Never invent details about Ali that aren't in the PORTFOLIO CONTEXT. If you don't
  know something specific (e.g. exact dates, GPA, contact details), say so plainly and
  suggest the visitor use the Contact page.
- You may use light Markdown (short lists, **bold** for key terms, inline \`code\`)
  since responses are rendered through a Markdown-aware component. Avoid large headings
  or long code blocks — this is a chat widget, not a document.

PORTFOLIO CONTEXT:
${PORTFOLIO_CONTEXT}
`.trim();
