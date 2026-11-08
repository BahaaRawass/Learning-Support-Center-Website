// Centralized CORS headers.
// All Edge Functions must respond to OPTIONS preflight requests
// before the browser will allow the actual POST/GET.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Bearer-token API; cookies are not accepted.
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-request-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "x-request-id",
};
