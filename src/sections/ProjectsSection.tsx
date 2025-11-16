import { FiArrowUpRight } from "react-icons/fi";
import { projects } from "@/data/content";
import { Reveal } from "@/components/Reveal";

export function ProjectsSection() {
  return (
    <section id="projects" className="space-y-10">
      <Reveal as="section" className="space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Projects</p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">Selected builds & research.</h2>
        <p className="max-w-3xl text-white/70">
          A few multi-modal launches that blend motion systems, story, and engineering rigor.
        </p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Reveal key={project.title}>
            <article className="rounded-3xl border border-white/10 bg-black p-6 shadow-[0_0_45px_rgba(0,0,0,0.85)] transition hover:border-white/40">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-white/50">Case Study</p>
                  <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs uppercase text-white/50">
                  {project.stack.map((stackItem) => (
                    <span key={stackItem} className="rounded-full border border-white/5 bg-white/5 px-3 py-1">
                      {stackItem}
                    </span>
                  ))}
                </div>
              </header>
              <p className="mt-4 text-white/70">{project.description}</p>
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
