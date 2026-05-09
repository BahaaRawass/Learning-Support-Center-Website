import { useState, type SubmitEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import InputForm from "../components/InputForm";
import type { NewUser, UserInput } from "../types/users";
import { useUsers } from "../hooks/useUsers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useDepartments } from "../hooks/useDepartments";

export default function WorkStudy() {
  useDocumentTitle("Workstudy");

  const InitialValue: UserInput = {
    displayname: "",
    email: "",
    password: "",
    department_id: NaN,
    isSupervisor: false,
  };

  const {
    Session,
    Loading: AuthLoading,
    Error: AuthError,
    SignUp,
    RestoreSession,
  } = useAuth();

  const {
    Users,
    Loading: UsersLoading,
    Error: UsersError,
    AddUser,
  } = useUsers();

  const {
    Departments,
    Loading: DepartmentsLoading,
    Error: DepartmentsError,
  } = useDepartments();

  const loading = AuthLoading || UsersLoading || DepartmentsLoading;
  const error = AuthError || UsersError || DepartmentsError;

  const [Input, setInput] = useState<UserInput>(InitialValue);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const prevSession = Session;

    const Auth_confirmed = await SignUp(
      Input.email,
      Input.password,
      Input.displayname,
      Input.isSupervisor,
    );

    if (prevSession) await RestoreSession(prevSession);

    const newUser: NewUser = {
      email: Input.email,
      display_name: Input.displayname,
      role: Input.isSupervisor ? "admin" : "workstudy",
      department_id: Input.department_id,
    };

    const Insert_confirmed = await AddUser(newUser);

    if (Auth_confirmed && Insert_confirmed) {
      setInput(InitialValue);
    }
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-[50vh]'>{error}</div>
    );
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-[50vh]'>
        {AuthLoading ? "Checking Authentication" : "Loading Data"}
      </div>
    );
  }

  if (!Session) {
    return <Navigate to='/login' replace />;
  }

  function updateFields(fields: Partial<UserInput>) {
    setInput((prev) => ({ ...prev, ...fields }));
  }

  return (
    <>
      <InputForm
        mode='user'
        loading={loading}
        updateFields={updateFields}
        handleUserSubmit={handleSubmit}
        userInput={Input}
        Departments={Departments}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-left'>WorkStudy Name</TableHead>
            <TableHead className='text-center'>WorkStudy Email</TableHead>
            <TableHead className='text-right'>WorkStudy Added At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Users.map((user) => {
            return (
              <TableRow key={user.id}>
                <TableHead scope='row' className='text-left'>
                  {user.display_name}
                </TableHead>
                <TableCell className='text-center'>{user.email}</TableCell>
                <TableCell className='text-right'>{user.created_at}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
