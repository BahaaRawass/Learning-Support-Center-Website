import type { SubmitEvent } from "react";
import type { StudentInput } from "../types/students";
import type { UserInput } from "../types/users";

type UpdateFieldsType<T> = (fields: Partial<T>) => void;

type InputFormProps = {
  loading: boolean;
} & (
  | {
      mode: "student";
      studentInput: StudentInput;
      handleStudentSubmit: (
        event: SubmitEvent<HTMLFormElement>,
      ) => Promise<void>;
      updateFields: UpdateFieldsType<StudentInput>;
      userInput?: never;
      handleUserSubmit?: never;
    }
  | {
      mode: "user";
      userInput: UserInput;
      handleUserSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
      updateFields: UpdateFieldsType<UserInput>;
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
}: InputFormProps) {
  return (
    <form
      onSubmit={mode === "student" ? handleStudentSubmit : handleUserSubmit}
      className='d-flex flex-column flex-wrap gap-2 justify-content-center align-items-center h-[50vh]'
    >
      {mode === "student" && (
        <>
          <div className='form-group'>
            <label htmlFor='name'>Student Name:</label>
            <input
              required
              type='text'
              className='form-control border-2 border-secondary'
              id='name'
              value={studentInput.studentName}
              onChange={(event) => {
                updateFields({ studentName: event.target.value });
                console.log(event.target.value);
              }}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='name'>Student Email: (Optional)</label>
            <input
              required
              type='text'
              className='form-control border-2 border-secondary'
              id='name'
              value={studentInput.email || ""}
              onChange={(event) => updateFields({ email: event.target.value })}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='id'>Student ID</label>
            <input
              required
              type='number'
              id='id'
              className='form-control border-2 border-secondary'
              value={
                isNaN(studentInput.studentId) ? "" : studentInput.studentId
              }
              onChange={(event) =>
                updateFields({ studentId: parseInt(event.target.value) })
              }
            />
          </div>
        </>
      )}

      {mode === "user" && (
        <>
          <div className='form-group'>
            <label htmlFor='name'>WorkStudy Name:</label>
            <input
              required
              type='text'
              className='form-control border-2 border-secondary'
              id='name'
              value={userInput.displayname}
              onChange={(event) =>
                updateFields({ displayname: event.target.value })
              }
            />
          </div>
          <div className='form-group'>
            <label htmlFor='name'>WorkStudy Email:</label>
            <input
              required
              type='text'
              className='form-control border-2 border-secondary'
              id='name'
              value={userInput.email}
              onChange={(event) => updateFields({ email: event.target.value })}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='id'>WorkStudy password:</label>
            <input
              required
              type='password'
              id='password'
              className='form-control border-2 border-secondary'
              value={userInput.password}
              onChange={(event) =>
                updateFields({ password: event.target.value })
              }
            />
          </div>
        </>
      )}

      {loading ? (
        <></>
      ) : (
        <button type='submit' className='btn btn-dark' disabled={loading}>
          Add
        </button>
      )}
    </form>
  );
}
