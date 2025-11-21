import { hero } from "@/data/content";
import { SiteHeader } from "@/components/SiteHeader";
import BackToTopButton from "@/components/BackToTopButton";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/config/site";
import HeroSection from "@/sections/HeroSection";
import StatsSection from "@/sections/StatsSection";
import ExpertiseSection from "@/sections/ExpertiseSection";
import ExperienceSection from "@/sections/ExperienceSection";
import ProjectsSection from "@/sections/ProjectsSection";
import ContactSection from "@/sections/ContactSection";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-8 sm:gap-16 sm:px-8 sm:pb-20 sm:pt-12 lg:px-12">
        <SiteHeader navLinks={siteConfig.navLinks} name={hero.name} role={hero.role} />

        <main className="space-y-16 sm:space-y-20 lg:space-y-24">
          <HeroSection />
          <ExpertiseSection />
          <StatsSection />
          <ExperienceSection />
          <ProjectsSection />
          <ContactSection />
        </main>

        <Reveal>
          <footer className="px-4 py-6 text-center text-sm text-white/80 sm:px-6">
            <p className="font-semibold tracking-[0.3em] text-white/60">Closure</p>
            <p
              className="mx-auto mt-2 font-poetic text-2xl leading-snug text-white sm:mt-3 sm:text-[29px]"
              style={{
                textShadow:
                  "0 0 10px rgba(95,225,255,0.55), 0 0 18px rgba(95,225,255,0.3), 0 0 32px rgba(95,225,255,0.12)",
              }}
            >
              Coding is like writing poetry for computers – carefully crafting lines to bring functionality to life.
            </p>
            <p
              className="mt-3 text-xs text-white/60"
              style={{
                textShadow: "0 0 6px rgba(95,225,255,0.45), 0 0 14px rgba(95,225,255,0.15)",
              }}
            >
              © {new Date().getFullYear()} {hero.name}
            </p>
          </footer>
        </Reveal>
      </div>
      <BackToTopButton />
    </div>
  );
}
