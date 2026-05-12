import { useEffect, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import type { NewUser, User } from "@/types/users";
import { supabaseClient } from "@/supabase-client";
import type { Data } from "@/types/types";

export function useUsers() {
  const [Users, setUsers] = useState<User[]>([]);
  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<string>("");

  function resetStates() {
    setLoading(true);
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `An Error Occurred: Error Code: ${error.code}\nError Message: ${error.message}`;
    setError(msg);
    setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      resetStates();

      const { data, error: FetchError } = (await supabaseClient
        .from("Users")
        .select("*")) as Data<User[]>;

      if (FetchError) return SetError(FetchError);

      setUsers(data || []);

      setLoading(false);
    }

    fetchData();

    const channel = supabaseClient.channel("Users Channel");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Users" },
        (payload) => {
          const newUser = payload.new as User;

          setUsers((prev) => [...prev, newUser]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Users" },
        (payload) => {
          const updatedUser = payload.new as User;

          setUsers((prev) =>
            prev.map((user) =>
              user.id === updatedUser.id ? updatedUser : user,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Users" },
        (payload) => {
          const deletedUser = payload.old as User;

          setUsers((prev) => prev.filter((user) => user.id !== deletedUser.id));
        },
      )
      .subscribe((status) => {
        console.log("Users Channel:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  async function AddUser(user: NewUser) {
    resetStates();

    const { error: InsertError } = await supabaseClient
      .from("Users")
      .insert(user)
      .single();

    if (InsertError) {
      SetError(InsertError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function RemoveUser(id: User["id"]) {
    resetStates();

    const { error: DeleteError } = await supabaseClient
      .from("Users")
      .delete()
      .eq("id", id);

    if (DeleteError) {
      SetError(DeleteError);
      return false;
    }

    setLoading(false);
    return true;
  }

  return {
    Users,
    Loading,
    Error,
    AddUser,
    RemoveUser,
  };
}
