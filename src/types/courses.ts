import type { Tables } from "./types";

type CoursesTable = Tables["Courses"]

export type Course = CoursesTable["Row"];