"use client";

import { useEffect, useState, useSyncExternalStore, useRef, useTransition } from "react";
import { useReducedMotion } from "framer-motion";

const TARGET_NAME = "DHANUSH SANTOSH";
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#$%";
const TOTAL_SCRAMBLE_FRAMES = 18;
const FRAME_DURATION_MS = 40;
const ROW_STAGGER_MS = 90;
const BAR_DELAY_MS = 100;
const BAR_DURATION_MS = 400;
const SAFETY_TIMEOUT_MS = 5000;

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function useMounted() {
  return useSyncExternalStore(emptySubscribe, getClientMounted, getServerMounted);
}

export function HomepageIntroLoader() {
  const isMounted = useMounted();
  const prefersReducedMotion = useReducedMotion();

  const [visible, setVisible] = useState(true);
  const [flicker, setFlicker] = useState(false);
  const [scrambleText, setScrambleText] = useState("");
  const [visibleRows, setVisibleRows] = useState(0);
  const [barProgress, setBarProgress] = useState(0);
  const [, startTransition] = useTransition();

  const isReadyRef = useRef(false);
  const isAnimationDoneRef = useRef(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!isMounted || prefersReducedMotion) {
      return;
    }

    // Lock body scroll
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };

    const triggerDismiss = () => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;

      // Brief static/glitch flicker then hard cut
      setFlicker(true);
      setTimeout(() => {
        unlockScroll();
        startTransition(() => {
          setVisible(false);
        });
      }, 140);
    };

    const checkComplete = () => {
      if (isReadyRef.current && isAnimationDoneRef.current) {
        triggerDismiss();
      }
    };

    // Readiness signal: document.fonts.ready
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready
        .then(() => {
          isReadyRef.current = true;
          checkComplete();
        })
        .catch(() => {
          isReadyRef.current = true;
          checkComplete();
        });
    } else {
      isReadyRef.current = true;
      checkComplete();
    }

    // Safety ceiling: reveal after 5s regardless
    const safetyTimer = setTimeout(() => {
      triggerDismiss();
    }, SAFETY_TIMEOUT_MS);

    // Scramble text animation sequence
    let currentFrame = 0;
    const scrambleInterval = setInterval(() => {
      currentFrame++;
      let out = "";
      for (let i = 0; i < TARGET_NAME.length; i++) {
        if (TARGET_NAME[i] === " ") {
          out += " ";
          continue;
        }
        const revealPoint = (i / TARGET_NAME.length) * TOTAL_SCRAMBLE_FRAMES;
        if (currentFrame > revealPoint + 6) {
          out += TARGET_NAME[i];
        } else {
          out += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }

      setScrambleText(out);

      if (currentFrame >= TOTAL_SCRAMBLE_FRAMES) {
        clearInterval(scrambleInterval);
        setScrambleText(TARGET_NAME);

        // Populate data rows in stepped sequence
        setTimeout(() => setVisibleRows(1), 0);
        setTimeout(() => setVisibleRows(2), ROW_STAGGER_MS);
        setTimeout(() => setVisibleRows(3), ROW_STAGGER_MS * 2);

        // Progress bar fills in stepped fashion
        const totalRowsTime = ROW_STAGGER_MS * 2 + BAR_DELAY_MS;
        setTimeout(() => {
          setBarProgress(100);
        }, totalRowsTime);

        // Animation completes its natural sequence
        setTimeout(() => {
          isAnimationDoneRef.current = true;
          checkComplete();
        }, totalRowsTime + BAR_DURATION_MS);
      }
    }, FRAME_DURATION_MS);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(safetyTimer);
      unlockScroll();
    };
  }, [isMounted, prefersReducedMotion]);

  // Don't render on server, when reduced motion is preferred, or after dismissed
  if (!isMounted || prefersReducedMotion || !visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black select-none font-mono ${
        flicker ? "opacity-30 invert" : "opacity-100"
      } transition-opacity duration-75`}
      style={{ fontFamily: '"Courier New", Courier, monospace' }}
    >
      {/* Subtle Scanline Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, transparent 1px, transparent 2px)",
        }}
      />

      {/* Reticle Card */}
      <div className="relative w-[280px] sm:w-[320px] border border-[rgba(95,225,255,0.4)] bg-black px-4 py-4 sm:px-5 sm:py-5 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Four Bracket Reticle Corners */}
        <div className="absolute -top-[1px] -left-[1px] h-2.5 w-2.5 border-t-2 border-l-2 border-[rgba(95,225,255,0.9)]" />
        <div className="absolute -top-[1px] -right-[1px] h-2.5 w-2.5 border-t-2 border-r-2 border-[rgba(95,225,255,0.9)]" />
        <div className="absolute -bottom-[1px] -left-[1px] h-2.5 w-2.5 border-b-2 border-l-2 border-[rgba(95,225,255,0.9)]" />
        <div className="absolute -bottom-[1px] -right-[1px] h-2.5 w-2.5 border-b-2 border-r-2 border-[rgba(95,225,255,0.9)]" />

        {/* Header Row */}
        <div className="mb-2.5 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-[rgba(95,225,255,0.8)]">
          <span>CTOS-LOCAL // IDENTITY SCAN</span>
          <span className="animate-pulse text-[rgba(95,225,255,0.9)]">●</span>
        </div>

        {/* Subject Line with Decrypt Effect */}
        <div className="mb-3 min-h-[20px] text-[15px] tracking-[0.03em] text-white">
          {scrambleText || "\u00A0"}
        </div>

        {/* Stepped Data Rows */}
        <div className="space-y-1">
          <div
            className={`flex items-center justify-between border-t border-dashed border-white/[0.08] pt-1 text-[10px] transition-none ${
              visibleRows >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-white/55">ROLE</span>
            <span className="text-[rgba(95,225,255,0.85)]">FULL-STACK AI DEVELOPER</span>
          </div>

          <div
            className={`flex items-center justify-between border-t border-dashed border-white/[0.08] pt-1 text-[10px] transition-none ${
              visibleRows >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-white/55">LOCATION</span>
            <span className="text-[rgba(95,225,255,0.85)]">REMOTE // WORLDWIDE</span>
          </div>

          <div
            className={`flex items-center justify-between border-t border-dashed border-white/[0.08] pt-1 text-[10px] transition-none ${
              visibleRows >= 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-white/55">ACCESS</span>
            <span className="text-[rgba(95,225,255,0.85)]">GRANTED</span>
          </div>
        </div>

        {/* Stepped Progress Indicator */}
        <div className="relative mt-3 h-[3px] w-full bg-white/[0.08]">
          <div
            className="absolute top-0 left-0 h-full bg-[rgba(95,225,255,0.85)]"
            style={{
              width: `${barProgress}%`,
              transition: barProgress > 0 ? "width 0.4s steps(12)" : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
