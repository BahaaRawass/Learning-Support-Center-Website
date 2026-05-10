import type { User } from "../types/users";
import type { Student } from "../types/students";
import type { Department } from "../types/department";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export type TableProps = {
  Students: Student[];
  Users: User[];
  Departments: Department[];
  handleUpdate: (studentId: number) => Promise<void>;
  isUpdating: number | null;
};

export default function StudentTable({
  Students,
  handleUpdate,
  isUpdating,
  Users,
  Departments,
}: TableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='text-center'>Student ID</TableHead>
          <TableHead className='text-center'>Student Name</TableHead>
          <TableHead className='text-center'>Email</TableHead>
          <TableHead className='text-center'>Department</TableHead>
          <TableHead className='text-center'>Added By</TableHead>
          <TableHead className='text-center'>Courses Asked About</TableHead>
          <TableHead className='text-center'>Visits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Students.length > 0 ? (
          Students.map((student) => (
            <TableRow key={student.id} className='text-center'>
              <TableHead className='text-center'>{student.studentId}</TableHead>
              <TableCell className='text-center'>
                {student.studentName}
              </TableCell>
              <TableCell className='text-center'>
                {student.email || "—"}
              </TableCell>
              <TableCell>
                {Departments.find((dept) => dept.id === student.department_id)
                  ?.name || "—"}
              </TableCell>
              <TableCell>
                {Users.find((user) => user.id === student.added_by)
                  ?.display_name || "—"}
              </TableCell>
              <TableCell>
                <span className='text-black text-[0.9rem]'>—</span>
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap items-center'>
                  <span className='grow text-center'>{student.nb_visits}</span>
                  {isUpdating === student.studentId ? (
                    <></>
                  ) : (
                    <button
                      className='text-black'
                      onClick={() => handleUpdate(student.studentId)}
                      disabled={isUpdating === student.studentId}
                    >
                      +
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className='text-center text-muted'>
              No student records found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
