import { useEffect, useState } from "react";
import { supabaseClient } from "../supabase-client";
import { PostgrestError } from "@supabase/supabase-js";
import type { Data } from "../types/types";
import type { User } from "../types/users";

export function useUsers() {
  const [Users, setUsers] = useState<User[]>([]);
  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<string>("");

  function SetError(error: PostgrestError) {
    const msg = `An Error Occurred: Error Code: ${error.code}\nError Message: ${error.message}`;
    setError(msg);
    setLoading(false);
  }

  // console.log(Users);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      const { data, error: FetchError } = (await supabaseClient
        .from("Users")
        .select("*")) as Data<User[]>;

      console.log("data: ", data);

      if (FetchError) {
        SetError(FetchError);
        return;
      }

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

  return {
    Users,
    Loading,
    Error,
  };
}
