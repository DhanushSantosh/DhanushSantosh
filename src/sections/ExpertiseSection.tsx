import { techStack, hero } from "@/data/content";
import { Reveal } from "@/components/Reveal";
import { ExpertiseSelectionController } from "@/components/ExpertiseSelectionController";
import Image from "next/image";
import type { CSSProperties } from "react";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiDocker,
  SiOpenai,
  SiAnthropic,
  SiMeta,
  SiHuggingface,
  SiSupabase,
} from "react-icons/si";

const iconMap: Record<string, React.ElementType | string> = {
  "Next.js": SiNextdotjs,
  React: SiReact,
  TypeScript: SiTypescript,
  TailwindCSS: SiTailwindcss,
  "Node.js": SiNodedotjs,
  Docker: SiDocker,
  Supabase: SiSupabase,
  "GPT-5": SiOpenai,
  "Claude 3.5": SiAnthropic,
  "Llama 3": SiMeta,
  "Gemini Pro": "/icons/gemini.png", // User provided image
  Cursor: "/icons/cursor.png", // User provided image
  "Hugging Face": SiHuggingface,
};

const colorMap: Record<string, string> = {
  "Next.js": "#ffffff", // White (Next.js brand)
  React: "#61DAFB", // Cyan
  TypeScript: "#3178C6", // Blue
  TailwindCSS: "#06B6D4", // Cyan
  "Node.js": "#339933", // Green
  Docker: "#2496ED", // Blue
  Supabase: "#3ECF8E", // Supabase Green
  "GPT-5": "#ffffff", // White (User preference)
  "Claude 3.5": "#D97757", // Anthropic Clay
  "Llama 3": "#0490EA", // Meta Blue
  "Gemini Pro": "#8E75B2", // Image handles color; keep a fallback for active states
  Cursor: "", // Image handles color
  "Hugging Face": "#FFD21E", // Hugging Face Yellow
};

const hoverColorMap: Record<string, string> = {
  ...colorMap,
  "Next.js": "#ffffff",
};

const SECONDARY_REVEAL_DELAY_S = 0.1;

export function ExpertiseSection() {
  return (
    <section id="expertise" className="space-y-16 cv-auto">
      {/* Hidden SVG for Gemini Gradient Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4E88D4" />
            <stop offset="100%" stopColor="#8E75B2" />
          </linearGradient>
        </defs>
      </svg>

      <Reveal as="section" className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">
          Expertise
        </p>
        <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
          AI-native systems with cinematic craft.
        </h2>
        <p className="max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          {hero.tagline}
        </p>
      </Reveal>

      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        {/* Full Stack Column */}
        <Reveal className="h-full">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-blue-500/50" />
              <h3 className="text-lg font-medium uppercase tracking-widest text-white/80">
                Full Stack
              </h3>
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
                            className="tech-image object-contain transition-all duration-300 opacity-50 grayscale hover-hover:group-hover:opacity-100 hover-hover:group-hover:grayscale-0 hover-hover:group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                          />
                        </div>
                      ) : Icon ? (
                        <Icon className="tech-icon text-4xl transition-all duration-300 text-white/40 hover-hover:group-hover:text-(--hover-color) hover-hover:group-hover:drop-shadow-[0_0_10px_var(--hover-color)]" />
                      ) : null}
                    </div>
                    <span className="tech-label text-[10px] font-medium uppercase tracking-wider transition-colors duration-300 text-white/20 hover-hover:group-hover:text-white/60">
                      {tech}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* AI Column */}
        <Reveal className="h-full" delay={SECONDARY_REVEAL_DELAY_S}>
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-blue-500/50" />
              <h3 className="text-lg font-medium uppercase tracking-widest text-white/80">
                AI Native
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-x-8 gap-y-10 sm:gap-x-12">
              {techStack.ai.map((tech) => {
                const Icon = iconMap[tech];
                const hoverColor = hoverColorMap[tech] || "#ffffff";
                const isGemini = tech === "Gemini Pro";

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
                            className="tech-image object-contain transition-all duration-300 opacity-50 grayscale hover-hover:group-hover:opacity-100 hover-hover:group-hover:grayscale-0 hover-hover:group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                          />
                        </div>
                      ) : Icon ? (
                        isGemini ? (
                          <Icon
                            className="tech-icon text-4xl transition-all duration-300 opacity-50 grayscale hover-hover:group-hover:opacity-100 hover-hover:group-hover:grayscale-0 hover-hover:group-hover:drop-shadow-[0_0_15px_rgba(142,117,178,0.5)]"
                            style={{ fill: "url(#gemini-gradient)" }}
                          />
                        ) : (
                          <Icon className="tech-icon text-4xl transition-all duration-300 text-white/40 hover-hover:group-hover:text-(--hover-color) hover-hover:group-hover:drop-shadow-[0_0_10px_var(--hover-color)]" />
                        )
                      ) : null}
                    </div>
                    <span className="tech-label text-[10px] font-medium uppercase tracking-wider transition-colors duration-300 text-white/20 hover-hover:group-hover:text-white/60">
                      {tech}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
      <ExpertiseSelectionController />
    </section>
  );
}

export default ExpertiseSection;
