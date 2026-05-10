import { Navigate } from "react-router-dom";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useStudents } from "../hooks/useStudents";

export default function StudentRecords() {
  useDocumentTitle("Student Records");

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const {
    Students,
    Loading: StudentsLoading,
    Error: StudentsError,
  } = useStudents(Session?.user);

  const loading = AuthLoading || StudentsLoading;
  const error = AuthError || StudentsError;

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
        style={{ height: "50vh", gap: "0.5rem" }}
      >
        <Spinner className="size-5" />
        <span>{AuthLoading ? "Checking Authentication" : "Loading Data"}</span>
      </div>
    );
  }

  if (!Session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          LSC–CAS › <span>Student Records</span>
        </div>
        <h1 className="page-title">Student Support Center Visits</h1>
        <p className="page-desc">
          Track student visits and support sessions at the Learning Support
          Center.
        </p>
      </div>

      <div
        className="table-responsive"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <table className="table table-secondary table-striped table-hover table-bordered text-center align-middle">
          <thead className="table-light">
            <tr className="sticky-top">
              <th scope="col">Student ID</th>
              <th scope="col">Student Name</th>
              <th scope="col">Email</th>
              <th scope="col">Visits</th>
              <th scope="col">Courses Asked About</th>
              <th scope="col">Staff Visited</th>
            </tr>
          </thead>

          <tbody>
            {Students.length > 0 ? (
              Students.map((student) => (
                <tr key={student.id} className="text-center">
                  <th scope="row">{student.studentId}</th>
                  <td>{student.studentName}</td>
                  <td>{student.email || "—"}</td>
                  <td>
                    <span className="badge bg-primary">
                      {student.nb_visits || 0}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      —
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      —
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No student records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginTop: "1rem",
          fontStyle: "italic",
        }}
      >
        Note: "Courses Asked About" and "Staff Visited" columns require tracking
        data to be implemented in the system.
      </p>
    </>
  );
}