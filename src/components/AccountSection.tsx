import { useState, type ChangeEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { simplifyErrorMessage } from "@/helper/functions";

type AccountSectionProps = {
  session: Session;
  updateDisplayName: (displayName: string) => Promise<boolean>;
  updateProfilePicture: (file: File) => Promise<string | null>;
};

export default function AccountSection({
  session,
  updateDisplayName,
  updateProfilePicture,
}: AccountSectionProps) {
  const [displayName, setDisplayName] = useState(
    session.user.user_metadata?.display_name || "",
  );
  const [profilePicture, setProfilePicture] = useState<string>(
    localStorage.getItem("profilePicture") || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  async function handleSaveProfile() {
    setIsSaving(true);
    setSaveMessage("");

    try {
      if (
        displayName &&
        displayName !== session.user.user_metadata?.display_name
      ) {
        const displayNameUpdated = await updateDisplayName(displayName);
        if (!displayNameUpdated) {
          setSaveMessage("Failed to update display name.");
          setIsSaving(false);
          return;
        }
      }

      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setSaveMessage(simplifyErrorMessage(errorMsg));
    }

    setIsSaving(false);
  }

  async function handleProfilePictureChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const publicUrl = await updateProfilePicture(file);

    if (publicUrl) {
      setProfilePicture(publicUrl);
      localStorage.setItem("profilePicture", publicUrl);
      setSaveMessage("Profile picture uploaded successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage(
        "Failed to upload profile picture. File may be too large.",
      );
    }
  }

  return (
    <section className='settings-section'>
      <h2 className='settings-section-title'>Account</h2>

      <div className='flex gap-8 items-start mb-8'>
        <div className='flex flex-col gap-4 items-center'>
          <div
            className={`w-25 h-25 rounded-full flex items-center justify-center overflow-hidden border-[3px] border-(--navy) ${
              profilePicture ? "bg-transparent" : "bg-(--navy-light)"
            }`}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt='Profile'
                className='w-full h-full object-cover'
              />
            ) : (
              <svg
                width='60'
                height='60'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                className='text-(--gold)'
              >
                <circle cx='12' cy='8' r='4' />
                <path d='M4 20c0-4 3.5-7 8-7s8 3 8 7' />
              </svg>
            )}
          </div>
          <input
            type='file'
            accept='image/*'
            onChange={handleProfilePictureChange}
            className='profile-picture-input'
          />
        </div>

        <div className='flex-1'>
          <FieldGroup>
            <div>
              <Label htmlFor='displayName'>Display Name</Label>
              <Input
                id='displayName'
                type='text'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Your display name'
              />
            </div>

            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                defaultValue={session.user.email || ""}
                disabled
              />
              <p className='text-sm text-muted-foreground'>
                Your login email address.
              </p>
            </div>
          </FieldGroup>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <Button onClick={handleSaveProfile} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
        {saveMessage && (
          <p
            className={`text-sm ${
              saveMessage.startsWith("Error")
                ? "text-destructive"
                : "text-(--success)"
            }`}
          >
            {saveMessage}
          </p>
        )}
      </div>
    </section>
  );
}
