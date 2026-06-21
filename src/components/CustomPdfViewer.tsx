"use client";

import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiZoomIn, FiZoomOut, FiMaximize } from "react-icons/fi";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Bundle the worker locally so the CV viewer doesn't depend on a third-party CDN at runtime.
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export default function CustomPdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic auto-scaling based on container width
    const updateScale = () => {
      if (containerRef.current) {
        // Assume A4 PDF width is roughly 600px at scale 1.0 (it varies)
        // We will scale down if container is narrower than 800px.
        const width = containerRef.current.clientWidth;
        if (width < 600) {
          setScale(width / 650);
        } else {
          setScale(1.0);
        }
      }
    };
    
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.4));
  const fitToWidth = () => {
    if (containerRef.current) {
      setScale(containerRef.current.clientWidth / 650);
    }
  };

  return (
    <div className="flex h-full w-full flex-col relative" ref={containerRef}>
      {/* Custom Tooling/Fluff removed, but keeping simple zoom buttons for usability */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 rounded-full border border-white/10 bg-black/60 p-1.5 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <button
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Zoom Out"
        >
          <FiZoomOut size={14} />
        </button>
        <button
          onClick={fitToWidth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Fit to Width"
        >
          <FiMaximize size={14} />
        </button>
        <button
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Zoom In"
        >
          <FiZoomIn size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-neutral-900 rounded-2xl md:rounded-[32px] custom-scrollbar">
        <div className="flex flex-col items-center py-8">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
              </div>
            }
            error={
              <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-2 text-white/50">
                <p>Failed to load PDF.</p>
              </div>
            }
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} className="mb-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden">
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="bg-white"
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
