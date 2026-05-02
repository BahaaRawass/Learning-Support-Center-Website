import { useState, type SubmitEvent } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import InputForm from "../components/InputForm";
import type { UserInput } from "../types/users";
import { useUsers } from "../hooks/useUsers";

export default function WorkStudy() {
  useDocumentTitle("Workstudy");

  const InitialValue: UserInput = { displayname: "", email: "", password: "" };

  const { Session, Loading: AuthLoading, Error: AuthError, SignUp } = useAuth();

  const { Users, Loading: UsersLoading, Error: UsersError } = useUsers();

  const loading = AuthLoading || UsersLoading;
  const error = AuthError || UsersError;

  const [Input, setInput] = useState<UserInput>(InitialValue);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const ok = await SignUp(Input.email, Input.password, Input.displayname);

    if (ok) return setInput(InitialValue);
  }

  if (error) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <Spinner
          text={AuthLoading ? "Checking Authentication" : "Loading Data"}
        />
      </div>
    );
  }

  if (!Session) {
    return <Navigate to="/login" replace />;
  }

  function updateFields(fields: Partial<UserInput>) {
    setInput((prev) => ({ ...prev, ...fields }));
  }

  return (
    <>
      <InputForm
        mode="user"
        loading={loading}
        updateFields={updateFields}
        handleUserSubmit={handleSubmit}
        userInput={Input}
      />
      <div
        className="table-responsive"
        style={{ maxHeight: "50vh", overflowY: "auto" }}
      >
        <table className="table table-secondary table-striped table-hover table-bordered text-center align-middle">
          <thead className="table-light">
            <tr className="sticky-top">
              <th scope="col">WorkStudy ID</th>
              <th scope="col">WorkStudy Name</th>
            </tr>
          </thead>
          <tbody>
            {Users.map((user) => {
              return (
                <tr key={user.id} className="text-center">
                  <th scope="row">{user.email}</th>
                  <td className="hover-cell">
                    <div className="d-flex flex-wrap align-items-center">
                      <span className="flex-grow-1 text-center">
                        {user.role}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
