"use client";

import { useCallback, useEffect, useState } from "react";
import { VideoModal } from "@/components/VideoModal";

const PROJECTS_SECTION_ID = "projects";
const DEMO_DATA_ATTR = "data-project-demo";
const DEMO_SELECTOR = `[${DEMO_DATA_ATTR}]`;
const EMPTY_VIDEO_URL = "";

export function ProjectsDemoController() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handleClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const trigger = target.closest(DEMO_SELECTOR) as HTMLElement | null;
    if (!trigger) return;

    const videoUrl = trigger.getAttribute(DEMO_DATA_ATTR);
    if (!videoUrl) return;

    event.preventDefault();
    setSelectedVideo(videoUrl);
  }, []);

  useEffect(() => {
    const section = document.getElementById(PROJECTS_SECTION_ID);
    if (!section) return;

    section.addEventListener("click", handleClick);
    return () => section.removeEventListener("click", handleClick);
  }, [handleClick]);

  const handleClose = useCallback(() => setSelectedVideo(null), []);

  return (
    <VideoModal
      isOpen={Boolean(selectedVideo)}
      onClose={handleClose}
      videoUrl={selectedVideo ?? EMPTY_VIDEO_URL}
    />
  );
}

export default ProjectsDemoController;
