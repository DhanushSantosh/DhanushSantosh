"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

type HeroSentenceCyclerProps = {
  name: string;
  intervalMs?: number;
};



export function HeroSentenceCycler({ name, intervalMs = 5000 }: HeroSentenceCyclerProps) {
  const [index, setIndex] = useState(0);
  const [sequence, setSequence] = useState<number[]>(() => [...DEFAULT_SEQUENCE]);

  const currentSentence = useMemo(() => {
    if (!sequence.length) return SENTENCES[index];
    return SENTENCES[sequence[index]];
  }, [index, sequence]);

  useEffect(() => {
    if (!sequence.length) return;

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
  }, [intervalMs, sequence]);

  return (
    <span className="inline-block">
      {name}{" "}
      <span className="relative inline-block align-baseline">
        <span aria-hidden="true" className="invisible select-none">
          {LONGEST_SENTENCE}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentSentence}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: { transition: { staggerChildren: 0.03 } },
              hidden: { transition: { staggerChildren: 0.01, staggerDirection: 1 } },
            }}
            className="absolute left-0 top-0 w-full"
          >
            {currentSentence.split(" ").map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block whitespace-nowrap">
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    variants={{
                      hidden: { opacity: 0, filter: "blur(5px)" },
                      visible: { opacity: 1, filter: "blur(0px)" },
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
                <span className="inline-block">&nbsp;</span>
              </span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

export default HeroSentenceCycler;
