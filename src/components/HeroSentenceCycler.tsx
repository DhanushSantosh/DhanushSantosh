"use client";

import { useEffect, useState } from "react";

const SENTENCES = [
  "designs cinematic software.",
  "crafts standout product flows.",
  "codes expressive launch systems.",
  "shapes bold digital moments.",
];

const LONGEST_SENTENCE = SENTENCES.reduce(
  (longest, sentence) => (sentence.length > longest.length ? sentence : longest),
  ""
);

type HeroSentenceCyclerProps = {
  name: string;
  intervalMs?: number;
};

const FADE_DURATION_MS = 400;

export function HeroSentenceCycler({ name, intervalMs = 6000 }: HeroSentenceCyclerProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fadeTimeout: number | null = null;
    const interval = window.setInterval(() => {
      setVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % SENTENCES.length);
        setVisible(true);
      }, FADE_DURATION_MS);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
      if (fadeTimeout) {
        window.clearTimeout(fadeTimeout);
      }
    };
  }, [intervalMs]);

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
          {SENTENCES[index]}
        </span>
      </span>
    </span>
  );
}

export default HeroSentenceCycler;
