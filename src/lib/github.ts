import "server-only";

import { cache } from "react";

import { featuredRepos, featuredRepoLookup, type FeaturedRepoConfig } from "@/config/featuredRepos";

const DEFAULT_REVALIDATE_SECONDS = 3600;
const DEFAULT_GITHUB_USERNAME = "DhanushSantosh";
const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const GITHUB_REST_ENDPOINT = "https://api.github.com";

export const GITHUB_TAGS = {
  profile: "github-profile",
  activity: "github-activity",
  featured: "github-featured",
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

export type GitHubProfileSummary = {
  avatarUrl: string | null;
  bio: string | null;
  followers: number;
  following: number;
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
  featuredRepos: GitHubFeaturedRepo[];
  lastSyncedAt: string;
  profile: GitHubProfileSummary | null;
  recentEvents: GitHubRecentEvent[];
  source: "graphql" | "rest-fallback" | "unavailable";
  totalFeaturedStars: number;
  weeks: GitHubContributionWeek[];
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
): Promise<T | null> {
  const token = getGitHubToken();
  if (!token) return null;

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

  if (!response.ok) return null;

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (!payload.data || payload.errors?.length) return null;

  return payload.data;
}

async function fetchGitHubRest<T>(path: string, tags: GitHubTag[]): Promise<T | null> {
  const token = getGitHubToken();
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

  if (!response.ok) return null;
  return (await response.json()) as T;
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

function normalizeStack(repoTopics: string[], config: FeaturedRepoConfig, languageName: string | null) {
  if (config.stackOverride?.length) return config.stackOverride;

  const items = [...(languageName ? [languageName] : []), ...repoTopics];
  return items.slice(0, 6);
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
  const payload = await fetchGitHubGraphQL<GitHubGraphQLPayload>(
    query,
    {
      from: from.toISOString(),
      login: username,
      to: today.toISOString(),
    },
    [GITHUB_TAGS.profile, GITHUB_TAGS.activity, GITHUB_TAGS.featured],
  );

  if (!payload?.user) return null;

  const featured = buildFeaturedRepositorySelection().map(({ alias, config }) =>
    normalizeGraphQLRepo(payload[alias], config),
  );

  const recentEventsRaw = await fetchGitHubRest<GitHubRestEvent[]>(
    `/users/${username}/events/public?per_page=12`,
    [GITHUB_TAGS.activity],
  );

  const recentEvents = (recentEventsRaw ?? [])
    .map(normalizeActivityEvent)
    .filter((event): event is GitHubRecentEvent => Boolean(event))
    .slice(0, 6);

  return {
    available: true,
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
      login: payload.user.login,
      name: payload.user.name,
      publicRepos: payload.user.repositories.totalCount,
      starredCount: payload.user.starredRepositories.totalCount,
      totalContributions: payload.user.contributionsCollection.contributionCalendar.totalContributions,
      url: payload.user.url,
    },
    recentEvents,
    source: "graphql",
    totalFeaturedStars: featured.reduce((sum, repo) => sum + (repo.stars ?? 0), 0),
    weeks: payload.user.contributionsCollection.contributionCalendar.weeks,
  };
}

async function getRestFallbackPortfolioData(username: string): Promise<GitHubPortfolioData> {
  const [user, events] = await Promise.all([
    fetchGitHubRest<GitHubRestUser>(`/users/${username}`, [GITHUB_TAGS.profile]),
    fetchGitHubRest<GitHubRestEvent[]>(`/users/${username}/events/public?per_page=12`, [GITHUB_TAGS.activity]),
  ]);

  const featured = await Promise.all(
    featuredRepos
      .filter((project) => !project.hidden)
      .map(async (config) => {
        if (!config.repo) return normalizeRestRepo(null, config);
        const repo = await fetchGitHubRest<GitHubRestRepo>(`/repos/${config.repo}`, [GITHUB_TAGS.featured]);
        return normalizeRestRepo(repo, config);
      }),
  );

  return {
    available: Boolean(user || featured.length),
    featuredRepos: featured.sort((a, b) => {
      const aOrder = featuredRepos.find((item) => item.titleOverride === a.name || item.repo === a.nameWithOwner)?.order ?? 0;
      const bOrder = featuredRepos.find((item) => item.titleOverride === b.name || item.repo === b.nameWithOwner)?.order ?? 0;
      return aOrder - bOrder;
    }),
    lastSyncedAt: new Date().toISOString(),
    profile: user
      ? {
          avatarUrl: user.avatar_url,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
          login: user.login,
          name: user.name,
          publicRepos: user.public_repos,
          starredCount: null,
          totalContributions: null,
          url: user.html_url,
        }
      : null,
    recentEvents: (events ?? [])
      .map(normalizeActivityEvent)
      .filter((event): event is GitHubRecentEvent => Boolean(event))
      .slice(0, 6),
    source: user ? "rest-fallback" : "unavailable",
    totalFeaturedStars: featured.reduce((sum, repo) => sum + (repo.stars ?? 0), 0),
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
