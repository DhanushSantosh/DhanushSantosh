"use client";

import type { PropsWithChildren } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

const MOTION_FEATURES = domAnimation;
const REDUCED_MOTION_SETTING = "user";

export function MotionRoot({ children }: PropsWithChildren) {
  return (
    <LazyMotion strict features={MOTION_FEATURES}>
      <MotionConfig reducedMotion={REDUCED_MOTION_SETTING}>{children}</MotionConfig>
    </LazyMotion>
  );
}

export default MotionRoot;
