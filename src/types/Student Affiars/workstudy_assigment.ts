import type { Tables } from "../types";

type WorkstudyAssignmentTable = Tables["Workstudy Assigments"];

export type WorkstudyAssignment = WorkstudyAssignmentTable["Row"];

export type NewWorkstudyAssignment = WorkstudyAssignmentTable["Insert"];