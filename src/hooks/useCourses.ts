import { supabaseClient } from "@/supabase-client";
import type { Course } from "@/types/courses";
import type { Data } from "@/types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useCourses() {
  const [Courses, setCourses] = useState<Course[]>([]);
  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<string>("");

  function resetStates() {
    setLoading(true);
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `An Error has Occurred\nError Code: ${error.code}\n Error Message: ${error.message}`;
    setError(msg);
    console.error(error);
  }

  useEffect(() => {
    async function fetchCourses() {
      resetStates();

      const { data, error: FetchError } = (await supabaseClient
        .from("Courses")
        .select("*")) as Data<Course[]>;
      if (FetchError) return SetError(FetchError);

      setCourses(data || []);
      setLoading(false);
    }

    fetchCourses();
  }, []);

  return { Courses, Loading, Error };
}
