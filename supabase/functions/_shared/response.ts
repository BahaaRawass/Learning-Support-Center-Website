import { corsHeaders } from "./cors.ts";

/**
 * Builds a standard JSON response with CORS headers attached.
 * Having one place that constructs responses prevents inconsistencies
 * across functions (missing headers, wrong Content-Type, etc.)
 */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Parses and validates the JSON body from an incoming Request.
 * Returns a typed object or throws with a clear message.
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  req: Request,
): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Invalid or missing JSON body");
  }
}
