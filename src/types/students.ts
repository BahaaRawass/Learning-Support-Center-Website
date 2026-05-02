import type { Tables } from "./types";

type StudentsTable = Tables["Students"];

export type Student = StudentsTable["Row"];

export type NewStudent = StudentsTable["Insert"];

export type StudentInput = {
  email?: Student["email"];
studentId: Student["studentId"];
  studentName: Student["studentName"];
};
