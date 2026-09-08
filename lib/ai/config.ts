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
 * We use OpenRouter via the official `@openrouter/ai-sdk-provider` package.
 * OpenRouter is an OpenAI-compatible gateway that proxies to 300+ models
 * from many labs (Meta, Google, Alibaba, Anthropic, etc.) behind one API
 * key, including a rotating set of genuinely free `:free`-suffixed models.
 * The API key is read server-side only, from process.env.OPENROUTER_API_KEY
 * — it is never sent to the client.
 *
 * Get a free key: sign up at https://openrouter.ai (no card required),
 * then create a key at https://openrouter.ai/keys.
 *
 * FREE MODEL CAVEATS — read before demoing/submitting
 * -----------------------------------------------------
 * - Free (`:free`) models are rate-limited, not credit-limited: roughly
 *   20 requests/minute, and 50 requests/day on a $0 balance (rising to
 *   1,000/day once you've ever bought $10 of credits — you don't have to
 *   spend it, just having bought it once raises the daily cap). If the
 *   widget suddenly starts erroring during a demo, you've likely hit the
 *   daily cap — check https://openrouter.ai/activity.
 * - The free model lineup rotates weekly as providers add/remove capacity.
 *   MODEL_ID below was verified live against OpenRouter's models API as of
 *   this edit, but if it 404s later, pick a replacement from
 *   https://openrouter.ai/models?max_price=0 (filter already applied by
 *   that URL) and swap the string below — nothing else needs to change.
 *
 * SWAPPING PROVIDERS / MODELS
 * -----------------------------
 * Any OpenRouter model — free or paid — is a one-line change:
 *
 *   export const chatModel = openrouter("meta-llama/llama-3.3-70b-instruct");
 *
 * Moving off OpenRouter entirely (e.g. back to OpenAI or Anthropic direct)
 * is a two-line change plus a new API key env var:
 *
 *   import { openai } from "@ai-sdk/openai";
 *   export const chatModel = openai("gpt-4.1-mini");
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { SITE_OWNER, SITE_TAGLINE } from "@/lib/constants";
import { getAllProjects } from "@/lib/data/projects";
import { getAllCertifications } from "@/lib/data/certifications";
import { getSkillCategories } from "@/lib/data/skills";
import { getExperience } from "@/lib/data/experience";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  // Shows up in OpenRouter's dashboard/rankings as the calling app —
  // optional, but nice for telling this app's traffic apart from others
  // using the same key.
  headers: {
    "HTTP-Referer": "https://aliray-yan.github.io/Portfolio/",
    "X-Title": "Cyber Portfolio CMS - AI Assistant",
  },
});

/**
 * Model selection.
 *
 * openrouter/free — OpenRouter's "Free Models Router." Rather than pinning
 * one specific free model (which rotates weekly as OpenRouter adds/drops
 * capacity — see the caveat above), this routes each request to whichever
 * currently-available free model fits it, and — this is the part that
 * matters since Week 5 — it explicitly filters for models that support
 * the features the request needs, including tool calling. Pinned models
 * like the previous google/gemma-4-26b-a4b-it:free aren't guaranteed to
 * support function calling reliably; the router is. $0/token either way.
 *
 * Reasoning here is "configurable," not on-by-default — OpenRouter's own
 * examples only enable it by explicitly passing `reasoning: {enabled:
 * true}`. The explicit `enabled: false` below is belt-and-suspenders:
 * harmless if the default is already off, and keeps this file
 * self-documenting/safe if that default ever changes upstream.
 */
const MODEL_ID = "openrouter/free";
// Pin a specific model instead if you want reproducible behavior for a
// demo (the router's selection can vary between requests):
// const MODEL_ID = "nvidia/nemotron-3-ultra-550b-a55b:free"; // free, tool-calling-capable, 1M context, larger/slower
// const MODEL_ID = "google/gemma-4-26b-a4b-it:free"; // previous default — multimodal, but tool-calling support unconfirmed
// Paid fallback if free-tier rate limits become a problem before a demo:
// const MODEL_ID = "meta-llama/llama-3.3-70b-instruct"; // fractions of a cent per message

export const chatModel = openrouter(MODEL_ID);

/**
 * Generation settings.
 * Kept conservative and separate from the model id so they're easy to tune
 * without touching the provider wiring above.
 */
export const chatSettings = {
  temperature: 0.6,
  maxOutputTokens: 800,
  providerOptions: {
    openrouter: {
      reasoning: { enabled: false },
    },
  },
};

