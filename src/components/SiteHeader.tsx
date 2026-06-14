"use client";

import { useCallback, useState } from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import useRafScroll from "@/hooks/useRafScroll";

const HEADER_SCROLL_Y_THRESHOLD = 24;

type SiteHeaderProps = {
  name: string;
  role: string;
  resumeUrl: string;
  githubUrl: string;
};

export function SiteHeader({ name, role, resumeUrl, githubUrl }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback((scrollY: number) => {
    const nextScrolled = scrollY > HEADER_SCROLL_Y_THRESHOLD;
    setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
  }, []);

  useRafScroll(handleScroll);

  return (
    <header
      className={`relative rounded-2xl border border-white/10 bg-black/85 p-5 shadow-[0_0_30px_rgba(0,0,0,0.6)] transition-all duration-300 ${scrolled ? "backdrop-blur supports-[backdrop-filter]:bg-black/65 sticky top-4 z-30" : ""
        }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.5em] text-white/45">
            Portfolio
          </p>
          <p className="mt-1 text-sm sm:text-lg font-semibold text-white">
            {name} — <span className="hidden sm:inline">{role}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor-block
            className="flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center sm:px-4 sm:py-2 rounded-full border border-white/10 text-white transition hover:border-white/40 hover:shadow-[0_0_28px_rgba(95,225,255,0.45)] text-sm font-medium"
            aria-label="GitHub Profile"
          >
            <FiGithub className="sm:mr-2 text-[15px]" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor-block
            className="group inline-flex items-center justify-center rounded-full border border-white bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs uppercase tracking-widest font-bold text-black transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]"
          >
            <span className="hidden sm:inline">Download CV</span>
            <span className="sm:hidden">CV</span>
            <FiArrowUpRight className="ml-1.5 text-black transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
