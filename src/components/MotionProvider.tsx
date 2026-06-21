"use client";

import type { PropsWithChildren } from "react";
import MotionRoot from "@/components/MotionRoot";

function MotionProvider({ children }: PropsWithChildren) {
  return <MotionRoot>{children}</MotionRoot>;
}

export default MotionProvider;
