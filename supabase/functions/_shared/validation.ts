import { AppError } from "./errors.ts";

export function invalid(field: string): never {
  throw new AppError(
    `Missing or invalid field: ${field}.`,
    400,
    "validation_error",
  );
}

export function stringField(
  body: Record<string, unknown>,
  field: string,
  max: number,
  trim = true,
): string {
  const value = body[field];
  if (typeof value !== "string") return invalid(field);
  const result = trim ? value.trim() : value;
  if (!result || result.length > max) return invalid(field);
  return result;
}

export function emailField(
  body: Record<string, unknown>,
  field: string,
  displayName = false,
): string {
  const value = stringField(body, field, 320);
  const address = displayName
    ? (value.match(/^[^<>\r\n]+<([^<>]+)>$/)?.[1] ?? value)
    : value;
  if (
    /[\r\n]/.test(value) ||
    !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(address)
  )
    return invalid(field);
  return value;
}

export function httpUrl(value: string, field: string): string {
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return invalid(field);
    if (
      url.protocol === "http:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
      return invalid(field);
    return url.href;
  } catch {
    return invalid(field);
  }
}
