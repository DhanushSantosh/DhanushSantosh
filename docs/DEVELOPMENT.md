# Development

`README.md` at the repo root doubles as the GitHub profile README for this
account (this repo is named to match the username, which GitHub renders as a
profile page) — it's deliberately not developer documentation. This file is.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in GITHUB_TOKEN at minimum
npm run dev
```

Requires Node 26.x (see `engines` in `package.json`; CI is pinned to the same
major).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_USERNAME` | No (defaults to `DhanushSantosh`) | Whose GitHub data the Projects/Activity sections pull from. |
| `GITHUB_TOKEN` | Recommended | A GitHub personal access token (no scopes needed for public data). Without it, `src/lib/github.ts` falls back to unauthenticated GitHub API calls, which hit a much lower rate limit. |
| `GITHUB_WEBHOOK_SECRET` | Only for `/api/github/refresh` | HMAC secret verifying that revalidation requests actually came from GitHub. |
| `CRON_SECRET` | Only for the scheduled refresh | Bearer token verifying that `/api/github/refresh` requests come from Vercel's own cron trigger (see `vercel.json`), not an arbitrary caller. |
| `NEXT_ALLOWED_DEV_ORIGINS` | No | Comma-separated bare hostnames (no protocol/port) allowed to load dev-server resources — e.g. a Tailscale IP for testing from a phone on the same network. Defaults to one hardcoded fallback IP in `next.config.ts`; override this instead of editing that default when your own dev machine's address changes. |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Turbopack dev server (Turbopack avoids an upstream Webpack/PDF.js conflict in dev; see the comment in `next.config.ts`). |
| `npm run build` | Production build — deliberately on Webpack, not Turbopack, for Serwist (PWA service worker) compatibility. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest, scoped to `src/**` only (see `vitest.config.mts` — without that scoping, Vitest's default discovery also picks up any nested git worktree checked out under this repo, silently doubling every test). Includes unit tests plus `src/lib/github-integration.test.ts`, which exercises `getGitHubPortfolioData` end-to-end against a mocked `fetch` (invalid token, partial page, timeouts, malformed HTML). |
| `npm run test:e2e` | Playwright, real-browser end-to-end tests in `e2e/` (modal keyboard/focus, CV worker loading, contact, anchor/Back navigation, no-JS degradation). Boots its own server per `playwright.config.ts`: a production build+start in CI, or the dev server locally (reuses one already running on port 3100, starts one otherwise). First run locally needs browser binaries: `npx playwright install chromium`. |
| `npm run deadcode` | `knip` — unused exports/files. |
| `npm run analyze` | Production build with the bundle analyzer enabled. |

## GitHub data pipeline and caching

`src/lib/github.ts` is the single entry point (`getGitHubPortfolioData`) for
everything the Projects/Activity/Expertise sections show. A few things worth
knowing before touching it:

- **Two data sources, one interface.** It tries GitHub's GraphQL API first
  (richer data, requires `GITHUB_TOKEN`) and falls back to the public REST
  API if that fails or no token is set — see `getGraphQLPortfolioData` /
  `getRestFallbackPortfolioData`.
- **Caching is via Next's `fetch()` cache**, not a database: every fetch
  passes `next: { revalidate: 3600, tags: [...] }`. `GITHUB_TAGS` (profile /
  activity / projects) are the granular tags `/api/github/refresh` and
  `/api/github/revalidate` use to invalidate just the relevant slice via
  `revalidateTag()`, rather than the whole cache.
- **Per-project overrides** (a custom live URL, a demo video, hiding a repo,
  linking a hand-authored case study) live in `src/config/projectOverrides.ts`,
  keyed by `owner/repo`. Case-study content itself lives in
  `src/data/projects.ts`; see the case-study section below.
- **Bounded fetch timeouts**: every GitHub request carries
  `signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS)` so a hung upstream
  request degrades gracefully to the unavailable/partial-data UI state
  instead of hanging the whole page render. There is currently no
  persistent last-known-good snapshot beyond what Next's fetch cache already
  retains — a full outage where the cache has also expired will show the
  degraded/empty state. Building real resilience against that (a static
  fallback snapshot, or an external KV/Blob store) is a real infra decision,
  not something to bolt on silently; raise it before building it.
- **`lastSyncedAt`** is intentionally *not* `new Date()` at render time — see
  the comment on `getApproximateLastSyncedAt()`. It's floored to the current
  revalidation window instead, since the actual fetch could have happened
  anywhere up to `DEFAULT_REVALIDATE_SECONDS` (1h) ago and Next's fetch cache
  doesn't expose whether a given request was a cache hit or a real network
  fetch.

## Case studies

`src/data/projects.ts` holds hand-authored case studies (problem, audience,
role, decisions, result, constraints — real content only, no invented
metrics). Each entry needs a matching `caseStudySlug` in
`projectOverrides.ts` pointing at the same repo, which is what makes the
GitHub-driven Projects grid link to `/projects/[slug]` (see
`src/app/projects/[slug]/page.tsx`) instead of just the repo. Add a project
here only when there's something real and specific to say about it.

## Deployment

Deploys via Vercel's GitHub integration on push to `main`. `vercel.json`
configures a daily cron (`0 5 * * *`) hitting `/api/github/refresh` to keep
the GitHub-sourced sections warm even without organic traffic.
