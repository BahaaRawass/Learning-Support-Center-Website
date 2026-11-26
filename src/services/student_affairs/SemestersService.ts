import { supabaseClient } from "@/supabase-client";
import type { NewSemester, Semester } from "@/types/Student Affiars/semesters";
import type { Data } from "@/types/types";

export async function fetchSemseters() {
  const { data, error } = (await supabaseClient
    .from("Semesters")
    .select("*")) as Data<Semester[]>;

  if (error) throw error;
  return data;
}

export async function addSemester(semester: NewSemester) {
  const { data, error } = (await supabaseClient
    .from("Semesters")
    .insert(semester)
    .select("*")
    .single()) as Data<Semester>;

  if (error) throw error;
  return data;
}

export async function fetchLatestSemesterId() {
  const { data, error } = await supabaseClient
    .from("Semesters")
    .select("id")
    .order("year", { ascending: false })
    .single();

  if (error) throw error;

  return data.id;
}
