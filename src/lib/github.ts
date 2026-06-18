import "server-only";

import { cache } from "react";

import { featuredRepos, featuredRepoLookup, type FeaturedRepoConfig } from "@/config/featuredRepos";
import { projectOverrideLookup, type ProjectOverrideConfig } from "@/config/projectOverrides";

const DEFAULT_REVALIDATE_SECONDS = 3600;
const DEFAULT_GITHUB_USERNAME = "DhanushSantosh";
const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const GITHUB_REST_ENDPOINT = "https://api.github.com";
const GITHUB_WEB_ENDPOINT = "https://github.com";

export const GITHUB_TAGS = {
  profile: "github-profile",
  activity: "github-activity",
  featured: "github-featured",
  projects: "github-projects",
} as const;

type GitHubTag = (typeof GITHUB_TAGS)[keyof typeof GITHUB_TAGS];

export type GitHubContributionDay = {
  color: string;
  contributionCount: number;
  contributionLevel: string;
  date: string;
  weekday: number;
};

export type GitHubContributionWeek = {
  contributionDays: GitHubContributionDay[];
  firstDay: string;
};

export type GitHubContributionYear = {
  totalContributions: number | null;
  weeks: GitHubContributionWeek[];
  year: number;
};

export type GitHubProfileSummary = {
  avatarUrl: string | null;
  bio: string | null;
  followers: number;
  following: number;
  lastYearContributions: number | null;
  login: string;
  name: string | null;
  publicRepos: number;
  starredCount: number | null;
  totalContributions: number | null;
  url: string;
};

export type GitHubRecentEvent = {
  id: string;
  kind: "branch" | "push" | "release" | "pull_request" | "repository" | "visibility";
  repoName: string;
  summary: string;
  timestamp: string;
  url: string;
};

export type GitHubFeaturedRepo = {
  accent: string;
  defaultBranch: string | null;
  demoUrl: string | null;
  description: string;
  forkCount: number | null;
  homepageUrl: string | null;
  isArchived: boolean;
  languageColor: string | null;
  languageName: string | null;
  liveUrl: string | null;
  name: string;
  nameWithOwner: string | null;
  openIssues: number | null;
  pushedAt: string | null;
  repoUrl: string | null;
  stack: string[];
  stars: number | null;
  summary: string;
  topics: string[];
};

export type GitHubPortfolioData = {
  available: boolean;
  contributionYears: GitHubContributionYear[];
  featuredRepos: GitHubFeaturedRepo[];
  lastSyncedAt: string;
  profile: GitHubProfileSummary | null;
  projects: GitHubProject[];
  recentEvents: GitHubRecentEvent[];
  source: "graphql" | "live-partial" | "rest-fallback" | "unavailable";
  starredRepos: GitHubStarredRepo[];
  totalProjectStars: number;
  weeks: GitHubContributionWeek[];
};

export type GitHubProject = {
  accent: string;
  defaultBranch: string | null;
  demoUrl: string | null;
  forkCount: number | null;
  homepageUrl: string | null;
  isArchived: boolean;
  isFork: boolean;
  languageName: string | null;
  liveUrl: string | null;
  name: string;
  nameWithOwner: string;
  openIssues: number | null;
  pushedAt: string | null;
  repoUrl: string;
  stack: string[];
  stars: number | null;
  summary: string;
  topics: string[];
};

export type GitHubStarredRepo = {
  description: string | null;
  languageName: string | null;
  name: string;
  nameWithOwner: string;
  url: string;
};

type GraphQLLanguage = {
  color: string | null;
  name: string;
};

