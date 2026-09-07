"use client";

import { Component, type ReactNode } from "react";

type WebGLErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type WebGLErrorBoundaryState = {
  hasError: boolean;
};

// react-three-fiber's <Canvas> throws synchronously during mount when it
// can't acquire a WebGL context (WebGL disabled, no GPU driver, some
// headless/locked-down browsers) — none of the dynamic-loading wrappers
// around our three sculptures (DynamicModelLoader, DynamicSculpture) caught
// that: it would propagate straight up through the section and crash that
// part of the render tree instead of degrading to the lightweight fallback
// those wrappers already built for the low-power/reduced-motion case. An
// error boundary is the only way React lets you catch a render-time throw
// like this — hooks and try/catch around JSX can't do it — hence the class
// component. This covers "WebGL unsupported"; a live mid-session
// webglcontextlost event doesn't throw (it's a DOM event on the canvas, not
// a React error) and so isn't caught here — that remains a known, disclosed
// gap, not silently claimed as handled.
export class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  state: WebGLErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
