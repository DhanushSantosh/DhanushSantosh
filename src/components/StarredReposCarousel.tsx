"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { GitHubStarredRepo } from "@/lib/github";

type StarredReposCarouselProps = {
  repos: GitHubStarredRepo[];
};

export default function StarredReposCarousel({ repos }: StarredReposCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  }, []);

  useEffect(() => {
    checkScroll();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        currentRef.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll, repos]);

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  }, []);

  if (repos.length === 0) {
    return <p className="text-sm text-white/55">Starred repositories will appear here once GitHub data is reachable.</p>;
  }

  return (
    <div className="relative group/carousel w-full">
      {canScrollLeft && (
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-[0_0_15px_rgba(0,0,0,0.8)] transition hover:bg-white hover:text-black opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll Left"
        >
          <FiChevronLeft size={16} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {repos.map((repo) => (
          <a
            key={repo.nameWithOwner}
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 w-[280px] snap-start rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white/75 transition hover:border-white/25 hover:bg-white/8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">{repo.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40 truncate">
                    {repo.nameWithOwner}
                  </p>
                </div>
                {repo.languageName ? (
                  <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/55">
                    {repo.languageName}
                  </span>
                ) : null}
              </div>
              {repo.description ? (
                <p className="mt-3 text-xs leading-relaxed text-white/60 line-clamp-2">{repo.description}</p>
              ) : null}
            </div>
          </a>
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-[0_0_15px_rgba(0,0,0,0.8)] transition hover:bg-white hover:text-black opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll Right"
        >
          <FiChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
