import { corsHeaders } from "./cors.ts";
import { AppError } from "./errors.ts";
import type { FunctionResponse } from "./contracts.ts";

export function jsonResponse(
  body: FunctionResponse<unknown>,
  status = 200,
  requestId?: string,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...(requestId ? { "X-Request-ID": requestId } : {}),
    },
  });
}

export async function parseJsonBody(
  req: Request,
): Promise<Record<string, unknown>> {
  if (
    req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    throw new AppError(
      "Content-Type must be application/json.",
      415,
      "unsupported_media_type",
    );
  }
  // Bound the actual streamed body, not just the untrusted Content-Length header.
  const reader = req.body?.getReader();
  if (!reader)
    throw new AppError("A JSON object is required.", 400, "invalid_json");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 65_536) {
        await reader.cancel();
        throw new AppError(
          "Request body is too large.",
          413,
          "payload_too_large",
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new AppError("A valid JSON object is required.", 400, "invalid_json");
  }
}
