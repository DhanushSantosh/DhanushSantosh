import { stats } from "@/data/content";
import { Reveal } from "@/components/Reveal";

export function StatsSection() {
  return (
    <section id="stats" className="cv-auto relative overflow-hidden pb-12 bg-transparent">
      <div className="relative z-10 px-6 sm:px-12 md:px-16 w-full max-w-7xl mx-auto">
        <Reveal>
          <div className="grid w-full grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-black/80 backdrop-blur-sm p-5 shadow-[0_0_45px_rgba(0,0,0,0.8)] sm:grid-cols-3 sm:gap-6 sm:p-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/5 bg-black/60 px-5 py-4 text-left text-white sm:text-center transition-colors hover:bg-black/80 hover:border-white/20"
              >
                <p className="text-2xl font-semibold sm:text-3xl">{stat.value}</p>
                <p className="text-xs text-white/60 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default StatsSection;
