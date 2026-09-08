import { describe, expect, it } from "vitest";

import type { GitHubContributionYear } from "./github";
import {
  buildTimelineWeeks,
  flattenContributionDays,
  getCurrentStreak,
  getLongestStreak,
  hasIncompleteYears,
  isMostRecentYearMissing,
} from "./github-contribution-timeline";

function day(date: string, contributionCount = 0) {
  return {
    color: "",
    contributionCount,
    contributionLevel: contributionCount > 0 ? "FIRST_QUARTILE" : "NONE",
    date,
    weekday: new Date(`${date}T00:00:00Z`).getUTCDay(),
  };
}

describe("contribution timeline shaping", () => {
  const years: GitHubContributionYear[] = [
    {
      totalContributions: 3,
      year: 2025,
      weeks: [
        { firstDay: "2025-12-22", contributionDays: [day("2025-12-22", 1)] },
        { firstDay: "2025-12-29", contributionDays: [day("2025-12-29", 2)] },
      ],
    },
    {
      totalContributions: 4,
      year: 2026,
      weeks: [
        { firstDay: "2026-01-05", contributionDays: [day("2026-01-05", 4)] },
        { firstDay: "2026-12-28", contributionDays: [day("2026-12-28")] },
      ],
    },
  ];

  it("removes future days and empty future weeks", () => {
    const timeline = buildTimelineWeeks(years, "2026-06-21");
    expect(timeline.map((week) => week.firstDay)).toEqual(["2025-12-22", "2025-12-29", "2026-01-05"]);
    expect(timeline[0]?.showYearDivider).toBe(true);
    expect(timeline[2]?.showYearDivider).toBe(true);
  });

  it("caps rendered history without changing all-history calculations", () => {
    expect(buildTimelineWeeks(years, "2026-06-21", 2).map((week) => week.firstDay)).toEqual([
      "2025-12-29",
      "2026-01-05",
    ]);
    expect(flattenContributionDays(years.flatMap((year) => year.weeks), "2026-06-21")).toHaveLength(3);
  });
});

describe("contribution streaks", () => {
  it("counts the current streak backward from the most recent day", () => {
    const days = [day("2026-01-01", 1), day("2026-01-02", 2), day("2026-01-03", 1)];
    expect(getCurrentStreak(days)).toBe(3);
  });

  it("breaks the current streak at the most recent zero-contribution day", () => {
    const days = [day("2026-01-01", 1), day("2026-01-02", 0), day("2026-01-03", 1), day("2026-01-04", 1)];
    expect(getCurrentStreak(days)).toBe(2);
  });

  it("is zero when the most recent day has no contributions, even after an earlier run", () => {
    const days = [day("2026-01-01", 3), day("2026-01-02", 3), day("2026-01-03", 0)];
    expect(getCurrentStreak(days)).toBe(0);
  });

  it("finds the longest run anywhere in the history, not just the trailing one", () => {
    const days = [
      day("2026-01-01", 1),
      day("2026-01-02", 1),
      day("2026-01-03", 1),
      day("2026-01-04", 0),
      day("2026-01-05", 1),
    ];
    expect(getLongestStreak(days)).toBe(3);
  });

  it("returns zero for both streaks with no contribution data", () => {
    expect(getCurrentStreak([])).toBe(0);
    expect(getLongestStreak([])).toBe(0);
  });
});

describe("incomplete-year disclosure", () => {
  // Fixed "now" throughout — isMostRecentYearMissing checks the real
  // current calendar year specifically, not just the numerically highest
  // year present, so these need a deterministic reference point rather than
  // depending on whatever year the test happens to run in.
  const now = new Date("2026-06-15T00:00:00Z");

  const complete: GitHubContributionYear[] = [
    { totalContributions: 10, year: 2025, weeks: [] },
    { totalContributions: 20, year: 2026, weeks: [] },
  ];

  it("is false when every year loaded successfully", () => {
    expect(hasIncompleteYears(complete)).toBe(false);
    expect(isMostRecentYearMissing(complete, now)).toBe(false);
  });

  it("flags an older failed year as incomplete but not as the most-recent-missing case", () => {
    const olderMissing: GitHubContributionYear[] = [
      { totalContributions: null, year: 2025, weeks: [] },
      { totalContributions: 20, year: 2026, weeks: [] },
    ];
    expect(hasIncompleteYears(olderMissing)).toBe(true);
    expect(isMostRecentYearMissing(olderMissing, now)).toBe(false);
  });

  it("flags the current year failing as both incomplete and most-recent-missing", () => {
    const currentMissing: GitHubContributionYear[] = [
      { totalContributions: 10, year: 2025, weeks: [] },
      { totalContributions: null, year: 2026, weeks: [] },
    ];
    expect(hasIncompleteYears(currentMissing)).toBe(true);
    expect(isMostRecentYearMissing(currentMissing, now)).toBe(true);
  });

  it("flags the current year as most-recent-missing when it has no entry at all, not just when it failed", () => {
    // Every REST-fallback result has an empty contributionYears array
    // regardless of the real calendar year — silently falling back to
    // whatever older year happens to be present would misreport a stale
    // year's peak/streak as current.
    const onlyOlderYearPresent: GitHubContributionYear[] = [{ totalContributions: 10, year: 2025, weeks: [] }];
    expect(isMostRecentYearMissing(onlyOlderYearPresent, now)).toBe(true);
  });

  it("treats a genuine zero-contribution year as complete, not missing", () => {
    const genuineZero: GitHubContributionYear[] = [{ totalContributions: 0, year: 2026, weeks: [] }];
    expect(hasIncompleteYears(genuineZero)).toBe(false);
    expect(isMostRecentYearMissing(genuineZero, now)).toBe(false);
  });

  it("is false for hasIncompleteYears but true for isMostRecentYearMissing with no years at all", () => {
    // hasIncompleteYears([]) is false: nothing has actually *failed*, there's
    // just nothing there. isMostRecentYearMissing([]) is true precisely
    // because it can't confirm the current year specifically — the stronger
    // claim Peak Day/Current Streak make needs that confirmation to be honest.
    expect(hasIncompleteYears([])).toBe(false);
    expect(isMostRecentYearMissing([], now)).toBe(true);
  });
});
