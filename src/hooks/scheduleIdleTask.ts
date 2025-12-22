type IdleScheduler = (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
type IdleCanceler = (handle: number) => void;

type IdleWindow = Window & {
  requestIdleCallback?: IdleScheduler;
  cancelIdleCallback?: IdleCanceler;
};

export type IdleTaskOptions = {
  timeoutMs: number;
  fallbackMs: number;
};

export function scheduleIdleTask(task: () => void, options: IdleTaskOptions) {
  const { timeoutMs, fallbackMs } = options;

  if (typeof window === "undefined") {
    const timeoutId = globalThis.setTimeout(task, fallbackMs);
    return () => globalThis.clearTimeout(timeoutId);
  }

  const idleWindow = window as IdleWindow;
  if (typeof idleWindow.requestIdleCallback === "function") {
    const idleId = idleWindow.requestIdleCallback(task, { timeout: timeoutMs });
    return () => {
      if (typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleId);
      }
    };
  }

  const timeoutId = globalThis.setTimeout(task, fallbackMs);
  return () => globalThis.clearTimeout(timeoutId);
}
