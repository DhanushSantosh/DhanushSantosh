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
// v1 used a flat #000000 fill with a barely-visible border — on GitHub's own
// dark theme (also near-black) that read as no card at all, just floating
// text (confirmed from a live screenshot, not assumed). The real site never
// ships a black surface alone: UI_STYLE_GUIDE.md pairs it with a lifted
// bg-white/5-style fill, a visible border, and an inset top highlight for
// "glass" depth (see ContactSection's shadow-[inset_0_1px_0_0_...]). Same
// treatment here.
const COLOR_BG = "#0c0c0f";
const COLOR_BORDER = "rgba(255, 255, 255, 0.16)";
const COLOR_INNER_HIGHLIGHT = "rgba(255, 255, 255, 0.09)";
const COLOR_DIVIDER = "rgba(255, 255, 255, 0.09)";
const COLOR_TRACK = "rgba(255, 255, 255, 0.09)";
const COLOR_BAR_STROKE = "rgba(255, 255, 255, 0.18)";
const COLOR_TITLE = "#5fe1ff";
const COLOR_ICON = "rgba(95, 225, 255, 0.85)";
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

// ---- icons ----------------------------------------------------------------
// Feather Icons (MIT) — the exact set the site's own UI already draws on via
// react-icons/fi (FiGithub, FiStar, FiGitBranch, FiPlay, ... in
// ProjectsSection/SiteHeader/ContactSection). Native 24x24 stroke grid;
// positioned via a wrapping <g transform>, so callers pick size/placement
// without touching the path data.
const ICONS = {
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="${COLOR_ICON}" stroke="${COLOR_ICON}" stroke-width="1.4" stroke-linejoin="round"/>`,
  commit: `<circle cx="12" cy="12" r="4" fill="none" stroke="${COLOR_ICON}" stroke-width="2"/><line x1="1.05" y1="12" x2="7" y2="12" stroke="${COLOR_ICON}" stroke-width="2" stroke-linecap="round"/><line x1="17.01" y1="12" x2="22.96" y2="12" stroke="${COLOR_ICON}" stroke-width="2" stroke-linecap="round"/>`,
  pullRequest: `<circle cx="18" cy="18" r="3" fill="none" stroke="${COLOR_ICON}" stroke-width="2"/><circle cx="6" cy="6" r="3" fill="none" stroke="${COLOR_ICON}" stroke-width="2"/><path d="M13 6h3a2 2 0 0 1 2 2v7" fill="none" stroke="${COLOR_ICON}" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="9" x2="6" y2="21" stroke="${COLOR_ICON}" stroke-width="2" stroke-linecap="round"/>`,
  alertCircle: `<circle cx="12" cy="12" r="10" fill="none" stroke="${COLOR_ICON}" stroke-width="2"/><line x1="12" y1="7.5" x2="12" y2="13" stroke="${COLOR_ICON}" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.1" fill="${COLOR_ICON}"/>`,
  gitBranch: `<line x1="6" y1="3" x2="6" y2="15" stroke="${COLOR_ICON}" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="6" r="3" fill="none" stroke="${COLOR_ICON}" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="none" stroke="${COLOR_ICON}" stroke-width="2"/><path d="M18 9a9 9 0 0 1-9 9" fill="none" stroke="${COLOR_ICON}" stroke-width="2" stroke-linecap="round"/>`,
};

function icon(name, cx, cy, size) {
  const scale = size / 24;
  return `<g transform="translate(${cx - size / 2}, ${cy - size / 2}) scale(${scale})">${ICONS[name]}</g>`;
}

// ---- SVG rendering --------------------------------------------------------
function cardShell(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="20" fill="${COLOR_BG}" stroke="${COLOR_BORDER}" stroke-width="1"/>
  <path d="M 20.5 1 H ${width - 20.5}" stroke="${COLOR_INNER_HIGHLIGHT}" stroke-width="1" stroke-linecap="round"/>
  <text x="24" y="33" font-family="${FONT_STACK}" font-size="15" font-weight="600" fill="${COLOR_TITLE}">${escapeXml(title)}</text>
  ${body}
</svg>`;
}

function renderStatsCard(data) {
  const width = 500;
  const height = 172;
  const tiles = [
    { label: "Stars", value: data.stars, icon: "star" },
    { label: "Commits", value: data.commits, icon: "commit" },
    { label: "Pull Requests", value: data.prs, icon: "pullRequest" },
    { label: "Issues", value: data.issues, icon: "alertCircle" },
    { label: "Repos Contributed", value: data.contributedTo, icon: "gitBranch" },
  ];
  const padding = 26;
  const usable = width - padding * 2;
  const tileWidth = usable / tiles.length;
  const iconY = 74;
  const valueY = 112;
  const labelY = 136;

  const body = tiles
    .map((tile, i) => {
      const cx = padding + tileWidth * i + tileWidth / 2;
      const divider =
        i > 0
          ? `<line x1="${padding + tileWidth * i}" y1="56" x2="${padding + tileWidth * i}" y2="150" stroke="${COLOR_DIVIDER}" stroke-width="1"/>`
          : "";
      return `
  ${divider}
  ${icon(tile.icon, cx, iconY, 22)}
  <text x="${cx}" y="${valueY}" font-family="${FONT_STACK}" font-size="26" font-weight="700" fill="${COLOR_VALUE}" text-anchor="middle">${formatCompact(tile.value)}</text>
  <text x="${cx}" y="${labelY}" font-family="${FONT_STACK}" font-size="9.5" font-weight="600" letter-spacing="0.5" fill="${COLOR_LABEL}" text-anchor="middle">${escapeXml(tile.label.toUpperCase())}</text>`;
    })
    .join("");

  return cardShell(width, height, "✦ GitHub Stats", body);
}

function renderLanguagesCard(data) {
  const width = 500;
  const rowHeight = 32;
  const rowsTop = 58;
  const height = rowsTop + data.topLanguages.length * rowHeight + 16;
  const padding = 26;
  const dotRadius = 4;
  const barTop = 16; // offset within each row, below the label baseline
  const barHeight = 8;
  const trackWidth = width - padding * 2 - dotRadius * 2 - 8; // leave room for the leading dot

  const body = data.topLanguages
    .map((lang, i) => {
      const rowY = rowsTop + i * rowHeight;
      const barY = rowY + barTop;
      const barX = padding + dotRadius * 2 + 8;
      const barWidth = Math.max((lang.pct / 100) * trackWidth, barHeight); // never below a pill's own diameter
      return `
  <circle cx="${padding + dotRadius}" cy="${rowY - 4}" r="${dotRadius}" fill="${lang.color}" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>
  <text x="${barX}" y="${rowY}" font-family="${FONT_STACK}" font-size="13" font-weight="600" fill="${COLOR_VALUE}">${escapeXml(lang.name)}</text>
  <text x="${width - padding}" y="${rowY}" font-family="${FONT_STACK}" font-size="12" fill="${COLOR_LABEL}" text-anchor="end">${lang.pct.toFixed(1)}%</text>
  <rect x="${barX}" y="${barY}" width="${trackWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${COLOR_TRACK}"/>
  <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${lang.color}" stroke="${COLOR_BAR_STROKE}" stroke-width="1"/>`;
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
