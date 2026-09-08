# Cyber Portfolio CMS

Professional cybersecurity portfolio platform, built as a Frontend AI Engineering internship capstone. Public portfolio site + an AI assistant that can query the portfolio's real data through tool calls, backed by a live Postgres database with a single-admin CMS dashboard. See [Status](#status).

## Live Demo
https://cyber-portfolio-cms.vercel.app/

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 — Deployed Skeleton | Routing, layout, placeholder pages | ✅ Done |
| 2 — UI Development | Real content, design system, light/dark theme, component library, AI assistant + tool calling | ✅ Done |
| 3 — Database & Data Layer | Prisma + Neon, replace `lib/data/*.ts` with real queries | ✅ Done |
| 4 — Authentication | Auth.js, protect `/dashboard/*` | ✅ Done |
| 5 — CMS Functionality | Real CRUD for projects/blog/certs/skills/experience, Cloudinary upload | ✅ Done |
| 6 — Polish & Launch | SEO, Lighthouse pass, final docs | ✅ Done |

`lib/data/*.ts` reads live from Postgres via Prisma (`lib/db.ts`) — the original static arrays now live in `prisma/seed-data/*.ts` and only matter for `npm run db:seed` (fresh databases, or resetting to "factory" content). The AI assistant's system prompt is rebuilt from the same live data on every chat request, so a CMS edit shows up in its answers immediately.

