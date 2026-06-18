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
      className="h-2 w-2 rounded-[1.5px] transition-all duration-200 hover:z-10 hover:scale-150 sm:h-2.5 sm:w-2.5"
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

function formatPeakDate(date: string | null) {
  if (!date) return "No active day";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

function YearHeatmapPanel({
  contributionYear,
  isArchiveView,
}: {
  contributionYear: GitHubContributionYear;
  isArchiveView: boolean;
}) {
  const contributionDays = flattenContributionDays(contributionYear.weeks.map((week) => week.contributionDays));
  const activeDays = getActiveDays(contributionDays);
  const peakDay = getPeakContributionDay(contributionDays);
  const weeksWithMonthLabels = getWeeksWithMonthLabels(contributionYear.weeks);

  return (
    <article
      className={`rounded-[24px] border border-white/[0.08] bg-white/[0.02] ${
        isArchiveView ? "p-4 sm:p-5" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/38">
            {isArchiveView ? "Archive Slice" : "Focused Year"}
          </p>
          <h4 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[30px]">{contributionYear.year}</h4>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-cyan-100/90">
          {contributionYear.totalContributions ?? "N/A"} total contributions
        </div>
      </div>

      <div className="overflow-x-auto pb-2 pt-4 no-scrollbar">
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

      <div className="mt-5 grid gap-3 border-t border-white/[0.05] pt-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.05] bg-black/30 px-4 py-3">
          <p className="text-lg font-medium tracking-tight text-white">{activeDays}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-white/38">Active Days</p>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-black/30 px-4 py-3">
          <p className="text-lg font-medium tracking-tight text-white">{peakDay?.contributionCount ?? 0}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-white/38">Peak Day</p>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-black/30 px-4 py-3">
          <p className="text-sm font-medium tracking-tight text-white">{formatPeakDate(peakDay?.date ?? null)}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-white/38">Peak Date</p>
        </div>
      </div>
    </article>
  );
}

type GitHubContributionExplorerProps = {
  contributionYears: GitHubContributionYear[];
  source: GitHubPortfolioData["source"];
};

export default function GitHubContributionExplorer({
  contributionYears,
  source,
}: GitHubContributionExplorerProps) {
  const orderedContributionYears = [...contributionYears].sort((left, right) => right.year - left.year);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const selectedContributionYear =
    selectedYear === "all"
      ? null
      : orderedContributionYears.find((entry) => entry.year === selectedYear) ?? orderedContributionYears[0] ?? null;
  const visibleYears = selectedContributionYear ? [selectedContributionYear] : orderedContributionYears;
  const hasContributionData = visibleYears.some((year) => year.weeks.length > 0);
  const isArchiveView = selectedContributionYear === null;
  const isLive = source !== "unavailable";

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-medium text-white/90">Contribution Archive</h3>
            {isLive ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
              </span>
            ) : null}
          </div>
          <p className="max-w-2xl text-[11px] leading-relaxed text-white/48 sm:text-xs">
            Scroll across every available year by default, or jump into a focused year view whenever you want a cleaner read.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <label className="relative min-w-[180px]">
            <span className="sr-only">Contribution archive mode</span>
            <select
              value={selectedYear}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedYear(value === "all" ? "all" : Number(value));
              }}
              className="w-full appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 pr-10 text-[10px] uppercase tracking-[0.26em] text-white/78 outline-none transition hover:border-white/18 focus:border-cyan-400/45"
            >
              <option value="all">Infinite Scroll</option>
              {orderedContributionYears.map((entry) => (
                <option key={entry.year} value={entry.year}>
                  {entry.year}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[9px] uppercase tracking-[0.3em] text-white/35">
              View
            </span>
          </label>

          {selectedContributionYear ? (
            <button
              type="button"
              onClick={() => setSelectedYear("all")}
              className="rounded-full border border-cyan-400/18 bg-cyan-400/8 px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-cyan-100 transition hover:border-cyan-400/35 hover:bg-cyan-400/12"
            >
              Back to Archive
            </button>
          ) : null}

          <span className="inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">
            {getSourceLabel(source)}
          </span>
        </div>
      </div>

      {hasContributionData ? (
        <>
          {isArchiveView ? (
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-black/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="max-h-[38rem] space-y-4 overflow-y-auto rounded-[28px] border border-white/[0.06] bg-black/25 p-3 no-scrollbar sm:p-4">
                {visibleYears
                  .filter((entry) => entry.weeks.length > 0)
                  .map((entry) => (
                    <YearHeatmapPanel key={entry.year} contributionYear={entry} isArchiveView />
                  ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] uppercase tracking-[0.24em] text-white/34">
                <span>Archive Mode</span>
                <span>{orderedContributionYears.length} years loaded</span>
              </div>
            </div>
          ) : selectedContributionYear && selectedContributionYear.weeks.length > 0 ? (
            <YearHeatmapPanel contributionYear={selectedContributionYear} isArchiveView={false} />
          ) : null}
        </>
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
    </div>
  );
}