type GraphQLRepositoryNode = {
  defaultBranchRef: { name: string } | null;
  description: string | null;
  forkCount: number;
  homepageUrl: string | null;
  isArchived: boolean;
  issues: { totalCount: number };
  name: string;
  nameWithOwner: string;
  primaryLanguage: GraphQLLanguage | null;
  pushedAt: string | null;
  repositoryTopics: {
    nodes: Array<{ topic: { name: string } }>;
  };
  stargazerCount: number;
  url: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type GitHubFetchResult<T> = {
  data: T | null;
  ok: boolean;
  partial: boolean;
};

type GitHubCollectionFetchResult<T> = {
  items: T[];
  ok: boolean;
  partial: boolean;
};

type GitHubGraphQLPayload = {
  user: {
    avatarUrl: string;
    bio: string | null;
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: GitHubContributionDay[];
          firstDay: string;
        }>;
      };
      contributionYears: number[];
    };
    followers: { totalCount: number };
    following: { totalCount: number };
    login: string;
    name: string | null;
    repositories: { totalCount: number };
    starredRepositories: { totalCount: number };
    url: string;
  } | null;
} & Record<string, GraphQLRepositoryNode | undefined | null>;

type GitHubContributionSummary = {
  lastYear: number | null;
  totalAllTime: number | null;
  years: GitHubContributionYear[];
  ok: boolean;
};

type GitHubRestUser = {
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  html_url: string;
  login: string;
  name: string | null;
  public_repos: number;
};

type GitHubRestRepo = {
  archived: boolean;
  default_branch: string;
  description: string | null;
  fork: boolean;
  forks_count: number;
  full_name: string;
  homepage: string | null;
  html_url: string;
  language: string | null;
  name: string;
  open_issues_count: number;
  pushed_at: string | null;
  stargazers_count: number;
  topics?: string[];
};

type GitHubRestEvent = {
  created_at: string;
  id: string;
  payload?: {
    action?: string;
    commits?: Array<{ sha: string }>;
    distinct_size?: number;
    head?: string;
    number?: number;
    pull_request?: {
      html_url?: string;
      merged?: boolean;
      title?: string;
    };
    ref?: string | null;
    ref_type?: string | null;
    release?: {
      html_url?: string;
      name?: string | null;
      tag_name?: string | null;
    };
    size?: number;
  };
  repo: {
    name: string;
  };
  type: string;
};

function getGitHubUsername() {
  return process.env.GITHUB_USERNAME?.trim() || DEFAULT_GITHUB_USERNAME;
}

function getGitHubToken() {
  return process.env.GITHUB_TOKEN?.trim() || null;
}

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function uniqueTags(tags: GitHubTag[]) {
  return Array.from(new Set(tags));
}

async function fetchGitHubGraphQL<T>(
  query: string,
  variables: Record<string, string>,
  tags: GitHubTag[],
): Promise<GitHubFetchResult<T>> {
  const token = getGitHubToken();
  if (!token) {
    return {
      data: null,
      ok: false,
      partial: false,
    };
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: {
        revalidate: DEFAULT_REVALIDATE_SECONDS,
        tags: uniqueTags(tags),
      },
    });

    if (!response.ok) {
      return {
        data: null,
        ok: false,
        partial: false,
      };
    }

    const payload = (await response.json()) as GraphQLResponse<T>;
    const data = payload.data ?? null;
    const hasErrors = Boolean(payload.errors?.length);

    return {
      data,
      ok: Boolean(data) && !hasErrors,
      partial: Boolean(data) && hasErrors,
    };
  } catch {
    return {
      data: null,
      ok: false,
      partial: false,
    };
  }
}

