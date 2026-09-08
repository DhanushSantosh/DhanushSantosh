import { useCallback, useEffect, useState } from "react";
import type { RootState } from "@react-three/fiber";
import { WebGLRenderer, type WebGLRendererParameters } from "three";

// react-three-fiber's <Canvas> constructs its WebGLRenderer inside an
// internal `async configure()` method — a synchronous throw from
// `new THREE.WebGLRenderer(...)` (WebGL unsupported, no GPU driver, some
// locked-down browsers) happening inside that async function becomes a
// promise rejection, not a synchronous render-phase throw. R3F itself never
// awaits or catches that call (its mount effect just does `run();` with no
// `.catch`), so no React error boundary — including this codebase's own
// WebGLErrorBoundary, which can only catch synchronous render-phase throws —
// ever sees it. On failure the Canvas just silently never finishes mounting.
//
// The one hook R3F actually gives into this path is the `gl` prop: passing
// a function bypasses R3F's own `new THREE.WebGLRenderer(...)` call and
// lets us wrap it in a real try/catch, calling `onFailure` synchronously
// (still inside R3F's `await glConfig(defaultProps)`, so it runs regardless
// of whether the subsequent promise rejection is ever observed elsewhere)
// before re-throwing — we're not suppressing the failure, only observing it
// in time to flip application state to the same fallback UI the mount-time
// WebGLErrorBoundary case already uses.
// re-throwing (see below) is still required — R3F's `configure()` awaits
// this call, and if it resolved instead of rejecting, R3F would go on to
// call `root.current.render(...)` against a value that isn't a real
// renderer, failing again deeper inside Three.js in a less predictable way.
// But letting that rejection reach the browser unhandled (R3F's own `run()`
// has no `.catch`) surfaces as a real "Uncaught (in promise)" pageerror —
// alarming in devtools/monitoring and exactly what onFailure already
// handled a moment earlier. This tracks which error objects we already
// reported through onFailure and, only for those, suppresses the resulting
// unhandledrejection — not unhandled rejections generally.
const handledWebglErrors = new WeakSet<WeakKey>();

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as unknown;
    if (typeof reason === "object" && reason !== null && handledWebglErrors.has(reason as WeakKey)) {
      event.preventDefault();
    }
  });
}

export function createGuardedGl(onFailure: (error: unknown) => void) {
  return (props: WebGLRendererParameters) => {
    try {
      return new WebGLRenderer(props);
    } catch (error) {
      onFailure(error);
      if (typeof error === "object" && error !== null) handledWebglErrors.add(error as WeakKey);
      throw error;
    }
  };
}

// A separate failure mode from the above: a context that was created
// successfully can still be lost mid-session — GPU driver crash/reset,
// out-of-memory, some platforms losing contexts on backgrounding. That's a
// "webglcontextlost" DOM event fired on the <canvas> element itself, not a
// thrown error, so it isn't caught by createGuardedGl or WebGLErrorBoundary
// at all; it needs its own listener. `preventDefault()` on the event is
// what tells the browser this page intends to handle recovery itself rather
// than immediately tearing down the context further — three.js's own
// automatic context-restore isn't attempted here (this app doesn't rebuild
// the whole scene on "webglcontextrestored"), so onLost's job is just to
// swap to the existing static/lite fallback UI, matching how a
// mount-time-unsupported failure already degrades.
export function attachContextLostHandler(canvas: HTMLCanvasElement, onLost: () => void) {
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onLost();
  };
  canvas.addEventListener("webglcontextlost", handleContextLost, false);
  return () => canvas.removeEventListener("webglcontextlost", handleContextLost, false);
}

// Shared wiring for the three sculptures: pass the returned onCreated to
// <Canvas onCreated={...}>. R3F's onCreated fires once, synchronously, with
// the real RootState (including gl.domElement, the actual <canvas>) — that
// timing is captured via state rather than a plain ref because a ref
// mutation alone wouldn't re-run the effect that attaches the listener.
export function useWebglContextLostHandler(onWebglFailure?: (error: unknown) => void) {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  const onCreated = useCallback((state: RootState) => {
    setCanvasEl(state.gl.domElement);
  }, []);

  useEffect(() => {
    if (!onWebglFailure || !canvasEl) return;
    return attachContextLostHandler(canvasEl, () => onWebglFailure(new Error("WebGL context lost")));
  }, [canvasEl, onWebglFailure]);

  return onCreated;
}
