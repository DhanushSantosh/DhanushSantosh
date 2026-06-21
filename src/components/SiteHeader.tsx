"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";

import useRafScroll from "@/hooks/useRafScroll";

const HEADER_SCROLL_Y_THRESHOLD = 24;

type SiteHeaderProps = {
  name: string;
  role: string;
  cvPageUrl: string;
  githubUrl: string;
};

export function SiteHeader({ name, role, cvPageUrl, githubUrl }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback((scrollY: number) => {
    const nextScrolled = scrollY > HEADER_SCROLL_Y_THRESHOLD;
    setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
  }, []);

  useRafScroll(handleScroll);

  return (
    <header
      className={`relative rounded-2xl border border-white/10 bg-black/85 p-5 shadow-[0_0_30px_rgba(0,0,0,0.6)] transition-all duration-300 ${
        scrolled ? "sticky top-4 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/65" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/45 sm:text-xs">Portfolio</p>
          <p className="mt-1 text-sm font-semibold text-white sm:text-lg">
            {name} - <span className="hidden sm:inline">{role}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor-block
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-sm font-medium text-white transition hover:border-white/40 hover:shadow-[0_0_28px_rgba(95,225,255,0.45)] sm:h-auto sm:w-auto sm:px-4 sm:py-2"
            aria-label="GitHub Profile"
          >
            <FiGithub className="text-[15px] sm:mr-2" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <Link
            href={cvPageUrl}
            data-cursor-block
            className="group inline-flex items-center justify-center rounded-full border border-white bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)] sm:px-5 sm:py-2.5 sm:text-xs"
          >
            <span className="hidden sm:inline">View CV</span>
            <span className="sm:hidden">CV</span>
            <FiArrowUpRight className="ml-1.5 text-black transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
