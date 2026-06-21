import { describe, expect, it } from "vitest";

import { getRestPortfolioSource } from "./github-source";

describe("REST portfolio source classification", () => {
  const empty = {
    eventCount: 0,
    hasUser: false,
    projectCount: 0,
    starredRepoCount: 0,
  };

  it("reports a fully empty failed response as unavailable", () => {
    expect(getRestPortfolioSource({ ...empty, complete: false })).toBe("unavailable");
  });

  it("reports partial and complete live REST states accurately", () => {
    expect(getRestPortfolioSource({ ...empty, complete: false, projectCount: 1 })).toBe("live-partial");
    expect(getRestPortfolioSource({ ...empty, complete: true, hasUser: true })).toBe("rest-fallback");
  });
});
