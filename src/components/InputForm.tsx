import type { InputFormProps } from "@/types/types";

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
  return (
    <form
      onSubmit={mode === "student" ? handleStudentSubmit : handleUserSubmit}
      className='flex flex-col flex-wrap gap-2 justify-center items-center h-[50vh]'
    >
      {mode === "student" && (
        <>
          <div>
            <label htmlFor='name'>Student Name:</label>
            <input
              required
              type='text'
              id='name'
              value={studentInput.studentName}
              onChange={(event) => {
                updateFields({ studentName: event.target.value });
                console.log(event.target.value);
              }}
            />
          </div>
          <div>
            <label htmlFor='name'>Student Email: (Optional)</label>
            <input
              required
              type='text'
              id='name'
              value={studentInput.email || ""}
              onChange={(event) => updateFields({ email: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor='id'>Student ID</label>
            <input
              required
              type='number'
              id='id'
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
          <div>
            <label htmlFor='name'>WorkStudy Name:</label>
            <input
              required
              type='text'
              id='name'
              value={userInput.displayname}
              onChange={(event) =>
                updateFields({ displayname: event.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor='name'>WorkStudy Email:</label>
            <input
              required
              type='text'
              id='name'
              value={userInput.email}
              onChange={(event) => updateFields({ email: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor='password'>WorkStudy password:</label>
            <input
              required
              type='password'
              id='password'
              value={userInput.password}
              onChange={(event) =>
                updateFields({ password: event.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor='isSupervisor'>IsSupervisor:</label>
            <input
              type='checkbox'
              id='isSupervisor'
              checked={userInput.isSupervisor}
              onChange={(event) =>
                updateFields({ isSupervisor: event.target.checked })
              }
            />
          </div>
          <div>
            <label htmlFor='department_id'>Select A Department:</label>
            <select
              required
              id='department_id'
              value={String(userInput.department_id)}
              onChange={(event) =>
                updateFields({ department_id: parseInt(event.target.value) })
              }
            >
              <option value=''>-- Select a Department --</option>
              {Departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
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
