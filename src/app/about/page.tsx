import Link from "next/link";
import type { Metadata } from "next";
import { FiArrowLeft } from "react-icons/fi";

import BackToTopButton from "@/components/BackToTopButton";
import PhotoFrame from "@/components/PhotoFrame";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { hero } from "@/data/content";

export const metadata: Metadata = {
  title: "About Me",
  description: "Learn more about my background, skills, and journey as a creative developer.",
};

const aboutNavLinks = [
  { label: "Bio", href: "#bio" },
  { label: "Skills", href: "#skills" },
  { label: "Journey", href: "#journey" },
  { label: "Interests", href: "#interests" },
] as const;

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-8 sm:gap-16 sm:px-8 sm:pb-20 sm:pt-12 lg:px-12">
        <SiteHeader navLinks={aboutNavLinks} name={hero.name} role={hero.role} />

        <Link
          href="/"
          data-cursor-block
          className="-mb-8 -mt-8 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-[0_15px_30px_rgba(0,0,0,0.45)] transition hover:bg-white/20 xl:absolute xl:-left-8 xl:top-18 xl:mb-0 xl:mt-0"
          aria-label="Back to home"
        >
          <FiArrowLeft className="transition group-hover:-translate-x-0.5" />
        </Link>

        <main className="space-y-16 sm:space-y-20 lg:space-y-24">
          <Reveal>
            <section id="bio" className="space-y-6">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
                <div className="w-full max-w-xs shrink-0 lg:w-80 lg:max-w-sm">
                  <PhotoFrame imageUrl="/profile-photo.jpg" />
                </div>

                <div className="flex-1 space-y-6 lg:pl-8">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">About Me</h1>
                  <div className="prose prose-invert max-w-none text-lg text-white/80">
                    <p>
                      I&apos;m a creative developer with a passion for building immersive digital experiences. My journey
                      began with a curiosity about how things work on the web, which quickly evolved into a career
                      crafting high-performance applications and interactive interfaces.
                    </p>
                    <p className="mt-4">
                      I specialize in the intersection of design and engineering, ensuring that every pixel serves a
                      purpose and every interaction feels natural. Whether it&apos;s optimizing rendering performance or
                      designing a complex system architecture, I approach every challenge with a problem-solving
                      mindset.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="skills" className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-wide text-white sm:text-3xl">Technical Arsenal</h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20">
                  <h3 className="text-xl font-medium text-white">Languages & Core</h3>
                  <ul className="list-inside list-disc space-y-2 text-white/70">
                    <li>TypeScript / JavaScript (ES6+)</li>
                    <li>Python</li>
                    <li>HTML5 & CSS3 (Modern Features)</li>
                    <li>SQL / NoSQL</li>
                  </ul>
                </div>
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20">
                  <h3 className="text-xl font-medium text-white">Frameworks & Tools</h3>
                  <ul className="list-inside list-disc space-y-2 text-white/70">
                    <li>Next.js / React</li>
                    <li>Tailwind CSS</li>
                    <li>Node.js / Express</li>
                    <li>PostgreSQL / MongoDB</li>
                    <li>Docker / Kubernetes</li>
                  </ul>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="journey" className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-wide text-white sm:text-3xl">Journey</h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-black bg-white" />
                  <h3 className="text-xl font-medium text-white">Senior Frontend Engineer</h3>
                  <p className="text-sm text-white/50">2023 - Present</p>
                  <p className="mt-2 text-white/70">
                    Leading frontend architecture and design system implementation for enterprise-scale applications.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-black bg-white/50" />
                  <h3 className="text-xl font-medium text-white">Full Stack Developer</h3>
                  <p className="text-sm text-white/50">2021 - 2023</p>
                  <p className="mt-2 text-white/70">
                    Built and maintained full-stack web solutions, focusing on performance and user experience.
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="interests" className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-wide text-white sm:text-3xl">Beyond Code</h2>
              <p className="text-lg text-white/80">
                When I&apos;m not coding, you can find me exploring new technologies, contributing to open source, or
                enjoying the outdoors. I believe in a balanced life where creativity is fueled by diverse experiences.
              </p>
            </section>
          </Reveal>
        </main>

        <Reveal>
          <footer className="px-4 py-6 text-center text-sm text-white/80 sm:px-6">
            <p className="mt-3 text-xs text-white/60">© {new Date().getFullYear()} {hero.name}</p>
          </footer>
        </Reveal>
      </div>
      <BackToTopButton />
    </div>
  );
}
