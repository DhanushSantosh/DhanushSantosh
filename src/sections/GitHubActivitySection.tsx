import { FiArrowUpRight, FiGithub, FiUsers } from "react-icons/fi";

import GitHubContributionExplorer from "@/components/GitHubContributionExplorer";
import { Reveal } from "@/components/Reveal";
import StarredReposCarousel from "@/components/StarredReposCarousel";
import { type GitHubRecentEvent, getGitHubPortfolioData } from "@/lib/github";

function formatShortDate(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateString));
}

function getEventKindLabel(kind: GitHubRecentEvent["kind"]) {
  if (kind === "pull_request") return "Pull Request";
  if (kind === "release") return "Release";
  if (kind === "visibility") return "Visibility";
  if (kind === "branch") return "Branch";
  if (kind === "repository") return "Repository";
  return "Push";
}

export default async function GitHubActivitySection() {
  const data = await getGitHubPortfolioData();
  const profile = data.profile;
  const hasContributionData = data.contributionYears.some((entry) => entry.weeks.length > 0);

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
                <GitHubContributionExplorer contributionYears={data.contributionYears} source={data.source} />
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
          
          <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] mt-6">
            <div className="rounded-3xl border border-white/8 bg-black/45 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
                  <FiUsers />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/45">Profile Pulse</p>
                  <p className="mt-1 text-white/70">
                    {profile
                      ? `@${profile.login} with ${profile.followers} followers and ${data.projects.length} public repos currently visible.`
                      : `${data.projects.length} public repos are currently visible while the GitHub profile summary reconnects.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-black/45 p-5 min-w-0">
              <p className="text-sm uppercase tracking-[0.3em] text-white/45 mb-4">Starred Repositories</p>
              <StarredReposCarousel repos={data.starredRepos} />
            </div>
          </div>
          
          {/* Fallback Metrics (when weeks length is 0) */}
          {!hasContributionData && (
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
                <span className="text-xl font-medium text-white tracking-tight">{data.projects.length}</span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1">Projects</span>
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
