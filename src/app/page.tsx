import BackToTopButton from "@/components/BackToTopButton";
import { ClientContactSculpture } from "@/components/ContactSculpture";
import { ClientExpertiseSculpture } from "@/components/ExpertiseSculpture";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { cvConfig } from "@/config/cv";
import { siteConfig } from "@/config/site";
import { hero } from "@/data/content";
import ContactSection from "@/sections/ContactSection";
import ExpertiseSection from "@/sections/ExpertiseSection";
import GitHubActivitySection from "@/sections/GitHubActivitySection";
import GitHubHighlightsSection from "@/sections/GitHubHighlightsSection";
import HeroSection from "@/sections/HeroSection";
import ProjectsSection from "@/sections/ProjectsSection";

export const revalidate = 3600;

const currentYear = new Date().getFullYear();

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
        <div className="flex min-h-[100dvh] flex-col gap-1 pt-8 sm:gap-2 sm:pt-10 lg:gap-3 lg:pt-12">
          <SiteHeader
            name={hero.name}
            role={hero.role}
            cvPageUrl={cvConfig.pageUrl}
            githubUrl={siteConfig.socialLinks.find((link) => link.label === "GitHub")?.href ?? "https://github.com"}
          />
          <div className="flex min-h-0 flex-1 items-start justify-center py-6 sm:items-center sm:py-0 lg:-translate-y-9">
            <HeroSection />
          </div>
        </div>
      </div>

      <main className="mt-8 w-full sm:mt-10 lg:mt-12">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-0 z-0">
            <ClientExpertiseSculpture />
          </div>
          <div className="relative z-10 flex flex-col space-y-4 sm:space-y-6 lg:space-y-8">
            <ExpertiseSection />
            <GitHubHighlightsSection />
          </div>
        </div>

        <div className="mt-12 sm:mt-14 lg:mt-16">
          <GitHubActivitySection />
        </div>

        <div className="mt-12 sm:mt-14 lg:mt-16">
          <ProjectsSection />
        </div>

        <div className="relative mt-12 w-full sm:mt-14 lg:mt-16">
          <div className="pointer-events-none absolute inset-0 z-0">
            <ClientContactSculpture />
          </div>
          <div className="relative z-10 flex flex-col space-y-4 rounded-3xl border border-white/[0.12] bg-black/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_-1px_0_0_rgba(255,255,255,0.05),0_0_30px_rgba(0,0,0,0.4)] backdrop-blur-[3px] sm:space-y-6 lg:space-y-8">
            <ContactSection />
            <Reveal>
              <footer className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-12 py-6 pb-16 text-center text-sm text-white/80 sm:pb-20">
                <p className="font-semibold tracking-[0.3em] text-white/60">Closure</p>
                <p
                  className="mx-auto mt-2 font-poetic text-2xl leading-snug text-white sm:mt-3 sm:text-[29px]"
                  style={{
                    textShadow:
                      "0 0 10px rgba(95,225,255,0.55), 0 0 18px rgba(95,225,255,0.3), 0 0 32px rgba(95,225,255,0.12)",
                  }}
                >
                  Coding is like writing poetry for computers - carefully crafting lines to bring functionality to life.
                </p>
                <p
                  className="mt-3 text-xs text-white/60"
                  style={{
                    textShadow: "0 0 6px rgba(95,225,255,0.45), 0 0 14px rgba(95,225,255,0.15)",
                  }}
                >
                  &copy; {currentYear} {hero.name}
                </p>
              </footer>
            </Reveal>
          </div>
        </div>
      </main>
      <BackToTopButton />
    </div>
  );
}
