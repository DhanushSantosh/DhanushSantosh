"use client";

import { useEffect, useMemo, useState } from "react";

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

const FADE_DURATION_MS = 400;

export function HeroSentenceCycler({ name, intervalMs = 5000 }: HeroSentenceCyclerProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [sequence, setSequence] = useState<number[]>(() => [...DEFAULT_SEQUENCE]);

  const currentSentence = useMemo(() => {
    if (!sequence.length) return SENTENCES[index];
    return SENTENCES[sequence[index]];
  }, [index, sequence]);

  useEffect(() => {
    if (!sequence.length) return;

    let fadeTimeout: number | null = null;
    const interval = window.setInterval(() => {
      setVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setIndex((prev) => {
          if (prev + 1 >= sequence.length) {
            setSequence(shuffleSequence());
            return 0;
          }
          return prev + 1;
        });
        setVisible(true);
      }, FADE_DURATION_MS);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
      if (fadeTimeout) {
        window.clearTimeout(fadeTimeout);
      }
    };
  }, [intervalMs, sequence]);

  return (
    <span className="inline-block">
      {name}{" "}
      <span className="relative inline-block align-baseline">
        <span aria-hidden="true" className="invisible select-none">
          {LONGEST_SENTENCE}
        </span>
        <span
          className={`absolute left-0 top-0 transition-opacity duration-500 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {currentSentence}
        </span>
      </span>
    </span>
  );
}

export default HeroSentenceCycler;
