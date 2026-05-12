import { useEffect, useState } from "react";
import RHULogo from "/Images/rhu_logo.png";
import { useAuth } from "@/hooks/useAuth";

type ThemeMode = "light" | "dark";

export default function Header() {
  const { Session, SignOut, Loading } = useAuth();

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme") as ThemeMode) || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }

  async function LogOut() {
    await SignOut();
  }

  const email = Session?.user.email;

  const DisplayName: string =
    Session?.user.user_metadata?.display_name?.trim() ||
    email?.slice(0, email.indexOf("@")) ||
    "User";

  const initials = DisplayName.split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className='site-header'>
      <div className='header-brand' style={{ position: "relative" }}>
        <img src={RHULogo} alt='RHU Logo' className='header-logo' />
      </div>

      <button
        type='button'
        className='theme-toggle'
        onClick={toggleTheme}
        aria-label='Toggle theme'
      >
        <span className='theme-toggle-icon'>
          {theme === "light" ? "☾" : "☀"}
        </span>
        <span className='theme-toggle-label'>
          {theme === "light" ? "Dark" : "Light"}
        </span>
      </button>

      <div className='header-user'>
        <div className='user-name'>{DisplayName}</div>
        <div className='user-avatar'>{initials}</div>

        {Session && (
          <button
            className='btn btn-ghost'
            onClick={LogOut}
            disabled={Loading}
            style={{ marginLeft: "0.5rem", padding: "0" }}
            title='Logout'
            type='button'
          >
            ↻
          </button>
        )}
      </div>
    </header>
  );
}
