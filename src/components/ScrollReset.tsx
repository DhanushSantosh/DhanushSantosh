"use client";

import { useEffect } from "react";

function ScrollReset() {
  useEffect(() => {
    // Forcing "manual" scrollRestoration and always jumping to top broke two
    // real navigation paths: landing on a URL with a hash fragment (e.g.
    // /about#experience) no longer scrolled to that section, and the browser
    // Back button no longer restored scroll position, both because this ran
    // unconditionally on every mount regardless of how the page was reached.
    //
    // Leave scrollRestoration on the browser's own default ("auto") so
    // back/forward navigation keeps working natively, and only step in for
    // the one case this component actually exists for: a fresh, non-back/
    // forward load with no hash, where the browser might otherwise retain a
    // stale scroll offset from a previous page.
    if (window.location.hash) return;

    const [navigationEntry] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navigationEntry?.type === "back_forward") return;

    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return null;
}

export default ScrollReset;
