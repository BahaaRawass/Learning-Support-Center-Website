import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSettings } from "@/hooks/useSettings";
import { supabaseClient } from "@/supabase-client";
import { useEffect, useState } from "react";

export default function Settings() {
  useDocumentTitle("Settings");

  const { Session, SignOut } = useAuth();
  const {
    settings,
    updateTheme,
    updateFontSize,
    updateCompactMode,
    updatePageSize,
    updateExportFormat,
    updateArchiveRetention,
  } = useSettings();

  const [displayName, setDisplayName] = useState(Session?.user.user_metadata?.display_name || "");
  const [profilePicture, setProfilePicture] = useState<string>(
    localStorage.getItem("profilePicture") || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    setDisplayName(Session?.user.user_metadata?.display_name || "");
  }, [Session]);

  async function handleSaveProfile() {
    if (!Session?.user) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      // Update user metadata with display name
      const { error } = await supabaseClient.auth.updateUser({
        data: {
          display_name: displayName,
        },
      });

      if (error) {
        setSaveMessage(`Error: ${error.message}`);
      } else {
        // Save profile picture to localStorage
        localStorage.setItem("profilePicture", profilePicture);
        window.dispatchEvent(new Event("profilePictureUpdated"));
        setSaveMessage("Profile updated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (err) {
      setSaveMessage(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    setIsSaving(false);
  }

  async function handlePasswordReset() {
    if (!Session?.user.email) return;

    setIsResettingPassword(true);
    setPasswordMessage("");

    const { error } = await supabaseClient.auth.resetPasswordForEmail(Session.user.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setPasswordMessage(`Error: ${error.message}`);
    } else {
      setPasswordMessage("Password reset email sent.");
    }

    setIsResettingPassword(false);
  }

  function handleProfilePictureChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setProfilePicture(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleLogoutEverywhere() {
    if (window.confirm("Log out from all devices? This will sign you out everywhere.")) {
      await SignOut();
    }
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
        {/* ACCOUNT SECTION */}
        <section className='settings-section'>
          <h2 className='settings-section-title'>Account</h2>

          {/* Profile Picture and Display Name in Row */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: profilePicture ? "transparent" : "var(--navy-light)",
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
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ color: "var(--gold)" }}
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
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
              <div className='settings-group'>
                <label className='settings-label'>Display Name</label>
                <input
                  type='text'
                  className='settings-input'
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder='Your display name'
                />
              </div>

              <div className='settings-group'>
                <label className='settings-label'>Email</label>
                <input
                  type='email'
                  className='settings-input'
                  defaultValue={Session?.user.email || ""}
                  disabled
                />
                <p className='settings-hint'>Your login email address.</p>
              </div>
            </div>
          </div>

          <div className='settings-group'>
            <button className='btn btn-primary settings-action-button' onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            {saveMessage && (
              <p className={`settings-hint ${saveMessage.startsWith("Error") ? "error" : "success"}`}>
                {saveMessage}
              </p>
            )}
          </div>

          <div className='settings-group'>
            <label className='settings-label'>Change Password</label>
            <button
              className='btn btn-gold settings-action-button'
              onClick={handlePasswordReset}
              disabled={isResettingPassword || !Session?.user.email}
            >
              {isResettingPassword ? "Sending..." : "Reset Password"}
            </button>
            {passwordMessage && (
              <p className={`settings-hint ${passwordMessage.startsWith("Error") ? "error" : "success"}`}>
                {passwordMessage}
              </p>
            )}
            <p className='settings-hint'>We will send a reset link to your email address.</p>
          </div>

          <div className='settings-group'>
            <label className='settings-label'>Logout Everywhere</label>
            <button className='btn btn-outline settings-action-button settings-danger-button' onClick={handleLogoutEverywhere}>
              Sign Out All Sessions
            </button>
            <p className='settings-hint'>Log out from all devices and browsers.</p>
          </div>
        </section>

        {/* APPEARANCE SECTION */}
        <section className='settings-section'>
          <h2 className='settings-section-title'>Appearance</h2>

          <div className='settings-group'>
            <label className='settings-label'>Theme</label>
            <div className='settings-radio-group'>
              <label className='settings-radio'>
                <input
                  type='radio'
                  name='theme'
                  value='light'
                  checked={settings.theme === "light"}
                  onChange={() => updateTheme("light")}
                />
                Light Mode
              </label>
              <label className='settings-radio'>
                <input
                  type='radio'
                  name='theme'
                  value='dark'
                  checked={settings.theme === "dark"}
                  onChange={() => updateTheme("dark")}
                />
                Dark Mode
              </label>
            </div>
          </div>

          <div className='settings-group'>
            <label className='settings-label'>Font Size</label>
            <div className='settings-radio-group'>
              <label className='settings-radio'>
                <input
                  type='radio'
                  name='fontSize'
                  value='normal'
                  checked={settings.fontSize === "normal"}
                  onChange={() => updateFontSize("normal")}
                />
                Normal
              </label>
              <label className='settings-radio'>
                <input
                  type='radio'
                  name='fontSize'
                  value='large'
                  checked={settings.fontSize === "large"}
                  onChange={() => updateFontSize("large")}
                />
                Large
              </label>
            </div>
          </div>

          <div className='settings-group'>
            <label className='settings-label'>Compact Mode</label>
            <label className='settings-checkbox'>
              <input
                type='checkbox'
                checked={settings.compactMode}
                onChange={(e) => updateCompactMode(e.target.checked)}
              />
              <span>Reduce spacing in tables and forms</span>
            </label>
          </div>
        </section>

        {/* DATA & RECORDS SECTION */}
        <section className='settings-section'>
          <h2 className='settings-section-title'>Data & Records</h2>

          <div className='settings-group'>
            <label className='settings-label'>Default Page Size</label>
            <select
              className='settings-select'
              value={settings.pageSize}
              onChange={(e) => updatePageSize(Number(e.target.value))}
            >
              <option value='5'>5 records per page</option>
              <option value='10'>10 records per page</option>
              <option value='25'>25 records per page</option>
              <option value='50'>50 records per page</option>
              <option value='100'>100 records per page</option>
            </select>
            <p className='settings-hint'>Number of records shown per page in tables.</p>
          </div>

          <div className='settings-group'>
            <label className='settings-label'>Export Format</label>
            <div className='settings-radio-group'>
              <label className='settings-radio'>
                <input
                  type='radio'
                  name='exportFormat'
                  value='csv'
                  checked={settings.exportFormat === "csv"}
                  onChange={() => updateExportFormat("csv")}
                />
                CSV
              </label>
              <label className='settings-radio'>
                <input
                  type='radio'
                  name='exportFormat'
                  value='excel'
                  checked={settings.exportFormat === "excel"}
                  onChange={() => updateExportFormat("excel")}
                />
                Excel
              </label>
            </div>
            <p className='settings-hint'>Default format for exporting records.</p>
          </div>

          <div className='settings-group'>
            <label className='settings-label'>Archive Retention</label>
            <input
              type='number'
              className='settings-input'
              min='30'
              max='730'
              step='30'
              value={settings.archiveRetention}
              onChange={(e) => updateArchiveRetention(Number(e.target.value))}
            />
            <p className='settings-hint'>Days to keep archived records before deletion ({settings.archiveRetention} days).</p>
          </div>
        </section>
      </div>
    </>
  );
}
