import Link from "next/link";
import type { Metadata } from "next";
import { FiArrowLeft } from "react-icons/fi";

import BackToTopButton from "@/components/BackToTopButton";
import PhotoFrame from "@/components/PhotoFrame";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/config/site";
import { hero } from "@/data/content";
import ExperienceSection from "@/sections/ExperienceSection";

export const metadata: Metadata = {
  title: "About Me",
  description: "Learn more about my background, skills, and journey as a creative developer.",
};

const aboutNavLinks = [
  { label: "Bio", href: "#bio" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Focus", href: "#focus" },
] as const;

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-8 sm:gap-16 sm:px-8 sm:pb-20 sm:pt-12 lg:px-12">
        <SiteHeader name={hero.name} role={hero.role} resumeUrl={hero.resume} githubUrl={siteConfig.socialLinks.find(link => link.label === "GitHub")?.href ?? "https://github.com"} />

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
            <section id="bio" className="space-y-6 cv-auto">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
                <div className="w-full max-w-xs shrink-0 lg:w-80 lg:max-w-sm">
                  <PhotoFrame imageUrl="/profile-photo.jpg" />
                </div>

                <div className="flex-1 space-y-6 lg:pl-8">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">About Me</h1>
                  <div className="prose prose-invert max-w-none text-lg text-white/80">
                    <p>
                      I&apos;m a developer who enjoys building thoughtful digital experiences where interface design,
                      engineering, and AI-aware product thinking work together. I care about software that feels clear,
                      polished, and genuinely useful from the first interaction.
                    </p>
                    <p className="mt-4">
                      This stage of my journey is about turning curiosity into strong professional practice. Alongside
                      building projects and sharpening my frontend craft, I started my internship at Payoda
                      Technologies on June 8, 2026, where I&apos;m learning how real teams collaborate, ship work, and
                      grow through responsibility.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="skills" className="space-y-6 cv-auto">
              <h2 className="text-2xl font-semibold tracking-wide text-white sm:text-3xl">Technical Arsenal</h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20">
                  <h3 className="text-xl font-medium text-white">Languages & Core</h3>
                  <ul className="list-inside list-disc space-y-2 text-white/70">
                    <li>TypeScript / JavaScript (ES6+)</li>
                    <li>Python</li>
                    <li>Problem solving and product thinking</li>
                    <li>Performance-aware frontend implementation</li>
                  </ul>
                </div>
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20">
                  <h3 className="text-xl font-medium text-white">Frameworks & Tools</h3>
                  <ul className="list-inside list-disc space-y-2 text-white/70">
                    <li>Next.js / React</li>
                    <li>Tailwind CSS / Framer Motion</li>
                    <li>Three.js / React Three Fiber</li>
                    <li>Node.js / Vercel</li>
                    <li>OpenAI / Claude / Gemini</li>
                  </ul>
                </div>
              </div>
            </section>
          </Reveal>

          <ExperienceSection />

          <Reveal>
            <section id="focus" className="space-y-6 cv-auto">
              <h2 className="text-2xl font-semibold tracking-wide text-white sm:text-3xl">Current Focus</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/75">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-white/50">Frontend Craft</h3>
                  <p className="mt-3 text-sm leading-relaxed">
                    Building interfaces that feel fast, clear, and visually intentional across desktop and mobile.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/75">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-white/50">AI Product Work</h3>
                  <p className="mt-3 text-sm leading-relaxed">
                    Learning how AI features, automation, and product usability come together in practical workflows.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/75">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-white/50">Career Growth</h3>
                  <p className="mt-3 text-sm leading-relaxed">
                    Growing through real collaboration, consistent practice, and the habits that turn learning into delivery.
                  </p>
                </div>
              </div>
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
