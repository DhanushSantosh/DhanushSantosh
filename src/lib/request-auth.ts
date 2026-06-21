import { createHmac, timingSafeEqual } from "node:crypto";

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isBearerTokenAuthorized(authorization: string | null, secret: string | null | undefined) {
  const normalizedSecret = secret?.trim();
  if (!normalizedSecret || !authorization) return false;
  return constantTimeEqual(authorization, `Bearer ${normalizedSecret}`);
}

export function verifyGitHubWebhookSignature(payload: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  return constantTimeEqual(signature, expected);
}
