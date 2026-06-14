import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { GITHUB_TAGS, isFeaturedRepository } from "@/lib/github";

export const runtime = "nodejs";

const SUPPORTED_EVENTS = new Set(["create", "delete", "public", "push", "release", "repository"]);

function verifyGitHubWebhookSignature(payload: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

function revalidateGitHubTags(includeFeatured: boolean) {
  revalidateTag(GITHUB_TAGS.profile, "max");
  revalidateTag(GITHUB_TAGS.activity, "max");
  revalidateTag(GITHUB_TAGS.projects, "max");
  if (includeFeatured) {
    revalidateTag(GITHUB_TAGS.featured, "max");
  }
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

  const body = JSON.parse(payload) as {
    repository?: { full_name?: string };
  };

  const repoFullName = body.repository?.full_name ?? null;
  const includeFeatured = isFeaturedRepository(repoFullName);
  revalidateGitHubTags(includeFeatured || event === "repository");

  return NextResponse.json({
    ok: true,
    event,
    repo: repoFullName,
    refreshed: includeFeatured
      ? ["github-profile", "github-activity", "github-projects", "github-featured"]
      : ["github-profile", "github-activity", "github-projects"],
  });
}
