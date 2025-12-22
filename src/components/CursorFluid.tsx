"use client";

import { useEffect, useRef } from "react";
import usePerformanceAudit from "@/hooks/usePerformanceAudit";

const POINTER_MOVE_EVENT = "pointermove";
const POINTER_LEAVE_EVENT = "pointerleave";
const POINTER_OUT_EVENT = "pointerout";
const WINDOW_BLUR_EVENT = "blur";

const CURSOR_GLOW_ID = "cursor-glow";
const CURSOR_GLOW_OPACITY_VAR = "--cursor-glow-opacity";
const CURSOR_GLOW_OPACITY_BLOCKED_VAR = "--cursor-glow-opacity-blocked";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const POINTER_FINE_QUERY = "(pointer: fine)";
const HOVER_QUERY = "(hover: hover)";
const CURSOR_BLOCK_SELECTOR = "[data-cursor-block]";

const PASSIVE_EVENT_OPTIONS: AddEventListenerOptions = { passive: true };
const DEFAULT_GLOW_OPACITY = 1;
const DEFAULT_GLOW_OPACITY_BLOCKED = 0;
const CURSOR_LERP_MIN = 0.22;
const CURSOR_LERP_MAX = 0.38;
const CURSOR_LERP_DISTANCE_DIVISOR = 220;
const CURSOR_EPSILON = 0.12;
const CURSOR_EPSILON_SQUARED = CURSOR_EPSILON * CURSOR_EPSILON;
const CURSOR_HIDDEN_OPACITY = 0;

type CursorState = {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  isVisible: boolean;
  isBlocked: boolean;
  hasPosition: boolean;
};

export function CursorFluid() {
  const frameRef = useRef<number | null>(null);
  const cursorStateRef = useRef<CursorState>({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    isVisible: false,
    isBlocked: false,
    hasPosition: false,
  });
  const isAudit = usePerformanceAudit();

  useEffect(() => {
    const glowElement = document.getElementById(CURSOR_GLOW_ID) as HTMLDivElement | null;
    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const supportsFinePointer = window.matchMedia(POINTER_FINE_QUERY).matches;
    const supportsHover = window.matchMedia(HOVER_QUERY).matches;

    if (isAudit || prefersReducedMotion || !supportsFinePointer || !supportsHover || !glowElement) {
      return undefined;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const glowOpacity = Number.parseFloat(rootStyles.getPropertyValue(CURSOR_GLOW_OPACITY_VAR));
    const glowOpacityBlocked = Number.parseFloat(rootStyles.getPropertyValue(CURSOR_GLOW_OPACITY_BLOCKED_VAR));
    const visibleOpacity = Number.isNaN(glowOpacity) ? DEFAULT_GLOW_OPACITY : glowOpacity;
    const blockedOpacity = Number.isNaN(glowOpacityBlocked) ? DEFAULT_GLOW_OPACITY_BLOCKED : glowOpacityBlocked;
    const glowRadius = glowElement.offsetWidth / 2;

    const applyCursorStyles = () => {
      frameRef.current = null;
      const { currentX, currentY, targetX, targetY, isVisible, isBlocked, hasPosition } =
        cursorStateRef.current;

      if (!hasPosition) return;

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared > CURSOR_EPSILON_SQUARED) {
        const distance = Math.sqrt(distanceSquared);
        const normalizedDistance = Math.min(1, distance / CURSOR_LERP_DISTANCE_DIVISOR);
        const lerpFactor =
          CURSOR_LERP_MIN + (CURSOR_LERP_MAX - CURSOR_LERP_MIN) * normalizedDistance;
        cursorStateRef.current.currentX = currentX + dx * lerpFactor;
        cursorStateRef.current.currentY = currentY + dy * lerpFactor;
      } else {
        cursorStateRef.current.currentX = targetX;
        cursorStateRef.current.currentY = targetY;
      }

      const nextOpacity = isVisible
        ? isBlocked
          ? blockedOpacity
          : visibleOpacity
        : CURSOR_HIDDEN_OPACITY;
      glowElement.style.opacity = `${nextOpacity}`;
      glowElement.style.transform = `translate3d(${cursorStateRef.current.currentX - glowRadius}px, ${cursorStateRef.current.currentY - glowRadius}px, 0)`;

      if (isVisible && distanceSquared > CURSOR_EPSILON_SQUARED) {
        frameRef.current = window.requestAnimationFrame(applyCursorStyles);
      }
    };

    const handleMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const isBlocked = Boolean(target?.closest(CURSOR_BLOCK_SELECTOR));
      const state = cursorStateRef.current;
      state.targetX = event.clientX;
      state.targetY = event.clientY;
      state.isVisible = true;
      state.isBlocked = isBlocked;

      if (!state.hasPosition) {
        state.currentX = state.targetX;
        state.currentY = state.targetY;
        state.hasPosition = true;
      }

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(applyCursorStyles);
      }
    };

    const handleLeave = () => {
      const state = cursorStateRef.current;
      state.isVisible = false;
      state.isBlocked = false;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      glowElement.style.opacity = `${CURSOR_HIDDEN_OPACITY}`;
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
