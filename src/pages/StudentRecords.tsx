import { Navigate } from "react-router-dom";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useStudents } from "../hooks/useStudents";
import StudentTable from "../components/StudentTable";
import type { Student, StudentInput } from "../types/students";
import InputForm from "../components/InputForm";
import { useDepartments } from "../hooks/useDepartments";
import { useState, type SubmitEvent } from "react";
import { useUsers } from "../hooks/useUsers";

export default function StudentRecords() {
  useDocumentTitle("Student Records");

  const InitialValue: StudentInput = {
    studentId: NaN,
    studentName: "",
    email: "",
    department_id: NaN,
  };

  const [StudentInput, setStudentInput] = useState<StudentInput>(InitialValue);

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const {
    Students,
    Loading: StudentsLoading,
    Error: StudentsError,
    incrementStudentVisits,
    isUpdating,
  } = useStudents(Session?.user);

  const { Users, Loading: UsersLoading, Error: UsersError } = useUsers();

  const {
    Departments,
    Loading: DepartmentsLoading,
    Error: DepartmentsError,
  } = useDepartments();

  const loading =
    AuthLoading || StudentsLoading || DepartmentsLoading || UsersLoading;
  const error = AuthError || StudentsError || DepartmentsError || UsersError;

  if (error) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ height: "50vh" }}
      >
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ height: "50vh", gap: "0.5rem" }}
      >
        <Spinner className='size-5' />
        <span>{AuthLoading ? "Checking Authentication" : "Loading Data"}</span>
      </div>
    );
  }

  if (!Session) {
    return <Navigate to='/login' replace />;
  }

  async function handleUpdate(id: Student["studentId"]) {
    // TODO: Implement Loading and Error Handling for this function
    await incrementStudentVisits(id);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function UpdateFields(fields: Partial<StudentInput>) {
    setStudentInput((prev) => ({ ...prev, ...fields }));
  }

  return (
    <>
      <div className='page-header'>
        <div className='page-breadcrumb'>
          LSC–CAS › <span>Student Records</span>
        </div>
        <h1 className='page-title'>Student Support Center Visits</h1>
        <p className='page-desc'>
          Track student visits and support sessions at the Learning Support
          Center.
        </p>
      </div>

      <InputForm
        mode='student'
        handleStudentSubmit={handleSubmit}
        studentInput={StudentInput}
        updateFields={UpdateFields}
        Departments={Departments}
        loading={loading}
      />

      <StudentTable
        Students={Students}
        Users={Users}
        Departments={Departments}
        handleUpdate={handleUpdate}
        isUpdating={isUpdating}
      />
    </>
  );
}
