import { FiArrowUpRight, FiGithub } from "react-icons/fi";

import { Reveal } from "@/components/Reveal";
import {
  type GitHubContributionDay,
  type GitHubRecentEvent,
  getGitHubPortfolioData,
} from "@/lib/github";

function formatTimestamp(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function formatShortDate(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateString));
}

function getSourceLabel(source: "graphql" | "rest-fallback" | "unavailable") {
  if (source === "graphql") return "Full Live Sync";
  if (source === "rest-fallback") return "Live Public Sync";
  return "Safe Fallback";
}

function getEventKindLabel(kind: GitHubRecentEvent["kind"]) {
  if (kind === "pull_request") return "Pull Request";
  if (kind === "release") return "Release";
  if (kind === "visibility") return "Visibility";
  if (kind === "branch") return "Branch";
  if (kind === "repository") return "Repository";
  return "Push";
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
  const color = getContributionColor(day);
  return (
    <div
      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[1.5px] transition-all duration-200 hover:scale-150 hover:z-10 cursor-pointer"
      style={{ backgroundColor: color }}
      title={`${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"} on ${day.date}`}
    />
  );
}

function flattenContributionDays(days: GitHubContributionDay[][]) {
  return days.flat().sort((left, right) => left.date.localeCompare(right.date));
}

function getCurrentStreak(days: GitHubContributionDay[]) {
  let streak = 0;

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index]?.contributionCount > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
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

