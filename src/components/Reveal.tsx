"use client";

import {
  motion,
  useAnimation,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { useEffect, useRef, type MutableRefObject, type PropsWithChildren } from "react";

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

const variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function Reveal(props: RevealProps) {
  const { children, delay = 0, as, className, ...rest } = props;
  const elementKey = (as ?? "div") as SupportedTag;
  const MotionTag = elements[elementKey] as typeof motion.div;
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: "-15% 0px -10% 0px",
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set("visible");
      return;
    }
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView, prefersReducedMotion]);

  return (
    <MotionTag
      ref={ref as unknown as MutableRefObject<HTMLDivElement | null>}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
