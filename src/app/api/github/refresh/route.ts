import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { GITHUB_TAGS } from "@/lib/github";

export const runtime = "nodejs";

function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
  }

  revalidateTag(GITHUB_TAGS.profile, "max");
  revalidateTag(GITHUB_TAGS.activity, "max");
  revalidateTag(GITHUB_TAGS.featured, "max");

  return NextResponse.json({
    ok: true,
    refreshed: ["github-profile", "github-activity", "github-featured"],
  });
}

