"use client";

import { m, AnimatePresence } from "framer-motion";
import { FiArrowUpRight, FiExternalLink, FiGithub, FiX } from "react-icons/fi";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

// Deliberately excludes `iframe`: once focus enters a cross-origin iframe's
// own document, this page cannot observe or intercept its key events at
// all (same-origin policy) — there is no way to "trap" Tab from in there,
// only to stop Tab from landing on the iframe in the first place. Keeping
// it out of the modal's own tab order (and setting tabIndex={-1} directly
// on both <iframe> elements below, for anything that ever queries a wider
// selector) is what actually keeps this contained — the modal already
// offers "Visit site"/"Repo"/"Open in new tab"/"Frame blocked?" as the
// real way to reach that content's own interface.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function useMounted() {
  return useSyncExternalStore(emptySubscribe, getClientMounted, getServerMounted);
}

export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  previewUrl?: string;
  url?: string;
  title?: string;
  repoUrl?: string;
  liveUrl?: string;
  previewKind?: "video" | "site";
}

interface PreviewContentProps {
  isVideo: boolean;
  activeUrl: string;
  iframeTitle: string;
  effectiveLiveUrl?: string;
  repoUrl?: string;
}

function PreviewContent({
  isVideo,
  activeUrl,
  iframeTitle,
  effectiveLiveUrl,
  repoUrl,
}: PreviewContentProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (isVideo) {
    return (
      <div className="aspect-video h-full w-full bg-black">
        <iframe
          src={activeUrl}
          title={iframeTitle}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          tabIndex={-1}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-1 flex-col">
      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-neutral-950">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">
            Connecting live preview...
          </p>
        </div>
      )}

      {/* Fallback View when iframe embedding fails */}
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 rounded-full border border-white/10 bg-white/5 p-4 text-white/60">
            <FiExternalLink size={28} />
          </div>
          <h4 className="text-lg font-semibold text-white sm:text-xl">
            Preview unavailable in frame
          </h4>
          <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-white/60">
            This deployment prevents embedded framing (X-Frame-Options or frame-ancestors security policy). You can still explore the live site directly.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {effectiveLiveUrl && (
              <a
                href={effectiveLiveUrl}
                target="_blank"
                rel="noreferrer"
                data-cursor-block
                className="inline-flex items-center justify-center rounded-full border border-white bg-white px-5 py-2 text-xs font-semibold text-black transition hover:shadow-[0_0_25px_rgba(255,255,255,0.55)]"
              >
                Visit live site
                <FiArrowUpRight className="ml-1.5" />
              </a>
            )}
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                data-cursor-block
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium text-white transition hover:bg-white/15"
              >
                <FiGithub className="mr-1.5" />
                View repository
              </a>
            )}
          </div>
        </div>
      ) : (
        <iframe
          src={activeUrl}
          title={iframeTitle}
          className="h-full w-full flex-1 border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          tabIndex={-1}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}

      {/* Persistent Info / Fallback Footer for Live Sites */}
      {!hasError && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-black/90 px-4 py-2 text-[11px] text-white/50">
          <span className="font-mono">
            Embedded site preview
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasError(true)}
              className="text-white/40 transition hover:text-white hover:underline"
            >
              Frame blocked?
            </button>
            {effectiveLiveUrl && (
              <a
                href={effectiveLiveUrl}
                target="_blank"
                rel="noreferrer"
                data-cursor-block
                className="inline-flex items-center gap-1 font-medium text-cyan-300 transition hover:underline"
              >
                <span>Open in new tab</span>
                <FiArrowUpRight size={11} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  previewUrl,
  url,
  title,
  repoUrl,
  liveUrl,
  previewKind,
}: VideoModalProps) {
  const activeUrl = previewUrl ?? videoUrl ?? url ?? "";
  const isVideo = previewKind === "video" || (Boolean(videoUrl) && !previewUrl);
  const iframeTitle = title ? `${title} preview` : "Project preview";
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Escape to dismiss, Tab/Shift+Tab trapped within the dialog (per the WAI-ARIA
  // dialog pattern — role="dialog"/aria-modal alone don't provide any of this
  // behavior, they're just the accessibility-tree annotation for it).
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialogRef.current.contains(active)) {
        // Focus escaped the dialog entirely (e.g. iframe content stealing it) —
        // pull it back in rather than letting Tab continue into the background.
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Initial focus on open, and restore focus to whatever triggered the modal
  // (the project's "preview" button) once it closes — without this, focus is
  // simply abandoned and the next Tab press falls through to the background.
  useEffect(() => {
    if (!isOpen) {
      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const id = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [isOpen]);

  // Background inertness: everything else under document.body (this modal is
  // portaled there) stops being reachable by keyboard/AT while the dialog is
  // open, matching the dialog pattern's "rest of the page is inert" rule.
  useEffect(() => {
    if (!isOpen) return;

    const siblings = Array.from(document.body.children).filter(
      (el) => el !== dialogRef.current?.closest("[data-video-modal-root]"),
    );
    const restoreFns = siblings.map((el) => {
      const alreadyInert = el.hasAttribute("inert");
      if (!alreadyInert) el.setAttribute("inert", "");
      return () => {
        if (!alreadyInert) el.removeAttribute("inert");
      };
    });

    return () => {
      restoreFns.forEach((restore) => restore());
    };
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const isMounted = useMounted();
  const effectiveLiveUrl = liveUrl ?? (!isVideo ? activeUrl : undefined);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <m.div
          data-video-modal-root
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={iframeTitle}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
        >
          {/* Modal Container */}
          <m.div
            ref={dialogRef}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[88vh] max-h-[850px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-[0_0_80px_rgba(0,0,0,0.9)] sm:rounded-3xl"
          >
            {/* Header Toolbar */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/70 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <h3 className="truncate text-sm font-semibold text-white sm:text-base">
                  {title ?? "Project Preview"}
                </h3>
                <span className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-cyan-300">
                  {isVideo ? "Video Demo" : "Live Preview"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {effectiveLiveUrl ? (
                  <a
                    href={effectiveLiveUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor-block
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/30 hover:bg-white hover:text-black"
                  >
                    <span>Visit site</span>
                    <FiArrowUpRight size={13} />
                  </a>
                ) : null}

                {repoUrl ? (
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor-block
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/30 hover:bg-white/15"
                  >
                    <FiGithub size={13} />
                    <span className="hidden sm:inline">Repo</span>
                  </a>
                ) : null}

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close preview modal"
                  data-cursor-block
                  className="rounded-full bg-white/5 p-2 text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="relative flex flex-1 flex-col overflow-hidden bg-black">
              <PreviewContent
                key={activeUrl}
                isVideo={isVideo}
                activeUrl={activeUrl}
                iframeTitle={iframeTitle}
                effectiveLiveUrl={effectiveLiveUrl}
                repoUrl={repoUrl}
              />
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
