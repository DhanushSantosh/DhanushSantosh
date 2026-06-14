import type { ReactNode } from "react";
import { FiActivity, FiAward, FiFolder, FiStar, FiUsers } from "react-icons/fi";

import { Reveal } from "@/components/Reveal";
import { getGitHubPortfolioData } from "@/lib/github";

function GitHubProofCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/45 p-4 shadow-[0_0_25px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-3 text-white/60">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/80">
          {icon}
        </span>
        <p className="text-[0.68rem] uppercase tracking-[0.26em]">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{value}</p>
      <p className="mt-2 text-sm text-white/45">{hint}</p>
    </div>
  );
}

export default async function GitHubHighlightsSection() {
  const data = await getGitHubPortfolioData();
  const profile = data.profile;
  const achievements = data.recentEvents
    .slice()
    .sort((left, right) => {
      const leftPriority = left.kind === "pull_request" || left.kind === "release" ? 0 : left.kind === "visibility" ? 1 : 2;
      const rightPriority = right.kind === "pull_request" || right.kind === "release" ? 0 : right.kind === "visibility" ? 1 : 2;
      return leftPriority - rightPriority;
    })
    .filter((event, index, collection) => {
      return collection.findIndex((candidate) => candidate.summary === event.summary && candidate.repoName === event.repoName) === index;
    })
    .slice(0, 3);

  return (
    <section id="github-highlights" className="cv-auto relative overflow-hidden pb-12 bg-transparent">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-12">
        <Reveal
          as="section"
          className="rounded-[32px] border border-white/10 bg-black/60 p-6 shadow-[0_0_40px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:p-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">GitHub Highlights</p>
                <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl">
                  Important GitHub signals in one place.
                </h2>
                <p className="max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
                  A compact snapshot of achievements, contributions, stars, and profile momentum before the deeper activity feed below.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.26em] text-white/55">
                {data.source === "graphql" ? "GraphQL + REST" : data.source === "rest-fallback" ? "REST fallback" : "Static-safe mode"}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <GitHubProofCard
                icon={<FiAward />}
                label="Achievements"
                value={String(achievements.length)}
                hint={achievements.length > 0 ? "recent public milestones tracked live" : "new public milestones will appear here"}
              />
              <GitHubProofCard
                icon={<FiActivity />}
                label="Contributions"
                value={profile?.totalContributions != null ? String(profile.totalContributions) : "REST mode"}
                hint="last 365 days of GitHub contribution activity"
              />
              <GitHubProofCard
                icon={<FiStar />}
                label="Stars"
                value={String(data.totalFeaturedStars)}
                hint="stars accumulated across curated featured repositories"
              />
              <GitHubProofCard
                icon={<FiFolder />}
                label="Public Repos"
                value={String(profile?.publicRepos ?? 0)}
                hint={profile ? `${profile.followers} followers tracking the journey` : "profile summary appears when GitHub data is reachable"}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-white/8 bg-black/45 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
                    <FiUsers />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/45">Profile Pulse</p>
                    <p className="mt-1 text-white/70">
                      @{profile?.login ?? "DhanushSantosh"} with {profile?.followers ?? 0} followers and {data.featuredRepos.length} curated builds in rotation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/8 bg-black/45 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-white/45">Recent Achievements</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {achievements.length > 0 ? (
                    achievements.map((event) => (
                      <a
                        key={event.id}
                        href={event.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:border-white/25 hover:bg-white/8"
                      >
                        {event.summary}
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-white/55">Recent public achievements will appear here as GitHub activity comes in.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
