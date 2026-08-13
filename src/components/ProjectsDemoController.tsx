"use client";

import { useCallback, useEffect, useState } from "react";
import { VideoModal } from "@/components/VideoModal";

const PROJECTS_SECTION_ID = "projects";
const DEMO_DATA_ATTR = "data-project-demo";
const DEMO_NAME_ATTR = "data-project-name";
const DEMO_SELECTOR = `[${DEMO_DATA_ATTR}]`;
const EMPTY_VIDEO_URL = "";

type SelectedDemo = {
  videoUrl: string;
  projectName: string | null;
};

export function ProjectsDemoController() {
  const [selectedDemo, setSelectedDemo] = useState<SelectedDemo | null>(null);

  const handleClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const trigger = target.closest(DEMO_SELECTOR) as HTMLElement | null;
    if (!trigger) return;

    const videoUrl = trigger.getAttribute(DEMO_DATA_ATTR);
    if (!videoUrl) return;

    event.preventDefault();
    setSelectedDemo({ videoUrl, projectName: trigger.getAttribute(DEMO_NAME_ATTR) });
  }, []);

  useEffect(() => {
    const section = document.getElementById(PROJECTS_SECTION_ID);
    if (!section) return;

    section.addEventListener("click", handleClick);
    return () => section.removeEventListener("click", handleClick);
  }, [handleClick]);

  const handleClose = useCallback(() => setSelectedDemo(null), []);

  return (
    <VideoModal
      isOpen={Boolean(selectedDemo)}
      onClose={handleClose}
      videoUrl={selectedDemo?.videoUrl ?? EMPTY_VIDEO_URL}
      title={selectedDemo?.projectName ?? undefined}
    />
  );
}
