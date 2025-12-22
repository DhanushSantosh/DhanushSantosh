"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EXPERTISE_SECTION_ID = "expertise";
const TECH_ITEM_ATTR = "data-tech-item";
const TECH_ITEM_SELECTOR = `[${TECH_ITEM_ATTR}]`;
const ACTIVE_ATTR = "data-active";
const ACTIVE_TRUE = "true";
const ACTIVE_FALSE = "false";
const ARIA_PRESSED_ATTR = "aria-pressed";

export function ExpertiseSelectionController() {
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const syncActiveState = useCallback((nextActive: string | null) => {
    const section = sectionRef.current ?? document.getElementById(EXPERTISE_SECTION_ID);
    if (!section) return;
    sectionRef.current = section;

    const items = section.querySelectorAll<HTMLElement>(TECH_ITEM_SELECTOR);
    items.forEach((item) => {
      const tech = item.getAttribute(TECH_ITEM_ATTR);
      const isActive = Boolean(nextActive && tech && tech === nextActive);
      item.setAttribute(ACTIVE_ATTR, isActive ? ACTIVE_TRUE : ACTIVE_FALSE);
      item.setAttribute(ARIA_PRESSED_ATTR, isActive ? ACTIVE_TRUE : ACTIVE_FALSE);
    });
  }, []);

  const handleClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const trigger = target.closest(TECH_ITEM_SELECTOR) as HTMLElement | null;
    if (!trigger) return;

    const tech = trigger.getAttribute(TECH_ITEM_ATTR);
    if (!tech) return;

    setActiveTech((prev) => (prev === tech ? null : tech));
  }, []);

  useEffect(() => {
    const section = document.getElementById(EXPERTISE_SECTION_ID);
    if (!section) return;
    sectionRef.current = section;

    section.addEventListener("click", handleClick);
    return () => section.removeEventListener("click", handleClick);
  }, [handleClick]);

  useEffect(() => {
    syncActiveState(activeTech);
  }, [activeTech, syncActiveState]);

  return null;
}

export default ExpertiseSelectionController;
