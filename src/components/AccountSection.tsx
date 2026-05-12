import { useState, type ChangeEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          setSaveMessage("Error updating display name");
          setIsSaving(false);
          return;
        }
      }

      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
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

      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: profilePicture
                ? "transparent"
                : "var(--navy-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "3px solid var(--navy)",
            }}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt='Profile'
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <svg
                width='60'
                height='60'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                style={{ color: "var(--gold)" }}
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

        <div style={{ flex: 1 }}>
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
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--muted-foreground)",
                }}
              >
                Your login email address.
              </p>
            </div>
          </FieldGroup>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Button onClick={handleSaveProfile} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
        {saveMessage && (
          <p
            style={{
              fontSize: "0.875rem",
              color: saveMessage.startsWith("Error")
                ? "var(--destructive)"
                : "var(--green-600)",
            }}
          >
            {saveMessage}
          </p>
        )}
      </div>
    </section>
  );
}
