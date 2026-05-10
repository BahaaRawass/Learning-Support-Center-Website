import type { InputFormProps } from "../types/types";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "../components/ui/field";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { Input } from "./ui/input";
import PasswordInput from "./PasswordInput";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";

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

  const title = isStudent ? "Add New Student" : "Add New WorkStudy";

  const description = isStudent
    ? "Register a new student to track their support center visits"
    : "Create a new WorkStudy account";

  console.log(userInput?.isSupervisor);

  return (
    <FieldSet className='form-card &>*:block!'>
      <FieldGroup className='form-card-header gold'>
        <FieldTitle className='section-title'>{title}</FieldTitle>
        <FieldDescription className='section-desc'>
          {description}
        </FieldDescription>
      </FieldGroup>

      <FieldGroup className='form-body'>
        <form onSubmit={isStudent ? handleStudentSubmit : handleUserSubmit}>
          <div className={isStudent ? "grid-3" : "grid-1"}>
            {isStudent && (
              <>
                <Field className='field'>
                  <FieldLabel htmlFor='studentName'>
                    Student Name <span className='required'>*</span>
                  </FieldLabel>

                  <Input
                    required
                    type='text'
                    id='studentName'
                    placeholder='John Doe'
                    value={studentInput.studentName}
                    onChange={(event) =>
                      updateFields({ studentName: event.target.value })
                    }
                  />
                  <FieldDescription>
                    Enter the full name of the student.
                  </FieldDescription>
                </Field>

                <Field className='field'>
                  <FieldLabel htmlFor='studentId'>
                    Student ID <span className='required'>*</span>
                  </FieldLabel>

                  <Input
                    required
                    type='number'
                    id='studentId'
                    placeholder='123456'
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
                  <FieldDescription>Enter the student ID</FieldDescription>
                </Field>

                <Field className='field'>
                  <FieldLabel htmlFor='studentEmail'>Student Email</FieldLabel>

                  <Input
                    required
                    type='email'
                    id='studentEmail'
                    placeholder='john.doe@students.rhu.edu'
                    value={studentInput.email || ""}
                    onChange={(event) =>
                      updateFields({ email: event.target.value })
                    }
                  />
                  <FieldDescription>
                    Enter the student's email address
                    <FieldSeparator />
                    Optional
                  </FieldDescription>
                </Field>

                <Field className='field'>
                  <FieldLabel htmlFor='studentDepartment'>
                    Student Department <span className='required'>*</span>
                  </FieldLabel>

                  <Select
                    value={String(studentInput.department_id)}
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
                  <FieldDescription>
                    Enter the student's department
                  </FieldDescription>
                </Field>
              </>
            )}

            {!isStudent && (
              <>
                <Field className='field'>
                  <FieldLabel htmlFor='displayname'>
                    Display Name <span className='required'>*</span>
                  </FieldLabel>

                  <Input
                    required
                    type='text'
                    id='displayname'
                    placeholder='Jane Smith'
                    value={userInput.displayname}
                    onChange={(event) =>
                      updateFields({ displayname: event.target.value })
                    }
                  />
                </Field>

                <Field className='field'>
                  <FieldLabel htmlFor='email'>
                    Email <span className='required'>*</span>
                  </FieldLabel>

                  <Input
                    required
                    type='email'
                    id='email'
                    placeholder='jane@example.com'
                    value={userInput.email}
                    onChange={(event) =>
                      updateFields({ email: event.target.value })
                    }
                  />
                </Field>

                <Field className='field'>
                  <FieldLabel htmlFor='password'>
                    Password <span className='required'>*</span>
                  </FieldLabel>

                  <PasswordInput
                    id='password'
                    placeholder='••••••••'
                    value={userInput.password}
                    onChange={(event) =>
                      updateFields({ password: event.target.value })
                    }
                    className='pr-10'
                  />
                </Field>

                <FieldGroup>
                  <Field orientation='horizontal'>
                    <Checkbox
                      id='isSupervisor'
                      name='isSupervisor'
                      className='cursor-pointer rounded-[5px]! size-6!'
                      checked={userInput.isSupervisor}
                      onCheckedChange={(checked) =>
                        updateFields({ isSupervisor: Boolean(checked) })
                      }
                    />
                    <FieldContent>
                      <FieldLabel
                        htmlFor='isSupervisor'
                        className='cursor-pointer'
                      >
                        Is Supervisor
                      </FieldLabel>
                      <FieldDescription>
                        Is This account for a supervisor?
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <Field className='field'>
                  <FieldLabel htmlFor='studentDepartment'>
                    Student Department <span className='required'>*</span>
                  </FieldLabel>

                  <Select
                    value={String(userInput.department_id)}
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
                  <FieldDescription>
                    Enter the{" "}
                    {isStudent
                      ? "student"
                      : userInput.isSupervisor
                        ? "supervisor"
                        : "workstudy"}
                    's department
                  </FieldDescription>
                </Field>
              </>
            )}
          </div>

          <FieldLegend className='form-actions'>
            <Button
              type='submit'
              className='btn btn-primary p-5!'
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : `Add ${isStudent ? "Student" : userInput.isSupervisor ? "Supervisor" : "WorkStudy"}`}
            </Button>
          </FieldLegend>
        </form>
      </FieldGroup>
    </FieldSet>
  );
}
