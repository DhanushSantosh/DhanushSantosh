import type { ReactNode } from "react";
import { FiActivity, FiFolder, FiStar } from "react-icons/fi";

import { Reveal } from "@/components/Reveal";
import { getGitHubPortfolioData } from "@/lib/github";

function getHighlightsSourceLabel(source: "graphql" | "live-partial" | "rest-fallback" | "unavailable") {
  if (source === "graphql") return "GraphQL + REST";
  if (source === "live-partial") return "Partial live data";
  if (source === "rest-fallback") return "REST fallback";
  return "Static-safe mode";
}

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
                {getHighlightsSourceLabel(data.source)}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <GitHubProofCard
                icon={<FiActivity />}
                label="Contributions"
                value={
                  profile?.totalContributions != null
                    ? String(profile.totalContributions)
                    : data.source === "unavailable"
                      ? "Offline"
                      : "REST mode"
                }
                hint="last 365 days of GitHub contribution activity when GraphQL is available"
              />
              <GitHubProofCard
                icon={<FiStar />}
                label="Stars"
                value={String(data.totalProjectStars)}
                hint="stars accumulated across public GitHub repos currently visible on the site"
              />
              <GitHubProofCard
                icon={<FiFolder />}
                label="Public Repos"
                value={String(profile?.publicRepos ?? 0)}
                hint={
                  profile
                    ? `${profile.followers} followers tracking the journey`
                    : data.source === "unavailable"
                      ? "profile summary reconnects when GitHub is reachable again"
                      : "profile summary is syncing from public GitHub data"
                }
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
