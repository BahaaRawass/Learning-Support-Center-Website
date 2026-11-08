import { FunctionsHttpError, type SupabaseClient } from "@supabase/supabase-js";
import type { EdgeFunctionError, EdgeFunctionMap } from "./functions.types.ts";

function isError(value: unknown): value is EdgeFunctionError {
  if (!value || typeof value !== "object") return false;
  const error = value as Record<string, unknown>;
  return typeof error.message === "string" &&
    (error.status === undefined || typeof error.status === "number") &&
    (error.code === undefined || typeof error.code === "string") &&
    (error.name === undefined || typeof error.name === "string");
}

// Always return an envelope, including HTTP, transport, and session failures.
export async function invokeFunction<T extends keyof EdgeFunctionMap>(
  supabase: SupabaseClient,
  name: T,
  body: EdgeFunctionMap[T]["body"],
): Promise<EdgeFunctionMap[T]["response"]> {
  const failure = (error: EdgeFunctionError): EdgeFunctionMap[T]["response"] => ({ data: null, error });
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return failure({ message: sessionError.message, status: sessionError.status, code: sessionError.code, name: sessionError.name });
    if (!sessionData.session) return failure({ message: "Authentication is required.", status: 401, code: "unauthenticated" });

    const { data, error } = await supabase.functions.invoke<EdgeFunctionMap[T]["response"]>(name, {
      body, headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    });
    if (error instanceof FunctionsHttpError) {
      const response = error.context as Response;
      const envelope: unknown = await response.clone().json().catch(() => null);
      if (envelope && typeof envelope === "object" && "error" in envelope && isError(envelope.error)) {
        return failure({ ...envelope.error, status: envelope.error.status ?? response.status });
      }
      return failure({ message: "The server could not complete the request.", status: response.status, code: "function_http_error", name: error.name });
    }
    if (error) return failure({ message: "Unable to reach the server. Please try again.", code: "function_transport_error", name: error.name });
    if (!data || typeof data !== "object" || !("data" in data) || !("error" in data) ||
      (data.error !== null && !isError(data.error)) ||
      (data.error !== null && data.data !== null) || (data.error === null && data.data === null)) {
      return failure({ message: "The server returned an invalid response.", status: 502, code: "invalid_function_response" });
    }
    return data;
  } catch {
    return failure({ message: "Unable to complete the request. Please try again.", code: "function_transport_error" });
  }
}
