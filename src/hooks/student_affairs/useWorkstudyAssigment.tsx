import {
  addWorkstudyAssignment,
  deleteWorkstudyAssignment,
  fetchWorkstudyAssignments,
} from "@/services/student_affairs/WorkstudyAssigmentService";
import type {
  NewWorkstudyAssignment,
  WorkstudyAssignment,
} from "@/types/Student Affiars/workstudy_assigment";
import type { MutationOptions } from "@/types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function useWorkstudyAssigment() {
  const queryClient = useQueryClient();

  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<PostgrestError | null>(null);

  const {
    data: WorkstudyAssignments,
    error: QueryError,
    isLoading,
  } = useQuery({
    queryKey: ["workstudy-assigments"],
    queryFn: fetchWorkstudyAssignments,
  });

  const AddMutation = useMutation<
    WorkstudyAssignment,
    PostgrestError,
    NewWorkstudyAssignment
  >({
    mutationFn: addWorkstudyAssignment,
    onMutate: () => setLoading(true),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workstudy-assigments"] }),
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  const DeleteMutation = useMutation<
    boolean,
    PostgrestError,
    WorkstudyAssignment["id"]
  >({
    mutationFn: deleteWorkstudyAssignment,
    onMutate: () => setLoading(true),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workstudy-assigments"] }),
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  async function AddWorkstudyAssignment(
    workstudyAssignment: NewWorkstudyAssignment,
    options?: MutationOptions<WorkstudyAssignment, NewWorkstudyAssignment>,
  ) {
    const { isSuccess, data, mutateAsync } = AddMutation;

    await mutateAsync(workstudyAssignment, options);

    return isSuccess ? data : null;
  }

  async function DeleteWorkstudyAssignment(
    id: WorkstudyAssignment["id"],
    options?: MutationOptions<boolean, WorkstudyAssignment["id"]>,
  ) {
    const { isSuccess, mutateAsync } = DeleteMutation;

    await mutateAsync(id, options);

    return isSuccess;
  }

  return {
    WorkstudyAssignments,
    Loading: isLoading || Loading,
    Error: QueryError || Error,
    AddWorkstudyAssignment,
    DeleteWorkstudyAssignment,
  };
}
