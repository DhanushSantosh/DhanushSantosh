"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { PropsWithChildren } from "react";

const elements = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
} as const;

type SupportedTag = keyof typeof elements;

type RevealProps = PropsWithChildren<
  {
    delay?: number;
    as?: SupportedTag;
  } & HTMLMotionProps<"div">
>;

export function Reveal(props: RevealProps) {
  const { children, delay = 0, as, className, ...rest } = props;
  const elementKey = (as ?? "div") as SupportedTag;
  const MotionTag = elements[elementKey] as typeof motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.4 }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
