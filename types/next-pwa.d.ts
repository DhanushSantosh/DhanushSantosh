declare module "next-pwa" {
  import type { NextConfig } from "next";

  export type NextPWAOptions = {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    buildExcludes?: RegExp[];
    customWorkerDir?: string;
    runtimeCaching?: Array<Record<string, unknown>>;
  };

  export default function withPWA(options?: NextPWAOptions): (nextConfig: NextConfig) => NextConfig;
}
