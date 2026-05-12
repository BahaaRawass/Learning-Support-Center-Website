import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { LoginInput } from "@/types/auth";
import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

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

    if (ok) {
      navigate("/");
    }
  }

  if (AuthLoading) {
    return (
      <div className='d-flex justify-content-center align-items-center h-[50vh]'>
        Checking Authentication
      </div>
    );
  }

  if (Session) {
    return <Navigate to='/' replace />;
  }

  return (
    <div className='login-page'>
      <div className='login-panel'>
        <div className='login-hero'>
          <h1>RHU Learning Support Center</h1>
          <p>
            Sign in to manage student visits, workstudy staff, and support
            records.
          </p>
        </div>

        <div className='login-card'>
          <div className='login-card-header'>
            <h2>Login</h2>
            <p>Use your Learning Center account credentials to continue.</p>
          </div>

          {AuthError && (
            <div className='login-alert' role='alert'>
              {AuthError}
            </div>
          )}

          <form onSubmit={handleSubmit} className='login-form'>
            <div className='login-field'>
              <label htmlFor='email'>Email</label>

              <input
                required
                type='email'
                id='email'
                className='login-input'
                placeholder='Enter your Learning Center email'
                value={Login.email}
                onChange={(event) =>
                  setLogin({ ...Login, email: event.target.value })
                }
              />
            </div>

            <div className='login-field'>
              <label htmlFor='password'>Password</label>

              <div className='login-password-wrap'>
                <PasswordInput
                  required
                  id='password'
                  className='login-input login-password-input'
                  placeholder='Enter your password'
                  value={Login.password}
                  onChange={(event) =>
                    setLogin({ ...Login, password: event.target.value })
                  }
                />
              </div>
            </div>

            <button
              type='submit'
              className='login-submit btn btn-primary'
              disabled={AuthLoading}
            >
              {AuthLoading ? (
                <>
                  <div
                    className='spinner-border spinner-border-sm'
                    role='status'
                  >
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                  <span>Logging In</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className='login-footer-note'>
            Secure access for RHU Learning Center staff.
          </div>
        </div>
      </div>
    </div>
  );
}
