import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "./errors.ts";

let adminClient: SupabaseClient | undefined;

// One server-only client per isolate. Never set a caller's session on this client.
export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new AppError(
      "Server configuration is incomplete.",
      500,
      "configuration_error",
    );
  }
  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  return adminClient;
}
