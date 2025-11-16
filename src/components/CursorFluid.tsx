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

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        handleLeave();
      }
    };

    const handleWindowBlur = () => {
      handleLeave();
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  return null;
}

export default CursorFluid;
