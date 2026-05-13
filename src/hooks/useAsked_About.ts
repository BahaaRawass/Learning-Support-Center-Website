import { useEffect, useRef, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "@/supabase-client";
import type {
  Asked_About,
  New_Asked_About,
  Update_Asked_About,
} from "@/types/asked_about";
import type { Data } from "@/types/types";

export function useAsked_About() {
  const [AskedAbout, setAskedAbout] = useState<Asked_About[]>([]);
  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<string>("");
  const channelNameRef = useRef(
    `Asked About Channel ${Math.random().toString(36).slice(2)}`,
  );

  function resetStates() {
    setLoading(true);
    setError("");
  }

  function clearError() {
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `An Error Occurred: Error Code: ${error.code}\nError Message: ${error.message}`;
    setError(msg);
    setLoading(false);
  }

  useEffect(() => {
    async function fetchAskedAbout() {
      resetStates();

      const { data, error: FetchError } = (await supabaseClient
        .from("Asked_About")
        .select("*")) as Data<Asked_About[]>;

      if (FetchError) return SetError(FetchError);

      setAskedAbout(data || []);
      setLoading(false);
    }

    fetchAskedAbout();

    const channel = supabaseClient.channel(channelNameRef.current);

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Asked_About" },
        (payload) => {
          const newAskedAbout = payload.new as Asked_About;
          setAskedAbout((prev) => {
            if (prev.some((record) => record.id === newAskedAbout.id)) {
              return prev;
            }
            return [...prev, newAskedAbout];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Asked_About" },
        (payload) => {
          const updatedAskedAbout = payload.new as Asked_About;

          setAskedAbout((prev) =>
            prev.map((record) =>
              record.id === updatedAskedAbout.id ? updatedAskedAbout : record,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Asked_About" },
        (payload) => {
          const deletedAskedAbout = payload.old as Asked_About;

          setAskedAbout((prev) =>
            prev.filter((record) => record.id !== deletedAskedAbout.id),
          );
        },
      )
      .subscribe((status) => {
        console.log("Asked About Channel:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  async function addAskedAbout(newAskedAbout: New_Asked_About) {
    clearError();

    const { data, error: InsertError } = await supabaseClient
      .from("Asked_About")
      .insert(newAskedAbout)
      .select("*")
      .single();

    if (InsertError) {
      SetError(InsertError);
      return null;
    }

    setAskedAbout((prev) => {
      if (prev.some((record) => record.id === data.id)) {
        return prev;
      }
      return [...prev, data];
    });

    return data;
  }

  async function updateAskedAbout(
    id: Asked_About["id"],
    updatedAskedAbout: Update_Asked_About,
  ) {
    clearError();

    const { data, error: UpdateError } = await supabaseClient
      .from("Asked_About")
      .update(updatedAskedAbout)
      .eq("id", id)
      .select("*")
      .single();

    if (UpdateError) {
      SetError(UpdateError);
      return null;
    }

    setAskedAbout((prev) =>
      prev.map((record) => (record.id === data.id ? data : record)),
    );

    return data;
  }

  async function removeAskedAbout(id: Asked_About["id"]) {
    clearError();

    const { error: DeleteError } = await supabaseClient
      .from("Asked_About")
      .delete()
      .eq("id", id);

    if (DeleteError) {
      SetError(DeleteError);
      return false;
    }

    setAskedAbout((prev) => prev.filter((record) => record.id !== id));
    return true;
  }

  async function syncStudentCourses(
    studentId: Asked_About["student_Id"],
    courseCodes: Asked_About["course_code"][],
  ) {
    clearError();

    const uniqueCourseCodes = Array.from(new Set(courseCodes));
    const existingRecords = AskedAbout.filter(
      (record) => record.student_Id === studentId,
    );

    const existingCourseCodeSet = new Set(
      existingRecords.map((record) => record.course_code),
    );

    const idsToDelete = existingRecords
      .filter((record) => !uniqueCourseCodes.includes(record.course_code))
      .map((record) => record.id);

    const codesToInsert = uniqueCourseCodes.filter(
      (courseCode) => !existingCourseCodeSet.has(courseCode),
    );

    let insertedRows: Asked_About[] = [];

    if (idsToDelete.length > 0) {
      const { error: DeleteError } = await supabaseClient
        .from("Asked_About")
        .delete()
        .in("id", idsToDelete);

      if (DeleteError) {
        SetError(DeleteError);
        return false;
      }
    }

    if (codesToInsert.length > 0) {
      const rowsToInsert: New_Asked_About[] = codesToInsert.map(
        (courseCode) => ({
          student_Id: studentId,
          course_code: courseCode,
        }),
      );

      const { data, error: InsertError } = await supabaseClient
        .from("Asked_About")
        .insert(rowsToInsert)
        .select("*");

      if (InsertError) {
        SetError(InsertError);
        return false;
      }

      insertedRows = data || [];
    }

    setAskedAbout((prev) => {
      const preserved = prev.filter(
        (record) =>
          record.student_Id !== studentId ||
          uniqueCourseCodes.includes(record.course_code),
      );

      const preservedWithoutReinserted = preserved.filter(
        (record) => !insertedRows.some((inserted) => inserted.id === record.id),
      );

      return [...preservedWithoutReinserted, ...insertedRows];
    });

    return true;
  }

  return {
    AskedAbout,
    Loading,
    Error,
    addAskedAbout,
    updateAskedAbout,
    removeAskedAbout,
    syncStudentCourses,
  };
}
