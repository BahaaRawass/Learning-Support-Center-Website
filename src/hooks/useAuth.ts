import type { EdgeFunctionError } from "@/lib/functions.types";
import { invokeFunction } from "@/lib/invokeFunction";
import { supabaseClient } from "@/supabase-client";
import type { Department } from "@/types/department";
import {
  AuthError,
  PostgrestError,
  type Session,
  type User,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Error = PostgrestError | AuthError | EdgeFunctionError;

export function useAuth() {
  const [Session, setSession] = useState<Session | null>(null);
  const [Loading, setLoading] = useState<boolean>(true);
  const [Error, setError] = useState<string>("");

  //Helper reset some states
  function resetSates() {
    setLoading(true);
    setError("");
  }

  // Helper function to set the error
  function SetError(error: Error) {
    const msg = `Failed to fetch Session.\n Error Code: ${error.code}.\n Error message: ${error.message}`;
    console.error(msg);
    setError(msg);
    setLoading(false);
  }

  useEffect(() => {
    async function getSession() {
      resetSates();

      const { data, error: SessionError } =
        await supabaseClient.auth.getSession();

      if (SessionError) {
        SetError(SessionError);
        return;
      }
      setSession(data.session);
      setLoading(false);
    }

    getSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function SignInWithPassword(email: string, password: string) {
    resetSates();

    const { error: SignInError } = await supabaseClient.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (SignInError) {
      SetError(SignInError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function SignUp(
    email: string,
    password: string,
    displayname: string,
    isSupervisor: boolean,
    department_id: Department["id"],
  ) {
    resetSates();

    const { data, error: SignUpError } = await invokeFunction(
      supabaseClient,
      "createUser",
      { email, password, displayname, isSupervisor, department_id },
    );

    if (SignUpError) {
      SetError(SignUpError);
      return null;
    }

    setLoading(false);
    return data;
  }

  async function SignOut() {
    resetSates();

    const { error: SignOutError } = await supabaseClient.auth.signOut();

    if (SignOutError) {
      SetError(SignOutError);
      return false;
    }

    localStorage.removeItem("profilePicture");
    window.dispatchEvent(new Event("profilePictureUpdated"));
    setLoading(false);
    return true;
  }

  async function RestoreSession(prevSession: Session) {
    const { error } = await supabaseClient.auth.setSession(prevSession);
    if (error) {
      SetError(error);
      return false;
    }
    return true;
  }

  async function DeleteUser(id: User["id"]) {
    resetSates();

    const { error } = await invokeFunction(supabaseClient, "deleteUser", {
      userId: id,
    });
    if (error) {
      SetError(error);
      return false;
    }
    return true;
  }

  async function DeleteNonAdminUsers() {
    resetSates();

    const DeletionSummary = await invokeFunction(
      supabaseClient,
      "deleteAllNonAdminUsers",
      {},
    );

    return DeletionSummary;
  }

  return {
    Session,
    Error,
    Loading,
    SignInWithPassword,
    SignUp,
    SignOut,
    RestoreSession,
    DeleteUser,
    DeleteNonAdminUsers,
  };
}
