import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Creates a Supabase admin client using the service role key.
 *
 * WHY: The service role key bypasses Row Level Security and has full
 * access to auth.users. It must ONLY exist inside Edge Functions —
 * never in frontend code. Using createClient here (server-side)
 * instead of the frontend client ensures the key stays secret.
 */
export function getAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable auto session persistence — Edge Functions are stateless.
      // Each invocation is a fresh execution context.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}