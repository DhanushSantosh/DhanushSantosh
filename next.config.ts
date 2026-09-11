import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);

// Next.js expects bare hostnames here (no protocol, no port) — passing a full
// URL string silently fails to match, and every dev-resource request (JS
// chunks, RSC payloads) gets blocked with no client-visible error beyond a
// generic 500, leaving only the plain server-rendered HTML (e.g. the navbar)
// visible with nothing hydrating below it.
const allowedDevOriginsEnvVar = "NEXT_ALLOWED_DEV_ORIGINS";
const defaultAllowedDevOrigin = "100.121.17.93";
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
  // www and apex currently serve identical content with no redirect between
  // them, which splits search-engine authority across two hostnames with no
  // canonical signal. Apex is the canonical domain (see brandConfig), so www
  // permanently redirects to it.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.dhanushsantosh.in" }],
        destination: "https://dhanushsantosh.in/:path*",
        permanent: true,
      },
    ];
  },
  // nosniff/referrer/permissions-policy carry no functional risk and apply
  // everywhere. CSP is intentionally Report-Only rather than enforced: the
  // project preview feature (VideoModal) embeds arbitrary external live-site
  // URLs per project, which a real frame-src allowlist can't accommodate
  // without defeating the point of restricting it — enforcing a guessed
  // policy risks silently breaking that feature. Report-Only surfaces real
  // violations (via the browser console) without blocking anything, so it
  // can be tightened into an enforced policy once actual traffic confirms
  // what it needs to allow.
  async headers() {
    const contentSecurityPolicyReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.github.com https://github.com",
      "frame-src https:",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicyReportOnly },
        ],
      },
      // Vercel's own production alias (profile-site-*.vercel.app) serves the
      // exact same content as the real domain but isn't covered by the
      // git-branch preview deployments' automatic noindex/SSO protection —
      // it was publicly crawlable with no signal telling search engines not
      // to index it as a duplicate. The <link rel="canonical"> every page
      // already sets should make Google consolidate to the real domain
      // regardless, but an explicit noindex on any host that isn't the real
      // one is a firmer, more direct signal than relying on canonical
      // resolution alone — and costs nothing on the domain that matters,
      // since `missing` only matches requests where the host is *not*
      // dhanushsantosh.in.
      {
        source: "/:path*",
        missing: [{ type: "host", value: "dhanushsantosh.in" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
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