async function fetchGitHubRest<T>(path: string, tags: GitHubTag[]): Promise<GitHubFetchResult<T>> {
  const token = getGitHubToken();
  try {
    const response = await fetch(`${GITHUB_REST_ENDPOINT}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: {
        revalidate: DEFAULT_REVALIDATE_SECONDS,
        tags: uniqueTags(tags),
      },
    });

    if (!response.ok) {
      return {
        data: null,
        ok: false,
        partial: false,
      };
    }

    return {
      data: (await response.json()) as T,
      ok: true,
      partial: false,
    };
  } catch {
    return {
      data: null,
      ok: false,
      partial: false,
    };
  }
}

async function fetchGitHubHtml(path: string, tags: GitHubTag[]): Promise<GitHubFetchResult<string>> {
  try {
    const response = await fetch(`${GITHUB_WEB_ENDPOINT}${path}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      next: {
        revalidate: DEFAULT_REVALIDATE_SECONDS,
        tags: uniqueTags(tags),
      },
    });

    if (!response.ok) {
      return {
        data: null,
        ok: false,
        partial: false,
      };
    }

    return {
      data: await response.text(),
      ok: true,
      partial: false,
    };
  } catch {
    return {
      data: null,
      ok: false,
      partial: false,
    };
  }
}

async function fetchGitHubRestPaginated<T>(
  path: string,
  tags: GitHubTag[],
  maxPages = 10,
): Promise<GitHubCollectionFetchResult<T>> {
  const token = getGitHubToken();
  const items: T[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    try {
      const response = await fetch(`${GITHUB_REST_ENDPOINT}${path}${separator}page=${page}`, {
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: {
          revalidate: DEFAULT_REVALIDATE_SECONDS,
          tags: uniqueTags(tags),
        },
      });

      if (!response.ok) {
        return {
          items,
          ok: false,
          partial: items.length > 0,
        };
      }

      const pageItems = (await response.json()) as T[];
      items.push(...pageItems);

      if (pageItems.length < 100) {
        return {
          items,
          ok: true,
          partial: false,
        };
      }
    } catch {
      return {
        items,
        ok: false,
        partial: items.length > 0,
      };
    }
  }

  return {
    items,
    ok: true,
    partial: false,
  };
}

function buildFeaturedRepositorySelection() {
  return featuredRepos
    .filter((project) => !project.hidden)
    .map((project, index) => ({ alias: `repo${index}`, config: project }));
}

function buildGitHubGraphQLQuery() {
  const aliases = buildFeaturedRepositorySelection()
    .filter(({ config }) => config.repo)
    .map(({ alias, config }) => {
      const [owner, name] = (config.repo as string).split("/");
      return `
      ${alias}: repository(owner: "${owner}", name: "${name}") {
        ...RepoFields
      }`;
    })
    .join("\n");

  return `
    query PortfolioGitHubData($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        login
        name
        bio
        avatarUrl(size: 160)
        url
        followers {
          totalCount
        }
        following {
          totalCount
        }
        repositories(first: 1, ownerAffiliations: OWNER, privacy: PUBLIC) {
          totalCount
        }
        starredRepositories(first: 1) {
          totalCount
        }
        contributionsCollection(from: $from, to: $to) {
          contributionYears
          contributionCalendar {
            totalContributions
            weeks {
              firstDay
              contributionDays {
                color
                contributionCount
                contributionLevel
                date
                weekday
              }
            }
          }
        }
      }
      ${aliases}
    }

    fragment RepoFields on Repository {
      name
      nameWithOwner
      description
      homepageUrl
      url
      stargazerCount
      forkCount
      pushedAt
      isArchived
      primaryLanguage {
        name
        color
      }
      repositoryTopics(first: 6) {
        nodes {
          topic {
            name
          }
        }
      }
      defaultBranchRef {
        name
      }
      issues(states: OPEN) {
        totalCount
      }
    }
  `;
}

function parseContributionHeadlineCount(html: string) {
  const match = html.match(/<h2[^>]*>\s*([\d,]+)\s*contributions?/i);
  if (!match) return null;

  const count = Number.parseInt(match[1]?.replace(/,/g, "") ?? "", 10);
  return Number.isFinite(count) ? count : null;
}

function parseContributionTooltipCount(label: string) {
  if (/No contributions/i.test(label)) return 0;

  const match = label.match(/([\d,]+)\s+contributions?/i);
  if (!match) return 0;

  const count = Number.parseInt(match[1]?.replace(/,/g, "") ?? "", 10);
  return Number.isFinite(count) ? count : 0;
}

