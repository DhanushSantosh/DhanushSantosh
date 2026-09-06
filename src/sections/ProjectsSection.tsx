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
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-10 px-4 sm:px-8 lg:px-12">
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
          <div className="border-t border-white/[0.08] grid grid-cols-1 lg:grid-cols-2">
            {data.projects.map((project, index) => {
              const indexLabel = String(index + 1).padStart(2, "0");
              const hasPreview = Boolean(project.liveUrl || project.demoUrl);
              const previewUrl = project.liveUrl ?? project.demoUrl ?? "";
              const previewKind = project.demoUrl ? "video" : "site";
              const isLive = isRecentlyPushed(project.pushedAt, project.isArchived);
              const isLeftColumn = index % 2 === 0;

              return (
                <Reveal key={project.nameWithOwner ?? project.name} className="h-full">
                  <article
                    data-project-item={project.name}
                    className={`group relative flex h-full flex-col justify-between gap-3.5 border-b border-white/[0.08] py-6 px-3 sm:px-4 transition-colors hover:bg-white/[0.02] ${
                      isLeftColumn
                        ? "lg:border-r lg:border-white/[0.08] lg:pr-8 xl:pr-10"
                        : "lg:pl-8 xl:pl-10"
                    }`}
                  >
                    {/* Top: Index + Status Dot + Name + Preview tag + Direct Links */}
                    <div className="flex items-start justify-between gap-3 min-h-[2rem]">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Monospace index & Live/Idle Pulse dot */}
                        <div className="flex items-center gap-2 pt-1 shrink-0 select-none">
                          <span className="font-mono text-xs text-white/35 transition-colors group-hover:text-cyan-400">
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

                        {/* Name and preview button */}
                        <div className="min-w-0">
                          {hasPreview ? (
                            <button
                              type="button"
                              data-project-preview={previewUrl}
                              data-project-name={project.name}
                              data-project-repo={project.repoUrl}
                              data-project-live={project.liveUrl ?? ""}
                              data-preview-kind={previewKind}
                              data-cursor-block
                              className="text-left font-semibold text-lg sm:text-xl text-white transition-colors hover:text-cyan-400 group-hover:text-cyan-400 inline-flex flex-wrap items-center gap-2"
                            >
                              <span className="break-words">{project.name}</span>
                              <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan-300 shrink-0 font-normal">
                                ▸ preview
                              </span>
                            </button>
                          ) : (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              data-cursor-block
                              className="text-left font-semibold text-lg sm:text-xl text-white transition-colors hover:text-cyan-400 group-hover:text-cyan-400 block break-words"
                            >
                              <span>{project.name}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Direct External Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        {project.liveUrl ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor-block
                            title="Visit live site"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/40 hover:bg-white hover:text-black"
                            aria-label={`Visit live site for ${project.name}`}
                          >
                            <FiArrowUpRight size={13} />
                          </a>
                        ) : null}
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor-block
                          title="View repository"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/40 hover:bg-white hover:text-black"
                          aria-label={`View repository for ${project.name}`}
                        >
                          <FiGithub size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Middle: Unified Fixed-Height Summary Slot */}
                    <div className="h-10 sm:h-11 flex items-center pl-7 sm:pl-8">
                      {project.summary ? (
                        <p className="text-xs sm:text-sm leading-relaxed text-white/65 line-clamp-2 font-sans">
                          {project.summary}
                        </p>
                      ) : (
                        <p className="text-xs text-white/30 italic font-sans">
                          Repository maintained on GitHub.
                        </p>
                      )}
                    </div>

                    {/* Bottom: Unified Fixed-Height Metadata + Stack Tags */}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pl-7 sm:pl-8 pt-1 font-mono text-[11px] uppercase tracking-wider text-white/45 min-h-[28px]">
                      <div className="flex flex-wrap items-center gap-2">
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

                      {/* Badges / Topics */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {project.isFork ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/40">
                            Fork
                          </span>
                        ) : null}
                        {project.isArchived ? (
                          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-amber-300">
                            Archived
                          </span>
                        ) : null}
                        {project.stack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/45"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
            {data.projects.length % 2 !== 0 ? (
              <div className="hidden lg:block border-b border-white/[0.08]" aria-hidden="true" />
            ) : null}
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