`/dashboard/*` requires signing in at `/login` — single-admin credentials via Auth.js (`ADMIN_EMAIL` + a bcrypt-hashed `ADMIN_PASSWORD_HASH`, see `.env.example`). Every resource — projects, blog posts, certifications, skills, experience — has real create/edit/delete forms backed by server actions, with Zod validation and Cloudinary image upload for project screenshots and blog cover images. Settings is still read-only (profile/social/resume aren't backed by a database table — a future schema addition, not yet built).

Every public page has real metadata — canonical URLs, OpenGraph/Twitter cards, and a per-project/per-post title and description generated from live data (`lib/seo.ts`) rather than one generic title site-wide. `/sitemap.xml` and `/robots.txt` are generated dynamically (`app/sitemap.ts`, `app/robots.ts`) — the sitemap pulls current project and blog slugs straight from the database, and the admin dashboard is excluded from both. The homepage carries JSON-LD `Person` structured data, and the OG image, Twitter card image, and favicon are all generated at request time (`app/opengraph-image.tsx`, `app/twitter-image.tsx`, `app/icon.tsx`) rather than static files.

**All six phases are now complete.** See [Known Limitations / Next Steps](#known-limitations--next-steps) for what's deliberately out of scope.

**Week 5 also included a second assignment — resilience/error handling for the chat flow.** See [Resilience & Error Handling](#resilience--error-handling) below.

## Tech Stack
- Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)
- Tailwind CSS v4
- Prisma 7 (driver adapters, `@prisma/adapter-pg`) + Neon Postgres
- Auth.js (next-auth v5) — Credentials provider, JWT sessions, single admin
- Cloudinary — image upload for project screenshots and blog cover images
- Zod — server-side form validation for every CMS resource
- `next/og` (`ImageResponse`) — dynamic OG image, Twitter card image, and favicon; no static image assets
- Vercel AI SDK (`ai` v7, `@ai-sdk/react`) + OpenRouter — streaming chat with server- and client-side tool calling
- Anime.js v4 — entrance/reveal animations and tool-call state transitions
- next-themes — light/dark mode
- Node's built-in test runner (`node --test`, zero extra dependencies) for `lib/ai/*.test.ts`
- Deployed on Vercel

## AI Portfolio Assistant

A floating chat widget (`components/chat/ChatWidget.tsx`) on every public page. It answers questions about Ali's background using a system prompt built dynamically from `lib/data/*` (`lib/ai/config.ts` → `buildPortfolioContext()`), general cybersecurity Q&A, and — as of the Week 5 generative-UI assignment — **three tools** it can call mid-conversation to pull live data or take a confirmed action, rendered as real UI components instead of text.

**Model:** `openrouter/free` (`lib/ai/config.ts`). This is OpenRouter's Free Models Router — rather than pinning one specific free model (which rotates weekly as capacity changes), it routes each request to whichever available free model fits it, explicitly filtering for the features the request needs, including tool calling. $0/token either way. A specific model can be pinned instead for reproducible demo behavior — see the commented alternatives in `config.ts`.

### Tool contracts

Defined in `lib/ai/tools.ts` with Zod input schemas. Full descriptions (used as model guidance) are in that file; shapes below are the return contract a consumer of the chat API can rely on.

---

**`searchProjects`** — server-executed, always resolves (zero matches is a valid result, not an error).

```ts
input:  { query?: string; category?: "Security" | "Development" | "Research"; limit?: number /* 1–8, default 6 */ }
output: {
  query: string | null;
  category: string | null;
  totalMatches: number;
  returned: number;
  projects: Array<{
    slug: string; title: string; description: string; category: string;
    tags: string[]; githubUrl: string | null; featured: boolean;
  }>;
}
```
Rendered by `components/chat/tool-parts/ProjectSearchPart.tsx` as a findings list (title, category badge, description, tags, GitHub link).

---

**`getSkillsRadar`** — server-executed, and can genuinely fail: `category` is free text, not a strict enum, so a category outside Ali's real three (`SOC & SIEM`, `Recon & Assessment`, `Automation & Development`) throws a descriptive `Error` instead of guessing a match. That's the reproducible failure path behind the tool's error state — ask the assistant for a "cloud skills chart" to trigger it.

```ts
input:  { category?: string } // omit for all three categories
output: {
  categories: Array<{
    title: string;
    skills: Array<{ name: string; level: "Beginner" | "Intermediate" | "Advanced"; score: number; maxScore: number }>;
  }>;
}
// throws: Error("No skill category matches "<x>". Ali's real categories are: ...")
```
Rendered by `components/chat/tool-parts/SkillsRadarPart.tsx` as a hand-rolled, Anime.js-animated horizontal bar chart (no charting library).

---

**`draftIntroEmail`** — **client-side tool, no `execute`.** Per the AI SDK's tool contract, a tool with no `execute` is never run automatically: the call streams to the browser and sits in `input-available` state until the UI resolves it. This is the "confirmation before an action runs" tool the Week 5 brief calls for — nothing is sent anywhere until a human clicks a button.

```ts
input:  { subject: string /* max 80 chars */; note: string /* max 400 chars, visitor's voice */ }
output: { confirmed: boolean; method: "mailto" | null }
```
Rendered by `components/chat/tool-parts/IntroEmailPart.tsx`: the `input-available` state shows an editable-looking preview (To / Subject / Message) with **Send via email** / **Cancel**. Confirming opens a pre-filled `mailto:` link in the visitor's own email client (via `lib/constants.ts`'s `SITE_EMAIL`) — the server never sends anything — and resolves the tool via `useChat`'s `addToolResult`. `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls` (set in `ChatWidget.tsx`) lets the model respond to the visitor's choice once resolved.

### Tool lifecycle states

Every tool part renders one of four states, each answering a different question (`components/chat/tool-parts/shared.tsx` → `ToolShell`), with an Anime.js crossfade between states instead of a hard swap (`lib/motion/useStateTransition.ts`):

| State | Question it answers | Visual |
|---|---|---|
| `input-streaming` | What is it doing, with what input? | Dashed border, muted tone, terminal-style line with a blinking cursor as arguments stream in |
| `input-available` | What's happening now? *(or, for `draftIntroEmail`: what do you want to do?)* | Amber/secondary tone, spinner — or, for the confirmation tool, the actual Confirm/Cancel UI |
| `output-available` | What came back? | Primary tone, check icon, the real component — findings list, bar chart, or send receipt |
| `output-error` | What went wrong? | Destructive tone, alert icon, the thrown error's message — not a stack trace |

Types are fully wired end to end via `lib/ai/message-types.ts` (`InferUITools`) — no `any`, no manual casting of `part.input` / `part.output` anywhere in the tool-part components.

## Resilience & Error Handling

The Week 5 resilience assignment: handle the ways the chat flow (the primary flow) can fail, deliberately, rather than let any of them show a crash or a dead end.

### Failure inventory → handling

| Failure / edge case | Handling |
|---|---|
| Malformed request body | `app/api/chat/route.ts` catches the `req.json()` parse and returns `400` with a plain-language message |
| Empty / missing messages | Same route, explicit check → `400` |
| API error mid-stream (provider outage, dropped connection) | `onError` inside `toUIMessageStream` catches it, logs the real error server-side, returns a safe message that becomes `useChat`'s `error.message` on the client |
| Rate limit (429) | `lib/ai/errors.ts` → `describeError()` detects `statusCode === 429` specifically and returns a "wait a few seconds" message, not the generic one |
| Provider 5xx | Same function, distinct "temporarily unavailable" message |
| Client-side network failure (request never reaches the server) | Surfaces through the same `useChat` `error` state — `ChatWidget.tsx`'s error banner handles it identically to a mid-stream failure, on purpose (see the comment at the top of `route.ts`) |
| Chat failure of any kind → recovery | Error banner with a **Retry** button (`ChatWidget.tsx`) — calls `regenerate()`, which resends only the failed turn, never duplicates the conversation; guarded against double-clicks via a synchronous `isRetrying` flag |
| Empty input | Send is disabled while the textarea is empty/whitespace-only; also re-checked before `sendMessage` fires |
| No search results | `searchProjects` returns a valid empty result (not an error) → `ProjectSearchPart.tsx` renders a "no projects matched, try a broader keyword" message |
| Unknown skill category | `getSkillsRadar` throws a real, descriptive error → `SkillsRadarPart.tsx` renders the designed error state, not a crash |
| First-run empty state | Chat opens with a short prompt + 3 clickable, click-to-fill example questions — not a bare "no messages yet" |
| Slow response | `ThinkingIndicator.tsx` adds a "taking a little longer than usual…" line after 6s, instead of the same silent dots indefinitely |
| Render/data errors elsewhere in the app | `app/error.tsx` (route-segment boundary, "Try again" + "Go home") and `app/global-error.tsx` (last resort if the root layout itself throws) |

### Why a typing-dots indicator, not a content skeleton

Deliberate, not an oversight — see the comment at the top of `ThinkingIndicator.tsx`. Response length varies from one sentence to several paragraphs, so a skeleton shaped like "the eventual answer" would mismatch what arrives more often than not — and per this assignment's own mentor guidance, a skeleton that doesn't match the real content causes a worse layout jump than a plain, fixed-size indicator would. The tool-call pending states (`ToolShell`'s `streaming`/`pending` tones) *are* real skeletons, because there the eventual shape (a findings list, a chart) is actually known in advance.

### Sabotage testing

Tested directly against the dev server with `curl` (malformed body, empty messages, a killed mid-request connection) and against a **real** thrown provider error — this sandbox's network policy blocks `openrouter.ai`, which produced a genuine `AI_APICallError` end to end and confirmed the error path against real SDK behavior, not just a mock. Couldn't exercise an actual 429 or a full token-by-token happy-path stream live for the same reason (see `PROJECT_HANDOFF.md` for what to re-verify once this runs somewhere with real network access).

What that live pass couldn't cover is pinned down with an automated test instead — no framework dependency, Node's built-in test runner:

```bash
npm test
```

- `lib/ai/errors.test.ts` — the 429/5xx/generic error-message mapping `route.ts` depends on, plus an explicit check that no message ever leaks a URL, stack trace, or key-shaped string
- `lib/ai/tools.test.ts` — `searchProjects`'s empty-result path, and `getSkillsRadar`'s "malformed input" case (an unknown category throwing a specific, friendly error instead of guessing or crashing)

### Mobile Safari fixes

- Every full-viewport layout (`app/layout.tsx`, `(public)/layout.tsx`, `(dashboard)/layout.tsx`, the login page, the chat widget's mobile view) uses `dvh` instead of `vh`/`h-screen` — `100vh` doesn't account for Safari's collapsing address bar or the on-screen keyboard, `dvh` does
- `ChatWidget.tsx` locks background scroll while open and sets `overscroll-contain` on the message list, so rubber-band scrolling inside the chat doesn't also drag the page behind it
- The input bar and the floating toggle button both pad for `env(safe-area-inset-bottom)`, clearing the home-indicator area on notched iPhones
- The message textarea stays at `font-size: 16px` — anything smaller makes iOS Safari auto-zoom on focus

## Design System

Warm cream/terracotta palette, defined as CSS custom properties in `app/globals.css` and mapped through Tailwind v4's `@theme inline`, with a `.dark` override — every color was checked against WCAG contrast (body text ≥4.5:1, borders ≥3:1) rather than eyeballed. Toggled via `components/theme/ThemeToggle.tsx` (next-themes).

Reusable animation primitive: `components/motion/Reveal.tsx` fades + rises a section's children in (staggered, Anime.js), either on mount (hero) or the first time it scrolls into view (below-the-fold sections). Currently used on the homepage; drop it around any other section for the same entrance treatment.

## Local Development

```bash
git clone [repo-url]
cd cyber-portfolio-cms
npm install
cp .env.example .env.local
# add OPENROUTER_API_KEY (free, no card — https://openrouter.ai/keys)
# add DATABASE_URL (Neon Postgres — pooled connection string)
npm run db:migrate    # applies prisma/migrations/ to your database
npm run db:seed       # populates it from prisma/seed-data/*.ts
# add AUTH_SECRET (openssl rand -base64 33) and AUTH_URL=http://localhost:3000
# add ADMIN_EMAIL, and ADMIN_PASSWORD_HASH via:
npm run hash-password -- "your-password"
# add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# (free tier at https://cloudinary.com — needed for project/blog image upload)
npm run dev
```

On Vercel: Project → Settings → Environment Variables → add `OPENROUTER_API_KEY`, `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for Production, Preview, and Development (`AUTH_URL` isn't needed there — Auth.js infers it on Vercel), then redeploy.

## Project Structure

```
app/
  (public)/            -> Navbar + Footer + ChatWidget wrap every visitor-facing route
  (auth)/login/        -> Real Auth.js login (server action + useActionState form)
  (dashboard)/         -> Admin routes; gated by proxy.ts + a session check in layout.tsx.
                           Real CRUD (create/edit/delete) for every resource, each with its own
                           actions.ts (server actions), new/ and [id]/edit/ routes
  api/auth/[...nextauth]/route.ts -> Auth.js route handler (sign-in/out, session, callbacks)
  api/chat/route.ts    -> Streaming chat endpoint — wires portfolioTools into streamText, layered error handling
  error.tsx             -> Route-segment error boundary (page-level failures)
  global-error.tsx       -> Last-resort boundary if the root layout itself throws
  health/              -> Server-side health check (proves SSR works)
  sitemap.ts            -> /sitemap.xml — static routes + live project/blog slugs (Phase 6)
  robots.ts             -> /robots.txt — disallows /dashboard, /login, /api (Phase 6)
  opengraph-image.tsx    -> Default OG/social preview image, generated at request time (Phase 6)
  twitter-image.tsx      -> Same, for Twitter's card image (Phase 6)
  icon.tsx              -> Favicon, generated at request time (Phase 6)

components/
  ui/                  -> Button, LinkButton, Card, Badge, Input, Textarea, Select, PageHeader,
                           EmptyState, StatCard, ...
  dashboard/            -> ProjectForm, BlogPostForm, CertificationForm, ExperienceForm,
                            SkillCategoryForm, SkillForm, ImageUploadField, DeleteButton — the
                            CMS's shared form/list building blocks (Phase 5)
  layout/               -> Navbar, Footer, DashboardSidebar (session-aware, sign-out), NavLink
  theme/                -> ThemeProvider, ThemeToggle (light/dark)
  motion/               -> Reveal (Anime.js entrance/scroll-reveal primitive)
  chat/                 -> ChatWidget (retry, mobile-Safari fixes), ChatMessage, ToolPart (dispatcher),
                            ThinkingIndicator (slow-response state), useAutoScroll
  chat/tool-parts/      -> One renderer per tool (ProjectSearchPart, SkillsRadarPart, IntroEmailPart) + shared chrome

lib/
  ai/config.ts          -> Model + system prompt; getSystemPrompt() rebuilds the portfolio context from
                            live data on every request (not cached at module scope)
  ai/tools.ts            -> Tool definitions (Zod schemas + execute) — see Tool contracts above
  ai/tools.test.ts       -> Unit tests for the tools' pure filter/select logic, against fixtures (no live DB)
  ai/errors.ts            -> describeError() — provider-error-to-visitor-message mapping, unit tested
  ai/errors.test.ts       -> Automated tests for describeError()
  ai/message-types.ts    -> InferUITools wiring — fully typed UIMessage for the chat widget
  motion/useStateTransition.ts -> Anime.js crossfade hook for tool-part states and the error banner
  data/                  -> projects, certifications, skills, experience, blog — live Prisma reads;
                             each also exports a getXById() for the dashboard's edit forms
  validations/            -> One Zod schema per CMS resource, shared by that resource's server actions
  db.ts                  -> The one PrismaClient instance (driver adapter, Neon-ready)
  cloudinary.ts            -> uploadImage() — validates type/size, uploads, returns a secure URL
  seo.ts                  -> buildMetadata() / buildPersonJsonLd() — shared SEO helpers (Phase 6)
  auth.config.ts          -> Edge-safe Auth.js config (routing rules) — used by proxy.ts
  auth.ts                 -> Full Auth.js config (Credentials provider, bcrypt) — used by server code
  auth-actions.ts          -> signOutAction server action
  require-admin.ts         -> requireAdminSession() — every mutating server action calls this first
  constants.ts            -> Site-wide constants, nav links, real contact info
  utils.ts                -> cn() class-merge helper

prisma/
  schema.prisma          -> Data model (Project, SkillCategory, Skill, Certification, BlogPost, ExperienceEntry)
  migrations/             -> 20260906190827_init (Phase 3), 20260908120000_add_image_urls (Phase 5)
  seed.ts                 -> Populates the DB from prisma/seed-data/*.ts (npm run db:seed)
  seed-data/              -> The "factory" content — moved out of lib/data/*.ts once those switched to live queries

scripts/
  hash-password.mjs      -> CLI: npm run hash-password -- "password" -> ADMIN_PASSWORD_HASH

proxy.ts                 -> Route protection for /dashboard/* (Next 16's replacement for middleware.ts)
```

## Known Limitations / Next Steps

- Settings (`/dashboard/settings`) is read-only — profile bio, social links, and resume aren't backed by a database table yet; that'd need a small schema addition (e.g. a single-row `SiteSettings` model), not built here.
- No "remove image" control on the edit forms — uploading a new image replaces the old one, but there's no way to clear an image back to none without going into Prisma Studio (`npm run db:studio`) directly.
- Replaced/deleted images aren't cleaned up on Cloudinary — the old asset is simply orphaned there rather than deleted. Fine at this scale (a personal portfolio, occasional edits); would want `cloudinary.uploader.destroy()` wiring if this saw heavier use.
- No custom font in the generated OG image/favicon (`app/opengraph-image.tsx`, `app/icon.tsx`) — deliberately: a system sans-serif keeps image generation dependency-free. Loading Space Grotesk there is possible (fetch the font file and pass it to `ImageResponse`'s `fonts` option) but wasn't worth the added failure mode for this.
- Only the homepage carries JSON-LD (`Person` schema). Adding `Article`/`CreativeWork` schema to individual project and blog post pages would be a reasonable next SEO step, not done here.
- Real Lighthouse numbers weren't re-measured after this session's changes — this sandbox can't reach Google Fonts or run a full `next build` (see below), so there's no way to run Lighthouse against the actual result here. Worth a real Lighthouse pass on the deployed site to confirm the metadata/sitemap/image work actually moved the score.
- The chat model (`openrouter/free`) can route to different underlying free models between requests; pin a specific model (see comments in `lib/ai/config.ts`) for reproducible demo behavior.
- The resilience work (error handling, retry) was sabotage-tested against the dev server directly, but this session's sandbox couldn't reach `openrouter.ai` at all, so a full token-by-token happy-path stream and a real 429 weren't exercised live — only via a real thrown error (a 403 from the sandbox's own network block) and unit tests. Worth a manual pass with real network access before recording the Checkpoint 1 demo: send a real message end to end, and try triggering a 429 by sending several messages in quick succession.
- This project's dev sandbox can't reach `binaries.prisma.sh` (network policy), Neon's Postgres endpoint, or Google Fonts, so `prisma generate`, `next build`, and anything touching a live DB connection or self-hosted fonts could only be verified by static review (`tsc --noEmit`, `eslint`, and the unit/component tests that don't need a live DB) — run the full `npm run build`, a real login, and a real create/edit/delete on each resource locally before trusting this end to end. The two new migration files (Phase 3's `20260906190827_init` and Phase 5's `20260908120000_add_image_urls`) were both hand-written for the same reason — run `npm run db:migrate` to confirm they apply cleanly.

## Author
Ali Rayyan
