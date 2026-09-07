"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { m, useReducedMotion } from "framer-motion";

const DISPLAY_NAME = "Dhanush Santosh";
const SAFETY_TIMEOUT_MS = 6500;
// The crossfade into the main page — slowed down so the handoff reads as a
// deliberate transition rather than a quick cut.
const OVERLAY_EXIT_DURATION_S = 0.7;

// Mirrors HeroSentenceCycler's motion values exactly — both the reveal AND
// the dismiss use the identical blur+character-stagger transition the hero
// text cycles through, so the name here reads as the very same animation,
// not a lookalike.
const CHARACTER_STAGGER_DELAY = 0.03;
const CHARACTER_EXIT_STAGGER_DELAY = 0.01;
const CHARACTER_EXIT_STAGGER_DIRECTION = 1;
const CHARACTER_ANIMATION_DURATION_S = 0.5;
const CHARACTER_OFFSET_PX = 8;
const CHARACTER_EASING = "easeOut";
const SENTENCE_BLUR_PX = 6;
const SENTENCE_BLUR_DURATION_S = 0.45;
const SENTENCE_BLUR_EASING = "easeOut";

// Brief pause between the text finishing its blur-out and the overlay
// starting its crossfade into the main page — short enough to keep the
// handoff snappy, long enough to still read as a deliberate beat.
const HOLD_GAP_MS = 700;

const CHARACTER_VARIANTS = {
  hidden: { opacity: 0, y: CHARACTER_OFFSET_PX },
  visible: { opacity: 1, y: 0 },
};

const SENTENCE_VARIANTS = {
  hidden: { filter: `blur(${SENTENCE_BLUR_PX}px)` },
  visible: { filter: "blur(0px)" },
};

const WORDS = DISPLAY_NAME.split(" ");

const CHARACTER_COUNT = DISPLAY_NAME.replace(/ /g, "").length;

// The name reveal's own natural duration: sentence blur-in plus the last
// character's stagger offset and its own animation length.
const NAME_REVEAL_DURATION_MS = Math.round(
  (SENTENCE_BLUR_DURATION_S + CHARACTER_COUNT * CHARACTER_STAGGER_DELAY + CHARACTER_ANIMATION_DURATION_S) * 1000,
);

// The blur-out's own natural duration — same shape as the reveal, just with
// the hero's faster exit stagger timing.
const NAME_EXIT_DURATION_MS = Math.round(
  (SENTENCE_BLUR_DURATION_S + CHARACTER_COUNT * CHARACTER_EXIT_STAGGER_DELAY + CHARACTER_ANIMATION_DURATION_S) * 1000,
);

// Full sequence floor: reveal -> hold -> blur out -> gap. The loader never
// dismisses before this has actually finished playing.
const NAME_ANIMATION_DURATION_MS = NAME_REVEAL_DURATION_MS + NAME_EXIT_DURATION_MS + HOLD_GAP_MS;

