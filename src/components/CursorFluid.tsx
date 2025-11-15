"use client";

import { useEffect } from "react";

export function CursorFluid() {
  useEffect(() => {
    const root = document.documentElement;

    const handleMove = (event: PointerEvent) => {
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);
      root.style.setProperty("--cursor-visible", "1");

      const target = event.target as HTMLElement | null;
      const block = target?.closest("[data-cursor-block]") as HTMLElement | null;
      root.style.setProperty("--cursor-glow-factor", block ? "0" : "1");
    };

    const handleLeave = () => {
      root.style.setProperty("--cursor-visible", "0");
      root.style.setProperty("--cursor-glow-factor", "0");
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return null;
}

export default CursorFluid;
