import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
  const [showPassword, setShowPassword] = useState(false);

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

    if (ok) {
      navigate("/");
    }
  }

  if (AuthLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-[50vh]">
        Checking Authentication
      </div>
    );
  }

  if (Session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-hero">
          <h1>RHU Learning Support Center</h1>
          <p>
            Sign in to manage student visits, workstudy staff, and support
            records.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Login</h2>
            <p>Use your Learning Center account credentials to continue.</p>
          </div>

          {AuthError && (
            <div className="login-alert" role="alert">
              {AuthError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email</label>

              <input
                required
                type="email"
                id="email"
                className="login-input"
                placeholder="Enter your Learning Center email"
                value={Login.email}
                onChange={(event) =>
                  setLogin({ ...Login, email: event.target.value })
                }
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="login-password-wrap">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="login-input login-password-input"
                  placeholder="Enter your password"
                  value={Login.password}
                  onChange={(event) =>
                    setLogin({ ...Login, password: event.target.value })
                  }
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit btn btn-primary"
              disabled={AuthLoading}
            >
              {AuthLoading ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Logging In</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="login-footer-note">
            Secure access for RHU Learning Center staff.
          </div>
        </div>
      </div>
    </div>
  );
}