function mapContributionLevel(level: number) {
  switch (level) {
    case 1:
      return "FIRST_QUARTILE";
    case 2:
      return "SECOND_QUARTILE";
    case 3:
      return "THIRD_QUARTILE";
    case 4:
      return "FOURTH_QUARTILE";
    default:
      return "NONE";
  }
}

function parseContributionWeeks(html: string) {
  const tooltipById = new Map<string, string>();
  const tooltipRegex = /<tool-tip([^>]*)>([^<]+)<\/tool-tip>/g;

  for (const match of html.matchAll(tooltipRegex)) {
    const attributes = match[1] ?? "";
    const targetId = attributes.match(/\sfor="([^"]+)"/)?.[1];
    const label = match[2]?.trim();

    if (targetId && label) {
      tooltipById.set(targetId, label);
    }
  }

  const weeksByIndex = new Map<number, GitHubContributionDay[]>();
  const dayRegex = /<td([^>]*class="ContributionCalendar-day"[^>]*)><\/td>/g;

  for (const match of html.matchAll(dayRegex)) {
    const attributes = match[1] ?? "";
    const weekIndex = Number.parseInt(attributes.match(/\sdata-ix="(\d+)"/)?.[1] ?? "", 10);
    const date = attributes.match(/\sdata-date="([^"]+)"/)?.[1];
    const level = Number.parseInt(attributes.match(/\sdata-level="(\d+)"/)?.[1] ?? "0", 10);
    const elementId = attributes.match(/\sid="([^"]+)"/)?.[1];

    if (!Number.isFinite(weekIndex) || !date || !elementId) continue;

    const count = parseContributionTooltipCount(tooltipById.get(elementId) ?? "");
    const day: GitHubContributionDay = {
      color: "",
      contributionCount: count,
      contributionLevel: mapContributionLevel(level),
      date,
      weekday: new Date(`${date}T00:00:00Z`).getUTCDay(),
    };

    const week = weeksByIndex.get(weekIndex) ?? [];
    week.push(day);
    weeksByIndex.set(weekIndex, week);
  }

  return Array.from(weeksByIndex.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([, days]) => {
      const contributionDays = days.sort((left, right) => left.date.localeCompare(right.date));
      return {
        contributionDays,
        firstDay: contributionDays[0]?.date ?? "",
      };
    })
    .filter((week) => week.firstDay);
}

async function getGitHubContributionSummary(username: string, years: number[]): Promise<GitHubContributionSummary> {
  const lastYearResult = await fetchGitHubHtml(`/users/${username}/contributions`, [GITHUB_TAGS.profile, GITHUB_TAGS.activity]);
  const lastYear = lastYearResult.data ? parseContributionHeadlineCount(lastYearResult.data) : null;

  if (years.length === 0) {
    return {
      lastYear,
      totalAllTime: 0,
      years: [],
      ok: lastYearResult.ok,
    };
  }

  const yearResults = await Promise.all(
    years.map(async (year) => {
      const from = `${year}-01-01`;
      const to = `${year}-12-31`;
      const result = await fetchGitHubHtml(`/users/${username}/contributions?from=${from}&to=${to}`, [
        GITHUB_TAGS.profile,
        GITHUB_TAGS.activity,
      ]);

      return {
        count: result.data ? parseContributionHeadlineCount(result.data) : null,
        weeks: result.data ? parseContributionWeeks(result.data) : [],
        ok: result.ok,
        year,
      };
    }),
  );

  const totalAllTime = yearResults.reduce((sum, result) => sum + (result.count ?? 0), 0);

  return {
    lastYear,
    totalAllTime,
    years: yearResults.map((result) => ({
      totalContributions: result.count,
      weeks: result.weeks,
      year: result.year,
    })),
    ok: lastYearResult.ok && yearResults.every((result) => result.ok),
  };
}

