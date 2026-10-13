export const runtime = "nodejs";

const MAX_REPORT_BYTES = 16 * 1024;

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function logField(value: unknown): string {
  const text = typeof value === "string" || typeof value === "number" ? String(value) : "unknown";
  return JSON.stringify(text.slice(0, 200).replace(/[\u0000-\u001f\u007f]/g, " "));
}

async function readBoundedBody(request: Request): Promise<{ text: string | null; tooLarge: boolean }> {
  const reader = request.body?.getReader();
  if (!reader) return { text: null, tooLarge: false };

  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_REPORT_BYTES) {
        await reader.cancel().catch(() => {});
        return { text: null, tooLarge: true };
      }
      chunks.push(value);
    }
  } catch {
    return { text: null, tooLarge: false };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { text: new TextDecoder().decode(bytes), tooLarge: false };
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType !== "application/csp-report" && contentType !== "application/reports+json") {
    return new Response(null, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REPORT_BYTES) {
    return new Response(null, { status: 413 });
  }

  const { text, tooLarge } = await readBoundedBody(request);
  if (tooLarge) return new Response(null, { status: 413 });
  if (!text) return new Response(null, { status: 204 });

  try {
    const parsed: unknown = JSON.parse(text);
    const reports = Array.isArray(parsed) ? parsed : [parsed];
    for (const entry of reports) {
      const report = asObject(entry);
      const body = asObject(report?.["csp-report"]) ?? asObject(report?.body);
      if (!body) continue;

      const directive = body["effective-directive"] ?? body.effectiveDirective ?? body["violated-directive"];
      const blocked = body["blocked-uri"] ?? body.blockedURL;
      const document = body["document-uri"] ?? body.documentURL;
      console.error(
        `[csp-report] directive=${logField(directive)} blocked=${logField(blocked)} document=${logField(document)}`,
      );
    }
  } catch {
    // Browsers may send truncated or malformed reports; acknowledge without throwing.
  }

  return new Response(null, { status: 204 });
}
