import { FiArrowUpRight, FiGithub, FiGitBranch, FiStar } from "react-icons/fi";

import { Reveal } from "@/components/Reveal";
import { ProjectsDemoController } from "@/components/ProjectsDemoController";
import { getGitHubPortfolioData } from "@/lib/github";

function formatUpdatedAt(dateString: string | null) {
  if (!dateString) return "Update unknown";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(dateString));
}

function isRecentlyPushed(dateString: string | null, isArchived: boolean): boolean {
  if (!dateString || isArchived) return false;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const diff = Date.now() - new Date(dateString).getTime();
  return diff >= 0 && diff <= thirtyDaysMs;
}

export default async function ProjectsSection() {
  const data = await getGitHubPortfolioData();

  return (
    <section id="projects" className="cv-auto relative overflow-hidden py-16">
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-8 lg:px-12">
        <Reveal as="section" className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Projects</p>
          <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl">
            Every public repo, live from GitHub.
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
            This section now mirrors your public GitHub catalog directly, so new repositories, metadata changes, and activity all flow into the site automatically.
          </p>
        </Reveal>

        {data.projects.length > 0 ? (
          <div className="flex flex-col divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {data.projects.map((project, index) => {
              const indexLabel = String(index + 1).padStart(2, "0");
              const hasPreview = Boolean(project.liveUrl || project.demoUrl);
              const previewUrl = project.liveUrl ?? project.demoUrl ?? "";
              const previewKind = project.demoUrl ? "video" : "site";
              const isLive = isRecentlyPushed(project.pushedAt, project.isArchived);

              return (
                <Reveal key={project.nameWithOwner ?? project.name}>
                  <article
                    data-project-item={project.name}
                    className="group relative flex flex-col justify-between gap-5 py-6 transition-colors hover:bg-white/[0.02] px-3 sm:px-5 -mx-3 sm:-mx-5 rounded-2xl lg:flex-row lg:items-center lg:gap-8 sm:py-8"
                  >
                    {/* Left: Index + Status Dot + Name + Preview tag + Summary + Badges */}
                    <div className="flex flex-1 items-start gap-3.5 sm:gap-5 min-w-0">
                      {/* Monospace index & Live/Idle Pulse dot */}
                      <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-1.5 shrink-0 select-none">
                        <span className="font-mono text-xs sm:text-sm text-white/35 transition-colors group-hover:text-white/70">
                          {indexLabel}
                        </span>
                        {isLive ? (
                          <span
                            className="relative flex h-2 w-2"
                            title="Active within last 30 days"
                          >
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.85)]" />
                          </span>
                        ) : (
                          <span
                            className="flex h-2 w-2 items-center justify-center"
                            title={project.isArchived ? "Archived repository" : "Idle repository"}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                          </span>
                        )}
                      </div>

                      {/* Name, summary, tags */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {hasPreview ? (
                            <button
                              type="button"
                              data-project-preview={previewUrl}
                              data-project-name={project.name}
                              data-project-repo={project.repoUrl}
                              data-project-live={project.liveUrl ?? ""}
                              data-preview-kind={previewKind}
                              data-cursor-block
                              className="text-left font-semibold text-xl sm:text-2xl lg:text-3xl text-white transition-colors hover:text-cyan-400 group-hover:text-cyan-400 inline-flex items-center gap-2.5"
                            >
                              <span className="truncate">{project.name}</span>
                              <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-cyan-300 shrink-0 font-normal">
                                ▸ preview
                              </span>
                            </button>
                          ) : (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              data-cursor-block
                              className="text-left font-semibold text-xl sm:text-2xl lg:text-3xl text-white transition-colors hover:text-cyan-400 group-hover:text-cyan-400"
                            >
                              <span className="truncate">{project.name}</span>
                            </a>
                          )}
                        </div>

                        {project.summary ? (
                          <p className="text-xs sm:text-sm leading-relaxed text-white/65 line-clamp-2 max-w-2xl font-sans">
                            {project.summary}
                          </p>
                        ) : null}

                        {/* Badges / Topics */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {project.isFork ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
                              Fork
                            </span>
                          ) : null}
                          {project.isArchived ? (
                            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-300">
                              Archived
                            </span>
                          ) : null}
                          {project.stack.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full border border-white/5 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/45"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Metadata + Direct Links */}
                    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/[0.05] pt-3.5 lg:border-t-0 lg:pt-0 lg:justify-end pl-8 sm:pl-11 lg:pl-0 font-mono text-[11px] uppercase tracking-wider text-white/45">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {project.languageName ? (
                          <span className="text-white/70">{project.languageName}</span>
                        ) : null}
                        {project.languageName ? <span>&bull;</span> : null}
                        <span>{formatUpdatedAt(project.pushedAt)}</span>
                        {project.stars != null && project.stars > 0 ? (
                          <>
                            <span>&bull;</span>
                            <span className="inline-flex items-center gap-1 text-white/60">
                              <FiStar className="text-[12px] text-amber-400" />
                              {project.stars}
                            </span>
                          </>
                        ) : null}
                        {project.forkCount != null && project.forkCount > 0 ? (
                          <>
                            <span>&bull;</span>
                            <span className="inline-flex items-center gap-1 text-white/50">
                              <FiGitBranch className="text-[12px]" />
                              {project.forkCount}
                            </span>
                          </>
                        ) : null}
                      </div>

                      {/* Direct External Action Buttons */}
                      <div className="flex items-center gap-2">
                        {project.liveUrl ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor-block
                            title="Visit live site"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/40 hover:bg-white hover:text-black"
                            aria-label={`Visit live site for ${project.name}`}
                          >
                            <FiArrowUpRight size={14} />
                          </a>
                        ) : null}
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor-block
                          title="View repository"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/40 hover:bg-white hover:text-black"
                          aria-label={`View repository for ${project.name}`}
                        >
                          <FiGithub size={13} />
                        </a>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal>
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/35 p-8 text-center text-white/60">
              Public repositories will appear here once GitHub project data is available.
            </div>
          </Reveal>
        )}
      </div>
      <ProjectsDemoController />
    </section>
  );
}