// How long after mount the name should start blurring back out.
const TEXT_EXIT_START_MS = NAME_REVEAL_DURATION_MS;

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
  const [isTextExiting, setIsTextExiting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [, startTransition] = useTransition();

  const isReadyRef = useRef(false);
  const isAnimationDoneRef = useRef(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!isMounted || prefersReducedMotion) {
      return;
    }

    // Every setTimeout scheduled below is tracked here and cleared on
    // cleanup. reactStrictMode double-invokes this effect once in dev
    // (mount -> cleanup -> mount); an untracked timeout left over from the
    // first, throwaway invocation would otherwise fire later against a stale
    // closure and collide with the real run.
    const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
    let cancelled = false;

    const track = (id: ReturnType<typeof setTimeout>) => {
      pendingTimeouts.add(id);
      return id;
    };
    const runAfter = (fn: () => void, delayMs: number) => {
      const id = setTimeout(() => {
        pendingTimeouts.delete(id);
        fn();
      }, delayMs);
      return track(id);
    };

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

      // Crossfade: the overlay fades out, revealing the page underneath.
      setIsExiting(true);
      unlockScroll();
      runAfter(() => {
        startTransition(() => {
          setVisible(false);
        });
      }, OVERLAY_EXIT_DURATION_S * 1000);
    };

    const checkComplete = () => {
      if (cancelled) return;
      if (isReadyRef.current && isAnimationDoneRef.current) {
        triggerDismiss();
      }
    };

    // Readiness signal: document.fonts.ready. Deliberately does not wait on
    // the hero's 3D sculpture, which is its own intentionally idle/lazy-loaded
    // component — gating this on it would fight that existing optimization.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready
        .then(() => {
          if (cancelled) return;
          isReadyRef.current = true;
          checkComplete();
        })
        .catch(() => {
          if (cancelled) return;
          isReadyRef.current = true;
          checkComplete();
        });
    } else {
      isReadyRef.current = true;
      checkComplete();
    }

    // Safety ceiling: reveal regardless once this fires, so a font-load
    // hiccup can never leave a visitor stuck looking at the loader.
    track(
      setTimeout(() => {
        triggerDismiss();
      }, SAFETY_TIMEOUT_MS),
    );

    // Name reveal finishes, holds briefly, then blurs back out on its own.
    runAfter(() => {
      setIsTextExiting(true);
    }, TEXT_EXIT_START_MS);

    // The full sequence's own natural length is the effective floor — never
    // dismiss before it's actually finished playing (reveal, fade-out, gap).
    runAfter(() => {
      isAnimationDoneRef.current = true;
      checkComplete();
    }, NAME_ANIMATION_DURATION_MS);

    return () => {
      cancelled = true;
      pendingTimeouts.forEach((id) => clearTimeout(id));
      pendingTimeouts.clear();
      unlockScroll();
    };
  }, [isMounted, prefersReducedMotion]);

  // Not dismissed yet, and reduced motion isn't (as far as we can tell yet)
  // preferred — render unconditionally, including on the server and on the
  // client's very first pre-hydration pass. `isMounted`/`prefersReducedMotion`
  // are both intentionally excluded from this guard's true-blocking branch
  // where possible: gating render on `isMounted` would mean the server (and
  // the client's matching first paint) never emit the overlay at all, so the
  // real page would flash visible until hydration catches up and mounts it.
  // Rendering it solid from frame one — no JS required — is what actually
  // prevents that flash.
  if (prefersReducedMotion || !visible) {
    return null;
  }

  return (
    <m.div
      aria-hidden="true"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{
        duration: isExiting ? OVERLAY_EXIT_DURATION_S : 0,
        ease: "easeOut",
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black select-none"
      style={{ pointerEvents: isExiting ? "none" : "auto" }}
    >
      <span className="text-2xl font-semibold text-white sm:text-3xl">
        <m.span
          initial="hidden"
          animate={isTextExiting ? "hidden" : "visible"}
          variants={SENTENCE_VARIANTS}
          transition={{ duration: SENTENCE_BLUR_DURATION_S, ease: SENTENCE_BLUR_EASING }}
          className="inline-block"
          style={{ willChange: "filter" }}
        >
          <m.span
            initial="hidden"
            animate={isTextExiting ? "hidden" : "visible"}
            variants={{
              visible: { transition: { staggerChildren: CHARACTER_STAGGER_DELAY } },
              hidden: {
                transition: {
                  staggerChildren: CHARACTER_EXIT_STAGGER_DELAY,
                  staggerDirection: CHARACTER_EXIT_STAGGER_DIRECTION,
                },
              },
            }}
            className="inline-block"
          >
            {WORDS.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block whitespace-nowrap">
                {word.split("").map((char, charIndex) => (
                  <m.span
                    key={charIndex}
                    variants={CHARACTER_VARIANTS}
                    transition={{ duration: CHARACTER_ANIMATION_DURATION_S, ease: CHARACTER_EASING }}
                    className="inline-block"
                  >
                    {char}
                  </m.span>
                ))}
                {wordIndex < WORDS.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
              </span>
            ))}
          </m.span>
        </m.span>
      </span>
    </m.div>
  );
}
