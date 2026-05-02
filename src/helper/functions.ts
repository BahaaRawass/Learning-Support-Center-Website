import type { Student } from "../types/types";

// Formatting the Date to this format: Day, Month, Year at HH:MM AM/PM
export function formatDate() {
  return new Date().toLocaleString("en-LB", {
    timeZone: "Asia/Beirut",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Preventing duplication in the Table
export function checkDupes(students: Student[], id: number): boolean {
  for (const student of students) {
    if (student.studentId === id) {
      return true;
    }
  }
  return false;
}