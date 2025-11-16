import { FiArrowUpRight } from "react-icons/fi";
import { projects } from "@/data/content";
import { Reveal } from "@/components/Reveal";

export function ProjectsSection() {
  return (
    <section id="projects" className="space-y-10">
      <Reveal as="section" className="space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Projects</p>
        <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl">
          AI-native builds & research.
        </h2>
        <p className="max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          A few launches that blend retrieval, automation, and cinematic UX with measurable outcomes.
        </p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Reveal key={project.title}>
            <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-black p-5 shadow-[0_0_45px_rgba(0,0,0,0.85)] transition hover:border-white/40 sm:p-6">
              <header className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-balance">
                  <p className="text-sm uppercase tracking-[0.4em] text-white/50">Case Study</p>
                  <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-white/50 sm:justify-end">
                  {project.stack.map((stackItem) => (
                    <span key={stackItem} className="rounded-full border border-white/5 bg-white/5 px-3 py-1">
                      {stackItem}
                    </span>
                  ))}
                </div>
              </header>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70 sm:text-base">{project.description}</p>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                data-cursor-block
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-white/70"
              >
                Visit project
                <FiArrowUpRight className="ml-2" />
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
