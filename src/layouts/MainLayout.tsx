import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const { Session, Loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [Session]);

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
            {isMenuOpen && <button className='sidebar-overlay' onClick={closeMenu} aria-label='Close menu' type='button' />}
          </>
        )}

        <main className='main'>
          <Outlet />
        </main>
      </div>

      <footer className='site-footer'>
        &copy; 2026 &nbsp;<span>RHU Learning Support Center</span>&nbsp; —
        College of Arts &amp; Sciences &nbsp;|&nbsp; All rights reserved.
      </footer>
    </div>
  );
}
