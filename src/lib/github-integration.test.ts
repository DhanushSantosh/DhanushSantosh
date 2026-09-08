import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Integration coverage for getGitHubPortfolioData's actual failure-handling
// against a mocked fetch — the audit's Priority 2 note asked specifically
// for "GitHub integration tests for invalid token, partial pages, timeouts
// and malformed HTML," distinct from github-contributions.test.ts's unit
// coverage of the HTML parsers in isolation.
//
// getGitHubPortfolioData is wrapped in React's cache(), which memoizes per
// call with no request boundary to reset it outside a real React render —
// so every test resets the module registry and re-imports fresh, rather
// than sharing one cached result across tests.

type MockResponseInit = {
  status?: number;
  json?: unknown;
  text?: string;
  rejectWith?: unknown;
};

type RouteHandler = (url: string, init: RequestInit | undefined) => MockResponseInit;

const RECORDED_CALLS: Array<{ url: string; hadAuthHeader: boolean }> = [];

function buildFetchMock(routes: Array<[RegExp, RouteHandler]>) {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const headers = new Headers(init?.headers);
    RECORDED_CALLS.push({ url, hadAuthHeader: headers.has("Authorization") });

    const match = routes.find(([pattern]) => pattern.test(url));
    if (!match) {
      throw new Error(`No mock route configured for ${url}`);
    }

    const result = match[1](url, init);
    if (result.rejectWith) throw result.rejectWith;

    const status = result.status ?? 200;
    return new Response(result.text ?? JSON.stringify(result.json ?? {}), {
      status,
      headers: { "Content-Type": result.text ? "text/html" : "application/json" },
    });
  });
}

async function freshGithubModule() {
  vi.resetModules();
  return import("@/lib/github");
}

const MINIMAL_USER = { avatar_url: "", bio: null, followers: 1, following: 1, html_url: "", login: "octocat", name: "Octocat", public_repos: 0 };

beforeEach(() => {
  RECORDED_CALLS.length = 0;
  vi.stubEnv("GITHUB_USERNAME", "octocat");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getGitHubPortfolioData: invalid/rejected token", () => {
  it("drops the token and retries unauthenticated within the same request, instead of failing outright", async () => {
    vi.stubEnv("GITHUB_TOKEN", "bad-token");

    const fetchMock = buildFetchMock([
      // GraphQL always rejects the token.
      [/graphql/, () => ({ status: 401 })],
      // REST endpoints: succeed once the request is unauthenticated (no
      // Authorization header) — this is what isTokenRejected()/restHeaders()
      // is responsible for making happen after the GraphQL 401.
      [/\/users\/octocat\/events/, (_url, init) => {
        const hadAuth = new Headers(init?.headers).has("Authorization");
        return hadAuth ? { status: 401 } : { json: [] };
      }],
      [/\/users\/octocat\/repos/, (_url, init) => {
        const hadAuth = new Headers(init?.headers).has("Authorization");
        return hadAuth ? { status: 401 } : { json: [] };
      }],
      [/\/users\/octocat\/starred/, (_url, init) => {
        const hadAuth = new Headers(init?.headers).has("Authorization");
        return hadAuth ? { status: 401 } : { json: [] };
      }],
      [/\/users\/octocat$/, (_url, init) => {
        const hadAuth = new Headers(init?.headers).has("Authorization");
        return hadAuth ? { status: 401 } : { json: MINIMAL_USER };
      }],
    ]);
    vi.stubGlobal("fetch", fetchMock);

    const { getGitHubPortfolioData } = await freshGithubModule();
    const result = await getGitHubPortfolioData();

    // The whole request degraded gracefully rather than throwing, and
    // eventually succeeded via the unauthenticated retry.
    expect(result.available).toBe(true);
    expect(result.profile?.login).toBe("octocat");
    // A genuinely fresh success this request, not a persisted fallback.
    expect(result.isPersistedSnapshot).toBe(false);

    // Every call after the first GraphQL 401 must have been unauthenticated
    // — proving the token-rejection state actually threaded through the
    // rest of this one request (AsyncLocalStorage-scoped; see
    // tokenRejectionStore in github.ts).
    const restCallsAfterRejection = RECORDED_CALLS.filter((call) => call.url.includes("api.github.com/users"));
    expect(restCallsAfterRejection.length).toBeGreaterThan(0);
    expect(restCallsAfterRejection.every((call) => !call.hadAuthHeader)).toBe(true);
  });
});

