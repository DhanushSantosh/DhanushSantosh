export const cvConfig = {
  title: "Dhanush Santosh CV",
  fileName: "dhanush-santosh-cv.pdf",
  fileUrl: "/cv/dhanush-santosh-cv.pdf",
  pageUrl: "/cv",
  downloadUrl: "/cv/download",
  downloadName: "dhanush-santosh-cv.pdf",
  lastUpdatedLabel: "Updated June 2026",
} as const;

export type CvConfig = typeof cvConfig;
