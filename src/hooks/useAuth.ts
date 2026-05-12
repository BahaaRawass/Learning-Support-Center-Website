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

  /**
   * Update the current user's display name.
   * @param displayName - New display name
   * @returns true if successful, false otherwise
   */
  async function UpdateDisplayName(displayName: string) {
    resetSates();

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

  /**
   * Update the current user's password directly (not via email).
   * @param newPassword - The new password
   * @returns true if successful, false otherwise
   */
  async function UpdatePassword(newPassword: string) {
    resetSates();

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

  /**
   * Upload a profile picture to the "Profile Pictures" bucket.
   * File size must be <= 1MB. The file is stored in a folder named {displayname}_{userId}.
   * @param file - The image file to upload
   * @returns the public URL of the uploaded file if successful, null otherwise
   */
  async function UpdateProfilePicture(file: File): Promise<string | null> {
    resetSates();

    if (!Session?.user) {
      setError("No user session");
      setLoading(false);
      return null;
    }

    // Check file size (1 MB = 1048576 bytes)
    const MAX_FILE_SIZE = 1048576;
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File size exceeds 1MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
      );
      setLoading(false);
      return null;
    }

    const displayName = Session.user.user_metadata?.display_name || "user";
    const userId = Session.user.id;
    const folderPath = `${displayName}_${userId}`;

    // Use a stable filename so uploads overwrite the previous profile picture.
    // Preserve the file extension if present (e.g. .jpg, .png).
    const originalName = file.name || "";
    const lastDot = originalName.lastIndexOf(".");
    const ext = lastDot > 0 ? originalName.slice(lastDot) : "";
    const targetFileName = `User_Profile${ext}`;
    const filePath = `${folderPath}/${targetFileName}`;

    const bucketName = import.meta.env.VITE_PROFILE_PICTURES_BUCKET;

    if (!bucketName) {
      setError("Missing VITE_PROFILE_PICTURES_BUCKET environment variable.");
      setLoading(false);
      return null;
    }

    // Remove any existing User_Profile files in the folder (different extensions)
    try {
      const { data: existingFiles, error: listError } =
        await supabaseClient.storage.from(bucketName).list(folderPath);

      if (listError) {
        // non-fatal: continue to upload; we'll report upload errors below
        console.warn(
          "Failed to list existing profile pictures:",
          listError.message,
        );
      } else if (Array.isArray(existingFiles) && existingFiles.length > 0) {
        const toRemove = existingFiles
          .filter(
            (f: any) =>
              typeof f.name === "string" && f.name.startsWith("User_Profile"),
          )
          .map((f: any) => `${folderPath}/${f.name}`);

        if (toRemove.length > 0) {
          const { error: removeError } = await supabaseClient.storage
            .from(bucketName)
            .remove(toRemove);
          if (removeError) {
            console.warn(
              "Failed to remove existing profile pictures:",
              removeError.message,
            );
          }
        }
      }
    } catch (err) {
      console.warn("Error while cleaning existing profile pictures:", err);
    }

    const { error: uploadError } = await supabaseClient.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(`Failed to upload profile picture: ${uploadError.message}`);
      setLoading(false);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    setLoading(false);
    return publicUrlData?.publicUrl || null;
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
    UpdateDisplayName,
    UpdatePassword,
    UpdateProfilePicture,
  };
}
