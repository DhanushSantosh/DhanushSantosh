"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import usePerformanceAudit from "@/hooks/usePerformanceAudit";
import { scheduleIdleTask } from "@/hooks/scheduleIdleTask";

type RenderMode = "idle" | "static" | "lite" | "full";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

const fallbackStyles =
  "mx-auto flex h-[420px] w-full max-w-[420px] flex-col justify-between rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent p-6 text-left shadow-[0_0_45px_rgba(0,0,0,0.8)]";

const MODE_IDLE_TIMEOUT_MS = 900;
const MODE_FALLBACK_TIMEOUT_MS = 120;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function StaticSculptureFallback() {
  return (
    <div className={fallbackStyles}>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Lite mode</p>
        <h3 className="text-2xl font-semibold text-white">3D paused to save power.</h3>
        <p className="text-sm text-white/65">
          We detected reduced-motion or a data saver connection and kept the scene lightweight.
        </p>
      </div>
      <div className="mt-auto h-28 rounded-2xl bg-gradient-to-r from-[#5fe1ff]/20 via-[#8cf9ff]/10 to-transparent shadow-[0_0_32px_rgba(95,225,255,0.25)]" />
    </div>
  );
}

function IdleSculptureFallback() {
  return (
    <div className="mx-auto h-[420px] w-full max-w-[420px] animate-pulse rounded-[32px] border border-white/10 bg-black" />
  );
}

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
  // Only drop to lite on very constrained devices; otherwise keep full fidelity.
  if (cores <= 2 || memory <= 2) return "lite";

  return "full";
}

export function ClientSculpture() {
  const [mode, setMode] = useState<RenderMode>("idle");
  const [Sculpture, setSculpture] = useState<ComponentType<{ quality?: "full" | "lite" }> | null>(null);
  const isAudit = usePerformanceAudit();
  const shouldLoadSculpture = useMemo(() => mode === "full" || mode === "lite", [mode]);
  const applyMode = useCallback(() => setMode(isAudit ? "static" : pickRenderMode()), [isAudit]);

  // Lazy-load the heavy 3D component after we're on the client to avoid
  // triggering state updates during the render phase.
  useEffect(() => {
    if (!shouldLoadSculpture || Sculpture) return;

    let cancelled = false;

    import("@/components/OrbitalSculpture")
      .then((module) => {
        if (!cancelled) {
          setSculpture(() => module.OrbitalSculpture);
        }
      })
      .catch(() => {
        // If the import fails, stay on the lightweight placeholder.
      });

    return () => {
      cancelled = true;
    };
  }, [Sculpture, shouldLoadSculpture]);

  useEffect(() => {
    const cancelIdle = scheduleIdleTask(applyMode, {
      timeoutMs: MODE_IDLE_TIMEOUT_MS,
      fallbackMs: MODE_FALLBACK_TIMEOUT_MS,
    });

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const onPreferenceChange = () => applyMode();
    mediaQuery.addEventListener("change", onPreferenceChange);

    return () => {
      cancelIdle();
      mediaQuery.removeEventListener("change", onPreferenceChange);
    };
  }, [applyMode]);

  if (mode === "idle") return <IdleSculptureFallback />;
  if (mode === "static") return <StaticSculptureFallback />;

  if (!Sculpture) return <IdleSculptureFallback />;

  const quality = mode === "lite" ? "lite" : "full";
  return <Sculpture quality={quality} />;
}

export default ClientSculpture;
