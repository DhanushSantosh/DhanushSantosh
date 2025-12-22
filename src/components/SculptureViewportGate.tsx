"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { scheduleIdleTask } from "@/hooks/scheduleIdleTask";

type SculptureViewportGateProps = {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
};

type NavigatorWithHints = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

const PREFETCH_IDLE_TIMEOUT_MS = 1200;
const PREFETCH_FALLBACK_TIMEOUT_MS = 200;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SLOW_CONNECTION_TYPES = new Set(["slow-2g", "2g"]);
let sculpturePrefetched = false;

export function SculptureViewportGate({
  children,
  className,
  rootMargin = "200px",
}: SculptureViewportGateProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (sculpturePrefetched) return;

    const nav = navigator as NavigatorWithHints;
    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const saveData = nav.connection?.saveData === true;
    const slowNet = SLOW_CONNECTION_TYPES.has(nav.connection?.effectiveType ?? "");

    if (prefersReducedMotion || saveData || slowNet) return;

    const cancelIdle = scheduleIdleTask(
      () => {
        if (sculpturePrefetched) return;
        sculpturePrefetched = true;
        import("@/components/OrbitalSculpture").catch(() => {
          // Prefetch is best-effort; ignore failures.
        });
      },
      { timeoutMs: PREFETCH_IDLE_TIMEOUT_MS, fallbackMs: PREFETCH_FALLBACK_TIMEOUT_MS },
    );

    return () => cancelIdle();
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        children
      ) : (
        <div className="mx-auto h-[300px] w-full max-w-[420px] animate-pulse rounded-[32px] border border-white/10 bg-black sm:h-[360px] lg:h-[420px]" />
      )}
    </div>
  );
}

export default SculptureViewportGate;
