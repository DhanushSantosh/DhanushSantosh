import { FiArrowUpRight, FiGithub, FiGitBranch, FiPlay, FiStar } from "react-icons/fi";

import { Reveal } from "@/components/Reveal";
import { ProjectsDemoController } from "@/components/ProjectsDemoController";
import { getGitHubPortfolioData } from "@/lib/github";

function formatUpdatedAt(dateString: string | null) {
  if (!dateString) return "Update unknown";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(dateString));
}

export default async function ProjectsSection() {
  const data = await getGitHubPortfolioData();

  return (
    <section id="projects" className="cv-auto relative overflow-hidden py-16">
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-8 lg:px-12">
        <Reveal as="section" className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Projects</p>
          <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl">
            GitHub-backed featured builds.
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
            Featured work is curated locally, but repository metadata, stars, forks, and repo activity are now sourced live from GitHub.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.featuredRepos.map((project) => {
            const primaryUrl = project.liveUrl ?? project.repoUrl ?? "#";
            const primaryLabel = project.liveUrl ? "Visit project" : "View repository";
            const showRepoButton = Boolean(project.liveUrl && project.repoUrl);

            return (
              <Reveal key={project.nameWithOwner ?? project.name}>
                <article
                  data-project-item={project.name}
                  className="flex h-full flex-col rounded-3xl border border-white/10 bg-black/60 p-5 shadow-[0_0_45px_rgba(0,0,0,0.85)] backdrop-blur-md transition hover:border-white/40 hover:bg-black/80 sm:p-6"
                >
                  <header className="flex flex-1 flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-balance">
                        <p className="text-sm uppercase tracking-[0.4em] text-white/50">{project.accent}</p>
                        <h3 className="text-2xl font-semibold text-white">{project.name}</h3>
                      </div>
                      {project.languageName ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-white/55">
                          {project.languageName}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-white/50">
                      {project.stack.map((stackItem) => (
                        <span key={stackItem} className="rounded-full border border-white/5 bg-white/5 px-3 py-1">
                          {stackItem}
                        </span>
                      ))}
                    </div>
                  </header>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70 sm:text-base">{project.summary}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-white/45">
                    {project.stars != null ? (
                      <span className="inline-flex items-center gap-2">
                        <FiStar />
                        {project.stars}
                      </span>
                    ) : null}
                    {project.forkCount != null ? (
                      <span className="inline-flex items-center gap-2">
                        <FiGitBranch />
                        {project.forkCount}
                      </span>
                    ) : null}
                    <span>{formatUpdatedAt(project.pushedAt)}</span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <a
                      href={primaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor-block
                      className="group inline-flex items-center justify-center rounded-full border border-white bg-white px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]"
                    >
                      {primaryLabel}
                      <FiArrowUpRight className="ml-2 text-black transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>

                    {showRepoButton ? (
                      <a
                        href={project.repoUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor-block
                        className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:border-white/40 hover:shadow-[0_0_28px_rgba(95,225,255,0.45)]"
                      >
                        <FiGithub className="mr-2" />
                        View repo
                      </a>
                    ) : null}

                    {project.demoUrl ? (
                      <button
                        type="button"
                        data-project-demo={project.demoUrl}
                        data-cursor-block
                        className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:border-white/40 hover:shadow-[0_0_28px_rgba(95,225,255,0.45)]"
                      >
                        Demo
                        <FiPlay className="ml-2" />
                      </button>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
      <ProjectsDemoController />
    </section>
  );
}

