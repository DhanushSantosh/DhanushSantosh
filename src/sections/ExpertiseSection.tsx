import { expertise, hero } from "@/data/content";
import { Reveal } from "@/components/Reveal";

export function ExpertiseSection() {
  return (
    <section id="expertise" className="space-y-10">
      <Reveal as="section" className="space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Expertise</p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          Systems thinking with cinematic craft.
        </h2>
        <p className="max-w-3xl text-white/70">{hero.tagline}</p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {expertise.map((item) => (
          <Reveal key={item.title} className="h-full">
            <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-black p-7 shadow-[0_0_35px_rgba(0,0,0,0.85)] transition hover:border-white/40">
              <div className="text-sm uppercase tracking-[0.4em] text-white/50">{item.title}</div>
              <p className="mt-4 flex-1 text-sm text-white/70">{item.description}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase text-white/50">
                {item.items.map((stackItem) => (
                  <span key={stackItem} className="rounded-full border border-white/5 bg-white/5 px-3 py-1">
                    {stackItem}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default ExpertiseSection;
