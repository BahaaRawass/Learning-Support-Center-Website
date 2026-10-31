import type { DeepNonNullable, Tables } from "./types";
import type { TimeSlot } from "./users";

type RegisteredStudentsTable = Tables["Registered_Students"];

export type RegisteredStudent = DeepNonNullable<RegisteredStudentsTable["Row"]>;

export type RegisteredStudentInsert = RegisteredStudentsTable["Insert"];

export type RegisteredStudentInput = Omit<
  RegisteredStudentInsert,
  "id" | "created_at" | "timeslots"
> & {
  timeslots: TimeSlot[];
};

export type RegisteredStudentUpdate = RegisteredStudentsTable["Update"];
