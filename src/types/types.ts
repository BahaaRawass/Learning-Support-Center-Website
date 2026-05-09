import type { PostgrestError } from "@supabase/supabase-js";
import type { Dispatch, SetStateAction, SubmitEvent } from "react";
import type { Database } from "../../database.types";
import type { StudentInput } from "./students";
import type { UserInput } from "./users";
import type { Department } from "./department";

export type UpdaterFunction<T> = Dispatch<SetStateAction<T>>;

export type PublicSchema = Database["public"];

export type Tables = PublicSchema["Tables"];

export type Data<T> =
  | {
      data: T;
      error: null;
    }
  | { data: null; error: PostgrestError };

type UpdateFieldsType<T> = (fields: Partial<T>) => void;

type StudentMode = {
  mode: "student";
  studentInput: StudentInput;
  handleStudentSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
  updateFields: UpdateFieldsType<StudentInput>;
  userInput?: never;
  handleUserSubmit?: never;
};

type UserMode = {
  mode: "user";
  userInput: UserInput;
  handleUserSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
  updateFields: UpdateFieldsType<UserInput>;
  studentInput?: never;
  handleStudentSubmit?: never;
};

export type InputFormProps = {
  loading: boolean;
  Departments: Department[];
} & (StudentMode | UserMode);
