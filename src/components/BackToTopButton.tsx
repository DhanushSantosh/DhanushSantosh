"use client";

import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 360);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      data-cursor-block
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-30 rounded-full border border-white/10 bg-white/10 p-3 text-white shadow-[0_15px_30px_rgba(0,0,0,0.45)] transition opacity-0 translate-y-4 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 ${
        visible ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none"
      }`}
    >
      <FiArrowUp />
    </button>
  );
}

export default BackToTopButton;
