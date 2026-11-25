import {
  addSemester,
  fetchSemseters,
} from "@/services/student_affairs/SemestersService";
import type { NewSemester, Semester } from "@/types/Student Affiars/semesters";
import type { MutationOptions } from "@/types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useSemesters() {
  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<PostgrestError | null>(null);

  const queryClient = useQueryClient();

  const {
    data: Semesters,
    isLoading,
    error: QueryError,
  } = useQuery<Semester[], PostgrestError>({
    queryKey: ["semesters"],
    queryFn: fetchSemseters,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const AddMutation = useMutation<Semester, PostgrestError, NewSemester>({
    mutationFn: addSemester,
    onMutate: () => setLoading(true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["semesters"] }),
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  async function AddSemester(
    semester: NewSemester,
    options?: MutationOptions<Semester, NewSemester>,
  ) {
    const { isSuccess, data, mutateAsync } = AddMutation;

    await mutateAsync(semester, options);

    return isSuccess ? data : null;
  }

  return {
    Semesters,
    Loading: isLoading || Loading,
    Error: QueryError || Error,
    AddSemester,
  };
}
