import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSettings } from "@/hooks/useSettings";
import AccountSection from "@/components/AccountSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import type { PageSize } from "@/types/settings";
import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function Settings() {
  useDocumentTitle("Settings");

  const {
    Session,
    Loading: AuthLoading,
    Error: AuthError,
    SignOut,
    UpdateDisplayName,
    UpdatePassword,
    UpdateProfilePicture,
  } = useAuth();
  const { Settings, updateSetting } = useSettings();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  async function handleChangePassword() {
    if (!newPassword || !oldPassword || !confirmPassword) {
      setPasswordMessage("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    if (newPassword === oldPassword) {
      setPasswordMessage("New password must be different from old password.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage("");

    try {
      // Note: You may want to verify the old password on the backend
      // For now, we'll just update to the new password
      const updated = await UpdatePassword(newPassword);

      if (updated) {
        setPasswordMessage("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMessage(""), 3000);
      } else {
        setPasswordMessage("Failed to change password. Please try again.");
      }
    } catch (err) {
      setPasswordMessage(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }

    setIsChangingPassword(false);
  }

  async function handleLogoutEverywhere() {
    if (
      window.confirm(
        "Log out from all devices? This will sign you out everywhere.",
      )
    ) {
      await SignOut();
    }
  }

  if (AuthLoading) {
    return <p>Checking Authentication...</p>;
  }

  if (AuthError) {
    return <p>{AuthError}</p>;
  }

  if (!Session) {
    return <Navigate to='/login' />;
  }

  return (
    <>
      <div className='page-header'>
        <div className='page-breadcrumb'>
          LSC–CAS › <span>Settings</span>
        </div>
        <h1 className='page-title'>Settings</h1>
      </div>

      <div className='settings-container'>
        <AccountSection
          session={Session}
          updateDisplayName={UpdateDisplayName}
          updateProfilePicture={UpdateProfilePicture}
        />

        <section className='settings-section'>
          <FieldGroup>
            <div>
              <Label htmlFor='oldPassword'>Old Password</Label>
              <Input
                id='oldPassword'
                type='password'
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder='Enter your current password'
              />
            </div>
            <div>
              <Label htmlFor='newPassword'>New Password</Label>
              <Input
                id='newPassword'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='Enter your new password'
              />
            </div>
            <div>
              <Label htmlFor='confirmPassword'>Confirm New Password</Label>
              <Input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm your new password'
              />
            </div>
            <Button
              variant='secondary'
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Updating..." : "Change Password"}
            </Button>
            {passwordMessage && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color:
                    passwordMessage.includes("Error") ||
                    passwordMessage.includes("do not match") ||
                    passwordMessage.includes("must be different") ||
                    passwordMessage.includes("required")
                      ? "var(--destructive)"
                      : "var(--green-600)",
                }}
              >
                {passwordMessage}
              </p>
            )}
          </FieldGroup>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <Label>Logout Everywhere</Label>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--muted-foreground)",
                  marginBottom: "0.5rem",
                }}
              >
                Log out from all devices and browsers.
              </p>
            </div>
            <Button variant='destructive' onClick={handleLogoutEverywhere}>
              Sign Out All Sessions
            </Button>
          </div>
        </section>

        {/* APPEARANCE SECTION */}
        <section className='settings-section'>
          <h2 className='settings-section-title'>Appearance</h2>

          <FieldGroup>
            <div>
              <Label>Theme</Label>
              <div style={{ display: "flex", gap: "2rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type='radio'
                    name='theme'
                    checked={Settings.theme === "light"}
                    onChange={() => updateSetting("theme", "light")}
                  />
                  Light Mode
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type='radio'
                    name='theme'
                    checked={Settings.theme === "dark"}
                    onChange={() => updateSetting("theme", "dark")}
                  />
                  Dark Mode
                </label>
              </div>
            </div>

            <div>
              <Label>Font Size</Label>
              <div style={{ display: "flex", gap: "2rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type='radio'
                    name='fontSize'
                    checked={Settings.fontSize === "normal"}
                    onChange={() => updateSetting("fontSize", "normal")}
                  />
                  Normal
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type='radio'
                    name='fontSize'
                    checked={Settings.fontSize === "large"}
                    onChange={() => updateSetting("fontSize", "large")}
                  />
                  Large
                </label>
              </div>
            </div>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <Checkbox
                id='compactMode'
                checked={Settings.compactMode}
                onCheckedChange={(checked) =>
                  updateSetting("compactMode", checked as boolean)
                }
              />
              <Label htmlFor='compactMode' style={{ margin: 0 }}>
                Compact Mode - Reduce spacing in tables and forms
              </Label>
            </div>
          </FieldGroup>
        </section>

        {/* DATA & RECORDS SECTION */}
        <section className='settings-section'>
          <h2 className='settings-section-title'>Data & Records</h2>

          <FieldGroup>
            <div>
              <Label htmlFor='pageSize'>Default Page Size</Label>
              <Select
                value={String(Settings.pageSize)}
                onValueChange={(value) =>
                  updateSetting("pageSize", Number(value) as PageSize)
                }
              >
                <SelectTrigger id='pageSize'>
                  <SelectValue placeholder='Select page size' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5 records per page</SelectItem>
                  <SelectItem value='10'>10 records per page</SelectItem>
                  <SelectItem value='25'>25 records per page</SelectItem>
                  <SelectItem value='50'>50 records per page</SelectItem>
                  <SelectItem value='100'>100 records per page</SelectItem>
                </SelectContent>
              </Select>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--muted-foreground)",
                }}
              >
                Number of records shown per page in tables.
              </p>
            </div>

            <div>
              <Label>Export Format</Label>
              <div style={{ display: "flex", gap: "2rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type='radio'
                    name='exportFormat'
                    checked={Settings.exportFormat === "csv"}
                    onChange={() => updateSetting("exportFormat", "csv")}
                  />
                  CSV
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type='radio'
                    name='exportFormat'
                    checked={Settings.exportFormat === "excel"}
                    onChange={() => updateSetting("exportFormat", "excel")}
                  />
                  Excel
                </label>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--muted-foreground)",
                }}
              >
                Default format for exporting records.
              </p>
            </div>

            <div>
              <Label htmlFor='archiveRetention'>Archive Retention</Label>
              <Input
                id='archiveRetention'
                type='number'
                min='30'
                max='730'
                step='30'
                value={Settings.archiveRetention}
                onChange={(e) =>
                  updateSetting("archiveRetention", Number(e.target.value))
                }
              />
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--muted-foreground)",
                }}
              >
                Days to keep archived records before deletion (
                {Settings.archiveRetention} days).
              </p>
            </div>
          </FieldGroup>
        </section>
      </div>
    </>
  );
}
