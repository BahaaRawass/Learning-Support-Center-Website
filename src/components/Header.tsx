import { Link } from "react-router-dom";
import accountImage from "../assets/Images/account_circle_30.png";
import logoutImage from "../assets/Images/logout_24.png";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { Session, SignOut, Loading } = useAuth();

  async function LogOut() {
    await SignOut();
  }

  const email = Session?.user.email;

  const DisplayName: string =
    Session?.user.user_metadata?.display_name?.trim() ||
    email?.slice(0, email.indexOf("@"));

  return (
    <header className="bg-dark text-white d-flex flex-wrap justify-content-between align-items-center p-3">
      <div className="d-flex align-items-center">
        <img
          src={accountImage}
          alt="Profile"
          className="rounded-circle me-2"
          style={{ width: "40px", height: "40px" }}
        />
        <p className="mb-0">{DisplayName}</p>
      </div>

      <nav className="d-flex justify-content-between align-items-between w-25">
        <Link to="/" className="text-white text-decoration-none">
          Home
        </Link>
        <Link
          to="/workstudy"
          className="text-white text-white text-decoration-none"
        >
          Edit Workstudy
        </Link>
      </nav>

      <div>
        {Session && (
          <button
            className="btn btn-danger d-flex align-items-center"
            onClick={LogOut}
            disabled={Loading}
          >
            <img
              src={logoutImage}
              alt="Logout"
              className="me-2"
              style={{ width: "20px", height: "20px" }}
            />
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
