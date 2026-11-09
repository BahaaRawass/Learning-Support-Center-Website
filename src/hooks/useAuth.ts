import { invokeFunction } from "@/lib/invokeFunction";
import { supabaseClient } from "@/supabase-client";
import type { Department } from "@/types/department";
import {
  AuthError,
  type PasskeyDeleteParams,
  type Session,
  type User,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CustomError } from "@/types/types";
import type { StaffRole } from "@/lib/functions.types";
import {
  getUserPath,
  updateUserAvatarData,
  uploadProfilePicture,
} from "@/services/ProfilePictureService";

type SignInParams =
  | { anon: true; email?: never; passowrd?: never }
  | { anon: false; email: string; password: string };

export function useAuth() {
  const [Session, setSession] = useState<Session | null>(null);
  const [Loading, setLoading] = useState<boolean>(true);
  const [Error, setError] = useState<CustomError | null>(null);

  const queryClient = useQueryClient();

  const bucketName = "Profile Pictures";

  //Helper reset some states
  function resetStates() {
    setLoading(true);
    setError(null);
  }

  function SetError(error: CustomError) {
    setLoading(false);
    setError(error);
  }

  useEffect(() => {
    async function getSession() {
      resetStates();

      const { data, error: SessionError } =
        await supabaseClient.auth.getSession();

      if (SessionError) return SetError(SessionError);

      setSession(data.session);
      setLoading(false);
    }

    getSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        resetStates();
        setSession(session);
        queryClient.invalidateQueries();
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function SignIn(params: SignInParams) {
    resetStates();

    if (params.anon) {
      const { error: AnonSignInError } =
        await supabaseClient.auth.signInAnonymously();

      if (AnonSignInError) {
        SetError(AnonSignInError);
        return false;
      }

      setLoading(false);
      return true;
    } else {
      const { error: SignInError } =
        await supabaseClient.auth.signInWithPassword({
          email: params.email,
          password: params.password,
        });

      if (SignInError) {
        SetError(SignInError);
        return false;
      }

      setLoading(false);
      return true;
    }
  }

  async function SignUp(
    email: string,
    password: string,
    displayname: string,
    role: StaffRole,
    department_id: Department["id"],
  ) {
    resetStates();

    const { data, error: SignUpError } = await invokeFunction(
      supabaseClient,
      "createUser",
      { email, password, displayname, role, department_id },
    );

    if (SignUpError) {
      SetError(SignUpError);
      return null;
    }

    setLoading(false);
    queryClient.invalidateQueries({ queryKey: ["users"] });

    return data;
  }

  async function SignOut() {
    resetStates();

    const isAnonymous = Session?.user.is_anonymous;

    if (isAnonymous) {
      const { error } = await invokeFunction(
        supabaseClient,
        "signOutAnonymous",
        {},
      );
      if (error) {
        SetError(error);
        return false;
      }
    }

    const { error: SignOutError } = await supabaseClient.auth.signOut({
      scope: isAnonymous ? "local" : "global",
    });

    if (SignOutError) {
      SetError(SignOutError);
      return false;
    }

    queryClient.clear();

    setLoading(false);
    return true;
  }

  async function DeleteUser(id: User["id"]) {
    resetStates();

    const { error } = await invokeFunction(supabaseClient, "deleteUser", {
      userId: id,
    });

    if (error) {
      SetError(error);
      return false;
    }
    if (Session?.user.id === id) {
      // Auth deletion has already revoked server sessions; clear this browser.
      await supabaseClient.auth.signOut({ scope: "local" });
      queryClient.clear();
      setSession(null);
    }
    setLoading(false);
    queryClient.invalidateQueries({ queryKey: ["users"] });
    return true;
  }

  async function UpdateDisplayName(displayName: string) {
    resetStates();

    const { error } = await supabaseClient.auth.updateUser({
      data: {
        display_name: displayName,
      },
    });

    if (error) {
      SetError(error);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function UpdatePassword(newPassword: string) {
    resetStates();

    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      SetError(error);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function UpdateProfilePicture(file: File) {
    resetStates();

    if (!Session?.user) {
      const error = new AuthError("No Authenticated User", 401, "no_user");
      SetError(error);
      return false;
    }

    const path = getUserPath(Session.user.id);

    const UploadError = await uploadProfilePicture(bucketName, path, file);

    if (UploadError) {
      SetError(UploadError);
      return false;
    }

    const UpdateError = await updateUserAvatarData(bucketName, path);

    if (UpdateError) {
      SetError(UpdateError);
      return false;
    }

    return true;
  }

  async function DeleteProfilePicture(userId: User["id"]) {
    resetStates();

    const { error: DeleteError } = await supabaseClient.storage
      .from(bucketName)
      .remove([`${userId}/profile_picture`]);

    if (DeleteError) {
      SetError(DeleteError);
      return false;
    }

    const { error: UpdateError } = await supabaseClient.auth.updateUser({
      data: {
        avatar_url: null,
      },
    });

    if (UpdateError) {
      SetError(UpdateError);
      return false;
    }

    return true;
  }

  async function SendEmail(
    to: string,
    from: string,
    subject: string,
    message: string,
    replyto?: string,
    buttontext?: string,
    buttonAction?: string,
  ) {
    resetStates();
    const { error } = await invokeFunction(supabaseClient, "sendEmail", {
      to,
      from,
      subject,
      message,
      replyto,
      buttontext,
      buttonAction,
    });

    if (error) {
      SetError(error);
      return false;
    }
    setLoading(false);
    return true;
  }

  async function RegisterPasskey() {
    resetStates();

    const { error } = await supabaseClient.auth.registerPasskey();

    if (error) {
      SetError(error);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function SignInWithPasskey() {
    resetStates();

    const { error } = await supabaseClient.auth.signInWithPasskey();

    if (error) {
      SetError(error);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function ListPasskeys() {
    resetStates();

    const { data, error } = await supabaseClient.auth.passkey.list();

    if (error) {
      SetError(error);
      return null;
    }

    setLoading(false);
    return data;
  }

  async function DeletePasskey(params: PasskeyDeleteParams) {
    resetStates();

    const { error } = await supabaseClient.auth.passkey.delete(params);

    if (error) {
      SetError(error);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function DeletePasskeys() {
    resetStates();

    const RegisteredPasskeys = await ListPasskeys();

    if (!RegisteredPasskeys) {
      const error = new AuthError(
        "No Registered Passkeys Found",
        404,
        "no_passkeys",
      );
      SetError(error);
      return false;
    }

    RegisteredPasskeys.forEach(async (passkey) => {
      const ok = await DeletePasskey({ passkeyId: passkey.id });
      if (!ok) {
        const error = new AuthError(
          `Failed to Delete Passkey with ID: ${passkey.id}`,
          500,
          "delete_passkey_failed",
        );
        SetError(error);
        return false;
      }
    });

    setLoading(false);
    return true;
  }

  async function ResetPassword(email: string) {
    resetStates();

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      SetError(error);
      return false;
    }

    setLoading(false);
    return true;
  }

  return {
    Session,
    Error,
    Loading,
    SignIn,
    SignUp,
    SignOut,
    DeleteUser,
    UpdateDisplayName,
    UpdatePassword,
    UpdateProfilePicture,
    DeleteProfilePicture,
    SendEmail,
    RegisterPasskey,
    SignInWithPasskey,
    ResetPassword,
    ListPasskeys,
    DeletePasskey,
    DeletePasskeys,
  };
}
