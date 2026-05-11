// Centralized CORS headers.
// All Edge Functions must respond to OPTIONS preflight requests
// before the browser will allow the actual POST/GET.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Tighten to your domain in production
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};