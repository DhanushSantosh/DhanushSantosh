"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import usePerformanceAudit from "@/hooks/usePerformanceAudit";
import { scheduleIdleTask } from "@/hooks/scheduleIdleTask";

export type RenderMode = "idle" | "static" | "lite" | "full";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

type QualityProps = {
  quality?: "full" | "lite";
};

const MODE_IDLE_TIMEOUT_MS = 900;
const MODE_FALLBACK_TIMEOUT_MS = 120;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function pickRenderMode(): RenderMode {
  if (typeof window === "undefined") return "idle";

  const nav = navigator as NavigatorWithHints;
  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const saveData = nav.connection?.saveData === true;
  const slowNet = ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? "");
  const lowPower = prefersReducedMotion || saveData || slowNet;

  if (lowPower) return "static";

  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  if (cores <= 2 || memory <= 2) return "lite";

  return "full";
}

type LoaderOptions<TProps extends QualityProps> = {
  loader: () => Promise<{ default: ComponentType<TProps> }>;
  fallback: ReactNode;
};

export function withDynamicModel<TProps extends QualityProps>({ loader, fallback }: LoaderOptions<TProps>) {
  return function DynamicModelWrapper(props: Omit<TProps, "quality">) {
    const [mode, setMode] = useState<RenderMode>("idle");
    const [Model, setModel] = useState<ComponentType<TProps> | null>(null);
    const isAudit = usePerformanceAudit();
    const shouldLoad = useMemo(() => mode === "full" || mode === "lite", [mode]);
    const applyMode = useCallback(() => setMode(isAudit ? "static" : pickRenderMode()), [isAudit]);

    useEffect(() => {
      if (!shouldLoad || Model) return;
      let cancelled = false;
      loader()
        .then((mod) => {
          if (!cancelled) setModel(() => mod.default);
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }, [Model, shouldLoad]);

    useEffect(() => {
      const cancelIdle = scheduleIdleTask(applyMode, {
        timeoutMs: MODE_IDLE_TIMEOUT_MS,
        fallbackMs: MODE_FALLBACK_TIMEOUT_MS,
      });

      const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
      const onPreferenceChange = () => applyMode();
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", onPreferenceChange);
      } else {
        mediaQuery.addListener(onPreferenceChange);
      }

      return () => {
        cancelIdle();
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", onPreferenceChange);
        } else {
          mediaQuery.removeListener(onPreferenceChange);
        }
      };
    }, [applyMode]);

    if (mode === "idle" || mode === "static" || !Model) {
      return fallback;
    }

    const quality = mode === "lite" ? "lite" : "full";
    return <Model {...(props as TProps)} quality={quality} />;
  };
}
