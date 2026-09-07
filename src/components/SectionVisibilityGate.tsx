"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type SectionVisibilityGateProps = {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
};

const DEFAULT_ROOT_MARGIN = "400px";
const DEFAULT_CLASS_NAME = "pointer-events-none absolute inset-0 z-0";

// Continuously mounts/unmounts children based on this element's own viewport
// intersection — unlike SculptureViewportGate's one-shot initial reveal, this
// re-mounts and re-unmounts every time the section scrolls in and out of
// view. A full-bleed background 3D scene has no natural stopping point
// otherwise (withDynamicModel's own gating is about *whether* to load it at
// all based on device/network, not about pausing an already-loaded scene);
// unmounting is what actually stops its R3F frame loop and releases its
// WebGL context while scrolled far away, instead of it running for the rest
// of the session regardless of whether anyone can see it.
export function SectionVisibilityGate({
  children,
  className = DEFAULT_CLASS_NAME,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: SectionVisibilityGateProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : null}
    </div>
  );
}
