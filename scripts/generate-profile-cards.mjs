// Generates the two README "Activity & Metrics" cards as static SVGs, styled
// to match this project's own dark-glass design system (see
// UI_STYLE_GUIDE.md / src/app/globals.css) instead of a generic third-party
// template. Run in CI (see .github/workflows/profile-cards.yml) and the
// output is committed to the `generated` branch; the README references
// those static files directly, never a live third-party render.
//
// Brand tokens pulled straight from src/app/globals.css, not re-invented:
//   background #000000, foreground #f5f5f5, muted #8e92a9,
//   cyan accent rgba(95, 225, 255, *) — the one glow color used throughout
//   the site (cursor, selection, hover states, the poetic footer text).

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

// Resolved against the current working directory, not this file's own
// location — the CI workflow runs this script copied out to a scratch
// location on the `generated` branch's checkout, so an __dirname-relative
// path would point at the wrong tree entirely.
const OUTPUT_DIR = resolve(process.cwd(), "profile-summary-card-output");

const USERNAME = process.env.USERNAME || process.env.GITHUB_REPOSITORY_OWNER || "DhanushSantosh";
const TOKEN = process.env.GITHUB_TOKEN || process.env.SUMMARY_GITHUB_TOKEN;

if (!TOKEN) {
  console.error("Missing GITHUB_TOKEN / SUMMARY_GITHUB_TOKEN — needed to query the GraphQL API.");
  process.exit(1);
}

// ---- design tokens (see file header) ----------------------------------
const COLOR_BG = "#000000";
const COLOR_BORDER = "rgba(255, 255, 255, 0.12)";
const COLOR_TRACK = "rgba(255, 255, 255, 0.08)";
const COLOR_TITLE = "#5fe1ff";
const COLOR_VALUE = "#f5f5f5";
const COLOR_LABEL = "#8e92a9";
const COLOR_LANG_FALLBACK = "#8e92a9";
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
// GitHub sandboxes SVG fonts in <img> context, so this stays a safe system
// stack — the site's actual Geist typeface can't load here regardless.

function escapeXml(value) {
  return String(value).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]);
}

function formatCompact(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(n);
}

// ---- GitHub GraphQL -----------------------------------------------------
async function graphql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GitHub GraphQL request failed: ${res.status} ${await res.text()}`);
  }
  const payload = await res.json();
  if (payload.errors) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(payload.errors)}`);
  }
  return payload.data;
}

