"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type SculptureViewportGateProps = {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
};

export function SculptureViewportGate({
  children,
  className,
  rootMargin = "200px",
}: SculptureViewportGateProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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
