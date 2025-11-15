"use client";

import dynamic from "next/dynamic";

const DynamicSculpture = dynamic(
  () =>
    import("@/components/OrbitalSculpture").then(
      (module) => module.OrbitalSculpture,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto h-[420px] w-full max-w-[420px] animate-pulse rounded-[32px] border border-white/10 bg-black" />
    ),
  },
);

export function ClientSculpture() {
  return <DynamicSculpture />;
}

export default ClientSculpture;
