import { useEffect, useState } from "react";
import RHULogo from "/Images/rhu_logo.png";
import { useAuth } from "@/hooks/useAuth";

type HeaderProps = {
  onToggleMenu: () => void;
  isMenuOpen: boolean;
};

export default function Header({ onToggleMenu, isMenuOpen }: HeaderProps) {
  const { Session, SignOut, Loading } = useAuth();

  const [profilePicture, setProfilePicture] = useState<string>(() => {
    return localStorage.getItem("profilePicture") || "";
  });

  useEffect(() => {
    function syncProfilePicture() {
      setProfilePicture(localStorage.getItem("profilePicture") || "");
    }

    syncProfilePicture();
    window.addEventListener("storage", syncProfilePicture);
    window.addEventListener("profilePictureUpdated", syncProfilePicture);

    return () => {
      window.removeEventListener("storage", syncProfilePicture);
      window.removeEventListener("profilePictureUpdated", syncProfilePicture);
    };
  }, []);

  async function LogOut() {
    await SignOut();
  }

  const email = Session?.user.email;

  const DisplayName: string = Session
    ? Session.user.user_metadata?.display_name?.trim() ||
      email?.slice(0, email.indexOf("@")) ||
      "User"
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

      <div className='header-brand relative'>
        <img src={RHULogo} alt='RHU Logo' className='header-logo' />
      </div>

      <div className='header-user'>
        <div className='user-name'>{DisplayName}</div>
        <div className='user-avatar'>
          {profilePicture ? (
            <img
              src={profilePicture}
              alt='Profile'
              className='w-full h-full rounded-full object-cover'
            />
          ) : (
            initials
          )}
        </div>

        {Session && (
          <button
            className='btn btn-ghost logout-button ml-2 p-0'
            onClick={LogOut}
            disabled={Loading}
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