function normalizeStack(repoTopics: string[], config: FeaturedRepoConfig, languageName: string | null) {
  if (config.stackOverride?.length) return config.stackOverride;

  const items = [...(languageName ? [languageName] : []), ...repoTopics];
  return items.slice(0, 6);
}

function normalizeProjectStack(repoTopics: string[]) {
  return Array.from(new Set(repoTopics)).slice(0, 6);
}

function normalizeRestStarredRepo(repo: GitHubRestRepo): GitHubStarredRepo {
  return {
    description: normalizeOptionalText(repo.description),
    languageName: repo.language ?? null,
    name: repo.name,
    nameWithOwner: repo.full_name,
    url: repo.html_url,
  };
}

function normalizeGraphQLRepo(
  repoNode: GraphQLRepositoryNode | null | undefined,
  config: FeaturedRepoConfig,
): GitHubFeaturedRepo {
  const fallbackTitle = config.titleOverride ?? config.repo?.split("/")[1] ?? "Project";
  const topics = repoNode?.repositoryTopics.nodes.map((item) => item.topic.name) ?? [];
  const languageName = repoNode?.primaryLanguage?.name ?? null;

  return {
    accent: config.accent ?? "Open Source",
    defaultBranch: repoNode?.defaultBranchRef?.name ?? null,
    demoUrl: config.demoUrl ?? null,
    description: repoNode?.description ?? config.summaryOverride ?? "Repository details will appear here once GitHub data is connected.",
    forkCount: repoNode?.forkCount ?? null,
    homepageUrl: normalizeOptionalText(repoNode?.homepageUrl),
    isArchived: repoNode?.isArchived ?? false,
    languageColor: repoNode?.primaryLanguage?.color ?? null,
    languageName,
    liveUrl: normalizeOptionalText(config.liveUrl) ?? normalizeOptionalText(repoNode?.homepageUrl),
    name: config.titleOverride ?? repoNode?.name ?? fallbackTitle,
    nameWithOwner: repoNode?.nameWithOwner ?? config.repo ?? null,
    openIssues: repoNode?.issues.totalCount ?? null,
    pushedAt: repoNode?.pushedAt ?? null,
    repoUrl: repoNode?.url ?? (config.repo ? `https://github.com/${config.repo}` : null),
    stack: normalizeStack(topics, config, languageName),
    stars: repoNode?.stargazerCount ?? null,
    summary: config.summaryOverride ?? repoNode?.description ?? "A curated featured project.",
    topics,
  };
}

function normalizeRestRepo(repo: GitHubRestRepo | null, config: FeaturedRepoConfig): GitHubFeaturedRepo {
  const topics = repo?.topics ?? [];

  return {
    accent: config.accent ?? "Open Source",
    defaultBranch: repo?.default_branch ?? null,
    demoUrl: config.demoUrl ?? null,
    description: repo?.description ?? config.summaryOverride ?? "Repository details will appear here once GitHub data is connected.",
    forkCount: repo?.forks_count ?? null,
    homepageUrl: normalizeOptionalText(repo?.homepage),
    isArchived: repo?.archived ?? false,
    languageColor: null,
    languageName: repo?.language ?? null,
    liveUrl: normalizeOptionalText(config.liveUrl) ?? normalizeOptionalText(repo?.homepage),
    name: config.titleOverride ?? repo?.name ?? config.repo?.split("/")[1] ?? "Project",
    nameWithOwner: repo?.full_name ?? config.repo ?? null,
    openIssues: repo?.open_issues_count ?? null,
    pushedAt: repo?.pushed_at ?? null,
    repoUrl: repo?.html_url ?? (config.repo ? `https://github.com/${config.repo}` : null),
    stack: normalizeStack(topics, config, repo?.language ?? null),
    stars: repo?.stargazers_count ?? null,
    summary: config.summaryOverride ?? repo?.description ?? "A curated featured project.",
    topics,
  };
}

