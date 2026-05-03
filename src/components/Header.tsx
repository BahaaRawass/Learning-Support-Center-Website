import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import rhuLogo from "../assets/Images/rhu_logo.png";

export default function Header() {
  const { Session, SignOut, Loading } = useAuth();
  const location = useLocation();

  async function LogOut() {
    await SignOut();
  }

  const email = Session?.user.email;

  const DisplayName: string =
    Session?.user.user_metadata?.display_name?.trim() ||
    email?.slice(0, email.indexOf("@")) ||
    "User";

  const initials = DisplayName.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="site-header">
      <div className="header-brand" style={{ position: "relative" }}>
        <img 
          src={rhuLogo} 
          alt="RHU Logo" 
          style={{ 
            width: "290px", 
            height: "75px",
            objectFit: "contain",
            padding: "0.5rem"
          }}
        />
      </div>

      <nav className="header-nav">
        <Link
          to="/"
          className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/workstudy"
          className={`nav-item ${location.pathname === "/workstudy" ? "active" : ""}`}
        >
          Edit Workstudy
        </Link>
      </nav>

      <div className="header-user">
        <div className="user-name">{DisplayName}</div>
        <div className="user-avatar">{initials}</div>
        {Session && (
          <button
            className="btn btn-ghost"
            onClick={LogOut}
            disabled={Loading}
            style={{ marginLeft: "0.5rem", padding: "0" }}
            title="Logout"
          >
            ↻
          </button>
        )}
      </div>
    </header>
  );
}
