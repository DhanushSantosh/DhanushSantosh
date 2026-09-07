import type { GitHubContributionDay, GitHubContributionWeek, GitHubContributionYear } from "@/lib/github";

export const MAX_TIMELINE_WEEKS = 106;

export type TimelineWeek = GitHubContributionWeek & {
  monthLabel: string;
  showMonthLabel: boolean;
  showYearDivider: boolean;
  year: number;
  yearLabel: string;
};

export function flattenContributionDays(weeks: GitHubContributionWeek[], throughDate: string) {
  return weeks
    .flatMap((week) => week.contributionDays)
    .filter((day) => day.date <= throughDate)
    .sort((left, right) => left.date.localeCompare(right.date));
}

// `days` is expected in chronological order with contributionCount === 0 on
// days with no activity (not omitted) — the shape flattenContributionDays
// above produces. That makes both streaks a plain walk rather than needing
// to reason about gaps in the data itself.
export function getCurrentStreak(days: GitHubContributionDay[]) {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].contributionCount === 0) break;
    streak += 1;
  }
  return streak;
}

export function getLongestStreak(days: GitHubContributionDay[]) {
  let longest = 0;
  let current = 0;
  for (const day of days) {
    current = day.contributionCount > 0 ? current + 1 : 0;
    if (current > longest) longest = current;
  }
  return longest;
}

export function buildTimelineWeeks(
  contributionYears: GitHubContributionYear[],
  throughDate: string,
  maxWeeks = MAX_TIMELINE_WEEKS,
): TimelineWeek[] {
  const chronologicalWeeks = [...contributionYears]
    .filter((entry) => entry.weeks.length > 0)
    .sort((left, right) => left.year - right.year)
    .flatMap((entry) =>
      entry.weeks.map((week) => ({
        ...week,
        contributionDays: week.contributionDays
          .filter((day) => day.date <= throughDate)
          .sort((left, right) => left.date.localeCompare(right.date)),
        year: entry.year,
      })),
    )
    .filter((week) => week.contributionDays.length > 0)
    .map((week) => ({ ...week, firstDay: week.contributionDays[0]?.date ?? week.firstDay }))
    .slice(-maxWeeks);

  return chronologicalWeeks.map((week, index) => {
    const date = new Date(`${week.firstDay}T00:00:00Z`);
    const monthLabel = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
    const previousWeek = chronologicalWeeks[index - 1];
    const previousMonth = previousWeek
      ? new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(`${previousWeek.firstDay}T00:00:00Z`))
      : null;

    return {
      ...week,
      monthLabel,
      showMonthLabel: !previousWeek || previousMonth !== monthLabel || previousWeek.year !== week.year,
      showYearDivider: !previousWeek || previousWeek.year !== week.year,
      yearLabel: String(week.year),
    };
  });
}
