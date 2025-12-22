"use client";

import { useEffect, useRef } from "react";
import usePerformanceAudit from "@/hooks/usePerformanceAudit";

const POINTER_MOVE_EVENT = "pointermove";
const POINTER_LEAVE_EVENT = "pointerleave";
const POINTER_OUT_EVENT = "pointerout";
const WINDOW_BLUR_EVENT = "blur";

const CURSOR_X_VAR = "--cursor-x";
const CURSOR_Y_VAR = "--cursor-y";
const CURSOR_VISIBLE_VAR = "--cursor-visible";
const CURSOR_GLOW_FACTOR_VAR = "--cursor-glow-factor";

const CURSOR_VISIBLE_ON = "1";
const CURSOR_VISIBLE_OFF = "0";
const CURSOR_GLOW_ON = "1";
const CURSOR_GLOW_OFF = "0";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const POINTER_FINE_QUERY = "(pointer: fine)";
const HOVER_QUERY = "(hover: hover)";
const CURSOR_BLOCK_SELECTOR = "[data-cursor-block]";

const PASSIVE_EVENT_OPTIONS: AddEventListenerOptions = { passive: true };

export function CursorFluid() {
  const frameRef = useRef<number | null>(null);
  const latestPositionRef = useRef({ x: 0, y: 0, target: null as HTMLElement | null });
  const isAudit = usePerformanceAudit();

  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const supportsFinePointer = window.matchMedia(POINTER_FINE_QUERY).matches;
    const supportsHover = window.matchMedia(HOVER_QUERY).matches;

    if (isAudit || prefersReducedMotion || !supportsFinePointer || !supportsHover) {
      return undefined;
    }

    const applyCursorStyles = () => {
      frameRef.current = null;
      const { x, y, target } = latestPositionRef.current;

      root.style.setProperty(CURSOR_X_VAR, `${x}px`);
      root.style.setProperty(CURSOR_Y_VAR, `${y}px`);
      root.style.setProperty(CURSOR_VISIBLE_VAR, CURSOR_VISIBLE_ON);

      const block = target?.closest(CURSOR_BLOCK_SELECTOR) as HTMLElement | null;
      root.style.setProperty(CURSOR_GLOW_FACTOR_VAR, block ? CURSOR_GLOW_OFF : CURSOR_GLOW_ON);
    };

    const handleMove = (event: PointerEvent) => {
      latestPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
        target: event.target as HTMLElement | null,
      };

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(applyCursorStyles);
      }
    };

    const handleLeave = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      root.style.setProperty(CURSOR_VISIBLE_VAR, CURSOR_VISIBLE_OFF);
      root.style.setProperty(CURSOR_GLOW_FACTOR_VAR, CURSOR_GLOW_OFF);
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        handleLeave();
      }
    };

    const handleWindowBlur = () => {
      handleLeave();
    };

    window.addEventListener(POINTER_MOVE_EVENT, handleMove, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(POINTER_LEAVE_EVENT, handleLeave, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(POINTER_OUT_EVENT, handlePointerOut, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(WINDOW_BLUR_EVENT, handleWindowBlur, PASSIVE_EVENT_OPTIONS);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      window.removeEventListener(POINTER_MOVE_EVENT, handleMove, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(POINTER_LEAVE_EVENT, handleLeave, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(POINTER_OUT_EVENT, handlePointerOut, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(WINDOW_BLUR_EVENT, handleWindowBlur, PASSIVE_EVENT_OPTIONS);
    };
  }, [isAudit]);

  return null;
}

export default CursorFluid;
