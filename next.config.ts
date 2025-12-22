import type { NextConfig } from "next";
import withPWA from "next-pwa";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const allowedDevOriginsEnvVar = "NEXT_ALLOWED_DEV_ORIGINS";
const defaultAllowedDevOrigin = "http://100.117.16.122:3000";
const allowedDevOrigins =
  process.env[allowedDevOriginsEnvVar]
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [defaultAllowedDevOrigin];

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || process.env.NEXT_DISABLE_PWA === "true",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
});

const isAnalyze = process.env.ANALYZE === "true";
let withBundleAnalyzer: (config: NextConfig) => NextConfig = (config) => config;

if (isAnalyze) {
  try {
    // Optional dependency: only used when ANALYZE=true and available locally.
    const analyzer = require("@next/bundle-analyzer");
    withBundleAnalyzer = analyzer({ enabled: true, openAnalyzer: false });
  } catch {
    console.warn("Bundle analyzer not installed; skip ANALYZE build.");
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins,
  compiler: {
    // Keep console errors in production, strip noisy logs for smaller bundles.
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
};

export default withBundleAnalyzer(withPWAConfig(nextConfig));
