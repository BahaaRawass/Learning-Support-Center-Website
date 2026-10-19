import { Link } from "react-router-dom";
import RHULogo from "/Images/rhu_logo.png";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-brand relative">
        <Link to="/">
          <img src={RHULogo} alt="RHU Logo" className="header-logo" />
        </Link>
      </div>
    </header>
  );
}
