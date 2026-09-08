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
export function createGuardedGl(onFailure: (error: unknown) => void) {
  return (props: WebGLRendererParameters) => {
    try {
      return new WebGLRenderer(props);
    } catch (error) {
      onFailure(error);
      throw error;
    }
  };
}
