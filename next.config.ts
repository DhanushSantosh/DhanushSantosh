import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);

const allowedDevOriginsEnvVar = "NEXT_ALLOWED_DEV_ORIGINS";
const defaultAllowedDevOrigin = "http://100.117.16.122:3000";
const allowedDevOrigins =
  process.env[allowedDevOriginsEnvVar]
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [defaultAllowedDevOrigin];

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  disable: process.env.NODE_ENV === "development" || process.env.NEXT_DISABLE_PWA === "true",
  globPublicPatterns: ["*.jpg", "*.png"],
  register: true,
  swDest: "public/sw.js",
  swSrc: "src/app/sw.ts",
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
    minimumCacheTTL: 31536000,
  },
  // Next 16's bundled dev Webpack collides with PDF.js's internal export scope.
  // Turbopack avoids that upstream bug; production remains on Webpack for Serwist.
  turbopack: {
    resolveAlias: {
      three: "./src/lib/react-three-fiber-three.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias["three$"] = path.resolve(process.cwd(), "src/lib/react-three-fiber-three.ts");
    return config;
  },
};

export default withBundleAnalyzer(withSerwist(nextConfig));
