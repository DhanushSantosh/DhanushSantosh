import { stats } from "@/data/content";
import { Reveal } from "@/components/Reveal";

export function StatsSection() {
  return (
    <section id="stats">
      <Reveal>
        <div className="grid w-full grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-black/80 p-5 shadow-[0_0_45px_rgba(0,0,0,0.8)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/5 bg-black/60 px-5 py-4 text-left text-white sm:text-center"
            >
              <p className="text-2xl font-semibold sm:text-3xl">{stat.value}</p>
              <p className="text-xs text-white/60 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default StatsSection;
