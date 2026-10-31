import { supabaseClient } from "@/supabase-client";
import type {
  RegisteredStudent,
  RegisteredStudentInsert,
  RegisteredStudentUpdate,
} from "@/types/student-affairs";
import type { Data } from "@/types/types";

export async function fetchRegisteredStudents() {
  const { data, error } = (await supabaseClient
    .from("Registered_Students")
    .select("*")) as Data<RegisteredStudent[]>;

  if (error) throw error;

  return data;
}

export async function addRegisteredStudent(student: RegisteredStudentInsert) {
  
  const { data, error } = (await supabaseClient
    .from("Registered_Students")
    .insert(student)
    .select("*")
    .single()) as Data<RegisteredStudent>;

  if (error) throw error;

  return data;
}

export async function updateRegisteredStudent({
  id,
  student,
}: {
  id: RegisteredStudent["id"];
  student: RegisteredStudentUpdate;
}) {
  const { data, error } = (await supabaseClient
    .from("Registered_Students")
    .update(student)
    .eq("id", id)
    .select("*")
    .single()) as Data<RegisteredStudent>;

  if (error) throw error;

  return data;
}

export async function deleteRegisteredStudent(id: RegisteredStudent["id"]) {
  const { error } = (await supabaseClient
    .from("Registered_Students")
    .delete()
    .eq("id", id)
    .select("*")) as Data<RegisteredStudent>;

  if (error) throw error;

  return true;
}
