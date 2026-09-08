import Image from "next/image";
import type { CSSProperties } from "react";
import {
  SiAnthropic,
  SiFramer,
  SiHuggingface,
  SiMeta,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

import { Reveal } from "@/components/Reveal";
import { hero, techStack } from "@/data/content";

// The OpenAI mark, used for the "Codex" tile since Codex has no distinct Simple Icons brand of
// its own. Hand-rolled because SiOpenai is no longer exported by react-icons/si. Path data is
// copied verbatim from Simple Icons' current official asset
// (cdn.jsdelivr.net/npm/simple-icons/icons/openai.svg) — do not hand-edit; the previous version
// of this path was a stale/approximate rendition that rendered visibly distorted (an uneven,
// broken-looking interlock) compared to the real logo.
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
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
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
  Codex: OpenAiIcon,
  Claude: SiAnthropic,
  Llama: SiMeta,
  Gemini: "/icons/gemini.png",
  Cursor: "/icons/cursor.png",
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
  Codex: "#ffffff",
  Claude: "#D97757",
  Llama: "#0490EA",
  Gemini: "#8E75B2",
  Cursor: "#ffffff",
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
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-16 px-4 sm:px-8 lg:px-12 py-12 md:py-16">
        <Reveal as="section" className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Expertise</p>
          <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
            Full-stack systems with cinematic craft.
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
                    // A static label, not a button: this used to be a
                    // clickable/"pressable" toggle with no effect beyond a
                    // decorative highlight — implying it did something
                    // meaningful (select this as evidence of expertise) when
                    // using a tool's logo isn't evidence of anything by
                    // itself. Hover still drives the 3D highlight purely as
                    // a visual flourish; nothing here claims to prove
                    // expertise the way a real link to a case study would.
                    <div
                      key={tech}
                      data-tech-item={tech}
                      className="group tech-item flex flex-col items-center gap-3"
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
                    </div>
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
                    // A static label, not a button: this used to be a
                    // clickable/"pressable" toggle with no effect beyond a
                    // decorative highlight — implying it did something
                    // meaningful (select this as evidence of expertise) when
                    // using a tool's logo isn't evidence of anything by
                    // itself. Hover still drives the 3D highlight purely as
                    // a visual flourish; nothing here claims to prove
                    // expertise the way a real link to a case study would.
                    <div
                      key={tech}
                      data-tech-item={tech}
                      className="group tech-item flex flex-col items-center gap-3"
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
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default ExpertiseSection;
