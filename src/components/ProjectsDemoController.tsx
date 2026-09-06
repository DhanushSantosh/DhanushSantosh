"use client";

import { useCallback, useEffect, useState } from "react";
import { VideoModal } from "@/components/VideoModal";

const PROJECTS_SECTION_ID = "projects";
const PREVIEW_SELECTOR = "[data-project-preview], [data-project-demo]";
const EMPTY_URL = "";

type SelectedPreview = {
  url: string;
  projectName: string | null;
  repoUrl?: string;
  liveUrl?: string;
  previewKind: "video" | "site";
};

export function ProjectsDemoController() {
  const [selectedPreview, setSelectedPreview] = useState<SelectedPreview | null>(null);

  const handleClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Check if click was inside a direct external link (like "repo" or direct "visit")
    if (target.closest("a[href]") && !target.closest(PREVIEW_SELECTOR)) {
      return;
    }

    const trigger = target.closest(PREVIEW_SELECTOR) as HTMLElement | null;
    if (!trigger) return;

    const url = trigger.getAttribute("data-project-preview") || trigger.getAttribute("data-project-demo");
    if (!url) return;

    event.preventDefault();
    const projectName = trigger.getAttribute("data-project-name");
    const repoUrl = trigger.getAttribute("data-project-repo") || undefined;
    const liveUrl = trigger.getAttribute("data-project-live") || undefined;
    const previewKindAttr = trigger.getAttribute("data-preview-kind");
    const previewKind = (previewKindAttr === "video" || trigger.hasAttribute("data-project-demo")) ? "video" : "site";

    setSelectedPreview({
      url,
      projectName,
      repoUrl,
      liveUrl,
      previewKind,
    });
  }, []);

  useEffect(() => {
    const section = document.getElementById(PROJECTS_SECTION_ID);
    if (!section) return;

    section.addEventListener("click", handleClick);
    return () => section.removeEventListener("click", handleClick);
  }, [handleClick]);

  const handleClose = useCallback(() => setSelectedPreview(null), []);

  return (
    <VideoModal
      isOpen={Boolean(selectedPreview)}
      onClose={handleClose}
      previewUrl={selectedPreview?.url ?? EMPTY_URL}
      title={selectedPreview?.projectName ?? undefined}
      repoUrl={selectedPreview?.repoUrl}
      liveUrl={selectedPreview?.liveUrl}
      previewKind={selectedPreview?.previewKind}
    />
  );
}

