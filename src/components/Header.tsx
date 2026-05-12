import { useEffect, useState } from "react";
import RHULogo from "/Images/rhu_logo.png";
import { useAuth } from "@/hooks/useAuth";

type ThemeMode = "light" | "dark";

type HeaderProps = {
  onToggleMenu: () => void;
  isMenuOpen: boolean;
};

export default function Header({ onToggleMenu, isMenuOpen }: HeaderProps) {
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

  const DisplayName: string = Session
    ? (Session.user.user_metadata?.display_name?.trim() ||
       email?.slice(0, email.indexOf("@")) ||
       "User")
    : "You are not logged in";

  const initials = Session
    ? DisplayName.split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <header className='site-header'>
      {Session && (
        <button
          type='button'
          className='hamburger-menu'
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <line x1='4' y1='6' x2='20' y2='6' />
            <line x1='4' y1='12' x2='20' y2='12' />
            <line x1='4' y1='18' x2='20' y2='18' />
          </svg>
        </button>
      )}

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
            className='btn btn-ghost logout-button'
            onClick={LogOut}
            disabled={Loading}
            style={{ marginLeft: "0.5rem", padding: "0" }}
            title='Logout'
            type='button'
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <path d='M10 17l5-5-5-5' />
              <path d='M15 12H4' />
              <path d='M20 4v16' />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
