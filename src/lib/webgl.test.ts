import { describe, expect, it, vi } from "vitest";

vi.mock("three", () => ({
  WebGLRenderer: vi.fn(),
}));

import { WebGLRenderer } from "three";
import { attachContextLostHandler, createGuardedGl } from "./webgl";

describe("createGuardedGl", () => {
  it("returns a real renderer and never calls onFailure when construction succeeds", () => {
    const fakeRenderer = { isWebGLRenderer: true };
    // A regular function, not an arrow function — vi.fn()'s mock
    // implementation has to support `new` the same way the real
    // THREE.WebGLRenderer constructor does, and arrow functions can't be.
    vi.mocked(WebGLRenderer).mockImplementation(function () {
      return fakeRenderer as unknown as WebGLRenderer;
    });
    const onFailure = vi.fn();

    const gl = createGuardedGl(onFailure);
    const result = gl({ antialias: true });

    expect(result).toBe(fakeRenderer);
    expect(onFailure).not.toHaveBeenCalled();
  });

  // This is the actual regression: react-three-fiber constructs its
  // WebGLRenderer inside an internal async function it never awaits or
  // catches, so a React error boundary can never see this throw — the `gl`
  // prop returned here is the only place the failure can be observed at
  // all. Confirming onFailure fires synchronously, before the re-throw, is
  // what proves application state (the fallback UI) still updates even
  // though the promise this runs inside of is never handled by R3F.
  it("calls onFailure synchronously before re-throwing when construction fails", () => {
    const constructionError = new Error("WebGL context creation failed");
    vi.mocked(WebGLRenderer).mockImplementation(function () {
      throw constructionError;
    });
    const onFailure = vi.fn();

    const gl = createGuardedGl(onFailure);

    expect(() => gl({ antialias: true })).toThrow(constructionError);
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(onFailure).toHaveBeenCalledWith(constructionError);
  });
});

// A minimal fake <canvas> — attachContextLostHandler only touches
// addEventListener/removeEventListener, so a full DOM/jsdom environment
// isn't needed to exercise its actual contract.
function createFakeCanvas() {
  const listeners = new Map<string, EventListener>();
  return {
    element: {
      addEventListener: vi.fn((type: string, listener: EventListener) => listeners.set(type, listener)),
      removeEventListener: vi.fn((type: string) => listeners.delete(type)),
    } as unknown as HTMLCanvasElement,
    fireContextLost: () => {
      const listener = listeners.get("webglcontextlost");
      const event = { type: "webglcontextlost", preventDefault: vi.fn() };
      listener?.(event as unknown as Event);
      return event;
    },
  };
}

describe("attachContextLostHandler", () => {
  it("calls onLost and prevents the event's default action when the context is lost", () => {
    const { element, fireContextLost } = createFakeCanvas();
    const onLost = vi.fn();

    attachContextLostHandler(element, onLost);
    const event = fireContextLost();

    expect(onLost).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("stops calling onLost once the returned cleanup function runs", () => {
    const { element, fireContextLost } = createFakeCanvas();
    const onLost = vi.fn();

    const cleanup = attachContextLostHandler(element, onLost);
    cleanup();
    fireContextLost();

    expect(onLost).not.toHaveBeenCalled();
  });
});