export default async function GitHubActivitySection() {
  const data = await getGitHubPortfolioData();
  const profile = data.profile;
  const contributionDays = flattenContributionDays(data.weeks.map((week) => week.contributionDays));
  const activeDays = getActiveDays(contributionDays);
  const currentStreak = getCurrentStreak(contributionDays);
  const peakDay = getPeakContributionDay(contributionDays);

  const weeksWithMonthLabels = data.weeks.map((week, index) => {
    const date = new Date(week.firstDay);
    const monthLabel = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
    
    let showLabel = false;
    if (index === 0) {
      showLabel = true;
    } else {
      const prevDate = new Date(data.weeks[index - 1].firstDay);
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

  const isLive = data.source === "graphql" || data.source === "rest-fallback";

  return (
    <section id="github-activity" className="cv-auto relative overflow-hidden pb-12 bg-transparent">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-12">
        <Reveal className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">GitHub Activity</p>
            <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl">
              A working log, not a vanity widget.
            </h2>
            <p className="max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
              Recent pushes, merges, and contribution rhythm scaled down to stay minimal and out of the way.
            </p>
          </div>

          <article className="rounded-[24px] border border-white/[0.08] bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors hover:border-white/[0.12] duration-300">
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              
              {/* Left Side: Contribution Grid & Metrics */}
              <div className="flex-1 p-5 sm:p-7 flex flex-col min-w-0 justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-medium text-white/90">Contribution Rhythm</h3>
                      {isLive && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-white/50 font-mono">
                        {getSourceLabel(data.source)}
                      </span>
                    </div>
                  </div>

                  {data.weeks.length > 0 ? (
                    <div className="overflow-x-auto no-scrollbar pb-2 pt-2 -mx-2 px-2 sm:-mx-4 sm:px-4">
                      <div className="flex gap-[3px] sm:gap-1 min-w-max items-end">
                        {/* Weekday Labels */}
                        <div className="flex flex-col gap-[2px] sm:gap-[3px] pr-1 sm:pr-1.5 pb-[2px] sm:pb-[3px] select-none text-[7px] text-white/30 font-mono">
                          <span className="h-2 sm:h-2.5 flex items-center justify-end"></span>
                          <span className="h-2 sm:h-2.5 flex items-center justify-end">Mon</span>
                          <span className="h-2 sm:h-2.5 flex items-center justify-end"></span>
                          <span className="h-2 sm:h-2.5 flex items-center justify-end">Wed</span>
                          <span className="h-2 sm:h-2.5 flex items-center justify-end"></span>
                          <span className="h-2 sm:h-2.5 flex items-center justify-end">Fri</span>
                          <span className="h-2 sm:h-2.5 flex items-center justify-end"></span>
                        </div>

                        {/* Contribution Grid */}
                        <div className="flex flex-col gap-[2px] sm:gap-[3px]">
                          {/* Month Markers */}
                          <div className="flex gap-[2px] sm:gap-[3px] text-[7px] text-white/35 h-2.5 relative select-none font-mono">
                            {weeksWithMonthLabels.map((week) => (
                              <div key={week.firstDay} className="w-2 sm:w-2.5 relative shrink-0 font-sans">
                                {week.showLabel && (
                                  <span className="absolute left-0 bottom-0 whitespace-nowrap uppercase tracking-wider text-[7px]">
                                    {week.monthLabel}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Grid Cells */}
                          <div className="flex gap-[2px] sm:gap-[3px]">
                            {weeksWithMonthLabels.map((week) => (
                              <div key={week.firstDay} className="flex flex-col gap-[2px] sm:gap-[3px] shrink-0">
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
                    <div className="rounded-xl border border-dashed border-white/10 bg-black/30 p-4 text-center my-3">
                      <p className="text-xs font-medium text-white/80">Public activity is live.</p>
                      <p className="mt-1 text-[10px] text-white/40 max-w-sm mx-auto leading-relaxed">
                        Recent events are syncing. The full contribution graph will appear when GraphQL data becomes available.
                      </p>
                    </div>
                  )}
                </div>

                {/* Inline Metrics */}
                {data.weeks.length > 0 && (
                  <div className="flex flex-wrap gap-x-8 gap-y-4 mt-5 pt-4 border-t border-white/[0.05]">
                    <div className="flex flex-col">
                      <span className="text-xl font-medium text-white tracking-tight leading-none">{profile?.totalContributions ?? "N/A"}</span>
                      <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1.5">Total Year</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-medium text-white tracking-tight leading-none">{activeDays}</span>
                      <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1.5">Active Days</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-medium text-white tracking-tight leading-none">{currentStreak}</span>
                      <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1.5">Day Streak</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Timeline (Limited to 3) */}
              <div className="lg:w-[320px] shrink-0 p-5 sm:p-7 flex flex-col border-t lg:border-t-0 lg:border-l border-white/[0.05] bg-white/[0.01]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[13px] font-medium text-white/90">Live Feed</h3>
                  {profile && (
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white transition-colors duration-200"
                    >
                      <FiGithub className="text-[12px]" />
                      @{profile.login}
                    </a>
                  )}
                </div>

                {data.recentEvents.length > 0 ? (
                  <div className="flex-1 flex flex-col space-y-4 py-1">
                    {data.recentEvents.slice(0, 3).map((event, idx) => {
                      const isLatest = idx === 0;
                      
                      let dotColorClass = "bg-white/30";
                      if (event.kind === "pull_request") dotColorClass = "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.4)]";
                      else if (event.kind === "release") dotColorClass = "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]";
                      else if (event.kind === "visibility") dotColorClass = "bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.4)]";
                      else if (event.kind === "push") dotColorClass = "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.4)]";

                      return (
                        <a
                          key={event.id}
                          href={event.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative flex flex-col gap-1 border-l border-white/[0.08] pl-3 py-0.5 hover:border-white/25 transition-colors duration-200"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute -left-[3px] top-[7px] flex h-1.5 w-1.5 items-center justify-center">
                            <span className={`h-1.5 w-1.5 rounded-full ${dotColorClass} transition-transform duration-300 group-hover:scale-125`} />
                            {isLatest && (
                              <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 opacity-30 animate-ping" />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                            <span className="text-white/40 font-mono">{formatShortDate(event.timestamp)}</span>
                            <span className="text-white/20">&bull;</span>
                            <span className="uppercase tracking-wider font-mono text-[8px] text-white/50">{getEventKindLabel(event.kind)}</span>
                            {isLatest && (
                              <span className="text-[7px] font-bold uppercase tracking-wider text-cyan-400 ml-0.5">
                                Latest
                              </span>
                            )}
                          </div>
                          <h4 className="text-[12px] font-medium text-white/90 group-hover:text-cyan-400 transition-colors duration-200 leading-snug">
                            {event.summary}
                          </h4>
                          <p className="font-mono text-[9px] text-white/30 truncate max-w-full">
                            {event.repoName}
                          </p>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-black/30 p-4 text-center text-[10px] text-white/40 font-sans my-auto">
                    No recent events found.
                  </div>
                )}

                {profile && (
                  <div className="pt-4 border-t border-white/[0.05] mt-4">
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-white/50 hover:text-white transition-all duration-200 group/btn uppercase tracking-wider font-semibold"
                    >
                      <span>Full Activity</span>
                      <FiArrowUpRight className="text-[10px] transition-transform duration-200 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                    </a>
                  </div>
                )}
              </div>

            </div>
          </article>
          
          {/* Fallback Metrics (when weeks length is 0) */}
          {data.weeks.length === 0 && (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-6">
              <div className="flex flex-col">
                <span className="text-xl font-medium text-white tracking-tight">{data.recentEvents.length}</span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1">Recent Events</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-medium text-white tracking-tight">{profile?.followers ?? 0}</span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-medium text-white tracking-tight">{data.featuredRepos.length}</span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1">Featured</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white tracking-tight mt-1">{formatShortDate(data.lastSyncedAt)}</span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1.5">Last Synced</span>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
