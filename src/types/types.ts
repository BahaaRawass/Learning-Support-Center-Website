import type { PostgrestError } from "@supabase/supabase-js";
import type { Dispatch, SetStateAction } from "react";
import type { Database } from "../../database.types";

export type UpdaterFunction<T> = Dispatch<SetStateAction<T>>;

export type PublicSchema = Database["public"];

export type Tables = PublicSchema["Tables"];

export type Data<T> =
  | {
      data: T;
      error: null;
    }
  | { data: null; error: PostgrestError };
