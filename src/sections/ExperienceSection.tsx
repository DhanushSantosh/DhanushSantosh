import { experience } from "@/data/content";
import { Reveal } from "@/components/Reveal";

export function ExperienceSection() {
  return (
    <section id="experience" className="space-y-10 cv-auto">
      <Reveal as="section">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Experience</p>
        <h2 className="mt-4 text-balance text-3xl font-semibold text-white md:text-4xl">
          Leadership across AI product squads and creative studios.
        </h2>
      </Reveal>
      <div className="space-y-8">
        {experience.map((item) => (
          <Reveal key={item.company}>
            <article className="rounded-3xl border border-white/10 bg-black p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] sm:p-8">
              <div className="flex flex-col gap-3 border-b border-white/5 pb-5 md:flex-row md:items-center md:justify-between md:gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-white/50">{item.period}</p>
                  <h3 className="text-2xl font-semibold text-white">
                    {item.role} · {item.company}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-white/65 sm:text-base">{item.summary}</p>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                {item.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black px-4 py-3"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white" />
                    <p className="leading-relaxed">{highlight}</p>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default ExperienceSection;
