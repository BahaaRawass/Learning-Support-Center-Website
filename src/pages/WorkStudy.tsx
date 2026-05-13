import InputForm from "@/components/InputForm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/helper/functions";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSettings } from "@/hooks/useSettings";
import { useUsers } from "@/hooks/useUsers";
import { exportData } from "@/lib/exportUtils";
import type { NewUser, User, UserInput } from "@/types/users";
import { MoreHorizontalIcon } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Navigate } from "react-router-dom";

export default function WorkStudy() {
  useDocumentTitle("Support Center Staff");

  const InitialValue: UserInput = {
    displayname: "",
    email: "",
    password: "",
    department_id: NaN,
    isSupervisor: false,
  };

  const [Input, setInput] = useState<UserInput>(InitialValue);
  const [LocalError, setLocalError] = useState<string>("");

  const {
    Session,
    Loading: AuthLoading,
    Error: AuthError,
    SignUp,
    RestoreSession,
    DeleteUser,
  } = useAuth();

  const {
    Users,
    Loading: UsersLoading,
    Error: UsersError,
    AddUser,
  } = useUsers(Session?.user);

  const {
    Departments,
    Loading: DepartmentsLoading,
    Error: DepartmentsError,
  } = useDepartments();

  const { Settings } = useSettings();

  const loading = AuthLoading || UsersLoading || DepartmentsLoading;
  const error = AuthError || UsersError || DepartmentsError || LocalError;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const prevSession = Session;

    const SignUpData = await SignUp(
      Input.email,
      Input.password,
      Input.displayname,
      Input.isSupervisor,
      Input.department_id,
    );

    if (!SignUpData?.user)
      return setLocalError("Failed to create account. Please try again.");

    const UserId = SignUpData.user.id;

    if (prevSession) {
      await RestoreSession(prevSession);
    }

    const newUser: NewUser = {
      id: UserId,
      email: Input.email,
      display_name: Input.displayname,
      role: Input.isSupervisor ? "admin" : "workstudy",
      department_id: Input.department_id,
    };

    const Insert_confirmed = await AddUser(newUser);

    if (Insert_confirmed) return setInput(InitialValue);
  }

  function updateFields(fields: Partial<UserInput>) {
    setInput((prev) => ({ ...prev, ...fields }));
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

  if (Session.user.user_metadata.role !== "admin") {
    alert("You do not have permission to access this page.");
    return <Navigate to='/' replace />;
  }

  async function handleDelete(id: User["id"]) {
    const ok = await DeleteUser(id);

    if (!ok) {
      setLocalError("Failed to remove user. Please try again.");
    }
  }

  function handleExport() {
    const exportData_formatted = Users.map((user) => ({
      Name: user.display_name,
      Email: user.email,
      Role: user.role,
      Department:
        Departments.find((d) => d.id === user.department_id)?.name || "—",
      "Created At": formatDate(user.created_at),
    }));

    exportData(
      exportData_formatted,
      Settings.exportFormat as "csv" | "excel",
      "support-center-staff",
    );
  }

  return (
    <>
      <div className='page-header'>
        <div className='page-breadcrumb'>
          LSC–CAS › <span>Support Center Staff</span>
        </div>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='page-title'>Support Center Staff Management</h1>
            <p className='page-desc'>Manage Support Center Staff accounts.</p>
          </div>
          <button
            onClick={handleExport}
            className='btn btn-primary export-button'
          >
            Export {Settings.exportFormat === "csv" ? "CSV" : "Excel"}
          </button>
        </div>
      </div>

      <InputForm
        mode='user'
        loading={loading}
        updateFields={updateFields}
        handleUserSubmit={handleSubmit}
        userInput={Input}
        Departments={Departments}
        formError={error}
      />

      <div className='mt-8'>
        <h2 className='text-xl text-(--navy) mb-4 font-serif font-semibold'>
          Active WorkStudy Accounts
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-center'></TableHead>
              <TableHead className='text-center'>Name</TableHead>
              <TableHead className='text-center'>Email</TableHead>
              <TableHead className='text-center'>Role</TableHead>
              <TableHead className='text-center'>Department</TableHead>
              <TableHead className='text-center'>Added At</TableHead>
              <TableHead className='text-center'>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Users.length > 0 ? (
              Users.map((user, index) => {
                if (user.id === Session.user.id) return null;

                return (
                  <TableRow key={user.id}>
                    <TableHead className='text-center'>{index + 1}</TableHead>
                    <TableCell className='text-center'>
                      {user.display_name}
                    </TableCell>
                    <TableCell className='text-center'>{user.email}</TableCell>
                    <TableCell className='text-center'>{user.role}</TableCell>
                    <TableCell className='text-center'>
                      {Departments.find(
                        (department) => department.id === user.department_id,
                      )?.name || "—"}
                    </TableCell>
                    <TableCell className='text-center'>
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild className='cursor-pointer'>
                          <Button variant='secondary'>
                            <MoreHorizontalIcon />
                            <span className='sr-only'>Open Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align='center'
                          className='focus:bg-none w-full'
                        >
                          <DropdownMenuItem variant='destructive'>
                            <Button
                              variant='destructive'
                              onClick={() => handleDelete(user.id)}
                            >
                              Remove
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className='text-center text-muted'>
                  No workstudy accounts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
