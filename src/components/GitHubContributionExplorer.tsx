"use client";

import { useEffect, useMemo, useRef } from "react";

import type { GitHubContributionDay, GitHubContributionYear, GitHubPortfolioData, GitHubContributionWeek } from "@/lib/github";

function getSourceLabel(source: GitHubPortfolioData["source"]) {
  if (source === "graphql") return "Full Live Sync";
  if (source === "live-partial") return "Partial Live Sync";
  if (source === "rest-fallback") return "Live Public Sync";
  return "Safe Fallback";
}

function getContributionColor(day: GitHubContributionDay) {
  if (day.contributionCount === 0) return "rgba(255, 255, 255, 0.03)";

  switch (day.contributionLevel) {
    case "FIRST_QUARTILE":
      return "rgba(95, 225, 255, 0.22)";
    case "SECOND_QUARTILE":
      return "rgba(95, 225, 255, 0.45)";
    case "THIRD_QUARTILE":
      return "rgba(95, 225, 255, 0.70)";
    case "FOURTH_QUARTILE":
      return "rgba(95, 225, 255, 1.0)";
    default:
      if (day.contributionCount <= 2) return "rgba(95, 225, 255, 0.3)";
      if (day.contributionCount <= 5) return "rgba(95, 225, 255, 0.6)";
      return "rgba(95, 225, 255, 1.0)";
  }
}

function ContributionCell({ day }: { day: GitHubContributionDay }) {
  return (
    <div
      className="h-2 w-2 rounded-[1.5px] transition-all duration-200 hover:z-10 hover:scale-150 sm:h-2.5 sm:w-2.5"
      style={{ backgroundColor: getContributionColor(day) }}
      title={`${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"} on ${day.date}`}
    />
  );
}

type TimelineWeek = GitHubContributionWeek & {
  monthLabel: string;
  showMonthLabel: boolean;
  showYearDivider: boolean;
  year: number;
  yearLabel: string;
};

function buildTimelineWeeks(contributionYears: GitHubContributionYear[]): TimelineWeek[] {
  const chronologicalYears = [...contributionYears]
    .filter((entry) => entry.weeks.length > 0)
    .sort((left, right) => left.year - right.year);

  const timelineWeeks: TimelineWeek[] = [];

  chronologicalYears.forEach((entry) => {
    entry.weeks.forEach((week, index) => {
      const date = new Date(`${week.firstDay}T00:00:00Z`);
      const monthLabel = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
      const previousWeek = timelineWeeks[timelineWeeks.length - 1];
      const previousMonthLabel = previousWeek?.monthLabel ?? null;

      timelineWeeks.push({
        ...week,
        monthLabel,
        showMonthLabel: !previousWeek || previousMonthLabel !== monthLabel,
        showYearDivider: index === 0,
        year: entry.year,
        yearLabel: String(entry.year),
      });
    });
  });

  return timelineWeeks;
}

type GitHubContributionExplorerProps = {
  contributionYears: GitHubContributionYear[];
  source: GitHubPortfolioData["source"];
};

export default function GitHubContributionExplorer({
  contributionYears,
  source,
}: GitHubContributionExplorerProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const timelineWeeks = useMemo(() => buildTimelineWeeks(contributionYears), [contributionYears]);
  const hasContributionData = timelineWeeks.length > 0;
  const isLive = source !== "unavailable";

  useEffect(() => {
    const node = scrollContainerRef.current;
    if (!node) return;

    node.scrollLeft = node.scrollWidth;
  }, [timelineWeeks.length]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-medium text-white/90">Contribution Rhythm</h3>
          {isLive ? (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            </span>
          ) : null}
        </div>
        <div className="flex items-center">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">
            {getSourceLabel(source)}
          </span>
        </div>
      </div>

      {hasContributionData ? (
        <div className="overflow-hidden rounded-[24px] border border-white/[0.06] bg-black/25">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto no-scrollbar px-3 pb-3 pt-4 sm:px-4 sm:pb-4"
          >
            <div className="flex min-w-max items-end gap-[3px] sm:gap-1">
              <div className="flex select-none flex-col gap-[2px] pb-[2px] pr-1 text-[7px] font-mono text-white/30 sm:gap-[3px] sm:pb-[3px] sm:pr-1.5">
                <span className="flex h-3 items-center justify-end sm:h-3.5"></span>
                <span className="flex h-2.5 items-center justify-end sm:h-3">Mon</span>
                <span className="flex h-2 items-center justify-end sm:h-2.5"></span>
                <span className="flex h-2.5 items-center justify-end sm:h-3">Wed</span>
                <span className="flex h-2 items-center justify-end sm:h-2.5"></span>
                <span className="flex h-2.5 items-center justify-end sm:h-3">Fri</span>
                <span className="flex h-2 items-center justify-end sm:h-2.5"></span>
              </div>

              <div className="flex flex-col gap-[2px] sm:gap-[3px]">
                <div className="relative flex h-3.5 select-none gap-[2px] font-mono text-[7px] text-white/28 sm:gap-[3px]">
                  {timelineWeeks.map((week) => (
                    <div
                      key={`year-${week.firstDay}`}
                      className={`relative w-2 shrink-0 font-sans sm:w-2.5 ${
                        week.showYearDivider ? "border-l border-white/10 pl-[3px] sm:pl-1" : ""
                      }`}
                    >
                      {week.showYearDivider ? (
                        <span className="absolute bottom-0 left-0 whitespace-nowrap text-[7px] uppercase tracking-[0.28em] text-white/45">
                          {week.yearLabel}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="relative flex h-2.5 select-none gap-[2px] font-mono text-[7px] text-white/35 sm:gap-[3px]">
                  {timelineWeeks.map((week) => (
                    <div
                      key={`month-${week.firstDay}`}
                      className={`relative w-2 shrink-0 font-sans sm:w-2.5 ${
                        week.showYearDivider ? "border-l border-white/10 pl-[3px] sm:pl-1" : ""
                      }`}
                    >
                      {week.showMonthLabel ? (
                        <span className="absolute bottom-0 left-0 whitespace-nowrap text-[7px] uppercase tracking-wider">
                          {week.monthLabel}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="flex gap-[2px] sm:gap-[3px]">
                  {timelineWeeks.map((week) => (
                    <div
                      key={week.firstDay}
                      className={`flex shrink-0 flex-col gap-[2px] sm:gap-[3px] ${
                        week.showYearDivider ? "border-l border-white/10 pl-[3px] sm:pl-1" : ""
                      }`}
                    >
                      {week.contributionDays.map((day) => (
                        <ContributionCell key={day.date} day={day} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-3 rounded-xl border border-dashed border-white/10 bg-black/30 p-4 text-center">
          <p className="text-xs font-medium text-white/80">
            {source === "unavailable" ? "GitHub sync is temporarily unavailable." : "Contribution history is syncing."}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[10px] leading-relaxed text-white/40">
            {source === "unavailable"
              ? "Recent events and contribution history will reappear automatically once GitHub data is reachable again."
              : "Contribution history will appear here as soon as GitHub activity data is available."}
          </p>
        </div>
      )}
    </div>
  );
}
