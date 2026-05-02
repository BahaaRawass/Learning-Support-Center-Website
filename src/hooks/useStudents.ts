import { useEffect, useState } from "react";
import { supabaseClient } from "../supabase-client";
import type { NewStudent, Student } from "../types/students";
import { PostgrestError, type User } from "@supabase/supabase-js";
import type { Data } from "../types/types";

export function useStudents(added_by?: User) {
  const [Students, setStudents] = useState<Student[]>([]);
  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<Student["studentId"] | null>(
    null,
  );

  function ResetStates() {
    setLoading(false);
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `An Error Occurred: Error Code: ${error.code}\nError Message: ${error.message}`;
    setError(msg);
    setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      if (!added_by) return;

      setLoading(true);
      setError("");

      let query = supabaseClient.from("Students").select("*");

      if (added_by.role !== "admin") query = query.eq("added_by", added_by.id);

      const { data, error: FetchError } = (await query) as Data<Student[]>;

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setStudents(data || []);

      setLoading(false);
    }

    fetchData();

    const channel = supabaseClient.channel("Students Channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Students" },
        (payload) => {
          const newStudent = payload.new as Student;

          setStudents((prev) => [...prev, newStudent]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Students" },
        (payload) => {
          const updatedStudent = payload.new as Student;

          setStudents((prev) =>
            prev.map((student) =>
              student.studentId === updatedStudent.studentId
                ? updatedStudent
                : student,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Students" },
        (payload) => {
          const deletedStudent = payload.old as Student;

          setStudents((prev) =>
            prev.filter(
              (student) => student.studentId !== deletedStudent.studentId,
            ),
          );
        },
      )
      .subscribe((status) => {
        console.log("Students Channel:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [added_by]);

  async function addStudent(student: NewStudent) {
    ResetStates();

    const { error: AddError } = await supabaseClient
      .from("Students")
      .insert(student)
      .single();

    if (AddError) {
      SetError(AddError);
      return false;
    }
    setLoading(false);
    return true;
  }

  async function incrementStudentVisits(studentId: number) {
    setIsUpdating(studentId);
    setError("");

    const { error: IncrementError } = await supabaseClient.rpc(
      "increment_student_visits",
      {
        student_id_input: studentId,
      },
    );

    if (IncrementError) {
      SetError(IncrementError);
      setIsUpdating(null);
      return false;
    }
    setIsUpdating(null);
    return true;
  }

  async function ClearStudents() {
    ResetStates();

    if (!added_by || added_by.role !== "admin") {
      const ClearError = new PostgrestError({
        message: "Only admins can clear all students.",
        details: "",
        hint: "",
        code: "403",
      });
      SetError(ClearError);
      return false;
    }

    const { error: ClearError } = await supabaseClient
      .from("Students")
      .delete();

    if (ClearError) {
      SetError(ClearError);
      return false;
    }

    setLoading(false);

    return true;
  }

  return {
    Students,
    Loading,
    Error,
    addStudent,
    incrementStudentVisits,
    isUpdating,
    ClearStudents,
  };
}
