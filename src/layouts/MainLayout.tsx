import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const { Session, Loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function toggleMenu() {
    setIsMenuOpen((currentValue) => !currentValue);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className='app-shell'>
      <Header onToggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      <div className='layout'>
        {!Loading && Session && (
          <>
            <SideBar onNavigate={closeMenu} isOpen={isMenuOpen} />
            {isMenuOpen && (
              <button
                className='sidebar-overlay'
                onClick={closeMenu}
                aria-label='Close menu'
                type='button'
              />
            )}
          </>
        )}

        <main className='main'>
          <Outlet />
        </main>
      </div>

      <footer className='site-footer'>
        &copy; 2026 &nbsp;<span>RHU Learning Support Center</span>&nbsp; —
        College of Arts &amp; Sciences &nbsp;|&nbsp; All rights reserved.
        <span className='footer-info-wrap' aria-label='Credits'>
          <span className='footer-info-icon' aria-hidden='true'>
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='12' cy='12' r='10' />
              <path d='M12 16v-4' />
              <path d='M12 8h.01' />
            </svg>
          </span>
          <span className='footer-tooltip'>
            Developed by Bahaa El Rawwas &amp; Mahdi Dagher
          </span>
        </span>
      </footer>
    </div>
  );
}
