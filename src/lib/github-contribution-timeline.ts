import type { GitHubContributionWeek, GitHubContributionYear } from "@/lib/github";

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
