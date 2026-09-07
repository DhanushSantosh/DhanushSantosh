"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
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

  // Whether this element is worth animating at all — decided once, shortly
  // after mount, by checking if it's already sitting in the viewport. An
  // element already visible has nothing to "reveal" and just stays at the
  // resting "visible" variant permanently (see animateState below); only
  // elements genuinely off-screen at mount get the scroll-triggered
  // treatment, and since the visitor can't see an off-screen element's
  // starting state, there's no flash even for those. An earlier version of
  // this check used a plain useEffect with no retry, which could run before
  // layout had actually settled and misjudge above-the-fold content as
  // off-screen — the rAF retry loop guards against that.
  const [shouldAnimate, setShouldAnimate] = useState(false);
  useEffect(() => {
    if (shouldReduceMotion) return;

    let frame: number;
    const check = () => {
      const node = ref.current;
      if (!node) return;
      const viewportHeight = window.innerHeight;
      if (!viewportHeight) {
        frame = requestAnimationFrame(check);
        return;
      }
      const alreadyVisible = node.getBoundingClientRect().top < viewportHeight;
      if (!alreadyVisible) setShouldAnimate(true);
    };

    frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, [shouldReduceMotion]);

  const animateState =
    shouldReduceMotion || !shouldAnimate ? "visible" : isInView ? "visible" : "hidden";

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
      // `initial={false}` is framer-motion's documented pattern for exactly
      // this: skip the separate "animate from initial" phase on mount and
      // just render directly at whatever `animate` currently resolves to —
      // computed synchronously, so it applies in the server-rendered HTML
      // too, with no dependency on JS ever executing. animateState starts
      // at "visible" until shouldAnimate says otherwise, so content is
      // visible-by-default: real resilience against a blocked or failed JS
      // bundle (not just a scripting-disabled visitor, which <noscript>
      // elsewhere already covers), not only for visitors with JS disabled.
      // Keeping this as the same MotionTag throughout the component's
      // lifecycle (rather than swapping to a plain element and back) also
      // matters mechanically: useInView's observer is wired to `ref` once
      // and doesn't reattach if the underlying DOM node gets replaced by a
      // remount, which swapping element types would cause.
      initial={false}
      animate={animateState}
      variants={REVEAL_VARIANTS}
      transition={transition}
      className={`${REVEAL_BASE_CLASS} ${className ?? ""}`.trim()}
    >
      {children}
    </MotionTag>
  );
}