function normalizeProjectRepo(repo: GitHubRestRepo, override?: ProjectOverrideConfig): GitHubProject {
  const topics = repo.topics ?? [];
  const liveUrl = normalizeOptionalText(override?.liveUrl) ?? normalizeOptionalText(repo.homepage);
  const accent =
    override?.accent ?? (repo.archived ? "Archived Repo" : repo.fork ? "Forked Build" : "Open Source");

  return {
    accent,
    defaultBranch: repo.default_branch ?? null,
    demoUrl: override?.demoUrl ?? null,
    forkCount: repo.forks_count ?? null,
    homepageUrl: normalizeOptionalText(repo.homepage),
    isArchived: repo.archived,
    isFork: repo.fork,
    languageName: repo.language ?? null,
    liveUrl,
    name: repo.name,
    nameWithOwner: repo.full_name,
    openIssues: repo.open_issues_count ?? null,
    pushedAt: repo.pushed_at ?? null,
    repoUrl: repo.html_url,
    stack: normalizeProjectStack(topics),
    stars: repo.stargazers_count ?? null,
    summary: override?.summaryOverride ?? repo.description ?? "Repository details will appear here once GitHub data is connected.",
    topics,
  };
}

function countProjectStars(projects: GitHubProject[]) {
  return projects.reduce((sum, project) => sum + (project.stars ?? 0), 0);
}

async function getGitHubStarredRepos(username: string): Promise<GitHubCollectionFetchResult<GitHubStarredRepo>> {
  const result = await fetchGitHubRestPaginated<GitHubRestRepo>(
    `/users/${username}/starred?per_page=100`,
    [GITHUB_TAGS.activity],
  );

  return {
    items: result.items.map(normalizeRestStarredRepo),
    ok: result.ok,
    partial: result.partial,
  };
}

async function getGitHubProjects(username: string): Promise<GitHubCollectionFetchResult<GitHubProject>> {
  const result = await fetchGitHubRestPaginated<GitHubRestRepo>(
    `/users/${username}/repos?per_page=100&sort=updated&direction=desc&type=public`,
    [GITHUB_TAGS.projects],
  );

  return {
    items: result.items
      .map((repo) => {
        const override = projectOverrideLookup.get(repo.full_name.toLowerCase());
        return override?.hidden ? null : normalizeProjectRepo(repo, override);
      })
      .filter((repo): repo is GitHubProject => Boolean(repo))
      .sort((left, right) => {
        const leftTime = left.pushedAt ? Date.parse(left.pushedAt) : 0;
        const rightTime = right.pushedAt ? Date.parse(right.pushedAt) : 0;
        return rightTime - leftTime;
      }),
    ok: result.ok,
    partial: result.partial,
  };
}

