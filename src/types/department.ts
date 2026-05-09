import type { Tables } from "./types";

export type DepartmentTable = Tables["Department"]

export type Department = DepartmentTable["Row"];