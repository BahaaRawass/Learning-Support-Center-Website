import { supabaseClient } from "@/supabase-client";
import type {
  NewWorkstudyAssignment,
  WorkstudyAssignment,
} from "@/types/Student Affiars/workstudy_assigment";
import type { Data } from "@/types/types";

export async function fetchWorkstudyAssignments() {
  const { data, error } = (await supabaseClient
    .from("Workstudy Assigments")
    .select("*")) as Data<WorkstudyAssignment[]>;

  if (error) throw error;

  return data;
}

export async function addWorkstudyAssignment(
  workstudyAssignment: NewWorkstudyAssignment,
) {
  const { data, error } = (await supabaseClient
    .from("Workstudy Assigments")
    .insert(workstudyAssignment)
    .select("*")
    .single()) as Data<WorkstudyAssignment>;

  if (error) throw error;

  return data;
}

export async function deleteWorkstudyAssignment(id: WorkstudyAssignment["id"]) {
  const { error } = await supabaseClient
    .from("Workstudy Assigments")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
