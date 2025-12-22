"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import usePerformanceAudit from "@/hooks/usePerformanceAudit";

const SENTENCES = [
  "ships AI copilots end-to-end.",
  "threads LLMs into workflows.",
  "orchestrates edge inference.",
  "designs automation that feels human.",
  "turns data into reliable retrieval.",
  "pairs design systems with agents.",
  "teaches models to respect UX.",
  "deploys evals before launch.",
  "connects research to production.",
  "builds interfaces that think.",
  "scales inference across regions.",
  "crafts interactions with intent.",
  "engineers reliable agentic flows.",
];

const LONGEST_SENTENCE = SENTENCES.reduce(
  (longest, sentence) => (sentence.length > longest.length ? sentence : longest),
  ""
);

const DEFAULT_SEQUENCE = SENTENCES.map((_, index) => index);
const shuffleSequence = () =>
  [...DEFAULT_SEQUENCE].sort(() => Math.random() - 0.5);

const MOBILE_QUERY = "(max-width: 768px)";
const ANIMATE_PRESENCE_MODE = "wait";
const CHARACTER_OPACITY_HIDDEN = 0;
const CHARACTER_OPACITY_VISIBLE = 1;
const CHARACTER_STAGGER_DELAY = 0.03;
const CHARACTER_EXIT_STAGGER_DELAY = 0.01;
const CHARACTER_EXIT_STAGGER_DIRECTION = 1;
const CHARACTER_ANIMATION_DURATION_S = 0.5;
const CHARACTER_OFFSET_PX = 8;
const CHARACTER_EASING = "easeOut";
const MOTION_OFFSET_REST_PX = 0;
const SENTENCE_BLUR_PX = 6;
const SENTENCE_BLUR_VISIBLE = "blur(0px)";
const SENTENCE_BLUR_DURATION_S = 0.45;
const SENTENCE_BLUR_EASING = "easeOut";
const SIMPLE_FADE_DURATION_S = 0.4;
const SIMPLE_OFFSET_PX = 8;
const SIMPLE_EASING = "easeOut";

const CHARACTER_VARIANTS = {
  hidden: { opacity: CHARACTER_OPACITY_HIDDEN, y: CHARACTER_OFFSET_PX },
  visible: { opacity: CHARACTER_OPACITY_VISIBLE, y: MOTION_OFFSET_REST_PX },
};

const SENTENCE_VARIANTS = {
  hidden: { filter: `blur(${SENTENCE_BLUR_PX}px)` },
  visible: { filter: SENTENCE_BLUR_VISIBLE },
};

type HeroSentenceCyclerProps = {
  name: string;
  intervalMs?: number;
};

export function HeroSentenceCycler({ name, intervalMs = 5000 }: HeroSentenceCyclerProps) {
  const [index, setIndex] = useState(0);
  const [sequence, setSequence] = useState<number[]>(() => [...DEFAULT_SEQUENCE]);
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  );
  const prefersReducedMotion = useReducedMotion();
  const isAudit = usePerformanceAudit();

  const currentSentence = useMemo(() => {
    if (!sequence.length) return SENTENCES[index];
    return SENTENCES[sequence[index]];
  }, [index, sequence]);
  const words = useMemo(() => currentSentence.split(" "), [currentSentence]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mql = window.matchMedia(MOBILE_QUERY);
    if (typeof mql.addEventListener === "function") {
      const listener = (event: MediaQueryListEvent) => setIsCompact(event.matches);
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }

    const legacyListener = (event: MediaQueryListEvent) => setIsCompact(event.matches);
    mql.addListener(legacyListener);
    return () => mql.removeListener(legacyListener);
  }, []);

  useEffect(() => {
    if (!sequence.length || isAudit) return;

    const interval = window.setInterval(() => {
      setIndex((prev) => {
        if (prev + 1 >= sequence.length) {
          setSequence(shuffleSequence());
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [intervalMs, isAudit, sequence]);

  const shouldSimplify = Boolean(isAudit || prefersReducedMotion || isCompact);

  if (shouldSimplify) {
    return (
      <span className="inline-block">
        {name}{" "}
        <span className="relative inline-block align-baseline">
          <span aria-hidden="true" className="invisible select-none">
            {LONGEST_SENTENCE}
          </span>
          <AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
            <m.span
              key={currentSentence}
              initial={{ opacity: CHARACTER_OPACITY_HIDDEN, y: SIMPLE_OFFSET_PX }}
              animate={{ opacity: CHARACTER_OPACITY_VISIBLE, y: MOTION_OFFSET_REST_PX }}
              exit={{ opacity: CHARACTER_OPACITY_HIDDEN, y: -SIMPLE_OFFSET_PX }}
              transition={{ duration: SIMPLE_FADE_DURATION_S, ease: SIMPLE_EASING }}
              className="absolute left-0 top-0 w-full"
            >
              {currentSentence}
            </m.span>
          </AnimatePresence>
        </span>
      </span>
    );
  }

  return (
    <span className="inline-block">
      {name}{" "}
        <span className="relative inline-block align-baseline">
          <span aria-hidden="true" className="invisible select-none">
            {LONGEST_SENTENCE}
          </span>
          <AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
            <m.span
              key={currentSentence}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={SENTENCE_VARIANTS}
              transition={{ duration: SENTENCE_BLUR_DURATION_S, ease: SENTENCE_BLUR_EASING }}
              className="absolute left-0 top-0 w-full"
            >
              <m.span
                initial="hidden"
                animate="visible"
                exit="hidden"
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
                {words.map((word, wordIndex) => (
                  <span key={wordIndex} className="inline-block whitespace-nowrap">
                    {word.split("").map((char, charIndex) => (
                      <m.span
                        key={charIndex}
                        variants={CHARACTER_VARIANTS}
                        transition={{ duration: CHARACTER_ANIMATION_DURATION_S, ease: CHARACTER_EASING }}
                        className="inline-block will-change-transform"
                      >
                        {char}
                      </m.span>
                    ))}
                    <span className="inline-block">&nbsp;</span>
                  </span>
                ))}
              </m.span>
            </m.span>
          </AnimatePresence>
        </span>
      </span>
  );
}

export default HeroSentenceCycler;
