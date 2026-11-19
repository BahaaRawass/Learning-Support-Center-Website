import type { Tables } from "./types";

type DepartmentTable = Tables["Department"];

export type Department = DepartmentTable["Row"];
