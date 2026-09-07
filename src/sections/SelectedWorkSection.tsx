import Link from "next/link";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";

import { Reveal } from "@/components/Reveal";
import { caseStudies } from "@/data/projects";

const STATUS_STYLES: Record<string, string> = {
  active: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  paused: "border-amber-400/20 bg-amber-400/10 text-amber-300",
};

// Deliberately reads from the local, hand-authored caseStudies list only —
// not from getGitHubPortfolioData(). The rest of the Projects section
// further down is genuinely GitHub-driven and that's fine for a full
// catalog, but the two or three projects actually worth leading with
// shouldn't disappear or reorder themselves because a live API call was
// slow, rate-limited, or down. This section always renders the same
// content regardless of GitHub's availability.
function SelectedWorkSection() {
  return (
    <section id="work" className="cv-auto relative overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-10 px-4 sm:px-8 lg:px-12">
        <Reveal as="section" className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Selected work</p>
          <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl">
            A couple of things worth a closer look.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {caseStudies.map((study) => (
            <Reveal key={study.slug} className="h-full">
              <article className="flex h-full flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover-hover:hover:border-white/25 hover-hover:hover:bg-white/[0.05]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[study.status]}`}
                    >
                      {study.statusLabel}
                    </span>
                    {study.techStack.slice(0, 2).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{study.name}</h3>
                  <p className="text-sm leading-relaxed text-white/70">{study.tagline}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/projects/${study.slug}`}
                    data-cursor-block
                    className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-4 py-2 text-xs font-semibold text-black transition hover-hover:hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
                  >
                    Read case study
                    <FiArrowUpRight size={13} />
                  </Link>
                  <a
                    href={study.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor-block
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover-hover:hover:border-white/30 hover-hover:hover:bg-white/15"
                  >
                    <FiGithub size={13} />
                    Repo
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SelectedWorkSection;
