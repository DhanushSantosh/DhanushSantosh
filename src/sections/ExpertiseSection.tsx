import Image from "next/image";
import type { CSSProperties } from "react";
import {
  SiAnthropic,
  SiFramer,
  SiHuggingface,
  SiMeta,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenai,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

import { ExpertiseSelectionController } from "@/components/ExpertiseSelectionController";
import { Reveal } from "@/components/Reveal";
import { hero, techStack } from "@/data/content";

const iconMap: Record<string, React.ElementType | string> = {
  "Next.js": SiNextdotjs,
  React: SiReact,
  TypeScript: SiTypescript,
  "Tailwind CSS": SiTailwindcss,
  "Framer Motion": SiFramer,
  "Three.js": SiThreedotjs,
  "Node.js": SiNodedotjs,
  Vercel: SiVercel,
  OpenAI: SiOpenai,
  Claude: SiAnthropic,
  Llama: SiMeta,
  Gemini: "/icons/gemini.png",
  Cursor: "/icons/cursor.png",
  Python: SiPython,
  "Hugging Face": SiHuggingface,
};

const colorMap: Record<string, string> = {
  "Next.js": "#ffffff",
  React: "#61DAFB",
  TypeScript: "#3178C6",
  "Tailwind CSS": "#06B6D4",
  "Framer Motion": "#ffffff",
  "Three.js": "#ffffff",
  "Node.js": "#339933",
  Vercel: "#ffffff",
  OpenAI: "#ffffff",
  Claude: "#D97757",
  Llama: "#0490EA",
  Gemini: "#8E75B2",
  Cursor: "#ffffff",
  Python: "#3776AB",
  "Hugging Face": "#FFD21E",
};

const hoverColorMap: Record<string, string> = {
  ...colorMap,
  "Next.js": "#ffffff",
};

const SECONDARY_REVEAL_DELAY_S = 0.1;

async function ExpertiseSection() {
  return (
    <section id="expertise" className="cv-auto relative overflow-hidden bg-transparent">
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-8 lg:px-12 py-12 md:py-16">
        <Reveal as="section" className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Expertise</p>
          <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
            AI-native systems with cinematic craft.
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">{hero.tagline}</p>
        </Reveal>

        <div className="grid w-full gap-12 md:grid-cols-2 md:gap-16">
          <Reveal className="h-full">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-blue-500/50" />
                <h3 className="text-lg font-medium uppercase tracking-widest text-white/80">Full Stack</h3>
              </div>

              <div className="grid grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-12">
                {techStack.fullStack.map((tech) => {
                  const Icon = iconMap[tech];
                  const hoverColor = hoverColorMap[tech] || "#ffffff";

                  return (
                    <button
                      key={tech}
                      type="button"
                      data-tech-item={tech}
                      data-active="false"
                      aria-pressed="false"
                      className="group tech-item flex cursor-pointer flex-col items-center gap-3"
                      style={{ "--hover-color": hoverColor } as CSSProperties}
                    >
                      <div className="tech-icon-wrap relative flex items-center justify-center transition-transform duration-300 hover-hover:group-hover:-translate-y-1">
                        {typeof Icon === "string" ? (
                          <div className="relative h-10 w-10">
                            <Image
                              src={Icon}
                              alt={tech}
                              fill
                              sizes="40px"
                              className="tech-image object-contain opacity-100 grayscale brightness-150 transition-all duration-300 hover-hover:group-hover:grayscale-0 hover-hover:group-hover:brightness-100 hover-hover:group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            />
                          </div>
                        ) : Icon ? (
                          <Icon className="tech-icon text-4xl text-white/70 transition-all duration-300 hover-hover:group-hover:text-(--hover-color) hover-hover:group-hover:drop-shadow-[0_0_10px_var(--hover-color)]" />
                        ) : null}
                      </div>
                      <span className="tech-label text-[10px] font-medium uppercase tracking-wider text-white/40 transition-colors duration-300 hover-hover:group-hover:text-white/70">
                        {tech}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal className="h-full" delay={SECONDARY_REVEAL_DELAY_S}>
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-blue-500/50" />
                <h3 className="text-lg font-medium uppercase tracking-widest text-white/80">AI Native</h3>
              </div>

              <div className="grid grid-cols-4 gap-x-8 gap-y-10 sm:gap-x-12">
                {techStack.ai.map((tech) => {
                  const Icon = iconMap[tech];
                  const hoverColor = hoverColorMap[tech] || "#ffffff";

                  return (
                    <button
                      key={tech}
                      type="button"
                      data-tech-item={tech}
                      data-active="false"
                      aria-pressed="false"
                      className="group tech-item flex cursor-pointer flex-col items-center gap-3"
                      style={{ "--hover-color": hoverColor } as CSSProperties}
                    >
                      <div className="tech-icon-wrap relative flex items-center justify-center transition-transform duration-300 hover-hover:group-hover:-translate-y-1">
                        {typeof Icon === "string" ? (
                          <div className="relative h-10 w-10">
                            <Image
                              src={Icon}
                              alt={tech}
                              fill
                              sizes="40px"
                              className="tech-image object-contain opacity-100 grayscale brightness-150 transition-all duration-300 hover-hover:group-hover:grayscale-0 hover-hover:group-hover:brightness-100 hover-hover:group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            />
                          </div>
                        ) : Icon ? (
                          <Icon className="tech-icon text-4xl text-white/70 transition-all duration-300 hover-hover:group-hover:text-(--hover-color) hover-hover:group-hover:drop-shadow-[0_0_10px_var(--hover-color)]" />
                        ) : null}
                      </div>
                      <span className="tech-label text-[10px] font-medium uppercase tracking-wider text-white/40 transition-colors duration-300 hover-hover:group-hover:text-white/70">
                        {tech}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <ExpertiseSelectionController />
    </section>
  );
}

export default ExpertiseSection;
