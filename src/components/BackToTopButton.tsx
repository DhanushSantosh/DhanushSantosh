"use client";

import { useCallback, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import useRafScroll from "@/hooks/useRafScroll";

const VISIBILITY_SCROLL_Y_THRESHOLD = 360;

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback((scrollY: number) => {
    const nextVisible = scrollY > VISIBILITY_SCROLL_Y_THRESHOLD;
    setVisible((prev) => (prev === nextVisible ? prev : nextVisible));
  }, []);

  useRafScroll(handleScroll);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      data-cursor-block
      aria-label="Back to top"
      className={`fixed bottom-10 right-8 z-30 rounded-full border border-white/10 bg-white/10 p-3 text-white shadow-[0_15px_30px_rgba(0,0,0,0.45)] transition opacity-0 translate-y-4 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 ${
        visible ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none"
      }`}
    >
      <FiArrowUp />
    </button>
  );
}

export default BackToTopButton;