function normalizeActivityEvent(event: GitHubRestEvent): GitHubRecentEvent | null {
  const repoName = event.repo.name;

  switch (event.type) {
    case "PushEvent": {
      const commitCount = event.payload?.distinct_size ?? event.payload?.commits?.length ?? 0;
      const branch = event.payload?.ref?.replace("refs/heads/", "");
      const summary =
        commitCount > 0
          ? `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"}${branch ? ` to ${branch}` : ""}`
          : branch
            ? `Updated ${branch}`
            : "Pushed new changes";

      return {
        id: event.id,
        kind: "push",
        repoName,
        summary,
        timestamp: event.created_at,
        url: `https://github.com/${repoName}/commits`,
      };
    }
    case "CreateEvent": {
      const refType = event.payload?.ref_type ?? "resource";
      const ref = event.payload?.ref;
      return {
        id: event.id,
        kind: "branch",
        repoName,
        summary: ref ? `Created ${refType} ${ref} in ${repoName}` : `Created ${refType} in ${repoName}`,
        timestamp: event.created_at,
        url: `https://github.com/${repoName}`,
      };
    }
    case "PullRequestEvent": {
      const action = event.payload?.action ?? "updated";
      const merged = event.payload?.pull_request?.merged === true;
      const number = event.payload?.number;
      const title = normalizeOptionalText(event.payload?.pull_request?.title);
      const label = title ?? (number ? `PR #${number}` : "pull request");
      return {
        id: event.id,
        kind: "pull_request",
        repoName,
        summary:
          action === "closed" && merged
            ? `Merged ${label}`
            : action === "merged" || merged
              ? `Merged ${label}`
              : `${action[0]?.toUpperCase() ?? ""}${action.slice(1)} ${label}`,
        timestamp: event.created_at,
        url:
          event.payload?.pull_request?.html_url ??
          (number ? `https://github.com/${repoName}/pull/${number}` : `https://github.com/${repoName}/pulls`),
      };
    }
    case "ReleaseEvent": {
      const releaseLabel = event.payload?.release?.name || event.payload?.release?.tag_name || "new release";
      return {
        id: event.id,
        kind: "release",
        repoName,
        summary: `Published ${releaseLabel} in ${repoName}`,
        timestamp: event.created_at,
        url: event.payload?.release?.html_url ?? `https://github.com/${repoName}/releases`,
      };
    }
    case "PublicEvent":
      return {
        id: event.id,
        kind: "visibility",
        repoName,
        summary: `Made ${repoName} public`,
        timestamp: event.created_at,
        url: `https://github.com/${repoName}`,
      };
    default:
      return null;
  }
}

async function getGraphQLPortfolioData(username: string): Promise<GitHubPortfolioData | null> {
  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(today.getUTCDate() - 364);

  const query = buildGitHubGraphQLQuery();
  const payloadResult = await fetchGitHubGraphQL<GitHubGraphQLPayload>(
    query,
    {
      from: from.toISOString(),
      login: username,
      to: today.toISOString(),
    },
    [GITHUB_TAGS.profile, GITHUB_TAGS.activity, GITHUB_TAGS.featured],
  );

  const payload = payloadResult.data;
  if (!payload?.user) return null;

  const [projectsResult, starredReposResult, recentEventsResult, contributionSummaryResult] = await Promise.all([
    getGitHubProjects(username),
    getGitHubStarredRepos(username),
    fetchGitHubRest<GitHubRestEvent[]>(`/users/${username}/events/public?per_page=12`, [GITHUB_TAGS.activity]),
    getGitHubContributionSummary(username, payload.user.contributionsCollection.contributionYears),
  ]);

  const featured = buildFeaturedRepositorySelection().map(({ alias, config }) =>
    normalizeGraphQLRepo(payload[alias], config),
  );

  const recentEvents = (recentEventsResult.data ?? [])
    .map(normalizeActivityEvent)
    .filter((event): event is GitHubRecentEvent => Boolean(event))
    .slice(0, 6);

  const source =
    payloadResult.ok &&
    projectsResult.ok &&
    starredReposResult.ok &&
    recentEventsResult.ok &&
    contributionSummaryResult.ok
      ? "graphql"
      : "live-partial";

  return {
    available: true,
    contributionYears: contributionSummaryResult.years,
    featuredRepos: featured.sort((a, b) => {
      const aOrder = featuredRepos.find((item) => (item.repo ?? item.titleOverride) === (a.nameWithOwner ?? a.name))?.order ?? 0;
      const bOrder = featuredRepos.find((item) => (item.repo ?? item.titleOverride) === (b.nameWithOwner ?? b.name))?.order ?? 0;
      return aOrder - bOrder;
    }),
    lastSyncedAt: new Date().toISOString(),
    profile: {
      avatarUrl: payload.user.avatarUrl,
      bio: payload.user.bio,
      followers: payload.user.followers.totalCount,
      following: payload.user.following.totalCount,
      lastYearContributions:
        contributionSummaryResult.lastYear ?? payload.user.contributionsCollection.contributionCalendar.totalContributions,
      login: payload.user.login,
      name: payload.user.name,
      publicRepos: payload.user.repositories.totalCount,
      starredCount: payload.user.starredRepositories.totalCount,
      totalContributions: contributionSummaryResult.totalAllTime,
      url: payload.user.url,
    },
    projects: projectsResult.items,
    recentEvents,
    source,
    starredRepos: starredReposResult.items,
    totalProjectStars: countProjectStars(projectsResult.items),
    weeks: contributionSummaryResult.years[0]?.weeks ?? payload.user.contributionsCollection.contributionCalendar.weeks,
  };
}

