import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { hero } from "@/data/content";
import { Reveal } from "@/components/Reveal";
import { ClientSculpture } from "@/components/DynamicSculpture";
import HeroSentenceCycler from "@/components/HeroSentenceCycler";
import SculptureViewportGate from "@/components/SculptureViewportGate";

export function HeroSection() {
  return (
    <section id="hero" className="flex h-full w-full flex-col justify-center gap-8 sm:gap-10">
      <div className="flex flex-col gap-8 sm:gap-12 lg:flex-row lg:items-start lg:gap-16">
        <Reveal className="w-full space-y-8 lg:flex-[0.65] lg:max-w-none">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50 sm:text-sm">{hero.location}</p>
            <h1 className="text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <HeroSentenceCycler name={hero.name} />
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{hero.summary}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/about"
              data-cursor-block
              className="group inline-flex w-full items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)] sm:w-auto"
            >
              About Me
              <FiArrowUpRight className="ml-2 text-black transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href={hero.resume}
              target="_blank"
              rel="noreferrer"
              data-cursor-block
              className="inline-flex w-full items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:shadow-[0_0_28px_rgba(95,225,255,0.45)] sm:w-auto"
            >
              Download CV
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.2} className="flex w-full justify-center lg:flex-[0.35] lg:justify-end">
          <SculptureViewportGate className="flex w-full max-w-[240px] justify-center sm:max-w-[320px] lg:max-w-[360px]">
            <ClientSculpture />
          </SculptureViewportGate>
        </Reveal>
      </div>
    </section>
  );
}

export default HeroSection;
