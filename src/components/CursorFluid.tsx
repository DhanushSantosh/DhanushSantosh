"use client";

import { useEffect, useRef } from "react";
import usePerformanceAudit from "@/hooks/usePerformanceAudit";

const POINTER_MOVE_EVENT = "pointermove";
const MOUSE_MOVE_EVENT = "mousemove";
const MOUSE_ENTER_EVENT = "mouseenter";
const POINTER_LEAVE_EVENT = "pointerleave";
const MOUSE_LEAVE_EVENT = "mouseleave";
const POINTER_OUT_EVENT = "pointerout";
const WINDOW_BLUR_EVENT = "blur";

const CURSOR_ROOT_ID = "site-cursor";
const CURSOR_ENABLED_BODY_CLASS = "has-custom-cursor";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const POINTER_FINE_QUERY = "(pointer: fine)";
const HOVER_QUERY = "(hover: hover)";
const CURSOR_INTERACTIVE_SELECTOR =
  "[data-cursor-block], a[href], button, input, textarea, select, summary, [role='button']";

const PASSIVE_EVENT_OPTIONS: AddEventListenerOptions = { passive: true };
const CURSOR_LERP_MIN = 0.22;
const CURSOR_LERP_MAX = 0.38;
const CURSOR_LERP_DISTANCE_DIVISOR = 220;
const CURSOR_EPSILON = 0.12;
const CURSOR_EPSILON_SQUARED = CURSOR_EPSILON * CURSOR_EPSILON;
const CURSOR_HIDDEN_TRANSLATE = "translate3d(-9999px, -9999px, 0)";

const CURSOR_VISIBLE_ATTR = "data-visible";
const CURSOR_STATE_ATTR = "data-state";
const CURSOR_STATE_DEFAULT = "default";
const CURSOR_STATE_INTERACTIVE = "interactive";

type CursorState = {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  isVisible: boolean;
  isInteractive: boolean;
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
    isInteractive: false,
    hasPosition: false,
  });
  const isAudit = usePerformanceAudit();

  useEffect(() => {
    const cursorElement = document.getElementById(CURSOR_ROOT_ID) as HTMLDivElement | null;
    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const supportsFinePointer = window.matchMedia(POINTER_FINE_QUERY).matches;
    const supportsHover = window.matchMedia(HOVER_QUERY).matches;

    if (
      isAudit ||
      prefersReducedMotion ||
      (!supportsFinePointer && !supportsHover) ||
      !cursorElement
    ) {
      return undefined;
    }

    document.body.classList.add(CURSOR_ENABLED_BODY_CLASS);

    const resolveInteractiveState = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        return false;
      }

      return Boolean(target.closest(CURSOR_INTERACTIVE_SELECTOR));
    };

    const applyVisibleState = (x: number, y: number, isInteractive: boolean) => {
      cursorElement.setAttribute(CURSOR_VISIBLE_ATTR, "true");
      cursorElement.setAttribute(
        CURSOR_STATE_ATTR,
        isInteractive ? CURSOR_STATE_INTERACTIVE : CURSOR_STATE_DEFAULT,
      );
      cursorElement.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const syncCursorState = () => {
      frameRef.current = null;
      const { currentX, currentY, targetX, targetY, isVisible, isInteractive, hasPosition } =
        cursorStateRef.current;

      if (!hasPosition) return;

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared > CURSOR_EPSILON_SQUARED) {
        const distance = Math.sqrt(distanceSquared);
        const normalizedDistance = Math.min(1, distance / CURSOR_LERP_DISTANCE_DIVISOR);
        const lerpFactor = CURSOR_LERP_MIN + (CURSOR_LERP_MAX - CURSOR_LERP_MIN) * normalizedDistance;
        cursorStateRef.current.currentX = currentX + dx * lerpFactor;
        cursorStateRef.current.currentY = currentY + dy * lerpFactor;
      } else {
        cursorStateRef.current.currentX = targetX;
        cursorStateRef.current.currentY = targetY;
      }

      cursorElement.setAttribute(CURSOR_VISIBLE_ATTR, isVisible ? "true" : "false");
      cursorElement.setAttribute(
        CURSOR_STATE_ATTR,
        isInteractive ? CURSOR_STATE_INTERACTIVE : CURSOR_STATE_DEFAULT,
      );
      cursorElement.style.transform = `translate3d(${cursorStateRef.current.currentX}px, ${cursorStateRef.current.currentY}px, 0)`;

      if (isVisible && distanceSquared > CURSOR_EPSILON_SQUARED) {
        frameRef.current = window.requestAnimationFrame(syncCursorState);
      }
    };

    const handleMove = (event: PointerEvent | MouseEvent) => {
      const state = cursorStateRef.current;
      state.targetX = event.clientX;
      state.targetY = event.clientY;
      state.isVisible = true;
      state.isInteractive = resolveInteractiveState(event.target);

      if (!state.hasPosition) {
        state.currentX = state.targetX;
        state.currentY = state.targetY;
        state.hasPosition = true;
      }

      applyVisibleState(state.currentX, state.currentY, state.isInteractive);

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(syncCursorState);
      }
    };

    const handleLeave = () => {
      const state = cursorStateRef.current;
      state.isVisible = false;
      state.isInteractive = false;

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      cursorElement.setAttribute(CURSOR_VISIBLE_ATTR, "false");
      cursorElement.setAttribute(CURSOR_STATE_ATTR, CURSOR_STATE_DEFAULT);
      cursorElement.style.transform = CURSOR_HIDDEN_TRANSLATE;
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        handleLeave();
      }
    };

    window.addEventListener(POINTER_MOVE_EVENT, handleMove, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(MOUSE_MOVE_EVENT, handleMove, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(MOUSE_ENTER_EVENT, handleMove, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(POINTER_LEAVE_EVENT, handleLeave, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(MOUSE_LEAVE_EVENT, handleLeave, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(POINTER_OUT_EVENT, handlePointerOut, PASSIVE_EVENT_OPTIONS);
    window.addEventListener(WINDOW_BLUR_EVENT, handleLeave, PASSIVE_EVENT_OPTIONS);

    return () => {
      document.body.classList.remove(CURSOR_ENABLED_BODY_CLASS);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      cursorElement.setAttribute(CURSOR_VISIBLE_ATTR, "false");
      cursorElement.setAttribute(CURSOR_STATE_ATTR, CURSOR_STATE_DEFAULT);
      cursorElement.style.transform = CURSOR_HIDDEN_TRANSLATE;

      window.removeEventListener(POINTER_MOVE_EVENT, handleMove, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(MOUSE_MOVE_EVENT, handleMove, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(MOUSE_ENTER_EVENT, handleMove, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(POINTER_LEAVE_EVENT, handleLeave, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(MOUSE_LEAVE_EVENT, handleLeave, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(POINTER_OUT_EVENT, handlePointerOut, PASSIVE_EVENT_OPTIONS);
      window.removeEventListener(WINDOW_BLUR_EVENT, handleLeave, PASSIVE_EVENT_OPTIONS);
    };
  }, [isAudit]);

  return null;
}

export default CursorFluid;
