import { useState, type SubmitEvent } from "react";
import type { StudentInput } from "../types/students";
import type { UserInput } from "../types/users";

type Department = {
  id: number;
  name: string;
};

type UpdateFieldsType<T> = (fields: Partial<T>) => void;

type InputFormProps = {
  loading: boolean;
} & (
  | {
      mode: "student";
      studentInput: StudentInput;
      handleStudentSubmit: (
        event: SubmitEvent<HTMLFormElement>
      ) => Promise<void>;
      updateFields: UpdateFieldsType<StudentInput>;
      userInput?: never;
      handleUserSubmit?: never;
      Departments?: never;
    }
  | {
      mode: "user";
      userInput: UserInput;
      handleUserSubmit: (
        event: SubmitEvent<HTMLFormElement>
      ) => Promise<void>;
      updateFields: UpdateFieldsType<UserInput>;
      Departments: Department[];
      studentInput?: never;
      handleStudentSubmit?: never;
    }
);

export default function InputForm({
  loading,
  mode,
  handleStudentSubmit,
  handleUserSubmit,
  studentInput,
  userInput,
  updateFields,
  Departments,
}: InputFormProps) {
  const isStudent = mode === "student";
  const [showPassword, setShowPassword] = useState(false);

  const title = isStudent ? "Add New Student" : "Add New WorkStudy Staff";

  const description = isStudent
    ? "Register a new student to track their support center visits"
    : "Create a new WorkStudy staff account";

  return (
    <div className="form-card">
      <div className="form-card-header gold">
        <div className="section-number">+</div>

        <div>
          <h3 className="section-title">{title}</h3>
          <p className="section-desc">{description}</p>
        </div>
      </div>

      <div className="form-body">
        <form onSubmit={isStudent ? handleStudentSubmit : handleUserSubmit}>
          <div className={isStudent ? "grid-3" : "grid-1"}>
            {isStudent && (
              <>
                <div className="field">
                  <label htmlFor="studentName">
                    Student Name <span className="required">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    id="studentName"
                    placeholder="John Doe"
                    value={studentInput.studentName}
                    onChange={(event) =>
                      updateFields({ studentName: event.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="studentId">
                    Student ID <span className="required">*</span>
                  </label>

                  <input
                    required
                    type="number"
                    id="studentId"
                    placeholder="123456"
                    value={
                      Number.isNaN(studentInput.studentId)
                        ? ""
                        : studentInput.studentId
                    }
                    onChange={(event) =>
                      updateFields({
                        studentId: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="studentEmail">
                    Email <span className="required">*</span>
                  </label>

                  <input
                    required
                    type="email"
                    id="studentEmail"
                    placeholder="john@example.com"
                    value={studentInput.email || ""}
                    onChange={(event) =>
                      updateFields({ email: event.target.value })
                    }
                  />
                </div>
              </>
            )}

            {!isStudent && (
              <>
                <div className="field">
                  <label htmlFor="displayname">
                    Display Name <span className="required">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    id="displayname"
                    placeholder="Jane Smith"
                    value={userInput.displayname}
                    onChange={(event) =>
                      updateFields({ displayname: event.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>

                  <input
                    required
                    type="email"
                    id="email"
                    placeholder="jane@example.com"
                    value={userInput.email}
                    onChange={(event) =>
                      updateFields({ email: event.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="password">
                    Password <span className="required">*</span>
                  </label>

                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      value={userInput.password}
                      onChange={(event) =>
                        updateFields({ password: event.target.value })
                      }
                      style={{ paddingRight: "2.5rem" }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((currentValue) => !currentValue)
                      }
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ width: "18px", height: "18px" }}
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
                          style={{ width: "18px", height: "18px" }}
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="isSupervisor">Account Type</label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      id="isSupervisor"
                      checked={userInput.isSupervisor}
                      onChange={(event) =>
                        updateFields({ isSupervisor: event.target.checked })
                      }
                    />
                    Supervisor / Admin
                  </label>
                </div>

                <div className="field">
                  <label htmlFor="department_id">
                    Department <span className="required">*</span>
                  </label>

                  <select
                    required
                    id="department_id"
                    value={
                      Number.isNaN(userInput.department_id)
                        ? ""
                        : String(userInput.department_id)
                    }
                    onChange={(event) =>
                      updateFields({
                        department_id: Number(event.target.value),
                      })
                    }
                  >
                    <option value="">-- Select a Department --</option>

                    {Departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: "1.5rem" }}>
            <div></div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : `Add ${isStudent ? "Student" : "Staff Member"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}