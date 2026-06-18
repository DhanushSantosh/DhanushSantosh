"use client";

import { useState } from "react";

import type { GitHubContributionDay, GitHubContributionYear, GitHubPortfolioData } from "@/lib/github";

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
      className="h-2 w-2 cursor-pointer rounded-[1.5px] transition-all duration-200 hover:z-10 hover:scale-150 sm:h-2.5 sm:w-2.5"
      style={{ backgroundColor: getContributionColor(day) }}
      title={`${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"} on ${day.date}`}
    />
  );
}

function flattenContributionDays(days: GitHubContributionDay[][]) {
  return days.flat().sort((left, right) => left.date.localeCompare(right.date));
}

function getActiveDays(days: GitHubContributionDay[]) {
  return days.filter((day) => day.contributionCount > 0).length;
}

function getPeakContributionDay(days: GitHubContributionDay[]) {
  return days.reduce<GitHubContributionDay | null>((peak, day) => {
    if (!peak || day.contributionCount > peak.contributionCount) return day;
    return peak;
  }, null);
}

function getWeeksWithMonthLabels(weeks: GitHubContributionYear["weeks"]) {
  return weeks.map((week, index) => {
    const date = new Date(week.firstDay);
    const monthLabel = new Intl.DateTimeFormat("en", { month: "short" }).format(date);

    let showLabel = false;
    if (index === 0) {
      showLabel = true;
    } else {
      const prevDate = new Date(weeks[index - 1]?.firstDay ?? week.firstDay);
      const prevMonthLabel = new Intl.DateTimeFormat("en", { month: "short" }).format(prevDate);
      if (monthLabel !== prevMonthLabel) {
        showLabel = true;
      }
    }

    return {
      ...week,
      monthLabel,
      showLabel,
    };
  });
}

type GitHubContributionExplorerProps = {
  contributionYears: GitHubContributionYear[];
  source: GitHubPortfolioData["source"];
};

export default function GitHubContributionExplorer({
  contributionYears,
  source,
}: GitHubContributionExplorerProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(contributionYears[0]?.year ?? null);
  const selectedContributionYear =
    contributionYears.find((entry) => entry.year === selectedYear) ?? contributionYears[0] ?? null;

  const contributionDays = selectedContributionYear
    ? flattenContributionDays(selectedContributionYear.weeks.map((week) => week.contributionDays))
    : [];
  const activeDays = getActiveDays(contributionDays);
  const peakDay = getPeakContributionDay(contributionDays);
  const weeksWithMonthLabels = selectedContributionYear ? getWeeksWithMonthLabels(selectedContributionYear.weeks) : [];
  const isLive = source !== "unavailable";

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

      {contributionYears.length > 1 ? (
        <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
          {contributionYears.map((entry) => {
            const isSelected = entry.year === selectedContributionYear?.year;
            return (
              <button
                key={entry.year}
                type="button"
                onClick={() => setSelectedYear(entry.year)}
                className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] transition ${
                  isSelected
                    ? "border-cyan-400/60 bg-cyan-400/12 text-cyan-200"
                    : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/25 hover:text-white/75"
                }`}
              >
                {entry.year}
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedContributionYear && weeksWithMonthLabels.length > 0 ? (
        <div className="overflow-x-auto no-scrollbar pb-2 pt-2 -mx-2 px-2 sm:-mx-4 sm:px-4">
          <div className="flex min-w-max items-end gap-[3px] sm:gap-1">
            <div className="flex select-none flex-col gap-[2px] pb-[2px] pr-1 text-[7px] font-mono text-white/30 sm:gap-[3px] sm:pb-[3px] sm:pr-1.5">
              <span className="flex h-2 items-center justify-end sm:h-2.5"></span>
              <span className="flex h-2 items-center justify-end sm:h-2.5">Mon</span>
              <span className="flex h-2 items-center justify-end sm:h-2.5"></span>
              <span className="flex h-2 items-center justify-end sm:h-2.5">Wed</span>
              <span className="flex h-2 items-center justify-end sm:h-2.5"></span>
              <span className="flex h-2 items-center justify-end sm:h-2.5">Fri</span>
              <span className="flex h-2 items-center justify-end sm:h-2.5"></span>
            </div>

            <div className="flex flex-col gap-[2px] sm:gap-[3px]">
              <div className="relative flex h-2.5 select-none gap-[2px] font-mono text-[7px] text-white/35 sm:gap-[3px]">
                {weeksWithMonthLabels.map((week) => (
                  <div key={week.firstDay} className="relative w-2 shrink-0 font-sans sm:w-2.5">
                    {week.showLabel ? (
                      <span className="absolute bottom-0 left-0 whitespace-nowrap text-[7px] uppercase tracking-wider">
                        {week.monthLabel}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex gap-[2px] sm:gap-[3px]">
                {weeksWithMonthLabels.map((week) => (
                  <div key={week.firstDay} className="flex shrink-0 flex-col gap-[2px] sm:gap-[3px]">
                    {week.contributionDays.map((day) => (
                      <ContributionCell key={day.date} day={day} />
                    ))}
                  </div>
                ))}
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
              : "Yearly contribution views will appear here as soon as GitHub activity data is available."}
          </p>
        </div>
      )}

      {selectedContributionYear && weeksWithMonthLabels.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/[0.05] pt-4">
          <div className="flex flex-col">
            <span className="text-xl font-medium leading-none tracking-tight text-white">
              {selectedContributionYear.totalContributions ?? "N/A"}
            </span>
            <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40">
              {selectedContributionYear.year} Total
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-medium leading-none tracking-tight text-white">{activeDays}</span>
            <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40">Active Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-medium leading-none tracking-tight text-white">{peakDay?.contributionCount ?? 0}</span>
            <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40">Peak Day</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
