"use client";

import { useEffect } from "react";

export function ScrollReset() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return null;
}

export default ScrollReset;
