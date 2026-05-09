import type { Student } from "../types/students";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export type TableProps = {
  Students: Student[];
  handleUpdate: (studentId: number) => Promise<void>;
  isUpdating: number | null;
};

export default function StudentTable({
  Students,
  handleUpdate,
  isUpdating,
}: TableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student ID</TableHead>
          <TableHead>Student Name</TableHead>
          <TableHead>Added At</TableHead>
          <TableHead>Added By</TableHead>
          <TableHead>Visits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Students.map((student) => (
          <TableRow key={student.id} className='text-center'>
            <TableCell>{student.studentId}</TableCell>
            <TableCell>{student.studentName}</TableCell>
            <TableCell>{student.added_at}</TableCell>
            <TableCell>{student.added_by}</TableCell>
            <TableCell className='hover-cell'>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
