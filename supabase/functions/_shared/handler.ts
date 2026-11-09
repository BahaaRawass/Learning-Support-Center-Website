import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getAdminClient } from "./adminClient.ts";
import { AppError, providerError, serializeError } from "./errors.ts";
import { createLogger, type Logger } from "./logger.ts";
import { jsonResponse, parseJsonBody } from "./response.ts";
import type { StaffRole } from "./contracts.ts";

export interface FunctionContext {
  admin: SupabaseClient;
  caller: User;
  token: string;
  requestId: string;
  log: Logger;
}

export interface FunctionDefinition {
  name: string;
  roles: readonly StaffRole[] | "anonymous";
  allowAnonymous?: boolean;
  status?: number;
  execute: (body: Record<string, unknown>, context: FunctionContext) => Promise<unknown>;
}

// Every endpoint uses this wrapper. Only preflight and method handling precede
// the guard; no request body or business logic is run before authorization.
export function createEdgeHandler(definition: FunctionDefinition, getClient = getAdminClient) {
  return async (req: Request): Promise<Response> => {
    const suppliedId = req.headers.get("x-request-id");
    const requestId = suppliedId && /^[0-9a-f-]{36}$/i.test(suppliedId) ? suppliedId : crypto.randomUUID();
    const log = createLogger(definition.name, requestId);
    const start = performance.now();
    log.info("request.received");
    try {
      if (req.method === "OPTIONS") {
        log.info("request.preflight");
        return jsonResponse({ data: null, error: null }, 200, requestId);
      }
      if (req.method !== "POST") throw new AppError("Only POST is supported.", 405, "method_not_allowed");
      log.info("authentication.started");
      const token = /^Bearer\s+(\S+)$/i.exec(req.headers.get("authorization") ?? "")?.[1];
      if (!token) throw new AppError("Authentication is required.", 401, "unauthenticated");
      const admin = getClient();
      // Live verification rejects expired tokens and deleted users. Never
      // authorize with decoded JWT claims or user-editable user_metadata.
      const { data, error } = await admin.auth.getUser(token);
      if (error) {
        if (!error.status || error.status === 429 || error.status >= 500) {
          throw providerError(error, "Authentication service is unavailable.", "authentication_unavailable", 503);
        }
        throw new AppError("Your session is invalid or expired.", 401, "unauthenticated");
      }
      const caller = data.user;
      if (!caller) throw new AppError("Authentication is required.", 401, "unauthenticated");
      const anonymous = caller.is_anonymous === true;
      const acceptsAnonymous = definition.roles === "anonymous" || definition.allowAnonymous === true;
      if (definition.roles !== "anonymous" && (anonymous ? !acceptsAnonymous : !caller.email_confirmed_at)) {
        throw new AppError("A confirmed staff account is required.", 401, "unauthenticated");
      }
      log.info("authentication.completed", { actorId: caller.id });
      log.info("authorization.started");
      if (caller.banned_until && Date.parse(caller.banned_until) > Date.now()) {
        throw new AppError("This account is suspended.", 403, "account_suspended");
      }
      const allowed = anonymous
        ? acceptsAnonymous
        : definition.roles !== "anonymous" && definition.roles.includes(caller.app_metadata?.role);
      if (!allowed) throw new AppError("You are not authorized to perform this action.", 403, "forbidden");
      log.info("authorization.completed");
      log.info("body.parsing");
      const body = await parseJsonBody(req);
      log.info("body.parsed");
      const result = await definition.execute(body, { admin, caller, token, requestId, log });
      log.info("request.completed", { status: definition.status ?? 200, durationMs: Math.round(performance.now() - start) });
      return jsonResponse({ data: result, error: null }, definition.status ?? 200, requestId);
    } catch (error) {
      const safeError = serializeError(error);
      log.error("request.failed", safeError);
      return jsonResponse({ data: null, error: safeError }, safeError.status ?? 500, requestId);
    }
  };
}
