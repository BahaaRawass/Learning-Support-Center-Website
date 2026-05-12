import { supabaseClient } from "@/supabase-client";
import type { Department } from "@/types/department";
import type { Data } from "@/types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useDepartments() {
  const [Departments, setDepartments] = useState<Department[]>([]);
  const [Loading, setLoading] = useState<boolean>(true);
  const [Error, setError] = useState<string>("");

  function resetStates() {
    setLoading(true);
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `An Error Occurred: Error Code: ${error.code}\nError Message: ${error.message}`;
    setError(msg);
    setLoading(false);
  }

  useEffect(() => {
    async function fetchDepartments() {
      resetStates();

      const { data, error: FetchError } = (await supabaseClient
        .from("Department")
        .select("*")) as Data<Department[]>;

      if (FetchError) return SetError(FetchError);

      setDepartments(data || []);
      setLoading(false);
    }
    fetchDepartments();
  }, []);

  return { Departments, Loading, Error };
}