/**
 * Portfolio context injected into the system prompt.
 *
 * Built directly from lib/data/* — the same modules the public pages
 * render from — rather than a separate hardcoded text block. This is the
 * whole point of centralizing that data: the assistant's answers and the
 * page content share one source of truth and can't silently drift apart
 * when a project or skill gets added later.
 *
 * Now async because lib/data/* reads live from Postgres (Phase 3) instead
 * of static arrays — this runs once per chat request (see getSystemPrompt
 * below), not once at module load, so an edit made through the CMS
 * dashboard (Phase 5) shows up in the assistant's answers on the very next
 * message, without a server restart or redeploy.
 */
async function buildPortfolioContext(): Promise<string> {
  const [experience, projects, certifications, skillCategories] = await Promise.all([
    getExperience(),
    getAllProjects(),
    getAllCertifications(),
    getSkillCategories(),
  ]);

  const experienceLines = experience
    .map(
      (entry) =>
        `- ${entry.role}, ${entry.organization} (${entry.period}): ${entry.description}`,
    )
    .join("\n");

  const projectLines = projects
    .map(
      (project) =>
        `- ${project.title} [${project.category}] (${project.tags.join(", ")}): ${project.description}`,
    )
    .join("\n");

  const certificationLines = certifications
    .map((cert) => `- ${cert.name}, ${cert.issuer} (${cert.year})`)
    .join("\n");

  const skillLines = skillCategories
    .map(
      (category) =>
        `- ${category.title}: ${category.skills.map((s) => s.name).join(", ")}`,
    )
    .join("\n");

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

/**
 * The static instructional part of the system prompt — scope, tool
 * guidance, guidelines. This never changes per-request, so it's kept
 * separate from the (now per-request, DB-backed) portfolio context and
 * only combined with it inside getSystemPrompt() below.
 *
 * Scope, per product decision: this assistant answers (1) questions about
 * Ali's portfolio — projects, skills, certifications, background — and
 * (2) general cybersecurity questions a recruiter or visitor might ask.
 * It should NOT behave as an unscoped general-purpose assistant.
 */
function buildSystemPrompt(portfolioContext: string): string {
  return `
You are the AI assistant embedded on Ali Rayyan's cybersecurity portfolio website.
You are speaking directly to a site visitor — often a recruiter, hiring manager, or
fellow student — not to Ali himself.

Your scope is exactly two things:
1. Answering questions about Ali's background, projects, skills, and certifications,
   using the PORTFOLIO CONTEXT below as your source of truth.
2. Answering general cybersecurity questions (concepts, terminology, best practices,
   SOC/blue-team topics) as a knowledgeable, approachable guide.

You have three tools — see lib/ai/tools.ts for their exact schemas:
- searchProjects: call this when a visitor wants to browse, filter, or search
  projects rather than hear about all of them at once (e.g. "show me his security
  work", "anything with Python?"). It renders as a findings table in the chat UI —
  after calling it, add one short sentence of context, don't re-list the results
  yourself.
- getSkillsRadar: call this when a visitor asks about skill proficiency or wants a
  visual comparison (e.g. "how good is he with SIEM tools?", "show me a skills
  chart"). Only pass one of Ali's three real categories — 'SOC & SIEM', 'Recon &
  Assessment', 'Automation & Development' — or omit it for all three. Don't invent a
  category (like "cloud" or "AWS") just because a visitor asked about it; if it
  doesn't map to a real category, say so instead of guessing.
- draftIntroEmail: call this ONLY when a visitor explicitly says they want to reach
  out or get in touch with Ali about something specific. This always pauses for the
  visitor's confirmation in the chat UI — never say the email has been sent, only
  that you've drafted it for them to review and send themselves.

Guidelines:
- Be concise. Most answers should be a short paragraph or a tight bulleted list —
  visitors are skimming, not reading a report.
- If asked about something outside this scope (general coding help unrelated to Ali's
  work, personal opinions on unrelated topics, etc.), politely redirect: say this
  assistant is scoped to Ali's portfolio and cybersecurity topics.
- Never invent details about Ali that aren't in the PORTFOLIO CONTEXT or a tool
  result. If you don't know something specific (e.g. exact dates, GPA, contact
  details), say so plainly and suggest the visitor use the Contact page.
- You may use light Markdown (short lists, **bold** for key terms, inline \`code\`)
  since responses are rendered through a Markdown-aware component. Avoid large headings
  or long code blocks — this is a chat widget, not a document.

PORTFOLIO CONTEXT:
${portfolioContext}
`.trim();
}

/**
 * Assembles the full system prompt for one chat request: static
 * instructions + a freshly-fetched portfolio context. Called once per
 * POST in app/api/chat/route.ts — deliberately NOT cached at module
 * scope, so a project/skill/cert edit made in the CMS dashboard is
 * reflected in the very next chat message rather than requiring a
 * redeploy or process restart.
 */
export async function getSystemPrompt(): Promise<string> {
  return buildSystemPrompt(await buildPortfolioContext());
}
