import type { Student } from "../types/students";

export type TableProps = {
  Students: Student[];
  handleUpdate: (studentId: number) => Promise<void>;
  isUpdating: number | null;
};

export default function Table({
  Students,
  handleUpdate,
  isUpdating,
}: TableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Student Name</th>
          <th>Added At</th>
          <th>Added By</th>
          <th>Visits</th>
        </tr>
      </thead>
      <tbody>
        {Students.map((student) => (
          <tr key={student.id} className='text-center'>
            <th>{student.studentId}</th>
            <td>{student.studentName}</td>
            <td>{student.added_at}</td>
            <td>{student.added_by}</td>
            <td className='hover-cell'>
              <div className='flex flex-wrap items-center'>
                <span className='grow text-center'>{student.nb_visits}</span>
                {isUpdating === student.studentId ? (
                  <></>
                ) : (
                  <button
                    className='hover-btn'
                    onClick={() => handleUpdate(student.studentId)}
                    disabled={isUpdating === student.studentId}
                  >
                    +
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
