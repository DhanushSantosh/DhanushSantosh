"use client";

import dynamic from "next/dynamic";

const CustomPdfViewer = dynamic(() => import("./CustomPdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[75vh] w-full items-center justify-center bg-neutral-900">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
    </div>
  ),
});

export default function PdfViewerWrapper({ fileUrl }: { fileUrl: string }) {
  return <CustomPdfViewer fileUrl={fileUrl} />;
}
