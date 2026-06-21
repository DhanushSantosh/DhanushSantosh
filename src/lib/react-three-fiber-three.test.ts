import { afterEach, describe, expect, it, vi } from "vitest";

import { Clock } from "./react-three-fiber-three";

describe("React Three Fiber timer adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves Fiber's clock contract without constructing deprecated THREE.Clock", () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(1_000);
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const clock = new Clock();

    expect(warning).not.toHaveBeenCalled();
    expect(clock.getDelta()).toBe(0);

    now.mockReturnValue(1_500);
    expect(clock.getDelta()).toBeCloseTo(0.5);
    expect(clock.elapsedTime).toBeCloseTo(0.5);

    now.mockReturnValue(1_750);
    clock.stop();
    expect(clock.elapsedTime).toBeCloseTo(0.75);
    expect(clock.running).toBe(false);
  });
});
