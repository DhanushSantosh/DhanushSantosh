import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { isBearerTokenAuthorized, verifyGitHubWebhookSignature } from "./request-auth";

describe("protected GitHub refresh authentication", () => {
  it("accepts only the configured bearer token", () => {
    expect(isBearerTokenAuthorized("Bearer cron-secret", " cron-secret ")).toBe(true);
    expect(isBearerTokenAuthorized("Bearer wrong", "cron-secret")).toBe(false);
    expect(isBearerTokenAuthorized(null, "cron-secret")).toBe(false);
    expect(isBearerTokenAuthorized("Bearer cron-secret", "")).toBe(false);
  });

  it("verifies GitHub HMAC signatures and rejects malformed inputs", () => {
    const payload = JSON.stringify({ repository: { full_name: "DhanushSantosh/DeskCrafter" } });
    const secret = "webhook-secret";
    const signature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

    expect(verifyGitHubWebhookSignature(payload, signature, secret)).toBe(true);
    expect(verifyGitHubWebhookSignature(`${payload} `, signature, secret)).toBe(false);
    expect(verifyGitHubWebhookSignature(payload, "sha256=invalid", secret)).toBe(false);
    expect(verifyGitHubWebhookSignature(payload, null, secret)).toBe(false);
  });
});
