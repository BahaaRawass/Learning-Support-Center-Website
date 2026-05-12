import { Link, useLocation } from "react-router-dom";

type SideBarProps = {
  onNavigate: () => void;
  isOpen: boolean;
};

export default function SideBar({ onNavigate, isOpen }: SideBarProps) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className='sidebar-section-label'>Navigation</div>

      <Link
        to='/'
        className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
        onClick={onNavigate}
      >
        <svg
          viewBox='0 0 16 16'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.4'
        >
          <rect x='2' y='3' width='12' height='10' rx='1.5' />
          <path d='M5 7h6M5 10h4' />
        </svg>
        Home
      </Link>

      <Link
        to='/student-records'
        className={`sidebar-link ${location.pathname === "/student-records" ? "active" : ""}`}
        onClick={onNavigate}
      >
        <svg
          viewBox='0 0 16 16'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.4'
        >
          <circle cx='8' cy='6' r='3' />
          <path d='M3 14c0-3 2.2-5 5-5s5 2 5 5' />
        </svg>
        Student Records
      </Link>

      <Link
        to='/support-center-staff'
        className={`sidebar-link ${location.pathname === "/support-center-staff" ? "active" : ""}`}
        onClick={onNavigate}
      >
        <svg
          viewBox='0 0 16 16'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.4'
        >
          <circle cx='8' cy='6' r='3' />
          <path d='M3 14c0-3 2.2-5 5-5s5 2 5 5' />
        </svg>
        Support Center Staff
      </Link>

      <hr className='sidebar-divider' />
      <div className='sidebar-section-label'>Account</div>

      <Link
        to='/settings'
        className={`sidebar-link ${location.pathname === "/settings" ? "active" : ""}`}
        onClick={onNavigate}
      >
        <svg
          viewBox='0 0 16 16'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.4'
        >
          <circle cx='8' cy='8' r='2.5' />
          <path d='M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1.1 1.1M11.1 11.1l1.1 1.1M3.8 12.2l1.1-1.1M11.1 4.9l1.1-1.1' />
        </svg>
        Settings
      </Link>
    </aside>
  );
}
