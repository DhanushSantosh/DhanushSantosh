import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { GITHUB_TAGS } from "@/lib/github";
import { verifyGitHubWebhookSignature } from "@/lib/request-auth";

export const runtime = "nodejs";

const SUPPORTED_EVENTS = new Set(["create", "delete", "public", "pull_request", "push", "release", "repository"]);

function revalidateGitHubTags() {
  revalidateTag(GITHUB_TAGS.profile, "max");
  revalidateTag(GITHUB_TAGS.activity, "max");
  revalidateTag(GITHUB_TAGS.projects, "max");
}

export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Missing GITHUB_WEBHOOK_SECRET" }, { status: 500 });
  }

  const event = request.headers.get("x-github-event");
  const signature = request.headers.get("x-hub-signature-256");
  const payload = await request.text();

  if (!verifyGitHubWebhookSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  if (!event || !SUPPORTED_EVENTS.has(event)) {
    return NextResponse.json({ ok: true, ignored: true, reason: "Unsupported event" });
  }

  let body: { repository?: { full_name?: string } };
  try {
    body = JSON.parse(payload) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const repoFullName = body.repository?.full_name ?? null;
  revalidateGitHubTags();

  return NextResponse.json({
    ok: true,
    event,
    repo: repoFullName,
    refreshed: ["github-profile", "github-activity", "github-projects"],
  });
}
