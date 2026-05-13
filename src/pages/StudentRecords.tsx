import InputForm from "@/components/InputForm";
import StudentTable from "@/components/StudentTable";
import { Spinner } from "@/components/ui/spinner";
import { checkDupes, formatDate } from "@/helper/functions";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSettings } from "@/hooks/useSettings";
import { useStudents } from "@/hooks/useStudents";
import { useUsers } from "@/hooks/useUsers";
import { exportData } from "@/lib/exportUtils";
import type { NewStudent, StudentInput } from "@/types/students";
import { useState, type SubmitEvent } from "react";
import { Navigate } from "react-router-dom";

export default function StudentRecords() {
  useDocumentTitle("Student Records");

  const InitialValue: StudentInput = {
    studentId: NaN,
    studentName: "",
    email: "",
    department_id: NaN,
  };

  const [StudentInput, setStudentInput] = useState<StudentInput>(InitialValue);
  const [LocalError, setLocalError] = useState<string>("");

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();
  const { Settings } = useSettings();

  const {
    Students,
    Loading: StudentsLoading,
    Error: StudentsError,
    incrementStudentVisits,
    isUpdating,
    addStudent,
    UpdateStudent,
    DeleteStudent,
  } = useStudents(Session?.user);

  const {
    Users,
    Loading: UsersLoading,
    Error: UsersError,
  } = useUsers(Session?.user);

  const {
    Departments,
    Loading: DepartmentsLoading,
    Error: DepartmentsError,
  } = useDepartments();

  const loading =
    AuthLoading || StudentsLoading || DepartmentsLoading || UsersLoading;
  const error =
    AuthError || StudentsError || DepartmentsError || UsersError || LocalError;

  if (error && !LocalError) {
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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !Session) return;

    if (checkDupes(Students, StudentInput))
      return setLocalError("A student with this ID or email already exists.");

    const newStudent: NewStudent = {
      studentName: StudentInput.studentName,
      studentId: StudentInput.studentId,
      email: StudentInput.email,
      department_id: StudentInput.department_id,
      added_at: formatDate(),
      added_by: Session.user.id,
      nb_visits: 1,
    };

    const ok = await addStudent(newStudent);

    if (ok) {
      setStudentInput(InitialValue);
      setLocalError("");
    } else {
      setLocalError("Failed to add student. Please try again.");
    }
  }

  function handleExport() {
    const exportData_formatted = Students.map((student) => ({
      "Student ID": student.studentId,
      "Student Name": student.studentName,
      Email: student.email,
      Department:
        Departments.find((d) => d.id === student.department_id)?.name || "—",
      "Added By":
        Users.find((u) => u.id === student.added_by)?.display_name || "—",
      "Added At": student.added_at,
      Visits: student.nb_visits,
    }));

    exportData(
      exportData_formatted,
      Settings.exportFormat as "csv" | "excel",
      "student-records",
    );
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 className='page-title'>Student Support Center Visits</h1>
            <p className='page-desc'>
              Track student visits and support sessions at the Learning Support
              Center.
            </p>
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
        mode='student'
        handleStudentSubmit={handleSubmit}
        studentInput={StudentInput}
        updateFields={UpdateFields}
        Departments={Departments}
        loading={loading}
        formError={error}
      />

      <StudentTable
        Students={Students}
        Users={Users}
        Departments={Departments}
        IncrementVisits={incrementStudentVisits}
        UpdateStudent={UpdateStudent}
        DeleteStudent={DeleteStudent}
        isUpdating={isUpdating}
      />
    </>
  );
}
