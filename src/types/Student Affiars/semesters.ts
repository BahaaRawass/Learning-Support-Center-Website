import type { Tables } from "../types";

type SemesterTable = Tables["Semesters"];

export type Semester = SemesterTable["Row"];

export type SemesterInput = Omit<SemesterTable["Insert"], "id">;

export type NewSemester = SemesterTable["Insert"];

export type SemesterTerm = Semester["term"];