import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowDown, FiArrowLeft, FiFileText } from "react-icons/fi";

import { cvConfig } from "@/config/cv";
import PdfViewerWrapper from "@/components/PdfViewerWrapper";

export const metadata: Metadata = {
  title: "CV",
  description: "View and download the latest CV for Dhanush Santosh.",
};

export default function CvPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-black text-white">
      {/* Top Toolbar */}
      <header className="sticky top-0 z-50 flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-white/10 bg-black/80 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/30 hover:bg-white/10"
            aria-label="Back to home"
          >
            <FiArrowLeft />
          </Link>
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <span className="hidden sm:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
              <FiFileText />
            </span>
            <div>
              <h1 className="text-sm font-semibold text-white">{cvConfig.title}</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/45">{cvConfig.fileName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
            {cvConfig.lastUpdatedLabel}
          </div>
          <a
            href={cvConfig.downloadUrl}
            className="group inline-flex items-center justify-center rounded-full border border-white bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)] sm:py-2.5 sm:text-xs"
          >
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">Save</span>
            <FiArrowDown className="ml-2 transition-transform group-hover:translate-y-0.5" />
          </a>
        </div>
      </header>

      {/* Viewer Canvas */}
      <main className="flex-1 bg-neutral-950 p-3 sm:p-6 lg:p-8 flex flex-col">
        <div className="mx-auto flex-1 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_50px_rgba(0,0,0,0.72)] sm:rounded-[32px]">
          <PdfViewerWrapper fileUrl={cvConfig.fileUrl} />
        </div>
      </main>
    </div>
  );
}