async function fetchProfileData(username) {
  // Phase 1: repos (stars + languages) + contributed-to count + the list of
  // years with any contribution activity, so phase 2 can sum commits/PRs/
  // issues across every year — contributionsCollection defaults to the
  // trailing 12 months if no from/to is given, which would badly undercount
  // an account with real history.
  const base = await graphql(
    `
    query ($login: String!) {
      user(login: $login) {
        name
        login
        repositoriesContributedTo(contributionTypes: [COMMIT, ISSUE, PULL_REQUEST], first: 1) {
          totalCount
        }
        contributionsCollection {
          contributionYears
        }
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
          totalCount
          nodes {
            stargazerCount
            languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node { name color }
              }
            }
          }
        }
      }
    }
  `,
    { login: username },
  );

  const user = base.user;
  const years = user.contributionsCollection.contributionYears;

  // Phase 2: one aliased query, one round trip, summing commits/PRs/issues
  // across every contribution year.
  const yearQuery = years
    .map(
      (year, i) => `
      y${i}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
      }`,
    )
    .join("\n");

  const perYear = years.length
    ? await graphql(`query ($login: String!) { user(login: $login) { ${yearQuery} } }`, { login: username })
    : { user: {} };

  const totals = years.reduce(
    (acc, _year, i) => {
      const y = perYear.user[`y${i}`];
      acc.commits += y.totalCommitContributions;
      acc.prs += y.totalPullRequestContributions;
      acc.issues += y.totalIssueContributions;
      return acc;
    },
    { commits: 0, prs: 0, issues: 0 },
  );

  const totalStars = user.repositories.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0);

  const languageBytes = new Map();
  for (const repo of user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const key = edge.node.name;
      const existing = languageBytes.get(key) ?? { size: 0, color: edge.node.color };
      existing.size += edge.size;
      languageBytes.set(key, existing);
    }
  }
  // Real per-language GitHub/linguist colors, not a hand-picked categorical
  // set — the dataviz skill's palette validator (scoped to categorical
  // palettes a design system invents) fails a couple of these pairwise
  // (e.g. TypeScript blue vs Go cyan, ΔE 14.5, just under its 15 floor), but
  // that check assumes color is the only identity carrier. Here it isn't:
  // each language is its own labeled row (name + %), so identity survives
  // color vision deficiency or a monochrome render on text alone — the
  // established convention for this kind of card, matching what any
  // "top languages" widget (including the one this replaces) already does.
  const totalBytes = [...languageBytes.values()].reduce((sum, v) => sum + v.size, 0);
  const topLanguages = [...languageBytes.entries()]
    .map(([name, { size, color }]) => ({
      name,
      color: color || COLOR_LANG_FALLBACK,
      pct: totalBytes > 0 ? (size / totalBytes) * 100 : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  return {
    stars: totalStars,
    commits: totals.commits,
    prs: totals.prs,
    issues: totals.issues,
    contributedTo: user.repositoriesContributedTo.totalCount,
    topLanguages,
  };
}

// ---- SVG rendering --------------------------------------------------------
function cardShell(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="20" fill="${COLOR_BG}" stroke="${COLOR_BORDER}" stroke-width="1"/>
  <text x="24" y="34" font-family="${FONT_STACK}" font-size="15" font-weight="600" fill="${COLOR_TITLE}">${escapeXml(title)}</text>
  ${body}
</svg>`;
}

function renderStatsCard(data) {
  const width = 480;
  const height = 170;
  const tiles = [
    { label: "Stars", value: data.stars },
    { label: "Commits", value: data.commits },
    { label: "Pull Requests", value: data.prs },
    { label: "Issues", value: data.issues },
    { label: "Repos Contributed", value: data.contributedTo },
  ];
  const padding = 24;
  const usable = width - padding * 2;
  const tileWidth = usable / tiles.length;

  const body = tiles
    .map((tile, i) => {
      const cx = padding + tileWidth * i + tileWidth / 2;
      return `
  <text x="${cx}" y="98" font-family="${FONT_STACK}" font-size="27" font-weight="700" fill="${COLOR_VALUE}" text-anchor="middle">${formatCompact(tile.value)}</text>
  <text x="${cx}" y="122" font-family="${FONT_STACK}" font-size="10" font-weight="600" letter-spacing="0.6" fill="${COLOR_LABEL}" text-anchor="middle">${escapeXml(tile.label.toUpperCase())}</text>`;
    })
    .join("");

  return cardShell(width, height, "✦ GitHub Stats", body);
}

function renderLanguagesCard(data) {
  const width = 480;
  const rowHeight = 28;
  const rowsTop = 56;
  const height = rowsTop + data.topLanguages.length * rowHeight + 14;
  const padding = 24;
  const barTop = 14; // offset within each row, below the label baseline
  const barHeight = 6;
  const trackWidth = width - padding * 2;

  const body = data.topLanguages
    .map((lang, i) => {
      const rowY = rowsTop + i * rowHeight;
      const barY = rowY + barTop;
      const barWidth = Math.max((lang.pct / 100) * trackWidth, barHeight); // never below a pill's own diameter
      return `
  <text x="${padding}" y="${rowY}" font-family="${FONT_STACK}" font-size="12.5" font-weight="600" fill="${COLOR_VALUE}">${escapeXml(lang.name)}</text>
  <text x="${width - padding}" y="${rowY}" font-family="${FONT_STACK}" font-size="12" fill="${COLOR_LABEL}" text-anchor="end">${lang.pct.toFixed(1)}%</text>
  <rect x="${padding}" y="${barY}" width="${trackWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${COLOR_TRACK}"/>
  <rect x="${padding}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${lang.color}"/>`;
    })
    .join("");

  return cardShell(width, height, "✦ Top Languages", body);
}

// ---- main -----------------------------------------------------------------
const data = await fetchProfileData(USERNAME);
mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(resolve(OUTPUT_DIR, "stats.svg"), renderStatsCard(data));
writeFileSync(resolve(OUTPUT_DIR, "languages.svg"), renderLanguagesCard(data));

console.log("Generated profile cards:", {
  stars: data.stars,
  commits: data.commits,
  prs: data.prs,
  issues: data.issues,
  contributedTo: data.contributedTo,
  topLanguages: data.topLanguages.map((l) => `${l.name} ${l.pct.toFixed(1)}%`),
});
