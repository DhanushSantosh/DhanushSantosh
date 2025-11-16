import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { hero, stats } from "@/data/content";
import { Reveal } from "@/components/Reveal";
import { ClientSculpture } from "@/components/DynamicSculpture";
import HeroSentenceCycler from "@/components/HeroSentenceCycler";

export function HeroSection() {
  return (
    <section id="hero" className="flex flex-col gap-10">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        <Reveal className="w-full space-y-8 lg:flex-[0.65] lg:max-w-none">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">{hero.location}</p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
              <HeroSentenceCycler name={hero.name} />
            </h1>
            <p className="max-w-2xl text-lg text-white/70">{hero.summary}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#contact"
              data-cursor-block
              className="group inline-flex items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold text-black transition bg-white hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]"
            >
              Start a project
              <FiArrowUpRight className="ml-2 text-black transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href={hero.resume}
              target="_blank"
              rel="noreferrer"
              data-cursor-block
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:shadow-[0_0_28px_rgba(95,225,255,0.45)]"
            >
              Download CV
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.2} className="flex w-full justify-center lg:flex-[0.35] lg:justify-end">
          <div className="flex w-full max-w-[320px] justify-center lg:max-w-[360px]">
            <ClientSculpture />
          </div>
        </Reveal>
      </div>
      <Reveal>
        <div className="flex w-full flex-wrap gap-6 rounded-3xl border border-white/10 bg-black p-6 shadow-[0_0_45px_rgba(0,0,0,0.8)]">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default HeroSection;
