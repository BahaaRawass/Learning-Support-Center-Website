/**
 * Normalizes any thrown value or Supabase error object into
 * a consistent shape. Supabase errors carry status and code
 * in addition to message — we preserve all of them.
 */
export function serializeError(err: unknown): {
  message: string;
  status?: number;
  code?: string;
  name?: string;
} {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    return {
      message: typeof e.message === "string" ? e.message : "Unknown error",
      ...(typeof e.status === "number" && { status: e.status }),
      ...(typeof e.code === "string" && { code: e.code }),
      ...(typeof e.name === "string" && { name: e.name }),
    };
  }

  return { message: String(err) };
}
