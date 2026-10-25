import type { StudentInput } from "@/types/students";
import type { UserInput } from "@/types/users";
import type { BookingInput } from "./calendar";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateStudentInput(input: StudentInput) {
  const {
    studentName,
    studentId,
    email,
    department_id,
    askedCourses,
    visitDateTime,
  } = input;

  if (!studentName || studentName.length === 0)
    return "Student name is required";

  if (!studentId) return "Student ID is required";

  if (email && !emailRegex.test(email)) return "Invalid email format";

  if (!department_id) return "Department is required";

  if (isNaN(Number(department_id)) || department_id < 1)
    return "Invalid department selected";

  if (!visitDateTime) return "Visit date and time is required";

  if (askedCourses && askedCourses.some((course) => course.trim() === ""))
    return "Asked courses cannot be empty";

  return null; // No validation errors
}

export function validateUserInput(input: UserInput) {
  const { displayname, email, department_id, password, time_slots } = input;

  if (!displayname || displayname.length === 0)
    return "Display name is required";

  if (!email || email.length === 0) return "Email is required";

  if (!emailRegex.test(email)) return "Invalid email format";

  if (!password || password.length < 6)
    return "Password must be at least 6 characters long";

  if (!department_id) return "Department is required";

  if (isNaN(Number(department_id)) || department_id < 1)
    return "Invalid department selected";

  if (time_slots.length === 0) return "At least one time slot must be selected";

  return null; // No validation errors
}

export function validateDisplayName(displayname: string) {
  return displayname.trim().length >= 3 && displayname.trim().length <= 50;
}

export function validateFileSize(file: File) {
  return file.size <= 1 * 1024 * 1024; // 1MB;
}

export function ValidateBooking(input: BookingInput) {
  const { name, email, courses, department_id, rhuId } = input;

  if (!name) return "name is required";

  if (!email) return "email is required";

  if (!emailRegex.test(email)) return "invalid email format";

  if (!rhuId) return "RHU id is required";

  if (isNaN(Number(rhuId)) || rhuId < 1) return "invalid RHU id";

  if (!department_id) return "department is required";

  if (isNaN(Number(department_id)) || department_id < 1)
    return "invalid department selected";

  if (!courses || courses.length === 0)
    return "at least one course must be selected";

  return null; // No validation errors
}
