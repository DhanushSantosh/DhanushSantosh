import type { GitHubContributionDay, GitHubContributionWeek } from "@/lib/github";

export function parseContributionHeadlineCount(html: string) {
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

export function parseContributionWeeks(html: string): GitHubContributionWeek[] {
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

    const contributionDays = weeksByIndex.get(weekIndex) ?? [];
    contributionDays.push({
      color: "",
      contributionCount: parseContributionTooltipCount(tooltipById.get(elementId) ?? ""),
      contributionLevel: mapContributionLevel(level),
      date,
      weekday: new Date(`${date}T00:00:00Z`).getUTCDay(),
    });
    weeksByIndex.set(weekIndex, contributionDays);
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
