import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { cvConfig } from "@/config/cv";

export const runtime = "nodejs";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "cv", cvConfig.fileName);
  const fileBuffer = await readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${cvConfig.downloadName}"`,
      "Content-Type": "application/pdf",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
