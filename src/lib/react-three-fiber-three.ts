import { Timer } from "three/src/Three.js";

export * from "three/src/Three.js";

/**
 * React Three Fiber still expects the legacy Clock surface. Keep that contract
 * local to Fiber while using Three's Timer for all timekeeping.
 */
class FiberTimerClock {
  autoStart: boolean;
  elapsedTime = 0;
  oldTime = 0;
  running = false;
  startTime = 0;

  private timer: Timer;

  constructor(autoStart = true) {
    this.autoStart = autoStart;
    this.timer = this.createTimer();
  }

  private createTimer() {
    const timer = new Timer();
    if (typeof document !== "undefined") timer.connect(document);
    return timer;
  }

  start() {
    this.timer.dispose();
    this.timer = this.createTimer();

    const now = performance.now();
    this.startTime = now;
    this.oldTime = now;
    this.elapsedTime = 0;
    this.running = true;
  }

  stop() {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta() {
    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }

    if (!this.running) return 0;

    this.timer.update();
    const delta = this.timer.getDelta();
    this.elapsedTime = this.timer.getElapsed();
    this.oldTime = performance.now();
    return delta;
  }
}

export { FiberTimerClock as Clock };
