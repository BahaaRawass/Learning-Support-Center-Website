import type { Tables } from "./types";

type RegisteredStudentsTable = Tables["Registered_Students"];

export type RegisteredStudent = RegisteredStudentsTable["Row"];

export type NewRegisteredStudent = RegisteredStudentsTable["Insert"];

export type RegisteredStudentUpdate = RegisteredStudentsTable["Update"];