describe("getGitHubPortfolioData: partial page failures", () => {
  it("reports live-partial instead of a false fully-fresh graphql source when some data succeeds and some fails", async () => {
    vi.stubEnv("GITHUB_TOKEN", "good-token");

    const fetchMock = buildFetchMock([
      [
        /graphql/,
        () => ({
          json: {
            data: {
              user: {
                avatarUrl: "",
                bio: null,
                contributionsCollection: {
                  contributionCalendar: { totalContributions: 0, weeks: [] },
                  contributionYears: [],
                },
                followers: { totalCount: 1 },
                following: { totalCount: 1 },
                login: "octocat",
                name: "Octocat",
                repositories: { totalCount: 0 },
                starredRepositories: { totalCount: 0 },
                url: "https://github.com/octocat",
              },
            },
          },
        }),
      ],
      // Projects and starred repos succeed...
      [/\/users\/octocat\/repos/, () => ({ json: [] })],
      [/\/users\/octocat\/starred/, () => ({ json: [] })],
      // ...but recent events fails outright: a genuine partial page.
      [/\/users\/octocat\/events/, () => ({ status: 500 })],
      [/\/users\/octocat\/contributions/, () => ({ text: "<main>No summary</main>" })],
      [/\/users\/octocat$/, () => ({ json: MINIMAL_USER })],
    ]);
    vi.stubGlobal("fetch", fetchMock);

    const { getGitHubPortfolioData } = await freshGithubModule();
    const result = await getGitHubPortfolioData();

    expect(result.source).toBe("live-partial");
    expect(result.available).toBe(true);
  });
});

describe("getGitHubPortfolioData: request timeouts", () => {
  it("degrades gracefully instead of throwing when a request is aborted mid-flight", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");

    // No GITHUB_TOKEN configured, so GraphQL is skipped entirely (see
    // fetchGitHubGraphQL's early return) and only the REST fallback path's
    // fetches are exercised here — every one of them simulates what a real
    // AbortSignal.timeout() firing looks like: the fetch promise rejects.
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    const fetchMock = buildFetchMock([
      [/\/users\/octocat\/events/, () => ({ rejectWith: abortError })],
      [/\/users\/octocat\/repos/, () => ({ rejectWith: abortError })],
      [/\/users\/octocat\/starred/, () => ({ rejectWith: abortError })],
      [/\/users\/octocat\/contributions/, () => ({ rejectWith: abortError })],
      [/\/users\/octocat$/, () => ({ rejectWith: abortError })],
    ]);
    vi.stubGlobal("fetch", fetchMock);

    const { getGitHubPortfolioData } = await freshGithubModule();
    // The call must resolve (not throw/hang) even though every underlying
    // request rejected — each fetch call site is try/catch-wrapped.
    const result = await getGitHubPortfolioData();

    expect(result.available).toBe(false);
    expect(result.source).toBe("unavailable");
    expect(result.lastReachableAt).toBeNull();
    // Nothing has ever been successfully cached to fall back to here (this
    // is the very first call in a fresh module), so this is a direct
    // failed attempt, not a persisted snapshot being served in its place.
    expect(result.isPersistedSnapshot).toBe(false);
  });
});

describe("isSnapshotStale", () => {
  it("is stale when there is no reachability timestamp at all", async () => {
    const { isSnapshotStale } = await freshGithubModule();
    expect(isSnapshotStale(null)).toBe(true);
  });

  it("is not stale for a timestamp from just now", async () => {
    const { isSnapshotStale } = await freshGithubModule();
    expect(isSnapshotStale(new Date().toISOString())).toBe(false);
  });

  it("is stale for a timestamp well beyond the revalidation window", async () => {
    const { isSnapshotStale } = await freshGithubModule();
    const wayInThePast = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(); // 6h ago
    expect(isSnapshotStale(wayInThePast)).toBe(true);
  });
});

describe("getGitHubPortfolioData: malformed contribution HTML", () => {
  it("doesn't crash the whole fetch when the scraped contribution page is garbage", async () => {
    vi.stubEnv("GITHUB_TOKEN", "good-token");

    const fetchMock = buildFetchMock([
      [
        /graphql/,
        () => ({
          json: {
            data: {
              user: {
                avatarUrl: "",
                bio: null,
                contributionsCollection: {
                  contributionCalendar: { totalContributions: 0, weeks: [] },
                  contributionYears: [2026],
                },
                followers: { totalCount: 1 },
                following: { totalCount: 1 },
                login: "octocat",
                name: "Octocat",
                repositories: { totalCount: 0 },
                starredRepositories: { totalCount: 0 },
                url: "https://github.com/octocat",
              },
            },
          },
        }),
      ],
      [/\/users\/octocat\/repos/, () => ({ json: [] })],
      [/\/users\/octocat\/starred/, () => ({ json: [] })],
      [/\/users\/octocat\/events/, () => ({ json: [] })],
      // Not HTML at all — a stand-in for GitHub changing markup out from
      // under the scraper, or an error page served with a 200.
      [/\/users\/octocat\/contributions/, () => ({ text: "<!doctype html><body>service unavailable, try again</body>" })],
      [/\/users\/octocat$/, () => ({ json: MINIMAL_USER })],
    ]);
    vi.stubGlobal("fetch", fetchMock);

    const { getGitHubPortfolioData } = await freshGithubModule();
    const result = await getGitHubPortfolioData();

    // Garbage HTML parses to "nothing found" (see github-contributions.test.ts's
    // own "ignores malformed calendar cells" case) rather than throwing, so
    // the request as a whole still completes with an honest, empty result
    // for that one year instead of taking the rest of the page down with it.
    expect(result.available).toBe(true);
    expect(result.contributionYears).toHaveLength(1);
    expect(result.contributionYears[0]?.totalContributions).toBeNull();
    expect(result.contributionYears[0]?.weeks).toEqual([]);
  });
});
