import type { User } from "../types/users";
import type { Student, StudentInput } from "../types/students";
import type { Department } from "../types/department";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";
import { useState } from "react";
import Modal from "./Modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import { Input } from "./ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { ErrorNotice } from "../types/types";

export type TableProps = {
  Students: Student[];
  Users: User[];
  Departments: Department[];
  IncrementVisits: (studentId: Student["studentId"]) => Promise<boolean>;
  UpdateStudent: (
    id: Student["studentId"],
    updatedStudent: Partial<Student>,
  ) => Promise<boolean>;
  DeleteStudent: (id: Student["studentId"]) => Promise<boolean>;
  isUpdating: number | null;
};

export default function StudentTable({
  Students,
  IncrementVisits,
  UpdateStudent,
  DeleteStudent,
  isUpdating,
  Users,
  Departments,
}: TableProps) {
  const InitialValue: StudentInput = {
    studentId: NaN,
    studentName: "",
    email: "",
    department_id: NaN,
  };

  const EmptyError: ErrorNotice = {
    id: NaN,
    message: "",
  };

  const [EditId, setEditId] = useState<Student["studentId"] | null>(null);
  const [EditValues, setEditValues] = useState<StudentInput>(InitialValue);
  const [DeletedStudent, setDeletedStudent] = useState<Student | null>(null);
  const [IsOpen, setIsOpen] = useState<boolean>(false);
  const [ErrorNotice, setErrorNotice] = useState<ErrorNotice>(EmptyError);

  function startEditing(student: Student) {
    setEditId(student.studentId);
    setEditValues({
      studentId: student.studentId,
      studentName: student.studentName,
      email: student.email,
      department_id: student.department_id,
    });
  }

  function cancelEditing() {
    setEditId(null);
    setEditValues(InitialValue);
  }

  async function handleDeleteStudent(id: Student["studentId"]) {
    const ok = await DeleteStudent(id);

    if (!ok)
      return setErrorNotice({
        id: id,
        message: "Failed to delete student. Please try again.",
      });
  }

  async function handleEditStudent(id: Student["studentId"]) {
    const ok = await UpdateStudent(id, EditValues);

    if (!ok)
      return setErrorNotice({
        id: id,
        message: "Failed to update student. Please try again.",
      });
    else return cancelEditing();
  }

  async function handleIncrementVisits(id: Student["studentId"]) {
    if (isUpdating) return;

    const ok = await IncrementVisits(id);

    if (!ok)
      return setErrorNotice({
        id: id,
        message: "Failed to update student visits. Please try again.",
      });
  }

  function updateFields(fields: Partial<StudentInput>) {
    setEditValues((prev) => ({ ...prev, ...fields }));
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center'></TableHead>
            <TableHead className='text-center'>Student ID</TableHead>
            <TableHead className='text-center'>Student Name</TableHead>
            <TableHead className='text-center'>Email</TableHead>
            <TableHead className='text-center'>Department</TableHead>
            <TableHead className='text-center'>Added By</TableHead>
            <TableHead className='text-center'>Added At</TableHead>
            <TableHead className='text-center'>Courses Asked About</TableHead>
            <TableHead className='text-center'>Visits</TableHead>
            <TableHead className='text-center'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Students.length > 0 ? (
            Students.map((student, index) => {
              const isEditing = EditId === student.studentId;

              if (ErrorNotice.id === student.studentId)
                return (
                  <TableRow key={student.id}>
                    <TableCell
                      colSpan={10}
                      className='text-center text-red-500 bg-red-500/5'
                    >
                      {ErrorNotice.message}
                    </TableCell>
                  </TableRow>
                );

              return (
                <TableRow key={student.id}>
                  <TableHead className='text-center'>{index + 1}</TableHead>
                  <TableCell className='text-center'>
                    {isEditing ? (
                      <Input
                        type='number'
                        placeholder='Student ID'
                        value={EditValues.studentId}
                        onChange={(event) =>
                          updateFields({
                            studentId: parseInt(event.target.value),
                          })
                        }
                      />
                    ) : (
                      student.studentId
                    )}
                  </TableCell>
                  <TableCell className='text-center'>
                    {isEditing ? (
                      <Input
                        type='text'
                        placeholder='Student Name'
                        value={EditValues.studentName}
                        onChange={(event) =>
                          updateFields({ studentName: event.target.value })
                        }
                      />
                    ) : (
                      student.studentName
                    )}
                  </TableCell>
                  <TableCell className='text-center'>
                    {isEditing ? (
                      <Input
                        type='email'
                        placeholder='Email'
                        value={EditValues.email || ""}
                        onChange={(event) =>
                          updateFields({ email: event.target.value })
                        }
                      />
                    ) : (
                      student.email || "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={String(EditValues.department_id ?? "")}
                        onValueChange={(value) => {
                          updateFields({ department_id: parseInt(value) });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a department' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select a Department</SelectLabel>
                            {Departments.map((department, index) => (
                              <div key={department.id}>
                                <SelectItem value={String(department.id)}>
                                  {department.name}
                                </SelectItem>
                                {index !== Departments.length - 1 && (
                                  <SelectSeparator />
                                )}
                              </div>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      Departments.find(
                        (dept) => dept.id === student.department_id,
                      )?.name
                    )}
                  </TableCell>
                  <TableCell>
                    {Users.find((user) => user.id === student.added_by)
                      ?.display_name || "—"}
                  </TableCell>
                  <TableCell>{student.added_at}</TableCell>
                  <TableCell>
                    <span className='text-black text-[0.9rem]'>—</span>
                  </TableCell>
                  <TableCell>
                    {isUpdating === student.studentId ? (
                      <Spinner />
                    ) : (
                      student.nb_visits
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className='cursor-pointer'>
                        <Button variant='secondary'>
                          <MoreHorizontalIcon />
                          <span className='sr-only'>Open Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='center'
                        className='focus:bg-none w-full'
                      >
                        {!isEditing && (
                          <>
                            <DropdownMenuItem>
                              <Button
                                className='cursor-pointer'
                                onClick={() => startEditing(student)}
                              >
                                Edit
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {isEditing && (
                          <>
                            <DropdownMenuItem>
                              <Button
                                className='cursor-pointer'
                                onClick={() => {
                                  console.log("Clicked");
                                  handleEditStudent(student.studentId);
                                }}
                              >
                                Submit Edits
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {isEditing && (
                          <DropdownMenuItem variant='destructive'>
                            <Button
                              variant='destructive'
                              className='cursor-pointer'
                              onClick={cancelEditing}
                            >
                              Cancel Edits
                            </Button>
                          </DropdownMenuItem>
                        )}
                        {!isEditing && (
                          <DropdownMenuItem>
                            <Button
                              className='cursor-pointer'
                              onClick={() =>
                                handleIncrementVisits(student.studentId)
                              }
                            >
                              Increment Visits
                            </Button>
                          </DropdownMenuItem>
                        )}
                        {!isEditing && (
                          <DropdownMenuItem variant='destructive'>
                            <Button
                              variant='destructive'
                              className='cursor-pointer'
                              onClick={() => {
                                setIsOpen(true);
                                setDeletedStudent(student);
                              }}
                            >
                              Delete
                            </Button>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={10} className='text-center text-muted'>
                No student records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {IsOpen && (
        <Modal
          Open={IsOpen}
          setOpen={setIsOpen}
          text={DeletedStudent?.studentName || "this student"}
          handleDelete={async () => {
            if (DeletedStudent)
              await handleDeleteStudent(DeletedStudent.studentId);
          }}
        />
      )}
    </>
  );
}
