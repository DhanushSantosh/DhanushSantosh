import { describe, expect, it } from "vitest";

import type { GitHubContributionYear } from "./github";
import { buildTimelineWeeks, flattenContributionDays } from "./github-contribution-timeline";

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
