import { Navigate } from "react-router-dom";
import InputForm from "../components/InputForm";
import Table from "../components/Table";
import { checkDupes, formatDate } from "../helper/functions";
import Spinner from "../components/Spinner";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuth } from "../hooks/useAuth";
import { useStudents } from "../hooks/useStudents";
import { useState, type SubmitEvent } from "react";
import { titleCase } from "title-case";
import { CSVLink } from "react-csv";
import exportImage from "../assets/Images/file-export_24.png";
import type { NewStudent, StudentInput } from "../types/students";

export default function Home() {
  useDocumentTitle("Home");

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const {
    Students,
    Loading: StudentsLoading,
    Error: StudentsError,
    addStudent,
    incrementStudentVisits,
    isUpdating,
  } = useStudents(Session?.user);

  const InitialValue: StudentInput = {
    studentName: "",
    studentId: NaN,
    email: "",
  };

  const [StudentInput, setStudentInput] = useState<StudentInput>(InitialValue);

  function updateFields(fields: Partial<StudentInput>) {
    setStudentInput((prev) => ({ ...prev, ...fields }));
  }

  const loading = AuthLoading || StudentsLoading;
  const error = AuthError || StudentsError;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!Session || loading) return;

    if (checkDupes(Students, StudentInput)) {
      alert("the ID  or email already exists!!");
      return;
    }

    const newStudent: NewStudent = {
      id: crypto.randomUUID(),
      studentId: StudentInput.studentId,
      studentName: titleCase(StudentInput.studentName),
      email: StudentInput.email,
      added_at: formatDate(),
      added_by: Session.user.id,
      nb_visits: 1,
    };

    const ok = await addStudent(newStudent);

    if (ok) setStudentInput(InitialValue);
  }

  async function handleUpdate(studentId: number) {
    if (isUpdating) return;

    await incrementStudentVisits(studentId);
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

  const headers = [
    { label: "Student ID", key: "studentId" },
    { label: "Student Name", key: "studentName" },
    { label: "Student Email", key: "email" },
    { label: "Added At", key: "added_at" },
    { label: "Added By", key: "added_by" },
    { label: "Visits", key: "nb_visits" },
  ];

  return (
    <>
      <InputForm
        mode="student"
        studentInput={StudentInput}
        updateFields={updateFields}
        loading={loading}
        handleStudentSubmit={handleSubmit}
      />
      {Session.user.role === "admin" && (
        <div className="d-flex justify-content-end mb-3">
          {/* Button to extract the table to a csv file */}
          <CSVLink
            data={Students}
            headers={headers}
            filename="Learning Support Center Student Visits.csv"
            className="btn btn-success"
          >
            <img src={exportImage} alt="" />
            Export CSV
          </CSVLink>
        </div>
      )}
      <Table
        Students={Students}
        handleUpdate={handleUpdate}
        isUpdating={isUpdating}
      />
    </>
  );
}
