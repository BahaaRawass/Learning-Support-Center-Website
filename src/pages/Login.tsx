import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuth } from "../hooks/useAuth";
import type { LoginInput } from "../types/auth";

export default function Login() {
  useDocumentTitle("Login");

  const InitialValue: LoginInput = {
    email: "",
    password: "",
  };

  const [Login, setLogin] = useState<LoginInput>(InitialValue);
  const {
    Session,
    Loading: AuthLoading,
    Error: AuthError,
    SignInWithPassword,
  } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const ok = await SignInWithPassword(Login.email, Login.password);

    if (ok) navigate("/");
  }

  if (AuthLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <Spinner text="Checking Authentication" />
      </div>
    );
  }

  if (Session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm p-4" style={{ width: "350px" }}>
        <h2 className="text-center mb-4">Login</h2>

        {AuthError && (
          <div className="alert alert-danger" role="alert">
            {AuthError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              required
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your RHU email"
              onChange={(event) =>
                setLogin({ ...Login, email: event.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              required
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              onChange={(event) =>
                setLogin({ ...Login, password: event.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={AuthLoading}
          >
            {AuthLoading ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Logging In</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