async function getRestFallbackPortfolioData(username: string): Promise<GitHubPortfolioData> {
  const [userResult, eventsResult, projectsResult, starredReposResult] = await Promise.all([
    fetchGitHubRest<GitHubRestUser>(`/users/${username}`, [GITHUB_TAGS.profile]),
    fetchGitHubRest<GitHubRestEvent[]>(`/users/${username}/events/public?per_page=12`, [GITHUB_TAGS.activity]),
    getGitHubProjects(username),
    getGitHubStarredRepos(username),
  ]);

  const featuredResults = await Promise.all(
    featuredRepos
      .filter((project) => !project.hidden)
      .map(async (config) => {
        if (!config.repo) {
          return {
            repo: normalizeRestRepo(null, config),
            ok: true,
          };
        }

        const repoResult = await fetchGitHubRest<GitHubRestRepo>(`/repos/${config.repo}`, [GITHUB_TAGS.featured]);
        return {
          repo: normalizeRestRepo(repoResult.data, config),
          ok: repoResult.ok,
        };
      }),
  );

  const featured = featuredResults.map((result) => result.repo);
  const isRestFallbackComplete =
    userResult.ok &&
    eventsResult.ok &&
    projectsResult.ok &&
    starredReposResult.ok &&
    featuredResults.every((result) => result.ok);

  const hasAnyLiveData = Boolean(userResult.data || featured.length || projectsResult.items.length);
  const source = !hasAnyLiveData ? "unavailable" : isRestFallbackComplete ? "rest-fallback" : "live-partial";

  return {
    available: hasAnyLiveData,
    contributionYears: [],
    featuredRepos: featured.sort((a, b) => {
      const aOrder = featuredRepos.find((item) => item.titleOverride === a.name || item.repo === a.nameWithOwner)?.order ?? 0;
      const bOrder = featuredRepos.find((item) => item.titleOverride === b.name || item.repo === b.nameWithOwner)?.order ?? 0;
      return aOrder - bOrder;
    }),
    lastSyncedAt: new Date().toISOString(),
    profile: userResult.data
      ? {
          avatarUrl: userResult.data.avatar_url,
          bio: userResult.data.bio,
          followers: userResult.data.followers,
          following: userResult.data.following,
          lastYearContributions: null,
          login: userResult.data.login,
          name: userResult.data.name,
          publicRepos: userResult.data.public_repos,
          starredCount: null,
          totalContributions: null,
          url: userResult.data.html_url,
        }
      : null,
    projects: projectsResult.items,
    recentEvents: (eventsResult.data ?? [])
      .map(normalizeActivityEvent)
      .filter((event): event is GitHubRecentEvent => Boolean(event))
      .slice(0, 6),
    source,
    starredRepos: starredReposResult.items,
    totalProjectStars: countProjectStars(projectsResult.items),
    weeks: [],
  };
}

export const getGitHubPortfolioData = cache(async (): Promise<GitHubPortfolioData> => {
  const username = getGitHubUsername();
  const graphQL = await getGraphQLPortfolioData(username);
  if (graphQL) return graphQL;
  return getRestFallbackPortfolioData(username);
});

export function isFeaturedRepository(repoFullName: string | null | undefined) {
  if (!repoFullName) return false;
  return featuredRepoLookup.has(repoFullName.toLowerCase());
}

export function getGitHubPublicUsername() {
  return getGitHubUsername();
}
