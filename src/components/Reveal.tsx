"use client";

import {
  useMemo,
  useRef,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type PropsWithChildren,
  type RefAttributes,
} from "react";
import { m, useInView, useReducedMotion, type MotionProps } from "framer-motion";
import usePerformanceAudit from "@/hooks/usePerformanceAudit";

const REVEAL_VIEWPORT_AMOUNT = 0.2;
const REVEAL_VIEWPORT_MARGIN = "-15% 0px -10% 0px";
const REVEAL_DURATION_S = 0.9;
const REVEAL_DELAY_DEFAULT_S = 0;
const REVEAL_OFFSET_PX = 32;
const REVEAL_REST_OFFSET_PX = 0;
const REVEAL_OPACITY_HIDDEN = 0;
const REVEAL_OPACITY_VISIBLE = 1;
const REVEAL_EASING: [number, number, number, number] = [0.16, 1, 0.3, 1];
const REVEAL_BASE_CLASS = "will-change-transform will-change-opacity";

const REVEAL_VARIANTS = {
  hidden: { opacity: REVEAL_OPACITY_HIDDEN, y: REVEAL_OFFSET_PX },
  visible: { opacity: REVEAL_OPACITY_VISIBLE, y: REVEAL_REST_OFFSET_PX },
};

const MOTION_TAGS = {
  div: m.div,
  section: m.section,
  article: m.article,
} as const;

type SupportedTag = keyof typeof MOTION_TAGS;

type RevealProps = PropsWithChildren<{
  delay?: number;
  as?: SupportedTag;
  className?: string;
}>;

export function Reveal(props: RevealProps) {
  const { children, delay = REVEAL_DELAY_DEFAULT_S, as = "div", className } = props;
  const ref = useRef<HTMLElement | null>(null);
  const isAudit = usePerformanceAudit();
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, {
    margin: REVEAL_VIEWPORT_MARGIN,
    amount: REVEAL_VIEWPORT_AMOUNT,
    once: true,
  });
  const shouldReduceMotion = Boolean(isAudit || prefersReducedMotion);
  const animateState = shouldReduceMotion ? "visible" : isInView ? "visible" : "hidden";
  const initialState = shouldReduceMotion ? false : "hidden";

  const transition = useMemo(() => {
    if (shouldReduceMotion) return undefined;
    return { duration: REVEAL_DURATION_S, ease: REVEAL_EASING, delay };
  }, [delay, shouldReduceMotion]);

  const MotionTag = MOTION_TAGS[as] as ForwardRefExoticComponent<
    MotionProps & HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>
  >;

  return (
    <MotionTag
      ref={ref}
      initial={initialState}
      animate={animateState}
      variants={REVEAL_VARIANTS}
      transition={transition}
      className={`${REVEAL_BASE_CLASS} ${className ?? ""}`.trim()}
    >
      {children}
    </MotionTag>
  );
}
