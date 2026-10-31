import {
  addRegisteredStudent,
  deleteRegisteredStudent,
  fetchRegisteredStudents,
  updateRegisteredStudent,
} from "@/services/student_affairs/RegistrationService";
import type {
  RegisteredStudent,
  RegisteredStudentInsert,
  RegisteredStudentUpdate,
} from "@/types/student-affairs";
import type { MutationOptions } from "@/types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function useRegister() {
  const queryClient = useQueryClient();

  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<PostgrestError | null>(null);

  const {
    data: RegisteredStudents,
    isLoading,
    error: QueryError,
  } = useQuery<RegisteredStudent[], PostgrestError>({
    queryKey: ["registered-students"],
    queryFn: fetchRegisteredStudents,
  });

  const AddRegisteredStudentMutation = useMutation<
    RegisteredStudent,
    PostgrestError,
    RegisteredStudentInsert
  >({
    mutationFn: addRegisteredStudent,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registered-students"] });
    },
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  const UpdateRegisteredStudentMutation = useMutation<
    RegisteredStudent,
    PostgrestError,
    { id: RegisteredStudent["id"]; student: RegisteredStudentUpdate }
  >({
    mutationFn: updateRegisteredStudent,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registered-students"] });
    },
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  const DeleteRegisteredStudentMutation = useMutation<
    boolean,
    PostgrestError,
    RegisteredStudent["id"]
  >({
    mutationFn: deleteRegisteredStudent,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registered-students"] });
    },
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  async function AddRegisteredStudent(
    student: RegisteredStudentInsert,
    options?: MutationOptions<RegisteredStudent, RegisteredStudentInsert>,
  ) {
    const { mutateAsync, isSuccess, data } = AddRegisteredStudentMutation;

    await mutateAsync(student, options);

    return isSuccess ? data : null;
  }

  async function UpdateRegisteredStudent(
    id: RegisteredStudent["id"],
    student: RegisteredStudentUpdate,
    options?: MutationOptions<
      RegisteredStudent,
      { id: RegisteredStudent["id"]; student: RegisteredStudentUpdate }
    >,
  ) {
    const { mutateAsync, isSuccess, data } = UpdateRegisteredStudentMutation;

    await mutateAsync({ id, student }, options);

    return isSuccess ? data : null;
  }

  async function DeleteRegisteredStudent(
    id: RegisteredStudent["id"],
    options?: MutationOptions<boolean, RegisteredStudent["id"]>,
  ) {
    const { mutateAsync, isSuccess } = DeleteRegisteredStudentMutation;

    await mutateAsync(id, options);

    return isSuccess;
  }

  return {
    RegisteredStudents,
    Loading: isLoading || Loading,
    Error: QueryError || Error,
    AddRegisteredStudent,
    UpdateRegisteredStudent,
    DeleteRegisteredStudent,
  };
}
