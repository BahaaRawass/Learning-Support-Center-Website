import { SupabaseClient } from "@supabase/supabase-js";
import type { EdgeFunctionMap } from "./functions.types";

export async function invokeFunction<T extends keyof EdgeFunctionMap>(
  supabase: SupabaseClient,
  name: T,
  body: EdgeFunctionMap[T]["body"],
): Promise<EdgeFunctionMap[T]["response"]> {
  const { data, error } = await supabase.functions.invoke<
    EdgeFunctionMap[T]["response"]
  >(name, { body });

  if (error) throw error;

  return data as EdgeFunctionMap[T]["response"];
}
