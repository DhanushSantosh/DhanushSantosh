import Image from "next/image";
import type { CSSProperties } from "react";
import {
  SiAnthropic,
  SiFramer,
  SiHuggingface,
  SiMeta,
  SiNextdotjs,
  SiNodedotjs,
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

const OpenAiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    role="img"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9013 6.0651 6.0651 0 0 0-4.9692-2.3168 6.0072 6.0072 0 0 0-5.717 4.1485 6.0197 6.0197 0 0 0-4.0044 2.9065 6.0483 6.0483 0 0 0 .8082 7.1006 5.98 5.98 0 0 0 .5156 4.9108 6.0483 6.0483 0 0 0 6.514 2.9014 6.066 6.066 0 0 0 4.9649 2.3167 6.0072 6.0072 0 0 0 5.717-4.1485 6.0232 6.0232 0 0 0 4.0044-2.9065 6.0442 6.0442 0 0 0-.8081-7.1006zm-8.8143 11.8906a4.5187 4.5187 0 0 1-2.9566-1.1042l.1423-.082 4.913-2.8365a.747.747 0 0 0 .3735-.6471V10.155l1.9806 1.1437a.7329.7329 0 0 1 .3735.6174V17.29a4.53 4.53 0 0 1-4.8263 4.4217zM4.697 18.3377a4.5187 4.5187 0 0 1-.5199-3.1171l.1424.0857 4.913 2.8365a.747.747 0 0 0 .747 0l5.9622-3.4429V17.001a.747.747 0 0 1-.3735.6471L9.67 21.05a4.5262 4.5262 0 0 1-4.973-2.7123zM3.4447 9.872a4.5187 4.5187 0 0 1 2.4367-2.0129v5.845a.747.747 0 0 0 .3735.6471l5.9622 3.4429-1.9806 1.1437a.7388.7388 0 0 1-.747 0L3.6 15.4057A4.5323 4.5323 0 0 1 3.4447 9.872zm15.8247 2.1245l-5.9622-3.4429 1.9806-1.1437a.7388.7388 0 0 1 .747 0l5.889 3.3976a4.5344 4.5344 0 0 1-.1613 8.1793v-5.845a.747.747 0 0 0-.3735-.6471zm1.2835-3.6587l-.1424-.0857-4.913-2.8365a.747.747 0 0 0-.747 0L8.7879 8.8585V6.999a.747.747 0 0 1 .3735-.6471l5.889-3.4019a4.5283 4.5283 0 0 1 5.4925 5.8298zm-12.8715-3.324a4.5187 4.5187 0 0 1 2.9566 1.1042l-.1423.082-4.913 2.8365a.747.747 0 0 0-.3735.6471V13.845L3.228 12.7013a.7329.7329 0 0 1-.3735-.6174V6.71a4.53 4.53 0 0 1 4.8263-4.4217zM9.54 13.563l2.46-1.42 2.46 1.42v2.84l-2.46 1.42-2.46-1.42z" />
  </svg>
);

const iconMap: Record<string, React.ElementType | string> = {
  "Next.js": SiNextdotjs,
  React: SiReact,
  TypeScript: SiTypescript,
  "Tailwind CSS": SiTailwindcss,
  "Framer Motion": SiFramer,
  "Three.js": SiThreedotjs,
  "Node.js": SiNodedotjs,
  Vercel: SiVercel,
  OpenAI: OpenAiIcon,
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
