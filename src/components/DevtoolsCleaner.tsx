"use client";

import { useEffect } from "react";

const selectors = ["#devtools-indicator", "[data-nextjs-toast]"];

export function DevtoolsCleaner() {
  useEffect(() => {
    const removeBadge = () => {
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((node) => {
          node.remove();
        });
      });
    };

    removeBadge();
    const observer = new MutationObserver(removeBadge);
    observer.observe(document.body, { childList: true, subtree: true });

    const interval = window.setInterval(removeBadge, 1000);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return null;
}

export default DevtoolsCleaner;
