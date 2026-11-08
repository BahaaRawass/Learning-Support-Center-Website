import type { EdgeFunctionError } from "./contracts.ts";

// Only messages deliberately written for callers are exposed. Provider messages
// can contain SQL details, addresses, request payloads, or credentials.
export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string, name = "EdgeFunctionError") {
    super(message);
    this.name = name;
    this.status = status;
    this.code = code;
  }
}

export function providerError(error: unknown, message: string, code: string, status = 502): AppError {
  const value = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const providerStatus = typeof value.status === "number" ? value.status : value.statusCode;
  return new AppError(
    message,
    typeof providerStatus === "number" && Number.isInteger(providerStatus) && providerStatus >= 400 && providerStatus <= 599
      ? providerStatus : status,
    typeof value.code === "string" && /^[a-zA-Z0-9_]{1,80}$/.test(value.code) ? value.code : code,
    typeof value.name === "string" && /^[a-zA-Z0-9_]{1,80}$/.test(value.name) ? value.name : "UpstreamError",
  );
}

export function serializeError(error: unknown): EdgeFunctionError {
  if (error instanceof AppError) {
    return { message: error.message, status: error.status, code: error.code, name: error.name };
  }
  return { message: "An unexpected server error occurred.", status: 500, code: "internal_error", name: "EdgeFunctionError" };
}
