import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { GITHUB_TAGS } from "@/lib/github";
import { isBearerTokenAuthorized } from "@/lib/request-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isBearerTokenAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
  }

  revalidateTag(GITHUB_TAGS.profile, "max");
  revalidateTag(GITHUB_TAGS.activity, "max");
  revalidateTag(GITHUB_TAGS.projects, "max");

  return NextResponse.json({
    ok: true,
    refreshed: ["github-profile", "github-activity", "github-projects"],
  });
}
